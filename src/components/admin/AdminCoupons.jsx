import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Sparkles, Copy, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminCoupons() {
  const { coupons, addCoupon, deleteCoupon, showToast } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percent', // 'percent' | 'flat'
    value: '',
    maxDiscount: 500,
    minOrder: 799,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) {
      alert("Please enter coupon code and discount value");
      return;
    }

    const payload = {
      code: newCoupon.code.toUpperCase().trim(),
      minOrder: Number(newCoupon.minOrder) || 0,
      description: newCoupon.description || `Special discount coupon ${newCoupon.code.toUpperCase()}`
    };

    if (newCoupon.type === 'percent') {
      payload.discountPercent = Number(newCoupon.value);
      payload.maxDiscount = Number(newCoupon.maxDiscount) || 500;
    } else {
      payload.flatDiscount = Number(newCoupon.value);
    }

    addCoupon(payload);
    setIsModalOpen(false);
    setNewCoupon({
      code: '',
      type: 'percent',
      value: '',
      maxDiscount: 500,
      minOrder: 799,
      description: ''
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Discount Coupons &amp; Offers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create festive promo codes, set flat or percentage discounts, and attract more customers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div 
            key={c.code}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-emerald-400 transition"
          >
            {/* Left green stripe */}
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />

            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {c.code}
                </span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-lg font-black text-slate-900">
                  {c.discountPercent ? `${c.discountPercent}% OFF` : `FLAT ₹${c.flatDiscount} OFF`}
                </h4>
                {c.maxDiscount && (
                  <p className="text-[11px] text-slate-500 font-medium">Upto ₹{c.maxDiscount} discount</p>
                )}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Min Order: <strong>₹{c.minOrder || 0}</strong></span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(c.code);
                    showToast(`Copied code "${c.code}"`);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title="Copy Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete coupon "${c.code}"?`)) {
                      deleteCoupon(c.code);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Create New Promo Code
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-700 font-bold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RATU70 or DIWALI500"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discount Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {newCoupon.type === 'percent' ? 'Discount %' : 'Flat ₹ Amount'} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={newCoupon.type === 'percent' ? 'e.g. 50' : 'e.g. 150'}
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 799"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                {newCoupon.type === 'percent' && (
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={newCoupon.maxDiscount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Offer Description</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 50% Off up to ₹500 on all outfits"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save &amp; Activate
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
