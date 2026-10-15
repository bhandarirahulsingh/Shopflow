import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isSeller: boolean;
    isAdmin: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (data: { email: string; password: string; firstName: string; lastName: string; role?: 'USER' | 'SELLER' }) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (open: boolean) => void;
    openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);

    // 1. On page mount, restore user session from localStorage if present
    useEffect(() => {
        const savedUser = localStorage.getItem('shopflow_user');
        const token = localStorage.getItem('shopflow_access_token');

        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('shopflow_user');
                localStorage.removeItem('shopflow_access_token');
            }
        }
        setLoading(false);
    }, []);

    // 2. Login function: calls backend, stores tokens, updates state
    const login = async (credentials: { email: string; password: string }) => {
        const data: AuthResponse = await api.post('/auth/login', credentials);
        setUser(data.user);
        localStorage.setItem('shopflow_user', JSON.stringify(data.user));
        localStorage.setItem('shopflow_access_token', data.tokens.accessToken);
        localStorage.setItem('shopflow_refresh_token', data.tokens.refreshToken);
        setIsAuthModalOpen(false);
    };

    // 3. Register function
    const register = async (formData: { email: string; password: string; firstName: string; lastName: string; role?: 'USER' | 'SELLER' }) => {
        const data: AuthResponse = await api.post('/auth/register', formData);
        setUser(data.user);
        localStorage.setItem('shopflow_user', JSON.stringify(data.user));
        localStorage.setItem('shopflow_access_token', data.tokens.accessToken);
        localStorage.setItem('shopflow_refresh_token', data.tokens.refreshToken);
        setIsAuthModalOpen(false);
    };

    // 4. Logout function: wipes state and storage
    const logout = () => {
        setUser(null);
        localStorage.removeItem('shopflow_user');
        localStorage.removeItem('shopflow_access_token');
        localStorage.removeItem('shopflow_refresh_token');
    };

    const isSeller = user?.role === 'SELLER';
    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isSeller,
                isAdmin,
                login,
                register,
                logout,
                loading,
                isAuthModalOpen,
                setIsAuthModalOpen,
                openAuthModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook to tune into AuthContext anywhere
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
