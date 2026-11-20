import React, { useState } from 'react';
import { 
  X, CheckCircle2, MapPin, CreditCard, ShieldCheck, 
  Smartphone, Building, Truck, Sparkles, Check, ArrowRight, 
  ShoppingBag, QrCode, Lock
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    finalTotal, 
    totalSavings, 
    user, 
    placeOrder, 
    deliveryPincode,
    deliveryCity,
    setIsOrdersOpen 
  } = useShop();

  // Steps: 1: Address, 2: Order Summary, 3: Payment, 4: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Address State
  const [address, setAddress] = useState({
    name: user?.name || "Rahul Sharma",
    phone: user?.phone || "+91 98765 43210",
    street: "Flat 402, Royal Palms Heights, Sector 18",
    city: deliveryCity || "New Delhi",
    state: "Delhi",
    pincode: deliveryPincode || "110001",
    type: "HOME"
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("gpay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode] = useState("7492");

  // Confirmed Order Info
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = () => {
    const order = placeOrder({
      address,
      paymentMethod: paymentMethod === 'UPI' ? `UPI (${upiApp.toUpperCase()})` : paymentMethod
    });
    setConfirmedOrder(order);
    setCurrentStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
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
            onClick={() => setIsCheckoutOpen(false)}
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
                  Default Address
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
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mobile Number (for delivery SMS)</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Flat / House No. / Building / Street</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">City / District</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
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
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold text-xs py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  Deliver Here & Continue <ArrowRight className="w-4 h-4" />
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
                {cart.map((item, idx) => (
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
                  <span className="text-emerald-700 font-bold">You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order!</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Payable</span>
                  <span className="text-base font-black text-blue-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  &larr; Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold text-xs py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Select Payment Option
              </h3>

              <div className="space-y-3">
                {/* UPI Option */}
                <div className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-200 bg-white'
                }`} onClick={() => setPaymentMethod('UPI')}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                      <input type="radio" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="accent-blue-600" />
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      UPI (Google Pay, PhonePe, Paytm, BHIM)
                    </label>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">Fastest</span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap gap-2">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map(app => (
                        <button
                          key={app}
                          onClick={() => setUpiApp(app)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize transition ${
                            upiApp === app ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {app === 'gpay' ? 'Google Pay' : app}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Credit/Debit Card */}
                <div className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-200 bg-white'
                }`} onClick={() => setPaymentMethod('CARD')}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                      <input type="radio" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="accent-blue-600" />
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Credit / Debit / ATM Card
                    </label>
                    <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</span>
                  </div>

                  {paymentMethod === 'CARD' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/50 space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4532 8920 1209 8492)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-200 bg-white'
                }`} onClick={() => setPaymentMethod('COD')}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                      <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-blue-600" />
                      <Truck className="w-4 h-4 text-amber-600" />
                      Cash on Delivery (COD)
                    </label>
                    <span className="text-[10px] text-slate-500">Pay cash at doorstep</span>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/50 flex items-center gap-3 text-xs">
                      <span className="font-mono bg-slate-200 font-black px-3 py-1.5 rounded tracking-widest text-slate-700">
                        {captchaCode}
                      </span>
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="pt-3 flex justify-between items-center">
                <button onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  &larr; Back to Summary
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  PAY ₹{finalTotal.toLocaleString('en-IN')} & PLACE ORDER
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
                    setIsCheckoutOpen(false);
                    setIsOrdersOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow transition"
                >
                  View in My Orders
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
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
