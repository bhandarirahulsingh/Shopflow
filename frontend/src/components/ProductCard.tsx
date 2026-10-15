import React, { useState } from 'react';
import type { Product } from '../types/index';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Check, ShoppingBag, Rotate3D, Heart, Columns } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onView3D?: (product: Product) => void;
    onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView3D, onClick }) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { isInCompare, toggleCompare } = useCompare();
    const { formatPrice } = useCurrency();

    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setIsAdding(true);
            await addToCart(product.id, 1);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1500);
        } catch (err: any) {
            alert(err.message || 'Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const isOutOfStock = product.availableStock <= 0;
    const isLowStock = product.availableStock > 0 && product.availableStock <= 5;
    const inWishlist = isInWishlist(product.id);
    const inCompare = isInCompare(product.id);

    return (
        <div
            onClick={() => onClick && onClick(product)}
            className="group relative flex flex-col rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:shadow-md hover:border-blue-300 overflow-hidden transition-all duration-200 cursor-pointer"
        >
            {/* Product Image / Visual Showcase */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <ShoppingBag className="h-14 w-14 stroke-1 mb-1.5" />
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">ShopFlow</span>
                    </div>
                )}

                {/* Stock Urgency Badge (Top Left) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isOutOfStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Out of Stock
                        </span>
                    ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Only {product.availableStock} left
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock
                        </span>
                    )}
                </div>

                {/* Top Right Actions: Wishlist ❤️ and Compare */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(product);
                        }}
                        className={`p-1.5 rounded-full border shadow-2xs transition-all ${inCompare
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white/90 border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-white'
                            }`}
                        title={inCompare ? 'In Compare Matrix' : 'Add to Compare'}
                    >
                        <Columns className="h-3.5 w-3.5" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                        }}
                        className={`p-1.5 rounded-full border shadow-2xs transition-all ${inWishlist
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white/90 border-gray-200 text-gray-400 hover:text-red-500 hover:bg-white'
                            }`}
                        title={inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                    >
                        <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-red-500' : ''}`} />
                    </button>
                </div>

                {/* 3D View Hover Trigger Overlay (Bottom Right) */}
                {onView3D && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView3D(product);
                        }}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 hover:bg-blue-600 text-gray-700 hover:text-white border border-gray-200/80 shadow-xs text-xs font-semibold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all backdrop-blur-xs"
                    >
                        <Rotate3D className="h-3.5 w-3.5" />
                        <span>3D View</span>
                    </button>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-blue-600">{product.categoryName}</span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
                    {product.description || 'Engineered hardware with industry-leading performance.'}
                </p>

                {/* Price & Add to Cart Button */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block">Price</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAdding}
                        className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${justAdded
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-sm'
                            }`}
                    >
                        {isAdding ? (
                            <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : justAdded ? (
                            <>
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                Added
                            </>
                        ) : isOutOfStock ? (
                            'Sold Out'
                        ) : (
                            <>
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
