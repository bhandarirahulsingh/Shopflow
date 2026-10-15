import { z } from 'zod';

// 1. Add item to cart
export const addToCartSchema = z.object({
    productId: z.number({ message: 'Product ID is required' }).int().positive(),
    quantity: z.number({ message: 'Quantity is required' }).int().min(1, 'Quantity must be at least 1').default(1),
});

// 2. Update item quantity in cart
export const updateCartItemSchema = z.object({
    quantity: z.number({ message: 'Quantity is required' }).int().min(0, 'Quantity cannot be negative'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
