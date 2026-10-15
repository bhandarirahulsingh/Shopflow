import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Category } from '../types';
import { X, Store, PackagePlus } from 'lucide-react';

interface SellerStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductCreated?: () => void;
}

export const SellerStudioModal: React.FC<SellerStudioModalProps> = ({
    isOpen,
    onClose,
    onProductCreated,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number>(1);
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('20');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const data: any = await api.get('/categories');
                    setCategories(data);
                    if (data && data.length > 0) setCategoryId(data[0].id);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await api.post('/products', {
                name,
                categoryId: Number(categoryId),
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                sku: sku.toUpperCase(),
                description,
                imageUrl: imageUrl || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                if (onProductCreated) onProductCreated();
            }, 1200);
        } catch (err: any) {
            setError(err.message || 'Failed to list product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <Store className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Seller Studio</h2>
                        <p className="text-xs text-gray-500">List new hardware in the live ShopFlow catalog</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center py-10">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                            <PackagePlus className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Product Listed Successfully!</h3>
                        <p className="text-xs text-gray-500 mt-1">Inventory stock has been initialized in PostgreSQL.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product Title</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Apple MacBook Pro M3 16-inch"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(Number(e.target.value))}
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id} className="text-gray-900">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">SKU Code</label>
                                <input
                                    type="text"
                                    required
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. MBPM3-16-SLV"
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹ INR)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 199990"
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock Count</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product Description</label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="High-performance specs, battery life, features..."
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Publish to Catalog'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
