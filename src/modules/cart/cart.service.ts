import { query } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { AddToCartInput } from './cart.schema';

export interface CartItemResponse {
    itemId: number;
    productId: number;
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
    itemTotal: number;
    availableStock: number;
}

export interface CartResponse {
    cartId: number;
    items: CartItemResponse[];
    totalItems: number;
    totalAmount: number;
}

export class CartService {
    // Helper: Get user's cart ID (or create one if missing)
    private static async getOrCreateCartId(userId: number): Promise<number> {
        const existing = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (existing.rows.length > 0) {
            return existing.rows[0].id;
        }
        const created = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
        return created.rows[0].id;
    }

    // 1. GET USER'S CART WITH CALCULATED TOTALS
    static async getCart(userId: number): Promise<CartResponse> {
        const cartId = await this.getOrCreateCartId(userId);

        const result = await query(
            `SELECT 
         ci.id as "itemId",
         p.id as "productId",
         p.name,
         p.price,
         p.image_url as "imageUrl",
         ci.quantity,
         (ci.quantity * p.price) as "itemTotal",
         (inv.quantity - inv.reserved_quantity) as "availableStock"
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN inventory inv ON p.id = inv.product_id
       WHERE ci.cart_id = $1 AND p.is_active = true
       ORDER BY ci.id ASC`,
            [cartId]
        );

        const items: CartItemResponse[] = result.rows.map((row) => ({
            ...row,
            price: parseFloat(row.price),
            itemTotal: parseFloat(row.itemTotal),
        }));

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.itemTotal, 0);

        return {
            cartId,
            items,
            totalItems,
            totalAmount: Math.round(totalAmount * 100) / 100, // rounded to 2 decimals
        };
    }

    // 2. ADD TO CART (Atomic UPSERT with Stock Verification 🛡️)
    static async addToCart(userId: number, input: AddToCartInput): Promise<CartResponse> {
        const { productId, quantity } = input;
        const cartId = await this.getOrCreateCartId(userId);

        // Step A: Verify product exists & check available stock
        const productCheck = await query(
            `SELECT p.id, p.name, p.is_active, (inv.quantity - inv.reserved_quantity) as "availableStock"
       FROM products p
       JOIN inventory inv ON p.id = inv.product_id
       WHERE p.id = $1`,
            [productId]
        );

        const product = productCheck.rows[0];
        if (!product || !product.is_active) {
            throw ApiError.notFound('Product not found or is inactive');
        }

        if (product.availableStock < quantity) {
            throw ApiError.badRequest(
                `Insufficient stock for '${product.name}'. Only ${product.availableStock} left in stock.`
            );
        }

        // Step B: Atomic UPSERT! If already in cart -> add quantity
        await query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
            [cartId, productId, quantity]
        );

        // Return the updated cart
        return this.getCart(userId);
    }

    // 3. UPDATE ITEM QUANTITY (If 0 -> Remove)
    static async updateQuantity(userId: number, itemId: number, quantity: number): Promise<CartResponse> {
        const cartId = await this.getOrCreateCartId(userId);

        if (quantity <= 0) {
            // Remove item
            await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
        } else {
            // Update quantity
            const result = await query(
                'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING id',
                [quantity, itemId, cartId]
            );
            if (result.rows.length === 0) {
                throw ApiError.notFound('Item not found in your cart');
            }
        }

        return this.getCart(userId);
    }

    // 4. REMOVE SINGLE ITEM FROM CART
    static async removeItem(userId: number, itemId: number): Promise<CartResponse> {
        const cartId = await this.getOrCreateCartId(userId);
        await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
        return this.getCart(userId);
    }

    // 5. CLEAR ENTIRE CART
    static async clearCart(userId: number): Promise<void> {
        const cartId = await this.getOrCreateCartId(userId);
        await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }
}
