export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    parentId?: number | null;
}

export interface Product {
    id: number;
    sellerId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description?: string;
    price: number;
    sku: string;
    imageUrl?: string;
    stock: number;
    availableStock: number;
    createdAt: string;
}

export interface ProductListResponse {
    items: Product[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CartItem {
    itemId: number;
    productId: number;
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
    itemTotal: number;
    availableStock: number;
}

export interface Cart {
    cartId: number;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}

export interface OrderItem {
    id: number;
    productId: number;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    userId: number;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    createdAt: string;
}
