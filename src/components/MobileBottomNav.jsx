import React from 'react';
import { Home, Grid, Zap, Package, ShoppingBag, Heart, User, LayoutDashboard } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function MobileBottomNav() {
  const { 
    cart, 
    wishlist, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    setIsOrdersOpen, 
    setSelectedCategory,
    setIsAdminMode,
    isAdminMode
  } = useShop();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (isAdminMode) return null; // Admin has its own mobile nav

  const scrollToCategories = () => {
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDeals = () => {
    const deals = document.getElementById('deals-section');
    if (deals) {
      deals.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
      <div className="grid grid-cols-5 items-center h-14 px-1">
        
        {/* 1. Home */}
        <button
          onClick={scrollToCategories}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 active:scale-90 transition"
        >
          <Home className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-bold text-blue-600 mt-0.5">Home</span>
        </button>

        {/* 2. Categories */}
        <button
          onClick={() => {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 active:scale-90 transition"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Categories</span>
        </button>

        {/* 3. Wishlist / Deals */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 text-slate-600 hover:text-rose-600 active:scale-90 transition"
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute top-0.5 right-4 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] font-semibold mt-0.5">Wishlist</span>
        </button>

        {/* 4. Orders */}
        <button
          onClick={() => setIsOrdersOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 active:scale-90 transition"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Orders</span>
        </button>

        {/* 5. Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 text-slate-600 hover:text-blue-600 active:scale-90 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-yellow-400 text-blue-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Cart</span>
        </button>

      </div>
    </nav>
  );
}
