import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { addToCartSchema, updateCartItemSchema } from './cart.schema';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class CartController {
    // 1. GET /api/v1/cart
    static async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const cart = await CartService.getCart(req.user!.userId);
            res.status(200).json(new ApiResponse(200, cart, 'Cart retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
    // 2. POST /api/v1/cart/items (Add to cart)
    static async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = addToCartSchema.parse(req.body);
            const cart = await CartService.addToCart(req.user!.userId, validatedData);
            res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
        } catch (error) {
            next(error);
        }
    }
    // 3. PATCH /api/v1/cart/items/:itemId (Update quantity)
    static async updateQuantity(req: Request<{ itemId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemId = parseInt(req.params.itemId, 10);
            if (isNaN(itemId)) {
                throw ApiError.badRequest('Invalid item ID');
            }
            const { quantity } = updateCartItemSchema.parse(req.body);
            const cart = await CartService.updateQuantity(req.user!.userId, itemId, quantity);
            res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
        } catch (error) {
            next(error);
        }
    }
    // 4. DELETE /api/v1/cart/items/:itemId (Remove single item)
    static async removeItem(req: Request<{ itemId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemId = parseInt(req.params.itemId, 10);
            if (isNaN(itemId)) {
                throw ApiError.badRequest('Invalid item ID');
            }
            const cart = await CartService.removeItem(req.user!.userId, itemId);
            res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
        } catch (error) {
            next(error);
        }
    }
    // 5. DELETE /api/v1/cart (Clear entire cart)
    static async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await CartService.clearCart(req.user!.userId);
            res.status(200).json(new ApiResponse(200, null, 'Cart cleared successfully'));
        } catch (error) {
            next(error);
        }
    }
}
