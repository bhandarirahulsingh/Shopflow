import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency, type CurrencyCode, CURRENCIES } from '../context/CurrencyContext';
import { ShoppingBag, Search, User, LogOut, Store, Shield, Heart, PackageCheck, Globe, UserCircle } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface NavbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onOpenSellerStudio?: () => void;
    onOpenOrders?: () => void;
    onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    searchQuery,
    onSearchChange,
    onOpenSellerStudio,
    onOpenOrders,
    onOpenProfile,
}) => {
    const { user, isAuthenticated, logout, openAuthModal, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
    const { totalItems, setIsCartOpen } = useCart();
    const { totalWishlistItems, setIsWishlistOpen } = useWishlist();
    const { currency, setCurrency } = useCurrency();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    const isSeller = user?.role === 'SELLER';

    const handleCartClick = () => {
        if (!isAuthenticated) {
            openAuthModal();
        } else {
            setIsCartOpen(true);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Google Store Style Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                Shop<span className="text-blue-600">Flow</span>
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md hidden md:block">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Search className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search products, brands, and categories..."
                                    className="w-full rounded-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white border border-transparent focus:border-blue-500 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            {/* Multi-Currency Switcher Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
                                    title="Switch Currency"
                                >
                                    <Globe className="h-3.5 w-3.5 text-blue-600" />
                                    <span>{CURRENCIES[currency].symbol} {currency}</span>
                                </button>

                                {isCurrencyOpen && (
                                    <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white p-1.5 shadow-lg border border-gray-100 z-50 animate-in fade-in zoom-in-95">
                                        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                                            <button
                                                key={code}
                                                onClick={() => {
                                                    setCurrency(code);
                                                    setIsCurrencyOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${currency === code
                                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{CURRENCIES[code].name}</span>
                                                <span className="font-mono font-bold text-gray-500">{CURRENCIES[code].symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Seller Studio button if user is a SELLER */}
                            {isSeller && (
                                <button
                                    onClick={onOpenSellerStudio}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                                >
                                    <Store className="h-4 w-4" />
                                    Seller Studio
                                </button>
                            )}

                            {/* Wishlist Button */}
                            <button
                                onClick={() => setIsWishlistOpen(true)}
                                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                                title="Saved Wishlist"
                            >
                                <Heart className="h-5 w-5" />
                                {totalWishlistItems > 0 && (
                                    <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                                        {totalWishlistItems}
                                    </span>
                                )}
                            </button>

                            {/* Cart Button */}
                            <button
                                onClick={handleCartClick}
                                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                                title="View Cart"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            {/* User Menu / Sign In */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 text-gray-800 text-sm font-medium transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                            {user?.firstName?.[0] || 'U'}
                                        </div>
                                        <span className="hidden sm:inline pr-2 text-gray-700 text-xs font-semibold">{user?.firstName}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-lg border border-gray-100 z-50 animate-in fade-in-50 zoom-in-95">
                                            <div className="px-3 py-2 border-b border-gray-100 text-xs">
                                                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-gray-500 truncate">{user?.email}</p>
                                                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    <Shield className="h-2.5 w-2.5" />
                                                    {user?.role}
                                                </div>
                                            </div>

                                            {/* Your Profile Trigger */}
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    if (onOpenProfile) onOpenProfile();
                                                }}
                                                className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                <UserCircle className="h-4 w-4 text-blue-600" />
                                                Your Profile & Account
                                            </button>

                                            {/* My Orders Trigger */}
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    if (onOpenOrders) onOpenOrders();
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                <PackageCheck className="h-4 w-4 text-emerald-600" />
                                                My Orders & Deliveries
                                            </button>

                                            <button
                                                onClick={() => { logout(); setIsUserMenuOpen(false); }}
                                                className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={openAuthModal}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
};
