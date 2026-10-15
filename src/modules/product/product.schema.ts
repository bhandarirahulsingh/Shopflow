import { z } from 'zod';

// 1. Schema for creating a Category
export const createCategorySchema = z.object({
    name: z.string({ message: 'Category name is required' }).trim().min(2).max(100),
    slug: z.string({ message: 'Slug is required' }).trim().toLowerCase().min(2).max(100),
    parentId: z.number().int().positive().optional(),
});

// 2. Schema for creating a Product (Sellers)
export const createProductSchema = z.object({
    name: z.string({ message: 'Product name is required' }).trim().min(3).max(255),
    description: z.string().trim().optional(),
    price: z.number({ message: 'Price is required' }).positive('Price must be greater than 0'),
    sku: z.string({ message: 'SKU is required' }).trim().toUpperCase().min(3).max(100),
    categoryId: z.number({ message: 'Category ID is required' }).int().positive(),
    stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
    imageUrl: z.string().url('Must be a valid URL').optional(),
});

// 3. Schema for filtering & paginating products (Query params: ?page=1&limit=20&search=sony)
export const listProductsQuerySchema = z.object({
    page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
    limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
    categoryId: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    search: z.string().trim().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>;
