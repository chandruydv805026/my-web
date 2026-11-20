import React from 'react';
import { useShop } from '../context/ShopContext';
import { RotateCcw, Star, Check, Sparkles, Filter } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function FilterSidebar({ isMobile = false, onCloseMobile }) {
  const {
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    selectedRating,
    setSelectedRating,
    onlyAssured,
    setOnlyAssured,
    selectedDiscount,
    setSelectedDiscount,
    selectedSize,
    setSelectedSize,
    selectedBrand,
    setSelectedBrand,
    products
  } = useShop();

  // Get unique brands
  const brands = Array.from(new Set(products.map(p => p.brand)));

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    priceRange < 5000 || 
    selectedRating > 0 || 
    onlyAssured || 
    selectedDiscount > 0 || 
    selectedSize !== 'all' || 
    selectedBrand !== 'all';

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setPriceRange(5000);
    setSelectedRating(0);
    setOnlyAssured(false);
    setSelectedDiscount(0);
    setSelectedSize('all');
    setSelectedBrand('all');
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs ${isMobile ? 'h-full overflow-y-auto' : 'sticky top-20'}`}>
      {/* Title & Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Ratu Assured Switch (Flipkart Assured Style) */}
      <div className="py-3.5 border-b border-slate-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-yellow-300 font-extrabold italic text-xs px-2 py-0.5 rounded shadow-xs">
              Ratu Assured
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">&bull; 6-pt Quality</span>
          </div>
          <input
            type="checkbox"
            checked={onlyAssured}
            onChange={(e) => setOnlyAssured(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Categories */}
      <div className="py-3.5 border-b border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar pr-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-md font-medium transition flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="py-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Max Price</h4>
          <span className="text-xs font-black text-blue-600">₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="250"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
          <span>₹500</span>
          <span>₹2,500</span>
          <span>₹5,000+</span>
        </div>

        {/* Quick price chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹999', val: 999 },
            { label: 'Under ₹1499', val: 1499 },
            { label: 'Under ₹2499', val: 2499 },
          ].map(chip => (
            <button
              key={chip.val}
              onClick={() => setPriceRange(chip.val)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition ${
                priceRange === chip.val 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="py-3.5 border-b border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Discount</h4>
        <div className="space-y-1.5">
          {[
            { label: '70% or more', val: 70 },
            { label: '60% or more', val: 60 },
            { label: '50% or more', val: 50 },
            { label: 'All Discounts', val: 0 },
          ].map(d => (
            <label key={d.val} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
              <input
                type="radio"
                name="discount"
                checked={selectedDiscount === d.val}
                onChange={() => setSelectedDiscount(d.val)}
                className="text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="py-3.5 border-b border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Customer Ratings</h4>
        <div className="space-y-1.5">
          {[
            { stars: 4, label: '4★ & above' },
            { stars: 3, label: '3★ & above' },
            { stars: 0, label: 'All Ratings' }
          ].map(r => (
            <label key={r.stars} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === r.stars}
                onChange={() => setSelectedRating(r.stars)}
                className="text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                {r.stars > 0 ? (
                  <span className="inline-flex items-center gap-0.5 bg-green-700 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                    {r.stars} <Star className="w-2.5 h-2.5 fill-white" />
                  </span>
                ) : null}
                <span>{r.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="py-3.5 border-b border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-xs font-bold px-2.5 py-1 rounded border transition ${
                selectedSize === size
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {size === 'all' ? 'All' : size}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Brand</h4>
        <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
            <input
              type="radio"
              name="brand"
              checked={selectedBrand === 'all'}
              onChange={() => setSelectedBrand('all')}
              className="text-blue-600 accent-blue-600 cursor-pointer"
            />
            <span>All Brands</span>
          </label>
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand}
                onChange={() => setSelectedBrand(brand)}
                className="text-blue-600 accent-blue-600 cursor-pointer"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {isMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full mt-5 bg-blue-600 text-white font-bold py-2.5 rounded-lg text-xs uppercase"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
}
