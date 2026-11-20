import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, loginWithEmail, registerWithEmail } = useShop();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAuthOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both Email and Password');
      return;
    }

    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      setIsAuthOpen(false);
      setEmail('');
      setPassword('');
    } else {
      setErrorMessage(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !email || !password) {
      setErrorMessage('Please provide Full Name, Email and Password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await registerWithEmail({ name, email, password, phone });
    setLoading(false);

    if (result.success) {
      setIsAuthOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } else {
      setErrorMessage(result.message || 'Registration failed. Try a different email.');
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@ratumart.com');
    setPassword('adminpassword123');
    setActiveTab('login');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Flipkart Blue Branding */}
        <div className="bg-[#2874f0] text-white p-6 md:w-5/12 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-800/60 px-2.5 py-1 rounded-full text-[10px] font-bold text-yellow-300 mb-3 border border-blue-400/30">
              <Sparkles className="w-3 h-3 fill-yellow-300" /> RatuMart Authenticated
            </div>

            <h3 className="text-xl font-black tracking-tight leading-snug">
              {activeTab === 'login' ? 'Login' : 'Naya Account'}
            </h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              {activeTab === 'login'
                ? 'Get access to your Orders, Wishlist and Personalized Fashion Recommendations'
                : 'Sign up to shop trending fashion for Chhote Bachhe, Bade Log aur Ladkiyan'}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-blue-400/40 text-[11px] text-blue-100 space-y-1.5">
            <p className="flex items-center gap-1.5 font-bold text-yellow-300">
              <Sparkles className="w-3.5 h-3.5 fill-yellow-300" /> +150 SuperCoins on signup
            </p>
            <p className="flex items-center gap-1 text-[10px] text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% Secure &amp; Authentic
            </p>
          </div>
        </div>

        {/* Right Side: Tab Switcher & Forms */}
        <div className="p-6 md:w-7/12 flex-1 flex flex-col justify-center">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`pb-2 text-xs font-bold transition border-b-2 flex-1 text-center ${
                activeTab === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`pb-2 text-xs font-bold transition border-b-2 flex-1 text-center ${
                activeTab === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Naya Account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] leading-snug">
              {errorMessage}
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition uppercase tracking-wider text-xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
              </button>

              {/* Demo Admin Quick Login Helper */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  ⚡ Fill Admin Credentials (admin@ratumart.com)
                </button>
              </div>

              <div className="text-center pt-1 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  New to RatuMart?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="e.g. priya@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black py-2.5 rounded-lg shadow-sm transition uppercase tracking-wider text-xs active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register & Claim 150 Coins'}
              </button>

              <div className="text-center pt-1 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  Existing user?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
