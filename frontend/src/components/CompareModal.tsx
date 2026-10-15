import React from 'react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { X, Columns, Plus, Check, ShoppingBag } from 'lucide-react';

export const CompareModal: React.FC = () => {
    const { compareItems, isCompareModalOpen, setIsCompareModalOpen, removeFromCompare } = useCompare();
    const { addToCart } = useCart();
    const [addedMap, setAddedMap] = React.useState<{ [key: number]: boolean }>({});

    if (!isCompareModalOpen || compareItems.length === 0) return null;

    const handleAddToCart = async (product: any) => {
        await addToCart(product.id, 1);
        setAddedMap((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedMap((prev) => ({ ...prev, [product.id]: false }));
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsCompareModalOpen(false)} />

            <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Columns className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Side-by-Side Product Comparison</h2>
                            <p className="text-xs text-gray-500">Compare hardware specifications, pricing, and live inventory</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCompareModalOpen(false)}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Comparison Grid Table */}
                <div className="p-6 overflow-x-auto flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-3 text-left text-xs font-bold text-gray-400 uppercase w-48 bg-gray-50/50 rounded-l-xl">
                                    Product
                                </th>
                                {compareItems.map((item) => (
                                    <th key={item.id} className="p-4 text-left w-64 bg-gray-50/50 relative">
                                        <button
                                            onClick={() => removeFromCompare(item.id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white transition-colors"
                                            title="Remove from comparison"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="aspect-square w-24 rounded-xl bg-white border border-gray-200 overflow-hidden mx-auto mb-2 flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 text-center">{item.name}</h4>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-xs">
                            {/* Price */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Price (INR)</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 font-extrabold text-base text-gray-900 text-center">
                                        ₹{Number(item.price).toLocaleString('en-IN')}
                                    </td>
                                ))}
                            </tr>

                            {/* Category */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Category</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 text-center">
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                                            {item.categoryName}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* SKU Code */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Model SKU</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 font-mono text-center text-gray-700">
                                        {item.sku}
                                    </td>
                                ))}
                            </tr>

                            {/* Live Stock */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Stock Availability</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 text-center">
                                        {item.availableStock > 0 ? (
                                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                                In Stock ({item.availableStock} units)
                                            </span>
                                        ) : (
                                            <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md">
                                                Sold Out
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Description & Overview */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Description</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 text-gray-600 leading-relaxed text-center">
                                        {item.description}
                                    </td>
                                ))}
                            </tr>

                            {/* Action Row */}
                            <tr>
                                <td className="p-3.5 font-bold text-gray-500 bg-gray-50/30">Action</td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="p-3.5 text-center">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={item.availableStock <= 0}
                                            className={`px-4 py-2 rounded-full font-bold text-xs text-white shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1 ${addedMap[item.id]
                                                ? 'bg-emerald-600'
                                                : item.availableStock <= 0
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                                }`}
                                        >
                                            {addedMap[item.id] ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
