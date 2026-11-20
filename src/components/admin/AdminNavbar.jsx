import React from 'react';
import { Store, ShieldCheck, Sparkles, ExternalLink, ArrowLeft, Bell } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminNavbar() {
  const { setIsAdminMode, orders, products, storeSettings } = useShop();

  const totalSales = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Admin Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => {
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
            setIsAdminMode(false);
          }}>
            <span className="text-xl sm:text-2xl font-black italic tracking-tight text-white font-sans">
              Ratu<span className="text-yellow-400">Mart</span>
            </span>
            <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          <span className="hidden sm:inline-block text-slate-500 text-xs">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Owner Command Center</span>
          </div>
        </div>

        {/* Center: Live Revenue Ticker */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-300 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/80">
          <span>Catalog: <strong className="text-yellow-400">{products.length} Items</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>Orders: <strong className="text-emerald-400">{orders.length}</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>Gross: <strong className="text-white">₹{totalSales.toLocaleString('en-IN')}</strong></span>
        </div>

        {/* Right: Switch to Live Store button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
              setIsAdminMode(false);
            }}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            title="Switch to customer storefront view"
          >
            <Store className="w-4 h-4" />
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
