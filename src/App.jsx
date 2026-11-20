import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import ProductGrid from './components/ProductGrid';
import TrustBadges from './components/TrustBadges';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';

// Admin Panel
import AdminPanel from './components/admin/AdminPanel';

// Modals & Drawers
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrdersModal from './components/OrdersModal';
import AuthModal from './components/AuthModal';
import SizeGuideModal from './components/SizeGuideModal';
import PincodeModal from './components/PincodeModal';
import Toast from './components/Toast';

function StoreApp() {
  const { isAdminMode, setIsAdminMode } = useShop();

  if (isAdminMode) {
    return (
      <>
        <AdminPanel />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative pb-16 md:pb-0">
      
      {/* Main Flipkart-Style Mobile-First Header */}
      <Header />

      {/* Horizontal Circle Categories Bar */}
      <CategoryBar />

      {/* Main Content Area */}
      <main className="flex-1 space-y-1 sm:space-y-2">
        {/* Product Catalog Grid with Mobile Sort & Clean Full Grid */}
        <ProductGrid />

        {/* Flipkart Trust Badges */}
        <TrustBadges />
      </main>

      {/* Rich Footer */}
      <Footer />

      {/* Flipkart-Style Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals & Overlays */}
      <ProductModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <OrdersModal />
      <AuthModal />
      <SizeGuideModal />
      <PincodeModal />
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <StoreApp />
    </ShopProvider>
  );
}
