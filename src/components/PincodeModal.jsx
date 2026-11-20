import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const POPULAR_LOCATIONS = [
  { city: "New Delhi", pin: "110001" },
  { city: "Mumbai", pin: "400001" },
  { city: "Bengaluru", pin: "560001" },
  { city: "Kolkata", pin: "700001" },
  { city: "Ranchi (Ratu)", pin: "835222" },
  { city: "Hyderabad", pin: "500001" }
];

export default function PincodeModal() {
  const { 
    isPincodeModalOpen, 
    setIsPincodeModalOpen, 
    deliveryPincode, 
    setDeliveryPincode, 
    deliveryCity, 
    setDeliveryCity,
    showToast 
  } = useShop();

  const [pin, setPin] = useState(deliveryPincode || '');

  if (!isPincodeModalOpen) return null;

  const handleApply = (selectedCity = null, selectedPin = null) => {
    const finalPin = selectedPin || pin;
    if (finalPin.length !== 6) {
      showToast("Please enter a valid 6-digit Pincode", "error");
      return;
    }
    const matched = POPULAR_LOCATIONS.find(l => l.pin === finalPin);
    const finalCity = selectedCity || (matched ? matched.city : "City");

    setDeliveryPincode(finalPin);
    setDeliveryCity(finalCity);
    setIsPincodeModalOpen(false);
    showToast(`Delivery location updated to ${finalCity} (${finalPin})`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Choose Your Location</span>
          </div>
          <button 
            onClick={() => setIsPincodeModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 text-xs">
          <p className="text-slate-500 mb-2">
            Enter your Pincode to check product availability and delivery timelines for your area.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 110001"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              onClick={() => handleApply()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition"
            >
              Apply
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Delivery Locations
            </span>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.pin}
                  onClick={() => handleApply(loc.city, loc.pin)}
                  className={`text-left p-2 rounded-lg border text-xs transition ${
                    deliveryPincode === loc.pin 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block truncate">{loc.city}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{loc.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
