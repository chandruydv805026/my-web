import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Heart, User, MapPin, 
  Sparkles, Mic, ChevronDown, Package, 
  HelpCircle, LogOut, CheckCircle2, X, Store, Flame,
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function Header() {
  const { 
    cart, 
    wishlist, 
    searchTerm, 
    setSearchTerm, 
    user, 
    setUser,
    logoutUser,
    setIsCartOpen, 
    setIsWishlistOpen,
    setIsOrdersOpen,
    setIsAuthOpen,
    deliveryPincode,
    deliveryCity,
    setIsPincodeModalOpen,
    showToast,
    products,
    setSelectedProduct,
    setSelectedCategory
  } = useShop();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Voice Search Simulation
  const handleVoiceSearch = () => {
    setIsVoiceListening(true);
    showToast("Listening... Speak now (e.g. 'Banarasi Saree', 'Denim Jacket')", "info");
    
    setTimeout(() => {
      const voiceQueries = ["Saree", "Denim Jacket", "Kurta", "Dress", "Hoodie"];
      const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
      setSearchTerm(randomQuery);
      setIsVoiceListening(false);
      showToast(`Search for "${randomQuery}"`, "success");
    }, 2200);
  };

  const suggestions = searchTerm.trim().length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      
      {/* Primary Flipkart App Header */}
      <div className="bg-[#2874f0] text-white pt-2.5 pb-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Row: Logo, User, Wishlist, Cart */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer flex-shrink-0" 
              onClick={() => { setSelectedCategory('all'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold italic tracking-tight text-white font-sans">
                    Ratu<span className="text-yellow-300">Mart</span>
                  </span>
                  <span className="text-[9px] sm:text-xs bg-yellow-400 text-blue-900 font-extrabold px-1 py-0.2 rounded-xs uppercase tracking-tighter">
                    Plus
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] text-blue-100 italic -mt-0.5 font-medium">
                  Explore <span className="text-yellow-300 font-bold ml-0.5">Fashion</span>
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300 ml-0.5 inline" />
                </div>
              </div>
            </div>

            {/* Desktop Location Selector */}
            <div 
              onClick={() => setIsPincodeModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 cursor-pointer bg-blue-600/40 hover:bg-blue-600/70 border border-blue-400/30 px-3 py-1.5 rounded-md transition"
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <div className="text-left text-xs leading-tight">
                <span className="text-blue-200 text-[10px] block">Deliver to</span>
                <strong className="text-white font-semibold truncate block max-w-[110px]">
                  {deliveryCity || "Ratu, Ranchi"} {deliveryPincode || "835222"}
                </strong>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </div>

            {/* Desktop Search Bar (hidden on mobile, shown in next row on phone) */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xl mx-2">
              <div className="relative flex items-center bg-white rounded-md shadow-inner overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="text"
                  placeholder="Search for Kurtas, Silk Sarees, Jackets, Dresses..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  className="w-full py-2 pl-3 pr-16 text-slate-800 text-xs placeholder-slate-400 focus:outline-none"
                />

                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button onClick={handleVoiceSearch} className={`p-1.5 text-blue-600 ${isVoiceListening ? 'animate-bounce text-red-600' : ''}`}>
                  <Mic className="w-3.5 h-3.5" />
                </button>

                <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 px-3 py-2 transition font-bold">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSearchSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedProduct(item); setShowSearchSuggestions(false); }}
                      className="flex items-center gap-2.5 p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">₹{item.price} ({item.discount}% off)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* User Account / Login Button */}
              <div className="relative" ref={dropdownRef}>
                {user?.isLoggedIn ? (
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1 bg-white text-blue-700 font-bold px-2.5 py-1 rounded-sm text-xs shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-white text-blue-700 font-bold px-3 py-1 rounded-sm text-xs shadow-xs"
                  >
                    Login
                  </button>
                )}

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="text-[11px] text-slate-500">Welcome,</p>
                      <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                    </div>

                    <button 
                      onClick={() => { setIsOrdersOpen(true); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      My Orders
                    </button>

                    <button 
                      onClick={() => { setIsWishlistOpen(true); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      Wishlist ({wishlist.length})
                    </button>

                    <button 
                      onClick={() => {
                        if (logoutUser) logoutUser();
                        else {
                          setUser(null);
                          showToast("Logged out successfully", "info");
                        }
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Link (Desktop) */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="hidden sm:flex relative items-center text-white hover:text-yellow-200 p-1"
                title="Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-2.5 sm:px-3 py-1 rounded-sm text-xs shadow-xs"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-yellow-400 animate-bounce">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </button>

            </div>

          </div>

          {/* Mobile Full-Width Search Bar */}
          <div className="md:hidden mt-2 relative">
            <div className="relative flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search kurtas, sarees, jackets, sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-8 pr-16 text-slate-800 text-xs placeholder-slate-400 focus:outline-none"
              />

              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 mr-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button 
                onClick={handleVoiceSearch} 
                className={`p-1.5 text-blue-600 bg-slate-50 border-l border-slate-200 ${isVoiceListening ? 'animate-pulse text-red-600' : ''}`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Location Bar */}
      <div 
        onClick={() => setIsPincodeModalOpen(true)}
        className="lg:hidden bg-blue-50/90 border-b border-blue-100 px-3 py-1.5 flex items-center justify-between text-[11px] text-blue-950 cursor-pointer"
      >
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-slate-600">Deliver to:</span>
          <strong className="text-slate-900 font-bold truncate">
            {deliveryCity || "Ratu, Ranchi"} - {deliveryPincode || "835222"}
          </strong>
        </div>
        <span className="text-[10px] font-bold text-blue-600 underline flex-shrink-0 ml-1">Change</span>
      </div>

    </header>
  );
}
