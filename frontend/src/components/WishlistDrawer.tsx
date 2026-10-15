import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
    const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, clearWishlist } = useWishlist();
    const { addToCart, setIsCartOpen } = useCart();

    if (!isWishlistOpen) return null;

    const handleMoveToCart = async (product: any) => {
        await addToCart(product.id, 1);
        removeFromWishlist(product.id);
    };

    const handleAddAllToCart = async () => {
        for (const item of wishlist) {
            await addToCart(item.id, 1);
        }
        clearWishlist();
        setIsWishlistOpen(false);
        setIsCartOpen(true);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={() => setIsWishlistOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                            <h2 className="text-base font-bold text-gray-900">Saved Wishlist</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsWishlistOpen(false)}
                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Wishlist Items List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {wishlist.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="h-16 w-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-3">
                                    <Heart className="h-8 w-8" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">Your wishlist is empty</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                    Tap the heart icon on any product to save items you love for later.
                                </p>
                                <button
                                    onClick={() => setIsWishlistOpen(false)}
                                    className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all"
                                >
                                    Explore Hardware
                                </button>
                            </div>
                        ) : (
                            wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-2xs"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-20 w-20 rounded-xl bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                                                <button
                                                    onClick={() => removeFromWishlist(item.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-gray-500">{item.categoryName}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-xs font-bold text-gray-900">
                                                ₹{Number(item.price).toLocaleString('en-IN')}
                                            </span>

                                            <button
                                                onClick={() => handleMoveToCart(item)}
                                                className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 transition-all"
                                            >
                                                Move to Cart
                                                <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    {wishlist.length > 0 && (
                        <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex gap-3">
                            <button
                                onClick={clearWishlist}
                                className="px-4 py-3 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Clear Wishlist
                            </button>
                            <button
                                onClick={handleAddAllToCart}
                                className="flex-1 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-bold text-white shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 transition-all"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Move All to Cart ({wishlist.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
