import React, { useState } from 'react';
import { 
  X, Trash2, Plus, Minus, Tag, ShieldCheck, 
  ShoppingBag, ArrowRight, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { COUPONS } from '../data/products';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart,
    cartSubtotal,
    cartPrice,
    mrpDiscount,
    couponDiscount,
    deliveryCharge,
    finalTotal,
    totalSavings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    setIsCheckoutOpen,
    deliveryPincode
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 flex justify-end animate-in fade-in duration-150">
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-800">My Cart</h2>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Delivering to: <strong className="text-slate-600">{deliveryPincode}</strong></p>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Your Cart is Empty!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore our festive clothing catalog and add your favorite ethnic and streetwear styles!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm transition"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                    className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex gap-3"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.name}
                        </h4>
                        
                        {/* Size & Color chips */}
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">Size: {item.selectedSize}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">{item.selectedColor}</span>
                        </div>
                      </div>

                      {/* Pricing & Quantity controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(index, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(index, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Apply Coupon & Offers
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-800">Coupon '{appliedCoupon.code}' Applied!</span>
                        <p className="text-[10px] text-emerald-600">You saved ₹{couponDiscount} with this coupon</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        placeholder="Enter RATU50, FIRSTORDER"
                        className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase tracking-wider font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <button
                        onClick={() => {
                          if (applyCoupon(inputCoupon)) {
                            setInputCoupon('');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{couponError}</p>
                    )}

                    {/* Quick clickable coupons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {COUPONS.map(c => (
                        <button
                          key={c.code}
                          onClick={() => applyCoupon(c.code)}
                          className="text-[10px] bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded border border-dashed border-blue-300 transition"
                        >
                          {c.code} (Save ₹{c.flatDiscount || c.maxDiscount})
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Flipkart Style Price Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 pb-2.5 border-b border-slate-100">
                  Price Details
                </h4>

                <div className="space-y-2.5 py-3 text-xs border-b border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Price ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount on MRP</span>
                    <span>- ₹{mrpDiscount.toLocaleString('en-IN')}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      <span>₹{deliveryCharge}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-baseline text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-base text-blue-600">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Savings Green Notification */}
                {totalSavings > 0 && (
                  <div className="mt-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold p-2 rounded-lg text-center border border-emerald-200">
                    🎉 You will save ₹{totalSavings.toLocaleString('en-IN')} on this order!
                  </div>
                )}
              </div>

              {/* Safe & Secure Guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Safe and Secure Payments. 100% Authentic Products.</span>
              </div>
            </>
          )}

        </div>

        {/* Sticky Bottom Bar with Place Order button */}
        {cart.length > 0 && (
          <div className="bg-white p-3.5 border-t border-slate-200 shadow-lg flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Payable</span>
              <span className="text-lg font-black text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-xs py-3 px-5 rounded-xl shadow-md transition uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95"
            >
              Place Order <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
