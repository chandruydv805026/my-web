import React from 'react';
import { X, Package, Truck, CheckCircle2, Download, ArrowRight, Clock } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function OrdersModal() {
  const { orders, isOrdersOpen, setIsOrdersOpen, showToast, user } = useShop();

  if (!isOrdersOpen) return null;

  // Filter orders for active user
  const displayedOrders = user?.role === 'admin'
    ? orders
    : orders.filter(o => {
        if (!user) return false;
        const uPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
        const uEmail = (user.email || '').toLowerCase().trim();
        const oPhone = (o.customerPhone || o.address?.phone || '').replace(/\D/g, '').slice(-10);
        const oEmail = (o.customerEmail || '').toLowerCase().trim();
        return (uPhone && oPhone === uPhone) || (uEmail && oEmail === uEmail);
      });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-200 flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">My Orders ({displayedOrders.length})</h2>
          </div>

          <button
            onClick={() => setIsOrdersOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet!</h3>
              <p className="text-xs text-slate-500 mt-1">Place your first order to track it live here.</p>
            </div>
          ) : (
            displayedOrders.map((ord) => (
              <div 
                key={ord.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition"
              >
                {/* Order Top Meta */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 flex-wrap gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Order ID</span>
                    <strong className="font-mono text-blue-600">{ord.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ordered On</span>
                    <span className="text-slate-700 font-medium">{ord.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Amount</span>
                    <strong className="text-slate-900">₹{ord.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> {ord.status || 'Confirmed'}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</span>
                        <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-slate-500 text-[11px]">Size: {item.selectedSize} &bull; Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <span className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{ord.deliveryDate || 'Delivery in 2 Days'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Delivery Address: <strong className="text-slate-700">{ord.address?.city} ({ord.address?.pincode})</strong>
                  </div>

                  <button
                    onClick={() => showToast(`Invoice downloaded for Order ${ord.id}!`)}
                    className="flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={() => setIsOrdersOpen(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}
