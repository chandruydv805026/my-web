import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toast } = useShop();

  if (!toast) return null;

  const isInfo = toast.type === 'info';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white border ${
        isError 
          ? 'bg-rose-600 border-rose-500' 
          : isInfo 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-emerald-600 border-emerald-500'
      }`}>
        {isError ? (
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
        ) : isInfo ? (
          <Info className="w-4 h-4 flex-shrink-0 text-blue-300" />
        ) : (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
