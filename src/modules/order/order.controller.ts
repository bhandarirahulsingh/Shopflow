import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { checkoutSchema } from './order.schema';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { withDistributedLock } from '../../utils/distributedLock';


export class OrderController {
    // 1. POST /api/v1/orders/checkout (Turn cart into an Order!)
    static async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = checkoutSchema.parse(req.body);
            const userId = req.user!.userId;

            // 🔒 Wrap checkout with Redis Distributed Lock!
            // Prevents double-clicks, duplicate orders, and concurrent cart checkouts
            const order = await withDistributedLock(
                `checkout:user:${userId}`,
                async () => {
                    return await OrderService.checkout(userId, validatedData);
                },
                { ttlMs: 8000, retryCount: 1, retryDelayMs: 100 }
            );

            res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
        } catch (error) {
            next(error);
        }
    }


    // 2. GET /api/v1/orders (User's order history)
    static async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const orders = await OrderService.getUserOrders(req.user!.userId);
            res.status(200).json(new ApiResponse(200, orders, 'Order history fetched successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 3. GET /api/v1/orders/:id (Single order details)
    static async getOrderById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const orderId = parseInt(req.params.id, 10);
            if (isNaN(orderId)) {
                throw ApiError.badRequest('Invalid order ID');
            }

            const order = await OrderService.getOrderById(req.user!.userId, orderId);
            res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
        } catch (error) {
            next(error);
        }
    }
}
