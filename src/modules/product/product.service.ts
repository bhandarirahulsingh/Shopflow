import { query, withTransaction } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { CreateCategoryInput, CreateProductInput, ListProductsQueryInput } from './product.schema';
import { InventoryService } from '../inventory/inventory.service';
import { redis, deleteKeysByPattern } from '../../config/redis';


export interface ProductResponse {
    id: number;
    sellerId: number;
    categoryId: number;
    categoryName?: string;
    name: string;
    description?: string;
    price: number;
    sku: string;
    imageUrl?: string;
    stock: number;
    availableStock: number;
    createdAt: Date;
}

export class ProductService {
    // 1. CREATE A NEW CATEGORY (Admin)
    static async createCategory(input: CreateCategoryInput) {
        const { name, slug, parentId } = input;

        // Check slug uniqueness
        const existing = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
        if (existing.rows.length > 0) {
            throw ApiError.conflict('Category with this slug already exists');
        }

        const result = await query(
            `INSERT INTO categories (name, slug, parent_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, parent_id as "parentId"`,
            [name, slug, parentId || null]
        );

        return result.rows[0];
    }

    // 2. GET ALL CATEGORIES (Public)
    static async getCategories() {
        const result = await query(
            `SELECT id, name, slug, parent_id as "parentId"
       FROM categories ORDER BY name ASC`
        );
        return result.rows;
    }

    // 3. CREATE PRODUCT + INVENTORY (Atomic Transaction! 🛡️)
    static async createProduct(sellerId: number, input: CreateProductInput): Promise<ProductResponse> {
        const { name, description, price, sku, categoryId, stock, imageUrl } = input;

        // Verify Category Exists
        const categoryCheck = await query('SELECT id, name FROM categories WHERE id = $1', [categoryId]);
        if (categoryCheck.rows.length === 0) {
            throw ApiError.notFound('Category not found');
        }

        // Verify SKU Uniqueness
        const skuCheck = await query('SELECT id FROM products WHERE sku = $1', [sku]);
        if (skuCheck.rows.length > 0) {
            throw ApiError.conflict(`Product with SKU '${sku}' already exists`);
        }

        // Atomic Creation: Product + Inventory
        const newProduct = await withTransaction(async (client) => {
            // Step A: Insert Product
            const productResult = await client.query(
                `INSERT INTO products (seller_id, category_id, name, description, price, sku, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, seller_id as "sellerId", category_id as "categoryId", name, description, price, sku, image_url as "imageUrl", created_at as "createdAt"`,
                [sellerId, categoryId, name, description || null, price, sku, imageUrl || null]
            );

            const product = productResult.rows[0];

            // Step B: Insert Inventory Record
            await InventoryService.createInitialStock(product.id, stock, client);

            return {
                ...product,
                categoryName: categoryCheck.rows[0].name,
                stock,
                availableStock: stock,
            };
        });

        // Invalidate product listings cache so the new product immediately appears in search/grid
        try {
            await deleteKeysByPattern('products:list:*');
        } catch (err: any) {
            console.warn('⚠️ [Redis] Failed to invalidate product lists cache:', err.message);
        }

        return newProduct;
    }

    // 4. GET ALL PRODUCTS WITH FILTERS & PAGINATION (With Redis Cache-Aside! ⚡)
    static async getProducts(filters: ListProductsQueryInput) {
        const { page, limit, categoryId, minPrice, maxPrice, search } = filters;
        const offset = (page - 1) * limit;

        // Construct unique, deterministic cache key based on query filters
        const cacheKey = `products:list:page=${page}:limit=${limit}:cat=${categoryId || 'all'}:min=${minPrice ?? 'none'}:max=${maxPrice ?? 'none'}:q=${search || 'none'}`;

        // Step 1: Check Redis Cache
        try {
            const cachedList = await redis.get(cacheKey);
            if (cachedList) {
                return JSON.parse(cachedList);
            }
        } catch (err: any) {
            console.warn(`⚠️ [Redis] Cache read failed for ${cacheKey}:`, err.message);
        }

        // Step 2: Cache MISS — Build dynamic SQL WHERE conditions safely
        const conditions: string[] = ['p.is_active = true'];
        const params: any[] = [];

        if (categoryId) {
            params.push(categoryId);
            conditions.push(`p.category_id = $${params.length}`);
        }

        if (minPrice !== undefined) {
            params.push(minPrice);
            conditions.push(`p.price >= $${params.length}`);
        }

        if (maxPrice !== undefined) {
            params.push(maxPrice);
            conditions.push(`p.price <= $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
        }

        const whereClause = conditions.join(' AND ');

        // Query 1: Get Total Matching Items (for pagination metadata)
        const countResult = await query(
            `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
            params
        );
        const totalItems = parseInt(countResult.rows[0].total, 10);
        const totalPages = Math.ceil(totalItems / limit);

        // Query 2: Fetch the Paginated Slice with JOINs
        const queryParams = [...params, limit, offset];
        const dataResult = await query<ProductResponse>(
            `SELECT 
         p.id, p.seller_id as "sellerId", p.category_id as "categoryId",
         c.name as "categoryName", p.name, p.description, p.price, p.sku,
         p.image_url as "imageUrl",
         i.quantity as stock,
         (i.quantity - i.reserved_quantity) as "availableStock",
         p.created_at as "createdAt"
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN inventory i ON p.id = i.product_id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
            queryParams
        );

        const response = {
            items: dataResult.rows,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };

        // Step 3: Store in Redis with a 3-Minute TTL (180 seconds)
        try {
            await redis.set(cacheKey, JSON.stringify(response), 'EX', 180);
        } catch (err: any) {
            console.warn(`⚠️ [Redis] Cache write failed for ${cacheKey}:`, err.message);
        }

        return response;
    }

    // 5. GET SINGLE PRODUCT BY ID (With Redis Cache-Aside! ⚡)
    static async getProductById(id: number): Promise<ProductResponse> {
        const cacheKey = `product:${id}`;

        // Step 1: Check Redis Cache
        try {
            const cachedProduct = await redis.get(cacheKey);
            if (cachedProduct) {
                // Cache HIT! ⚡ (Return in <1ms without touching PostgreSQL)
                return JSON.parse(cachedProduct);
            }
        } catch (err: any) {
            // Graceful Fallback: If Redis is temporarily unreachable, don't crash! Just log and hit DB.
            console.warn(`⚠️ [Redis] Cache read failed for ${cacheKey}:`, err.message);
        }

        // Step 2: Cache MISS — Query PostgreSQL
        const result = await query<ProductResponse>(
            `SELECT 
         p.id, p.seller_id as "sellerId", p.category_id as "categoryId",
         c.name as "categoryName", p.name, p.description, p.price, p.sku,
         p.image_url as "imageUrl",
         i.quantity as stock,
         (i.quantity - i.reserved_quantity) as "availableStock",
         p.created_at as "createdAt"
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN inventory i ON p.id = i.product_id
       WHERE p.id = $1 AND p.is_active = true`,
            [id]
        );

        const product = result.rows[0];
        if (!product) {
            throw ApiError.notFound('Product not found or has been discontinued');
        }

        // Step 3: Save to Redis with 10-Minute TTL (600 seconds)
        try {
            await redis.set(cacheKey, JSON.stringify(product), 'EX', 600);
        } catch (err: any) {
            console.warn(`⚠️ [Redis] Cache write failed for ${cacheKey}:`, err.message);
        }

        return product;
    }
}
