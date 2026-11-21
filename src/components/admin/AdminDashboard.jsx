import React from 'react';
import { 
  TrendingUp, IndianRupee, ShoppingBag, Users, 
  Package, AlertTriangle, ArrowUpRight, CheckCircle2, 
  Clock, ShieldCheck, Sparkles, PlusCircle, Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminDashboard({ onNavigate }) {
  const { products, orders, customers, coupons, setAdminTab } = useShop();

  // Metrics calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter(p => (p.stockLeft || 0) < 10);
  const pendingOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Packing');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-blue-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 fill-blue-950" /> Super Admin Control
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to RatuMart Owner Console
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Complete store control at your fingertips. Add new collections, manage pricing, fulfill customer orders, and track real-time sales.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Add New Clothes
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" /> View Orders ({orders.length})
          </button>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Sales</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> 100% Cash on Delivery
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Orders</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{totalOrders}</span>
              <span className="text-xs text-slate-400 font-medium">({pendingOrders.length} pending)</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {deliveredOrders.length} Delivered
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Catalog Outfits</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{totalProducts}</span>
              <span className="text-xs text-slate-400 font-medium">items</span>
            </div>
            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {lowStockProducts.length} low stock alerts
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Shoppers</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{totalCustomers}</span>
              <span className="text-xs text-slate-400 font-medium">registered</span>
            </div>
            <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Real Verified Shoppers
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-400">Real-time orders placed on RatuMart</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {orders.slice(0, 4).map(ord => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    <img 
                      src={ord.items[0]?.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200"} 
                      alt="Order" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-blue-600 block">{ord.id}</span>
                    <span className="text-slate-700 font-semibold truncate block max-w-[150px] sm:max-w-[200px]">
                      {ord.address?.name || 'Customer'} &bull; {ord.items[0]?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{ord.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900 block">₹{ord.totalAmount?.toLocaleString('en-IN')}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    ord.status === 'Delivered' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : ord.status === 'Shipped' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status || 'Confirmed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Product Alerts & Marketing Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Low Stock Watch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Inventory Stock Alerts
              </h3>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Update Stock
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              {lowStockProducts.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate block max-w-[170px]">{p.name}</span>
                  </div>
                  <span className="bg-rose-600 text-white font-black px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                    Only {p.stockLeft} left!
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Promo Coupons Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Active Store Coupons
              </h3>
              <button
                onClick={() => onNavigate('coupons')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {coupons.map(c => (
                <div key={c.code} className="bg-emerald-50 border border-dashed border-emerald-300 p-2 rounded-lg flex items-center justify-between gap-3 flex-1 min-w-[130px]">
                  <div>
                    <span className="font-mono font-bold text-emerald-800 block text-xs">{c.code}</span>
                    <span className="text-[10px] text-emerald-600">Save ₹{c.flatDiscount || c.maxDiscount}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
