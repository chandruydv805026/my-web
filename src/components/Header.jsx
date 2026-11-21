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
    setIsAddressModalOpen,
    userAddresses,
    activeAddressIndex,
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

  // Active delivery address for current user
  const activeAddress = (userAddresses && userAddresses[activeAddressIndex]) || user?.address;

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
      <div className="bg-[#2874f0] text-white py-3 sm:py-3.5 px-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Row: Logo, Deliver To, Search, User, Wishlist, Cart */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer flex-shrink-0" 
              onClick={() => { setSelectedCategory('all'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black italic tracking-tight text-white font-sans">
                    Ratu<span className="text-yellow-300">Mart</span>
                  </span>
                  <span className="text-[10px] sm:text-xs bg-yellow-400 text-blue-900 font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider shadow-2xs">
                    Plus
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-blue-100 italic -mt-0.5 font-semibold">
                  Explore <span className="text-yellow-300 font-bold ml-0.5">Fashion</span>
                  <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300 ml-0.5 inline" />
                </div>
              </div>
            </div>

            {/* Desktop Location Selector - Shown only when user is logged in */}
            {user && (
              <div 
                onClick={() => setIsAddressModalOpen(true)}
                className="hidden lg:flex items-center gap-2 cursor-pointer bg-blue-700/60 hover:bg-blue-600/80 border border-blue-300/40 px-3.5 py-2 rounded-lg transition shadow-2xs group"
                title="Click to view, edit or switch delivery address"
              >
                <MapPin className="w-4.5 h-4.5 text-yellow-300 flex-shrink-0 group-hover:animate-bounce" />
                <div className="text-left leading-tight">
                  <span className="text-blue-200 text-[11px] font-medium block">
                    Deliver to {activeAddress?.name ? activeAddress.name.split(' ')[0] : (user.name ? user.name.split(' ')[0] : '')}
                  </span>
                  <strong className="text-white font-bold text-xs truncate block max-w-[150px]">
                    {activeAddress?.street || activeAddress?.area || activeAddress?.city || 'Ratu, Ranchi'} {activeAddress?.pincode ? `- ${activeAddress.pincode}` : ''}
                  </strong>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
              </div>
            )}

            {/* Desktop Search Bar */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xl mx-2 lg:mx-3">
              <div className="relative flex items-center bg-white rounded-lg shadow-sm overflow-hidden border-2 border-transparent focus-within:border-yellow-400">
                <input
                  type="text"
                  placeholder="Search for Kurtas, Silk Sarees, Jackets, Dresses..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  className="w-full py-2.5 pl-4 pr-20 text-slate-800 text-sm placeholder-slate-400 focus:outline-none font-medium"
                />

                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-700 mr-1">
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button onClick={handleVoiceSearch} className={`p-2 text-blue-600 hover:bg-slate-50 transition ${isVoiceListening ? 'animate-bounce text-red-600' : ''}`} title="Voice Search">
                  <Mic className="w-4 h-4" />
                </button>

                <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 px-4 sm:px-5 py-2.5 transition font-extrabold flex items-center justify-center">
                  <Search className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSearchSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedProduct(item); setShowSearchSuggestions(false); }}
                      className="flex items-center gap-3 p-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition"
                    >
                      <img src={item.image} alt={item.name} className="w-9 h-9 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">₹{item.price} ({item.discount}% off)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              
              {/* User Account / Login Button */}
              <div className="relative" ref={dropdownRef}>
                {user?.isLoggedIn ? (
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1.5 bg-white text-blue-700 font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md text-xs sm:text-sm shadow-sm hover:bg-blue-50 transition"
                  >
                    <User className="w-4 h-4 text-blue-700" />
                    <span className="hidden sm:inline max-w-[85px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-white hover:bg-blue-50 text-blue-700 font-extrabold px-4 sm:px-5 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Login
                  </button>
                )}

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-[11px] text-slate-500 font-medium">Welcome,</p>
                      <p className="font-bold text-slate-900 truncate text-sm">{user?.name}</p>
                    </div>

                    <button 
                      onClick={() => { setIsOrdersOpen(true); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    >
                      <Package className="w-4 h-4 text-blue-600" />
                      My Orders
                    </button>

                    <button 
                      onClick={() => { setIsWishlistOpen(true); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
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
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Link (Desktop) */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="hidden sm:flex relative items-center justify-center text-white hover:text-yellow-200 hover:bg-blue-600/50 p-2 rounded-full transition"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm shadow-md transition active:scale-95"
              >
                <div className="relative">
                  <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-yellow-400 animate-bounce">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-black">Cart</span>
              </button>

            </div>

          </div>

          {/* Mobile Full-Width Search Bar */}
          <div className="md:hidden mt-2.5 relative">
            <div className="relative flex items-center bg-white rounded-xl shadow-xs overflow-hidden border border-blue-200/80">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search kurtas, sarees, jackets, sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-10 pr-20 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none font-medium"
              />

              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1.5 text-slate-400 mr-1">
                  <X className="w-4 h-4" />
                </button>
              )}

              <button 
                onClick={handleVoiceSearch} 
                className={`p-2 text-blue-600 bg-slate-50 border-l border-slate-200 ${isVoiceListening ? 'animate-pulse text-red-600' : ''}`}
                title="Voice Search"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Location Bar - Shown only when user is logged in */}
      {user && (
        <div 
          onClick={() => setIsAddressModalOpen(true)}
          className="lg:hidden bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border-b border-blue-200/60 px-3.5 py-2 flex items-center justify-between text-xs text-slate-800 cursor-pointer shadow-2xs active:bg-blue-100"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-slate-600 font-medium flex-shrink-0">Deliver to:</span>
            <strong className="text-slate-900 font-bold truncate">
              {activeAddress ? `${activeAddress.name ? activeAddress.name + ' - ' : ''}${activeAddress.street || activeAddress.area || activeAddress.city || 'Ratu, Ranchi'} ${activeAddress.pincode ? `(${activeAddress.pincode})` : ''}` : 'Ratu, Ranchi'}
            </strong>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-md flex-shrink-0 ml-1 shadow-2xs">
            Edit / Change
          </span>
        </div>
      )}

    </header>
  );
}
