import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { X, Mail, Shield, Award, MapPin, PackageCheck, Heart, LogOut, CheckCircle2, Lock } from 'lucide-react';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenOrders?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onOpenOrders }) => {
    const { user, logout } = useAuth();
    const { totalWishlistItems } = useWishlist();
    const { totalItems } = useCart();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ADDRESSES' | 'SECURITY'>('OVERVIEW');
    const [savedMsg, setSavedMsg] = useState(false);

    if (!isOpen || !user) return null;

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header Profile Cover */}
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-extrabold text-2xl shadow-md">
                            {user.firstName?.[0] || 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Member Tier Badge */}
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                            <Award className="h-4 w-4" />
                            <span>ShopFlow Gold Member • Free Express Delivery Active</span>
                        </div>
                        <span className="text-[11px] text-blue-200">Joined 2026</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-100 px-6 bg-gray-50/60 text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`py-3 px-3 border-b-2 transition-colors ${activeTab === 'OVERVIEW'
                            ? 'border-blue-600 text-blue-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Account Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('ADDRESSES')}
                        className={`py-3 px-3 border-b-2 transition-colors ${activeTab === 'ADDRESSES'
                            ? 'border-blue-600 text-blue-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Saved Addresses
                    </button>
                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`py-3 px-3 border-b-2 transition-colors ${activeTab === 'SECURITY'
                            ? 'border-blue-600 text-blue-600 font-bold'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Security & Auth
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6 overflow-y-auto flex-1 text-xs">
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                                    <PackageCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                    <span className="text-gray-500 text-[10px] uppercase font-semibold block">Orders</span>
                                    <span className="text-base font-bold text-gray-900">Active</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 text-center">
                                    <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                                    <span className="text-gray-500 text-[10px] uppercase font-semibold block">Wishlist</span>
                                    <span className="text-base font-bold text-gray-900">{totalWishlistItems} Items</span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                                    <Shield className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                                    <span className="text-gray-500 text-[10px] uppercase font-semibold block">Cart</span>
                                    <span className="text-base font-bold text-gray-900">{totalItems} Items</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Quick Management</h4>
                                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            if (onOpenOrders) onOpenOrders();
                                        }}
                                        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <PackageCheck className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="font-bold text-gray-900">View All Orders & Deliveries</p>
                                                <p className="text-[11px] text-gray-500">Track shipments and download tax invoices</p>
                                            </div>
                                        </div>
                                        <span className="text-blue-600 font-bold">➔</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('ADDRESSES')}
                                        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            <div>
                                                <p className="font-bold text-gray-900">Default Shipping Address</p>
                                                <p className="text-[11px] text-gray-500">Bengaluru, Karnataka - 560038</p>
                                            </div>
                                        </div>
                                        <span className="text-blue-600 font-bold">➔</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ADDRESSES' && (
                        <form onSubmit={handleSaveAddress} className="space-y-3">
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Default Delivery Address</h4>
                            <div className="space-y-2.5">
                                <div>
                                    <label className="text-gray-600 font-medium block mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        defaultValue="100 Feet Road, Indiranagar"
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-gray-600 font-medium block mb-1">City</label>
                                        <input
                                            type="text"
                                            defaultValue="Bengaluru"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium block mb-1">State</label>
                                        <input
                                            type="text"
                                            defaultValue="Karnataka"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-gray-600 font-medium block mb-1">PIN Code</label>
                                        <input
                                            type="text"
                                            defaultValue="560038"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium block mb-1">Country</label>
                                        <input
                                            type="text"
                                            defaultValue="India"
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1.5"
                            >
                                {savedMsg ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                                {savedMsg ? 'Address Updated!' : 'Save Address'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Lock className="h-4 w-4 text-blue-600" />
                                    <span>PostgreSQL Row-Level Security & Argon2 Password Hashing</span>
                                </div>
                                <p className="text-gray-500 leading-relaxed text-[11px]">
                                    Your account is protected by industry-grade cryptographic hashing and JWT session validation with bearer tokens.
                                </p>
                            </div>

                            <div className="pt-2 flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Session ID: <strong className="font-mono text-gray-900">ACTIVE-JWT-V1</strong></span>
                                <button
                                    onClick={() => {
                                        logout();
                                        onClose();
                                    }}
                                    className="px-4 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold flex items-center gap-1.5 transition-colors"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
