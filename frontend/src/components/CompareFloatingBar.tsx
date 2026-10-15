import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Columns, X, ArrowRight, ShoppingBag } from 'lucide-react';

export const CompareFloatingBar: React.FC = () => {
    const { compareItems, removeFromCompare, clearCompare, setIsCompareModalOpen } = useCompare();

    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto rounded-3xl bg-white/95 border border-gray-200/90 shadow-2xl backdrop-blur-md p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Columns className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-900">
                        Compare ({compareItems.length}/3)
                    </h4>
                    <p className="text-[11px] text-gray-500 hidden sm:block">Side-by-side spec matrix</p>
                </div>
            </div>

            {/* Thumbnail Pills */}
            <div className="flex items-center gap-2">
                {compareItems.map((item) => (
                    <div
                        key={item.id}
                        className="relative group h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center"
                    >
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <ShoppingBag className="h-5 w-5 text-gray-400" />
                        )}
                        <button
                            onClick={() => removeFromCompare(item.id)}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={clearCompare}
                    className="p-2 text-gray-400 hover:text-gray-700 text-xs font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={() => setIsCompareModalOpen(true)}
                    disabled={compareItems.length < 2}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center gap-1.5 transition-all"
                >
                    Compare Now
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};
