import { query, withTransaction } from '../../db';
import { ApiError } from '../../utils/ApiError';
import { ProcessPaymentInput } from './payment.schema';

export interface PaymentResponse {
    paymentId: number;
    orderId: number;
    orderNumber: string;
    transactionId: string;
    paymentMethod: string;
    amount: number;
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    orderStatus: string;
    paidAt: Date;
}

export class PaymentService {
    // 1. PROCESS PAYMENT FOR AN ORDER
    static async processPayment(userId: number, input: ProcessPaymentInput): Promise<PaymentResponse> {
        const { orderId, paymentMethod, amount } = input;

        return await withTransaction(async (client) => {
            // Step A: Fetch order and verify ownership + PENDING status
            const orderResult = await client.query(
                `SELECT id, order_number as "orderNumber", user_id as "userId", total_amount as "totalAmount", status
         FROM orders
         WHERE id = $1
         FOR UPDATE`,
                [orderId]
            );

            const order = orderResult.rows[0];
            if (!order) {
                throw ApiError.notFound('Order not found');
            }

            if (order.userId !== userId) {
                throw ApiError.forbidden('You do not have permission to pay for this order');
            }

            if (order.status !== 'PENDING') {
                throw ApiError.badRequest(`Order cannot be paid. Current status is '${order.status}'`);
            }

            const expectedAmount = parseFloat(order.totalAmount);
            if (Math.abs(expectedAmount - amount) > 0.01) {
                throw ApiError.badRequest(
                    `Payment amount mismatch. Expected ₹${expectedAmount}, but received ₹${amount}`
                );
            }

            // Step B: Generate Unique Gateway Transaction ID
            const transactionId = `TXN-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

            // Step C: Record Payment in database
            const paymentResult = await client.query(
                `INSERT INTO payments (order_id, transaction_id, method, amount, status)
         VALUES ($1, $2, $3, $4, 'SUCCESS')
         RETURNING id, order_id as "orderId", transaction_id as "transactionId", method as "paymentMethod", amount, status as "paymentStatus", created_at as "paidAt"`,
                [order.id, transactionId, paymentMethod, amount]
            );

            const payment = paymentResult.rows[0];

            // Step D: Update Order Status to 'CONFIRMED'
            await client.query(
                `UPDATE orders
         SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
                [order.id]
            );

            return {
                paymentId: payment.paymentId || payment.id,
                orderId: order.id,
                orderNumber: order.orderNumber,
                transactionId: payment.transactionId,
                paymentMethod: payment.paymentMethod,
                amount: parseFloat(payment.amount),
                paymentStatus: payment.paymentStatus,
                orderStatus: 'CONFIRMED',
                paidAt: payment.paidAt,
            };
        });
    }

    // 2. GET PAYMENT DETAILS BY ORDER ID
    static async getPaymentByOrderId(userId: number, orderId: number): Promise<any> {
        const result = await query(
            `SELECT p.id, p.transaction_id as "transactionId", p.method as "paymentMethod", p.amount, p.status, p.created_at as "createdAt"
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.order_id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );

        const payment = result.rows[0];
        if (!payment) {
            throw ApiError.notFound('No payment record found for this order');
        }

        return {
            ...payment,
            amount: parseFloat(payment.amount),
        };
    }
}
