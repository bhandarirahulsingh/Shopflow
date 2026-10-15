import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
    cart: Cart | null;
    totalItems: number;
    totalAmount: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, openAuthModal } = useAuth();

    // 1. Fetch Cart from Backend
    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }
        try {
            setLoading(true);
            const data: Cart = await api.get('/cart');
            setCart(data);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch cart whenever authentication status changes (login / logout)
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    // 2. Add to Cart: calls backend, refreshes cart, and slides open the Cart Drawer!
    const addToCart = async (productId: number, quantity: number = 1) => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }
        await api.post('/cart/items', { productId, quantity });
        await fetchCart();
        setIsCartOpen(true); // Automatically slide open cart drawer for instant feedback!
    };

    // 3. Update Quantity (+ / -)
    const updateQuantity = async (itemId: number, quantity: number) => {
        await api.patch(`/cart/items/${itemId}`, { quantity });
        await fetchCart();
    };

    // 4. Remove Item
    const removeItem = async (itemId: number) => {
        await api.delete(`/cart/items/${itemId}`);
        await fetchCart();
    };

    // 5. Clear Cart (e.g. after successful checkout)
    const clearCart = async () => {
        await api.delete('/cart');
        setCart({
            cartId: cart?.cartId || 0,
            items: [],
            totalItems: 0,
            totalAmount: 0,
        });
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                totalItems: cart?.totalItems || 0,
                totalAmount: cart?.totalAmount || 0,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                fetchCart,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom Hook to tune into CartContext anywhere
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
