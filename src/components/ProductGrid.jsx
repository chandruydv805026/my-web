import React, { useState } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';

export default function ProductGrid() {
  const { 
    filteredProducts, 
    sortBy, 
    setSortBy, 
    searchTerm 
  } = useShop();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const sortOptions = [
    { id: 'popularity', label: 'Popularity' },
    { id: 'price-low', label: 'Price -- Low to High' },
    { id: 'price-high', label: 'Price -- High to Low' },
    { id: 'discount', label: 'Discount (High to Low)' },
    { id: 'rating', label: 'Customer Rating' },
  ];

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 scroll-mt-28">
      
      {/* Grid Layout: Desktop Sidebar + Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* Desktop Left Filter Sidebar (3 cols) */}
        <div className="hidden lg:block lg:col-span-3">
          <FilterSidebar />
        </div>

        {/* Right Main Product Listing (9 cols) */}
        <div className="lg:col-span-9 space-y-3 sm:space-y-4">
          
          {/* Desktop Sort Bar & Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Title & Count */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                  {searchTerm ? `Results for "${searchTerm}"` : 'Trending Fashion Collection'}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  ({filteredProducts.length} items)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                All prices inclusive of GST &bull; 100% Genuine Indian Fashion
              </p>
            </div>

            {/* Desktop Sort By Pills */}
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-bold mr-1 text-[11px] uppercase tracking-wider">
                Sort By:
              </span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap transition ${
                    sortBy === opt.id
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Mobile Filter & Sort Triggers (In Header) */}
            <div className="flex sm:hidden items-center justify-between pt-1 border-t border-slate-100">
              <button
                onClick={() => setIsMobileSortOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 py-1 px-2"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Sort: <strong className="text-blue-600 capitalize">{sortOptions.find(o => o.id === sortBy)?.label.split(' ')[0]}</strong></span>
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold shadow-xs active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

          </div>

          {/* Product Cards Grid: 2 columns on mobile, 3 on tablet, 3 on desktop */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Filter className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Outfits Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No outfits match your filter. Try changing category or price filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Flipkart Mobile Bottom-Sheet Sort Drawer */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end justify-center animate-in fade-in sm:hidden">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-blue-600" />
                Sort Products By
              </h4>
              <button onClick={() => setIsMobileSortOpen(false)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortBy(opt.id);
                    setIsMobileSortOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    sortBy === opt.id ? 'bg-blue-50 text-blue-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flipkart Mobile Full-Screen Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex justify-end animate-in fade-in lg:hidden">
          <div className="w-full max-w-sm bg-white h-full p-4 overflow-y-auto">
            <FilterSidebar isMobile onCloseMobile={() => setIsMobileFilterOpen(false)} />
          </div>
        </div>
      )}

    </section>
  );
}
