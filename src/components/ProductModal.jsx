import React, { useState } from 'react';
import { 
  X, Heart, Star, ShoppingBag, Zap, ShieldCheck, 
  Truck, RotateCcw, Check, MapPin, Tag, ChevronRight, Share2, ArrowLeft 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ProductModal() {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    startBuyNow,
    wishlist, 
    toggleWishlist,
    setIsCartOpen,
    setIsCheckoutOpen,
    setIsAuthOpen,
    user,
    setIsSizeGuideOpen,
    showToast
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chosenSize, setChosenSize] = useState(null);
  const [chosenColor, setChosenColor] = useState(null);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.includes(selectedProduct.id);
  const currentSize = chosenSize || (selectedProduct.sizes && selectedProduct.sizes[0]);
  const currentColor = chosenColor || (selectedProduct.colors && selectedProduct.colors[0]);
  const images = selectedProduct.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image];

  const handleBuyNow = () => {
    startBuyNow(selectedProduct, currentSize, currentColor, 1);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, currentSize, currentColor, 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedProduct.name,
        text: `Check out ${selectedProduct.name} on RatuMart!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast("Product link copied!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain touch-pan-y bg-black/75 flex sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      
      {/* Container - Full-screen on mobile, rounded card on tablet/desktop */}
      <div className="relative bg-white w-full sm:max-w-4xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl sm:max-h-[92vh] overflow-y-auto overscroll-contain no-scrollbar border-0 sm:border border-slate-200 flex flex-col justify-between">
        
        {/* Mobile Sticky Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white px-3 py-2.5 border-b border-slate-100 flex items-center justify-between sm:hidden shadow-xs">
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1 text-slate-700 hover:bg-slate-100 rounded-full flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">
            {selectedProduct.brand}
          </span>

          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-1.5 text-slate-600 rounded-full">
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => toggleWishlist(selectedProduct.id)} 
              className={`p-1.5 rounded-full ${isWishlisted ? 'text-rose-500' : 'text-slate-600'}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Desktop Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="hidden sm:block absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Body */}
        <div className="p-3 sm:p-6 md:p-8 flex-1 pb-24 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            
            {/* Left Column: Image Gallery (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              {/* Main Image */}
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img
                  src={images[activeImageIndex] || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-top"
                />

                {/* Desktop Wishlist & Share */}
                <div className="hidden sm:flex absolute top-3 right-3 items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/80 text-slate-600 hover:bg-white shadow transition"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`p-2 rounded-full shadow transition ${
                      isWishlisted ? 'bg-rose-50 text-rose-500 border border-rose-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-blue-600 shadow scale-105' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Selection (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Brand & Assured */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedProduct.brand}
                  </span>
                  {selectedProduct.assured && (
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-yellow-300 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded shadow-xs">
                      ★ Ratu Assured
                    </span>
                  )}
                </div>

                <h1 className="mt-1 text-base sm:text-xl font-bold text-slate-900 leading-snug">
                  {selectedProduct.name}
                </h1>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5 bg-green-700 text-white font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded">
                    {selectedProduct.rating} <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedProduct.ratingCount?.toLocaleString('en-IN')} Ratings
                  </span>
                </div>
              </div>

              {/* Flipkart Special Price Box */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 sm:p-3.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Special Festive Price</span>
                <div className="flex items-baseline gap-2.5 mt-1 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{selectedProduct.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 line-through">
                    ₹{selectedProduct.originalPrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-600">
                    {selectedProduct.discount}% off
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Inclusive of all taxes &amp; GST</p>
              </div>

              {/* Size Selector with Size Guide */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Size: <strong className="text-blue-600">{currentSize}</strong>
                  </h4>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs font-bold text-blue-600 underline"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setChosenSize(size)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition active:scale-95 ${
                        currentSize === size
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              {selectedProduct.colors && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Color: <strong className="text-blue-600">{currentColor}</strong>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setChosenColor(color)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                          currentColor === color
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7 Days Return Policy & Cash on Delivery (COD) Available */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs sm:text-sm">7 Days Return Policy</strong>
                    <span className="text-[11px] text-emerald-800 font-medium">Easy doorstep return &amp; exchange</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Cash on Delivery (COD)</strong>
                    <span className="text-[11px] text-blue-800 font-medium">Pay cash at your doorstep</span>
                  </div>
                </div>
              </div>

              {/* Highlights & Fabric */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Fabric</span>
                    <strong className="text-slate-800">{selectedProduct.fabric}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Fit</span>
                    <strong className="text-slate-800">{selectedProduct.fit}</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Flipkart Sticky Mobile Bottom Action Bar (Fixed at the bottom of the screen on phones) */}
        <div className="fixed sm:sticky bottom-0 inset-x-0 bg-white p-2.5 sm:p-4 border-t border-slate-200 shadow-2xl flex items-center gap-2 z-40">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-xs sm:text-sm py-3 px-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ADD TO CART</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 px-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>BUY NOW</span>
          </button>
        </div>

      </div>

    </div>
  );
}
