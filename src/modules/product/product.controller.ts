import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { createCategorySchema, createProductSchema, listProductsQuerySchema } from './product.schema';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class ProductController {
    // 1. POST /api/v1/categories (Admin only)
    static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createCategorySchema.parse(req.body);
            const category = await ProductService.createCategory(validatedData);
            res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 2. GET /api/v1/categories (Public)
    static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await ProductService.getCategories();
            res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 3. POST /api/v1/products (Sellers & Admins)
    static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createProductSchema.parse(req.body);
            // req.user!.userId comes directly from our authenticate middleware!
            const product = await ProductService.createProduct(req.user!.userId, validatedData);
            res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 4. GET /api/v1/products (Public - Filtered & Paginated)
    static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters = listProductsQuerySchema.parse(req.query);
            const result = await ProductService.getProducts(filters);
            res.status(200).json(new ApiResponse(200, result, 'Products fetched successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 5. GET /api/v1/products/:id (Public)
    static async getProductById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw ApiError.badRequest('Invalid product ID');
            }
            const product = await ProductService.getProductById(id);
            res.status(200).json(new ApiResponse(200, product, 'Product details fetched successfully'));
        } catch (error) {
            next(error);
        }
    }
}
