import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category, ProductListResponse } from '../types';
import { api } from '../lib/api';
import { ProductCard } from './ProductCard';
import { Hero3DCanvas } from './Hero3DCanvas';
import { Layers, PackageX, ChevronLeft, ChevronRight, Zap, ShieldCheck, ArrowUpDown, CheckSquare, Square } from 'lucide-react';

interface ProductGridProps {
    searchQuery: string;
    onView3D?: (product: Product) => void;
    onProductClick?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery, onView3D, onProductClick }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Smart Filters State
    const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'stock'>('featured');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [priceRange, setPriceRange] = useState<number>(400000);

    // 1. Fetch Categories for the filter pills
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data: Category[] = await api.get('/categories');
                setCategories(data);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Reset to page 1 on search or filter change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedCategory, sortBy, inStockOnly, priceRange]);

    // 2. Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params: any = { page, limit: 24 };
                if (searchQuery) params.search = searchQuery;
                if (selectedCategory) params.categoryId = selectedCategory;

                const data: ProductListResponse = await api.get('/products', { params });
                setProducts(data.items || []);
                setTotalPages(data.pagination.totalPages || 1);
                setTotalItems(data.pagination.totalItems || 0);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, selectedCategory, page]);

    // 3. Client-side Smart Sorting & Filtering on the current view
    const filteredProducts = useMemo(() => {
        let list = [...products];

        if (inStockOnly) {
            list = list.filter((p) => p.availableStock > 0);
        }

        list = list.filter((p) => Number(p.price) <= priceRange);

        if (sortBy === 'price_asc') {
            list.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === 'stock') {
            list.sort((a, b) => b.availableStock - a.availableStock);
        }

        return list;
    }, [products, sortBy, inStockOnly, priceRange]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Clean Hero Banner with Live Three.js 3D Canvas */}
            {!searchQuery && selectedCategory === null && page === 1 && (
                <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 sm:p-10 lg:p-12 mb-10 text-white shadow-lg overflow-hidden border border-blue-500/20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left Content Column */}
                        <div className="lg:col-span-7 z-10">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-5 border border-white/20">
                                <Zap className="h-3.5 w-3.5 text-amber-300" />
                                <span>377+ Live Hardware Catalog</span>
                                <span className="w-1 h-1 rounded-full bg-white/60" />
                                <span className="text-blue-200">PostgreSQL Powered</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                Hardware Engineered for Peak Precision.
                            </h1>

                            <p className="mt-4 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl">
                                Explore flagship smartphones, studio acoustics, pro laptops, and smart wearables with real-time stock allocation and pessimistic row-locking checkout.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-100">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                    <span>100% Genuine Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Zap className="h-4 w-4 text-amber-300" />
                                    <span>Instant Dispatch</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Three.js 3D Canvas Column */}
                        <div className="lg:col-span-5 flex items-center justify-center">
                            <Hero3DCanvas />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter Pills & Counter */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedCategory === null
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Layers className="h-3.5 w-3.5" />
                        All Categories
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="hidden sm:block shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    {totalItems} Products Available
                </div>
            </div>

            {/* Smart Sorting & Price Range Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-semibold text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                        >
                            <option value="featured">Featured Catalog</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="stock">High Stock Availability</option>
                        </select>
                    </div>

                    {/* In-Stock Only Toggle */}
                    <button
                        type="button"
                        onClick={() => setInStockOnly(!inStockOnly)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${inStockOnly
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {inStockOnly ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                        In Stock Only
                    </button>
                </div>

                {/* Price Range Slider */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="font-semibold text-gray-600 whitespace-nowrap">
                        Max Price: <strong className="text-gray-900">₹{priceRange.toLocaleString('en-IN')}</strong>
                    </span>
                    <input
                        type="range"
                        min="5000"
                        max="400000"
                        step="5000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-28 sm:w-36 accent-blue-600 cursor-pointer"
                    />
                </div>
            </div>

            {/* Product Grid State */}
            {loading ? (
                // Loading Skeleton Cards
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="rounded-2xl bg-white border border-gray-200 overflow-hidden animate-pulse p-4 space-y-4">
                            <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                                <div className="h-5 bg-gray-200 rounded w-16" />
                                <div className="h-8 bg-gray-200 rounded-xl w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                // Empty State
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 max-w-lg mx-auto p-8 shadow-xs">
                    <PackageX className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-900">No products found</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Try clearing your filters or choosing a different category.
                    </p>
                </div>
            ) : (
                // Live Products Grid
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onView3D={onView3D}
                                onClick={onProductClick}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                                Page {page} of {totalPages}
                            </div>

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
