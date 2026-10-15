import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<'USER' | 'SELLER'>('USER');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (mode === 'LOGIN') {
                await login({ email, password });
            } else {
                await register({ email, password, firstName, lastName, role });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'LOGIN' ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {mode === 'LOGIN'
                            ? 'Sign in to access your cart, orders, and ShopFlow account'
                            : 'Join ShopFlow to start shopping or selling hardware today'}
                    </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode('LOGIN'); setError(null); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'LOGIN'
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('REGISTER'); setError(null); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'REGISTER'
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'REGISTER' && (
                        <>
                            {/* Role Toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Account Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRole('USER')}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${role === 'USER'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <UserIcon className="h-3.5 w-3.5" />
                                        Customer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('SELLER')}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${role === 'SELLER'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Seller
                                    </button>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Rahul"
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Sharma"
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Mail className="h-4 w-4" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-3 text-sm font-semibold text-white shadow-xs hover:shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : mode === 'LOGIN' ? (
                            'Sign In'
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
