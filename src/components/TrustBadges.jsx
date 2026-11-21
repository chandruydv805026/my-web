import React from 'react';
import { ShieldCheck, RotateCcw, Truck, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: "100% Authentic Guarantee",
      desc: "Direct from verified weavers & certified Indian manufacturers",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: RotateCcw,
      title: "7 Days Return & Exchange",
      desc: "Hassle-free doorstep pickup & instant refund processing",
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      icon: Truck,
      title: "Free Express Shipping",
      desc: "Fast delivery on all orders above ₹499 with real-time SMS tracking",
      color: "text-amber-600 bg-amber-50"
    },
    {
      icon: Award,
      title: "Ratu Quality Assured",
      desc: "Rigorous 6-step quality control check before every dispatch",
      color: "text-indigo-600 bg-indigo-50"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl ${b.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
