import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const BANNERS = [
  {
    id: 1,
    title: "GRAND FESTIVE FASHION SALE",
    subtitle: "Banarasi Sarees, Embroidered Lehengas & Kurtas",
    tagline: "Min. 60% - 80% Off + Extra 15% with Axis Bank",
    badge: "Big Billion Vibes",
    cta: "Explore Ethnic",
    category: "women-ethnic",
    gradient: "from-amber-600/95 via-rose-700/90 to-indigo-950/95",
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "MEN'S WINTER & STREETWEAR",
    subtitle: "Heavyweight Boxy Hoodies, Denim & Sneakers",
    tagline: "Starting at ₹799 | 100% Premium Quality",
    badge: "Trending 2026",
    cta: "Shop Streetwear",
    category: "men",
    gradient: "from-blue-950/95 via-slate-900/90 to-zinc-950/95",
    bgImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "DESIGNER WESTERN COUTURE",
    subtitle: "Chiffon Maxi Dresses, Party Fits & Coats",
    tagline: "Starting ₹899 | Exclusive Boutique Drops",
    badge: "Limited Drops",
    cta: "View Western",
    category: "women-western",
    gradient: "from-fuchsia-950/95 via-purple-900/90 to-slate-950/95",
    bgImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&auto=format&fit=crop&q=80"
  }
];

function DealCountdown({ defaultHours = 3 }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: defaultHours,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: defaultHours, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [defaultHours]);

  return (
    <div className="mt-3 inline-flex items-center gap-1.5 bg-black/70 border border-white/20 px-2.5 py-1 rounded-lg">
      <Clock className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '10s' }} />
      <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Ends in:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-[10px] sm:text-xs text-yellow-300">
        <span className="bg-white/20 px-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>:
        <span className="bg-white/20 px-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
        <span className="bg-white/20 px-1 rounded text-yellow-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
}

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setSelectedCategory, storeSettings } = useShop();

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, []);

  const slide = BANNERS[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-2 sm:pt-3 pb-1">
      
      {/* Banner Carousel Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[240px] sm:min-h-[320px] md:min-h-[380px] flex items-center bg-slate-900 text-white mobile-gpu">
        
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-95`} />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-8 md:p-12 max-w-xl">
          
          <div className="inline-flex items-center gap-1 bg-yellow-400 text-slate-950 font-black text-[9px] sm:text-xs px-2 py-0.5 rounded uppercase tracking-wider mb-2 shadow-xs">
            <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
            {slide.badge}
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow">
            {slide.title}
          </h2>

          <p className="mt-1 text-xs sm:text-base text-slate-200 font-medium line-clamp-1 sm:line-clamp-2">
            {slide.subtitle}
          </p>

          <p className="mt-1 text-xs sm:text-sm font-extrabold text-yellow-300">
            {slide.tagline}
          </p>

          {/* Flipkart Flash Deal Timer Component (Isolated Re-render) */}
          <DealCountdown defaultHours={storeSettings.dealTimerHours || 3} />

          {/* CTA Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory(slide.category);
                const target = document.getElementById('products-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow transition active:scale-95 text-xs uppercase tracking-wider"
            >
              {slide.cta} &rarr;
            </button>
          </div>
        </div>

        {/* Carousel Arrow Controls (hidden on small phone screens, shown on tablet/desktop) */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
          className="hidden sm:block absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNERS.length)}
          className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
