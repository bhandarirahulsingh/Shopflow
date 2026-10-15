import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { X, Heart, Plus, Minus, Check, Truck, Rotate3D, MapPin } from 'lucide-react';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onView3D?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    isOpen,
    onClose,
    onView3D,
}) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { formatPrice } = useCurrency();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    // Delivery Estimator State
    const [pincode, setPincode] = useState('560038');
    const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>('Express Delivery by Tomorrow, 4:00 PM');

    if (!isOpen || !product) return null;

    const handleCheckPincode = (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length === 6) {
            setDeliveryEstimate('Express Delivery in 24 Hours • Free with ShopFlow Prime');
        } else {
            setDeliveryEstimate('Standard Delivery in 2-3 Business Days');
        }
    };

    const handleAddToCart = async () => {
        try {
            setIsAdding(true);
            await addToCart(product.id, quantity);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1500);
        } catch (err: any) {
            alert(err.message || 'Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const isOutOfStock = product.availableStock <= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left: Product Image & 3D Link */}
                <div className="md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 relative">
                    <div className="aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-gray-200">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="text-gray-400 font-bold">ShopFlow Hardware</div>
                        )}
                    </div>

                    {/* Quick 3D View Button */}
                    {onView3D && (
                        <button
                            onClick={() => {
                                onClose();
                                onView3D(product);
                            }}
                            className="mt-4 px-4 py-2 rounded-full bg-white hover:bg-blue-50 border border-gray-200 text-blue-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all"
                        >
                            <Rotate3D className="h-4 w-4 text-blue-600 animate-spin" />
                            <span>Launch 360° 3D Inspector</span>
                        </button>
                    )}
                </div>

                {/* Right: Technical Specs & Add to Cart */}
                <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                                {product.categoryName}
                            </span>

                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`p-2 rounded-full border transition-all ${isInWishlist(product.id)
                                    ? 'bg-red-50 border-red-200 text-red-500'
                                    : 'border-gray-200 text-gray-400 hover:text-red-500 hover:bg-gray-50'
                                    }`}
                                title={isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                            >
                                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">SKU: {product.sku}</p>

                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-3xl font-extrabold text-gray-900">
                                {formatPrice(Number(product.price) * quantity)}
                            </span>
                            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Inclusive of all taxes
                            </span>
                        </div>

                        <p className="mt-3 text-xs text-gray-600 leading-relaxed">{product.description}</p>

                        {/* Specs Matrix */}
                        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Inventory Status</span>
                                <span className="font-bold text-gray-800">
                                    {isOutOfStock ? 'Sold Out' : `${product.availableStock} Units in Stock`}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Official Warranty</span>
                                <span className="font-bold text-gray-800">1 Year Brand Warranty</span>
                            </div>
                        </div>

                        {/* Delivery PIN Code Checker */}
                        <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-2">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                Check Delivery & Availability
                            </label>
                            <form onSubmit={handleCheckPincode} className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 6-digit PIN"
                                    className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors"
                                >
                                    Check
                                </button>
                            </form>
                            {deliveryEstimate && (
                                <p className="mt-2 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                                    <Truck className="h-3.5 w-3.5" />
                                    {deliveryEstimate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-full bg-gray-100 border border-gray-200 p-1">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => Math.min(product.availableStock, q + 1))}
                                disabled={quantity >= product.availableStock}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors disabled:opacity-30"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isAdding}
                            className={`flex-1 py-3.5 rounded-full font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 ${justAdded
                                ? 'bg-emerald-600'
                                : isOutOfStock
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                }`}
                        >
                            {isAdding ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : justAdded ? (
                                <>
                                    <Check className="h-4 w-4 stroke-[2.5]" />
                                    Added to Cart
                                </>
                            ) : isOutOfStock ? (
                                'Sold Out'
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 stroke-[2.5]" />
                                    Add to Cart • {formatPrice(Number(product.price) * quantity)}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
