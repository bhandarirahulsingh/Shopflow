import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyInfo {
    code: CurrencyCode;
    symbol: string;
    rate: number; // Conversion rate relative to INR
    name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
    INR: { code: 'INR', symbol: '₹', rate: 1.0, name: 'Indian Rupee' },
    USD: { code: 'USD', symbol: '$', rate: 0.012, name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.011, name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.0095, name: 'British Pound' },
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatPrice: (amountInInr: number | string) => string;
    convertPrice: (amountInInr: number | string) => number;
    currentCurrencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        try {
            const saved = localStorage.getItem('shopflow_currency');
            return (saved as CurrencyCode) || 'INR';
        } catch {
            return 'INR';
        }
    });

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
        try {
            localStorage.setItem('shopflow_currency', code);
        } catch (e) {
            console.error('Failed to save currency:', e);
        }
    };

    const currentCurrencyInfo = CURRENCIES[currency];

    const convertPrice = (amountInInr: number | string): number => {
        const num = typeof amountInInr === 'string' ? parseFloat(amountInInr) || 0 : amountInInr;
        return num * currentCurrencyInfo.rate;
    };

    const formatPrice = (amountInInr: number | string): string => {
        const converted = convertPrice(amountInInr);
        if (currency === 'INR') {
            return `${currentCurrencyInfo.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
        }
        return `${currentCurrencyInfo.symbol}${converted.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatPrice,
                convertPrice,
                currentCurrencyInfo,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
