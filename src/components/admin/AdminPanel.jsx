import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, 
  Megaphone, Users, Settings, ArrowLeft, ExternalLink 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import AdminNavbar from './AdminNavbar';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCoupons from './AdminCoupons';
import AdminMarketing from './AdminMarketing';
import AdminCustomers from './AdminCustomers';
import AdminSettings from './AdminSettings';

export default function AdminPanel() {
  const { adminTab, setAdminTab, setIsAdminMode, orders } = useShop();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Catalog', icon: ShoppingBag },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: Package, 
      badge: orders.filter(o => o.status === 'Confirmed' || o.status === 'Packing').length 
    },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'marketing', label: 'Banners', icon: Megaphone },
    { id: 'customers', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-16 md:pb-0">
      
      {/* Top Navbar */}
      <AdminNavbar />

      {/* Mobile Horizontal Navigation Tabs (Phone-Friendly) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 sticky top-[49px] z-30 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex-shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-yellow-400 text-blue-950' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 sm:py-5 flex-1 flex flex-col md:flex-row gap-4 sm:gap-5">
        
        {/* Desktop Left Admin Navigation Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs sticky top-20">
            
            <div className="px-3 py-2 mb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Navigation</span>
              <span className="text-xs font-black text-slate-800">RatuMart Owner Panel</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-yellow-400 text-blue-950' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Back to store shortcut */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAdminMode(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Store</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 min-w-0">
          {adminTab === 'dashboard' && <AdminDashboard onNavigate={setAdminTab} />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'coupons' && <AdminCoupons />}
          {adminTab === 'marketing' && <AdminMarketing />}
          {adminTab === 'customers' && <AdminCustomers />}
          {adminTab === 'settings' && <AdminSettings />}
        </main>

      </div>

    </div>
  );
}
