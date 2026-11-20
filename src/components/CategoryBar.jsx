import React from 'react';
import { CATEGORIES } from '../data/products';
import { useShop } from '../context/ShopContext';
import { Sparkles, Shirt, Flame, Crown, PartyPopper, Smile, Snowflake, Footprints } from 'lucide-react';

export default function CategoryBar() {
  const { selectedCategory, setSelectedCategory, setSearchTerm } = useShop();

  const handleSelect = (id) => {
    setSelectedCategory(id);
    setSearchTerm('');
    const target = document.getElementById('products-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className="group flex flex-col items-center flex-shrink-0 min-w-[62px] sm:min-w-[80px] text-center focus:outline-none transition active:scale-90"
              >
                <div className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 border-2 transition-all shadow-xs ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-200 scale-105' 
                    : 'border-slate-100 group-hover:border-blue-400'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className={`mt-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition ${
                  isSelected ? 'text-blue-600 font-bold' : 'text-slate-700'
                }`}>
                  {cat.name}
                </span>
                {isSelected && (
                  <span className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
