import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, 
  Megaphone, Users, Settings, ArrowLeft, ExternalLink,
  Lock, Key, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 
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
  const { adminTab, setAdminTab, setIsAdminMode, orders, user, loginWithEmail } = useShop();

  const [adminEmail, setAdminEmail] = useState('admin@ratumart.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!adminPassword) {
      setAuthError('Please enter admin password');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(adminEmail, adminPassword);
      if (!res.success) {
        setAuthError(res.message || 'Incorrect password. Access denied.');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated as admin, show secure password gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Glowing accent circle */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 shadow-lg flex items-center justify-center mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-yellow-400">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner Console
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Ratu<span className="text-yellow-400">Mart</span> Admin Access
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please enter your master password to unlock the store management console.
            </p>
          </div>

          {authError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email ID
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Unlock Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
                setIsAdminMode(false);
              }}
              className="text-xs text-slate-400 hover:text-yellow-400 font-semibold transition inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Store</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

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
