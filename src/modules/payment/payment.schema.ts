import { z } from 'zod';

export const processPaymentSchema = z.object({
    orderId: z.number({ message: 'Order ID is required' }).int().positive(),
    paymentMethod: z.enum(['CARD', 'UPI', 'WALLET', 'COD'], {
        message: "Invalid payment method. Allowed: 'CARD', 'UPI', 'WALLET', 'COD'",
    }),
    amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
