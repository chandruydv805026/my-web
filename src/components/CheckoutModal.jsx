import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, MapPin, ShieldCheck, 
  Truck, Sparkles, Check, ArrowRight, 
  ShoppingBag, Lock
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    finalTotal, 
    totalSavings, 
    buyNowItem,
    setBuyNowItem,
    checkoutItems,
    checkoutFinalTotal,
    checkoutTotalSavings,
    user, 
    placeOrder, 
    deliveryPincode,
    deliveryCity,
    setIsOrdersOpen 
  } = useShop();

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (setBuyNowItem) setBuyNowItem(null);
  };

  // Steps: 1: Address, 2: Order Summary, 3: Payment, 4: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Address State
  const [address, setAddress] = useState({
    name: user?.address?.name || user?.name || "",
    phone: user?.address?.phone || user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    type: user?.address?.type || "HOME",
    lat: user?.address?.lat,
    lng: user?.address?.lng,
    distanceKm: user?.address?.distanceKm
  });

  useEffect(() => {
    if (user && user.address) {
      setAddress({
        name: user.address.name || user.name || "",
        phone: user.address.phone || user.phone || "",
        street: user.address.street || "",
        city: user.address.city || "",
        state: user.address.state || "",
        pincode: user.address.pincode || "",
        type: user.address.type || "HOME",
        lat: user.address.lat,
        lng: user.address.lng,
        distanceKm: user.address.distanceKm
      });
      if (user.address.street) {
        setCurrentStep(2);
      }
    }
  }, [user]);

  // Payment State: 100% Cash on Delivery (COD) Only
  const paymentMethod = "Cash on Delivery (COD)";

  // Confirmed Order Info
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = async () => {
    if (!address.street.trim()) {
      alert("Please provide your delivery address.");
      setCurrentStep(1);
      return;
    }
    const order = await placeOrder({
      address,
      paymentMethod: 'Cash on Delivery (COD)'
    });
    setConfirmedOrder(order);
    setCurrentStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto no-scrollbar border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#2874f0] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">RatuMart Secure Checkout</h2>
              <p className="text-xs text-blue-100">100% Safe 256-bit SSL Encrypted Payment</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        {currentStep < 4 && (
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
            {[
              { num: 1, label: "Address" },
              { num: 2, label: "Summary" },
              { num: 3, label: "Payment" }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition ${
                  currentStep === step.num 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > step.num 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
                </span>
                <span className={currentStep >= step.num ? 'text-slate-900' : 'text-slate-400'}>
                  {step.label}
                </span>
                {idx < 2 && <span className="w-8 sm:w-16 h-0.5 bg-slate-200 mx-1 hidden sm:block" />}
              </div>
            ))}
          </div>
        )}

        {/* Step Body */}
        <div className="p-4 sm:p-6">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Select Delivery Address
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Ratu Hyperlocal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mobile Number (for delivery SMS)</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Flat / House No. / Building / Street</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="e.g. Dandai Phutaltoli, Near Shiv Mandir, Ratu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">City / District</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!address.name.trim() || !address.phone.trim()) {
                      alert("Please enter receiver name and mobile number.");
                      return;
                    }
                    if (!address.street.trim()) {
                      alert("Please enter your House / Flat / Street address.");
                      return;
                    }
                    if (!address.pincode.trim() || address.pincode.length !== 6) {
                      alert("Please enter a valid 6-digit Pincode.");
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-xs py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Deliver Here &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block">Deliver to: <strong className="text-slate-800">{address.name}</strong>, {address.pincode}</span>
                  <span className="text-slate-600 truncate block max-w-md">{address.street}, {address.city}</span>
                </div>
                <button onClick={() => setCurrentStep(1)} className="text-blue-600 font-bold hover:underline">
                  Change
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-slate-500 text-[11px]">Size: {item.selectedSize} &bull; Qty: {item.quantity}</p>
                      <p className="text-slate-900 font-black mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right text-[11px] text-emerald-600 font-bold flex flex-col justify-end">
                      <span>Express Delivery in 2 Days</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-600 block">Order confirmation email sent to: <strong>{user?.email || 'user@example.com'}</strong></span>
                  <span className="text-emerald-700 font-bold">You are saving ₹{checkoutTotalSavings.toLocaleString('en-IN')} on this order!</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Payable</span>
                  <span className="text-base font-black text-blue-900">₹{checkoutFinalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  &larr; Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold text-xs py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  Proceed to Payment (COD) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD (100% COD ONLY) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Payment Method
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Cash on Delivery Only
                </span>
              </div>

              {/* COD Active Box */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-xs">
                      ✓
                    </div>
                    <div>
                      <strong className="text-sm sm:text-base font-black text-slate-900 block">
                        Cash on Delivery (COD)
                      </strong>
                      <span className="text-xs text-slate-600 font-medium">
                        Pay cash directly at doorstep when your order is delivered
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                    COD Active
                  </span>
                </div>

                <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">
                      No Online Payment / No Advance Money Required!
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Google Pay, PhonePe ya card se pehle paise dene ki koi zaroorat nahi hai. Jab parcel aapke ghar pahunchega, tab aap cash me <strong>₹{checkoutFinalTotal.toLocaleString('en-IN')}</strong> delivery executive ko de sakte hain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm COD Order Button */}
              <div className="pt-3 flex justify-between items-center">
                <button onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  &larr; Back to Summary
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  PLACE CASH ON DELIVERY ORDER (₹{checkoutFinalTotal.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS CELEBRATION! */}
          {currentStep === 4 && confirmedOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thank you, <strong>{confirmedOrder.address.name}</strong>! Your order has been received by RatuMart.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs max-w-md mx-auto space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-blue-600">{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-black text-slate-900">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery To:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{confirmedOrder.address.city} - {confirmedOrder.address.pincode}</span>
                </div>
              </div>

              {/* Flipkart Tracking Timeline */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 max-w-md mx-auto">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 text-left">Live Tracking Status</h4>
                <div className="flex items-center justify-between text-center relative">
                  <div className="flex flex-col items-center z-10">
                    <span className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 mt-1">Confirmed</span>
                  </div>
                  <div className="h-0.5 bg-emerald-600 flex-1 mx-1" />
                  
                  <div className="flex flex-col items-center z-10">
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 mt-1">Packing</span>
                  </div>
                  <div className="h-0.5 bg-slate-200 flex-1 mx-1" />

                  <div className="flex flex-col items-center z-10">
                    <span className="w-7 h-7 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">
                      <Truck className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Shipped</span>
                  </div>
                  <div className="h-0.5 bg-slate-200 flex-1 mx-1" />

                  <div className="flex flex-col items-center z-10">
                    <span className="w-7 h-7 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">
                      <Building className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Delivered</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => {
                    handleClose();
                    setIsOrdersOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow transition"
                >
                  View in My Orders
                </button>
                <button
                  onClick={handleClose}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold text-xs py-2.5 px-6 rounded-xl shadow transition"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
