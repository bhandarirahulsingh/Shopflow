import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag } from 'lucide-react';

interface CartDrawerProps {
    onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalItems, totalAmount } = useCart();

    const [couponInput, setCouponInput] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError(null);
        setCouponSuccess(null);

        const code = couponInput.trim().toUpperCase();
        if (!code) return;

        if (code === 'SHOP10' || code === 'FIRSTBUY10' || code === 'SHOPFLOW10') {
            const discount = Math.round(totalAmount * 0.10);
            setDiscountAmount(discount);
            setCouponSuccess(`Code applied! You saved ₹${discount.toLocaleString('en-IN')} (10% OFF)`);
        } else if (code === 'TECH5000') {
            if (totalAmount < 50000) {
                setCouponError('TECH5000 requires a minimum cart value of ₹50,000');
                return;
            }
            setDiscountAmount(5000);
            setCouponSuccess('Code applied! Flat ₹5,000 discount applied');
        } else if (code === 'WELCOME500') {
            setDiscountAmount(500);
            setCouponSuccess('Code applied! Flat ₹500 discount applied');
        } else {
            setCouponError('Invalid promo code. Try "SHOP10" or "TECH5000"');
        }
    };

    if (!isCartOpen) return null;

    const freeShippingThreshold = 50000;
    const progressToFreeShipping = Math.min(100, (totalAmount / freeShippingThreshold) * 100);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                    {/* Drawer Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                            <h2 className="text-base font-bold text-gray-900">Your Cart</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Free Shipping Progress Bar */}
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                <Truck className="h-3.5 w-3.5 text-blue-600" />
                                {totalAmount >= freeShippingThreshold ? (
                                    <span className="text-emerald-700 font-semibold">🎉 You unlocked Free Express Shipping!</span>
                                ) : (
                                    <span>
                                        Add <strong className="text-gray-900">₹{(freeShippingThreshold - totalAmount).toLocaleString('en-IN')}</strong> for Free Shipping
                                    </span>
                                )}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500">{Math.round(progressToFreeShipping)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${progressToFreeShipping}%` }}
                            />
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {!cart || cart.items.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">Your cart is empty</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                    Looks like you haven't added anything to your cart yet.
                                </p>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div
                                    key={item.itemId}
                                    className="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-2xs"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-16 w-16 rounded-xl bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <button
                                                onClick={() => removeItem(item.itemId)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="text-xs text-blue-600 font-semibold">
                                            ₹{Number(item.price).toLocaleString('en-IN')}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center rounded-lg bg-gray-100 border border-gray-200 p-0.5">
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.availableStock}
                                                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors disabled:opacity-30"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <span className="text-xs font-bold text-gray-900">
                                                ₹{Number(item.itemTotal).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Summary */}
                    {cart && cart.items.length > 0 && (
                        <div className="p-5 border-t border-gray-100 bg-gray-50/70 space-y-3.5">
                            {/* Promo Code Engine */}
                            <div className="p-3 bg-white rounded-2xl border border-gray-200">
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Promo code (e.g. TECH5000, SHOP10)"
                                        className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-900 font-mono focus:outline-none focus:border-blue-500 uppercase"
                                    />
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                                    >
                                        Apply
                                    </button>
                                </form>

                                {couponSuccess && (
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {couponSuccess}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setDiscountAmount(0);
                                                setCouponSuccess(null);
                                                setCouponInput('');
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="mt-1.5 text-[11px] text-red-600 font-medium">
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-medium">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-semibold">
                                        <span>Promo Discount</span>
                                        <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-700 font-medium">
                                        {totalAmount >= freeShippingThreshold ? 'FREE' : '₹499'}
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
                                    <span>Total</span>
                                    <div className="text-right">
                                        {discountAmount > 0 && (
                                            <span className="text-xs text-gray-400 line-through mr-2 font-normal">
                                                ₹{(totalAmount + (totalAmount >= freeShippingThreshold ? 0 : 499)).toLocaleString('en-IN')}
                                            </span>
                                        )}
                                        <span className="text-base text-blue-600">
                                            ₹{Math.max(0, totalAmount - discountAmount + (totalAmount >= freeShippingThreshold ? 0 : 499)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setIsCartOpen(false);
                                    onOpenCheckout();
                                }}
                                className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-sm text-white shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all group"
                            >
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </button>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Pessimistic Locking Stock Guarantee</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
