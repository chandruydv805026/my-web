import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import HeroBanner from './components/HeroBanner';
import DealOfTheDay from './components/DealOfTheDay';
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

import { LayoutDashboard } from 'lucide-react';

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
        {/* Hero Banner Carousel & Bank Strip */}
        <HeroBanner />

        {/* Flipkart Deal of the Day Shelf */}
        <DealOfTheDay />

        {/* Product Catalog Grid with Mobile Sort/Filter & Desktop Sidebar */}
        <ProductGrid />

        {/* Flipkart Trust Badges */}
        <TrustBadges />
      </main>

      {/* Rich Footer */}
      <Footer />

      {/* Flipkart-Style Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Floating Desktop Admin Switcher Button (hidden on phone, accessible via top bar on mobile) */}
      <div className="hidden md:block fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsAdminMode(true)}
          className="group flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-yellow-400 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-2xl border-2 border-yellow-400/80 transition-all transform hover:scale-105 active:scale-95"
          title="Open Admin Control Center"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <LayoutDashboard className="w-4 h-4 text-yellow-400" />
          <span className="tracking-wide">Owner Admin Panel</span>
        </button>
      </div>

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
