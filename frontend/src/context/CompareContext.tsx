import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';

interface CompareContextType {
    compareItems: Product[];
    addToCompare: (product: Product) => boolean;
    removeFromCompare: (productId: number) => void;
    toggleCompare: (product: Product) => void;
    isInCompare: (productId: number) => boolean;
    clearCompare: () => void;
    isCompareModalOpen: boolean;
    setIsCompareModalOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareItems, setCompareItems] = useState<Product[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const addToCompare = (product: Product): boolean => {
        if (compareItems.some((p) => p.id === product.id)) return true;
        if (compareItems.length >= 3) {
            alert('You can compare up to 3 products at a time.');
            return false;
        }
        setCompareItems((prev) => [...prev, product]);
        return true;
    };

    const removeFromCompare = (productId: number) => {
        setCompareItems((prev) => prev.filter((p) => p.id !== productId));
    };

    const toggleCompare = (product: Product) => {
        if (isInCompare(product.id)) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    const isInCompare = (productId: number) => {
        return compareItems.some((p) => p.id === productId);
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    return (
        <CompareContext.Provider
            value={{
                compareItems,
                addToCompare,
                removeFromCompare,
                toggleCompare,
                isInCompare,
                clearCompare,
                isCompareModalOpen,
                setIsCompareModalOpen,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
