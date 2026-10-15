import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

interface WishlistContextType {
    wishlist: Product[];
    totalWishlistItems: number;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<Product[]>(() => {
        try {
            const saved = localStorage.getItem('shopflow_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('shopflow_wishlist', JSON.stringify(wishlist));
        } catch (e) {
            console.error('Failed to persist wishlist:', e);
        }
    }, [wishlist]);

    const addToWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist((prev) => prev.filter((p) => p.id !== productId));
    };

    const toggleWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) {
                return prev.filter((p) => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some((p) => p.id === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                totalWishlistItems: wishlist.length,
                isWishlistOpen,
                setIsWishlistOpen,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
