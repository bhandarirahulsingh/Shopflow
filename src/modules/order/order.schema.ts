import { z } from 'zod';

// Schema for checkout / placing an order
export const checkoutSchema = z.object({
    shippingAddress: z.object({
        street: z.string({ message: 'Street is required' }).trim().min(3),
        city: z.string({ message: 'City is required' }).trim().min(2),
        state: z.string({ message: 'State is required' }).trim().min(2),
        zipCode: z.string({ message: 'Zip code is required' }).trim().min(3),
        country: z.string().default('India'),
    }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
