import React from 'react';
import { Clock, ChevronRight, Zap, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function DealOfTheDay() {
  const { products, setSelectedProduct, setSelectedCategory } = useShop();

  const hotDeals = [...products]
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 6);

  return (
    <div id="deals-section" className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 scroll-mt-28">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-3 sm:p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Deals of the Day</h3>
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase animate-pulse">Live</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Top fashion discounts up to 73% off</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('all');
              const target = document.getElementById('products-section');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-0.5 active:scale-95"
          >
            VIEW ALL <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal Scroll Shelf - Optimized for Mobile Thumb Swipe */}
        <div className="mt-3 flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 touch-pan-x">
          {hotDeals.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProduct(item)}
              className="group flex-shrink-0 w-36 sm:w-48 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer p-2 sm:p-3 flex flex-col justify-between active:scale-95"
            >
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-white mb-1.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute top-1 left-1 bg-green-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                  {item.discount}% OFF
                </span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase truncate block">{item.brand}</span>
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                  {item.name}
                </h4>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xs sm:text-sm font-black text-slate-900">₹{item.price}</span>
                  <span className="text-[9px] sm:text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="inline-flex items-center gap-0.5 bg-green-700 text-white font-bold px-1 py-0.2 rounded text-[9px]">
                    {item.rating} <Star className="w-2 h-2 fill-white" />
                  </span>
                  <span className="text-green-700 font-bold text-[9px]">Special Price</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
