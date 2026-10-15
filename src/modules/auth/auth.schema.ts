import { z } from 'zod';

// 1. Validation Schema for User Registration
export const registerSchema = z.object({
    email: z
        .string({ message: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: z
        .string({ message: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long')
        .max(100, 'Password cannot exceed 100 characters'),
    firstName: z
        .string({ message: 'First name is required' })
        .trim()
        .min(1, 'First name cannot be empty')
        .max(100),
    lastName: z
        .string({ message: 'Last name is required' })
        .trim()
        .min(1, 'Last name cannot be empty')
        .max(100),
    role: z.enum(['USER', 'SELLER']).default('USER'),
});

// 2. Validation Schema for User Login
export const loginSchema = z.object({
    email: z
        .string({ message: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: z
        .string({ message: 'Password is required' })
        .min(1, 'Password cannot be empty'),
});

// 3. Validation Schema for Refreshing Token
export const refreshTokenSchema = z.object({
    refreshToken: z.string({ message: 'Refresh token is required' }),
});

// 4. Automatically infer TypeScript types from Zod schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
