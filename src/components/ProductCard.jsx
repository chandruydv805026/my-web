import React from 'react';
import { Heart, Star, Plus, Eye, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, setSelectedProduct } = useShop();

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Product Image Container */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer" 
        onClick={() => setSelectedProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Discount & Tag Badge */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
          <span className="bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded shadow uppercase tracking-wider">
            {product.discount}% OFF
          </span>
          {product.tag && (
            <span className="hidden sm:inline bg-blue-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
              {product.tag}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button - Big touch area for phone thumbs */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1.5 right-1.5 p-1.5 sm:p-2 rounded-full shadow-xs transition-all active:scale-75 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/95 text-slate-500 hover:text-rose-500 border border-slate-200/80'
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Assured Badge (Overlaid on bottom left of image) */}
        {product.assured && (
          <div className="absolute bottom-1.5 left-1.5 bg-white text-blue-700 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 border border-blue-200">
            <span className="text-yellow-500">★</span> Assured
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand */}
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
            {product.brand}
          </span>

          {/* Title */}
          <h3 
            onClick={() => setSelectedProduct(product)}
            className="text-[11px] sm:text-xs font-semibold text-slate-900 line-clamp-2 hover:text-blue-600 transition cursor-pointer min-h-[28px] sm:min-h-[32px] leading-tight mt-0.5"
          >
            {product.name}
          </h3>

          {/* Rating Pill */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 bg-green-700 text-white font-bold text-[9px] sm:text-[10px] px-1 py-0.2 rounded">
              {product.rating} <Star className="w-2 h-2 fill-white" />
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">
              ({product.ratingCount?.toLocaleString('en-IN')})
            </span>
          </div>

          {/* Pricing Row */}
          <div className="mt-1.5 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-slate-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
              ₹{product.originalPrice?.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
              {product.discount}% off
            </span>
          </div>

          {/* Free delivery tag */}
          <div className="mt-1 text-[9px] text-emerald-700 font-semibold truncate hidden sm:block">
            Free Delivery
          </div>
        </div>

        {/* Quick Add To Cart Button */}
        <div className="mt-2 pt-1.5 border-t border-slate-100">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-[10px] sm:text-xs py-1.5 px-2 rounded-lg shadow-xs transition flex items-center justify-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>

    </div>
  );
}
