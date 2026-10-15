import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FlashSaleBanner } from './components/FlashSaleBanner';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SellerStudioModal } from './components/SellerStudioModal';
import { Product3DModal } from './components/Product3DModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrdersModal } from './components/OrdersModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CompareModal } from './components/CompareModal';
import type { Product } from './types';
import { ShieldCheck, Zap, Server, Database } from 'lucide-react';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSellerStudioOpen, setIsSellerStudioOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProduct3D, setSelectedProduct3D] = useState<Product | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Flash Sale Live Ticking Announcement */}
      <FlashSaleBanner />

      {/* Sticky Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSellerStudio={() => setIsSellerStudioOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Catalog Storefront */}
      <main className="flex-1">
        <ProductGrid
          key={refreshKey}
          searchQuery={searchQuery}
          onView3D={(product) => setSelectedProduct3D(product)}
          onProductClick={(product) => setSelectedProductDetail(product)}
        />
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer />

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Product Detail & Spec Sheet Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onView3D={(product) => setSelectedProduct3D(product)}
      />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* My Orders & Live Delivery Tracker Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Seller Studio Modal */}
      <SellerStudioModal
        isOpen={isSellerStudioOpen}
        onClose={() => setIsSellerStudioOpen(false)}
        onProductCreated={() => setRefreshKey((k) => k + 1)}
      />

      {/* 360 Degree Product 3D Inspector Modal */}
      <Product3DModal
        product={selectedProduct3D}
        isOpen={!!selectedProduct3D}
        onClose={() => setSelectedProduct3D(null)}
      />

      {/* Floating Product Comparison Bar */}
      <CompareFloatingBar />

      {/* Side-by-Side Product Comparison Modal */}
      <CompareModal />

      {/* Clean Google Store Style Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 tracking-wide">ShopFlow</span>
            <span>• E-Commerce Platform</span>
          </div>

          {/* Architecture Badges */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
              <Database className="h-3.5 w-3.5 text-blue-600" /> PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
              <Server className="h-3.5 w-3.5 text-emerald-600" /> Express Core
            </span>
            <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> React + Vite
            </span>
            <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-red-500" /> Pessimistic Locks
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
