import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { processPaymentSchema } from './payment.schema';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class PaymentController {
    // 1. POST /api/v1/payments/process
    static async processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = processPaymentSchema.parse(req.body);
            const payment = await PaymentService.processPayment(req.user!.userId, validatedData);
            res.status(200).json(new ApiResponse(200, payment, 'Payment processed successfully'));
        } catch (error) {
            next(error);
        }
    }

    // 2. GET /api/v1/payments/order/:orderId
    static async getPaymentByOrderId(req: Request<{ orderId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            if (isNaN(orderId)) {
                throw ApiError.badRequest('Invalid order ID');
            }

            const payment = await PaymentService.getPaymentByOrderId(req.user!.userId, orderId);
            res.status(200).json(new ApiResponse(200, payment, 'Payment details retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}
