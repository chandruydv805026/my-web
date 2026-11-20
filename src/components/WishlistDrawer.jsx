import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function WishlistDrawer() {
  const { 
    wishlist, 
    products, 
    isWishlistOpen, 
    setIsWishlistOpen, 
    toggleWishlist, 
    moveToCartFromWishlist,
    setSelectedProduct 
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-extrabold text-slate-800">My Wishlist</h2>
            <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
              {wishlistedProducts.length} items
            </span>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mb-4">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore our festive collections and tap the heart icon on any outfit to save it here!
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm transition"
              >
                Browse Outfits
              </button>
            </div>
          ) : (
            wishlistedProducts.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex gap-3 group hover:border-blue-300 transition"
              >
                {/* Image */}
                <div 
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsWishlistOpen(false);
                  }}
                  className="w-20 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer"
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h4 
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsWishlistOpen(false);
                      }}
                      className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition"
                    >
                      {product.name}
                    </h4>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] font-bold text-emerald-600">{product.discount}% off</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => moveToCartFromWishlist(product)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-950 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xs transition flex items-center justify-center gap-1 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
