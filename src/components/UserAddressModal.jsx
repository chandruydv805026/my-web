import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, CheckCircle2, Plus, Edit2, Trash2, 
  Home, Briefcase, Navigation, Loader2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

// Store Center Coordinates: Dandai Phutaltoli, Ratu, Ranchi - 835222
const STORE_COORDS = {
  lat: 23.414532,
  lng: 85.216414,
  maxRadiusKm: 5.0
};

function calcDist(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function UserAddressModal() {
  const {
    user,
    isAddressModalOpen,
    setIsAddressModalOpen,
    userAddresses,
    activeAddressIndex,
    addUserAddress,
    editUserAddress,
    selectUserAddress,
    deleteUserAddress,
    showToast
  } = useShop();

  // Mode: 'list' | 'add' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingIndex, setEditingIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [addrType, setAddrType] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Ranchi');
  const [pincode, setPincode] = useState('835222');
  const [lat, setLat] = useState(STORE_COORDS.lat);
  const [lng, setLng] = useState(STORE_COORDS.lng);
  const [distanceKm, setDistanceKm] = useState(0);
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset to list when modal opens
  useEffect(() => {
    if (isAddressModalOpen) {
      setViewMode('list');
      setEditingIndex(null);
      setFormError('');
    }
  }, [isAddressModalOpen]);

  if (!isAddressModalOpen || !user) return null;

  const handleOpenAdd = () => {
    if (userAddresses.length >= 2) {
      showToast('Maximum 2 addresses allowed. Please edit an existing one.', 'info');
      return;
    }
    setAddrType(userAddresses.length === 0 ? 'Home' : 'Work');
    setRecipientName(user.name || '');
    setRecipientPhone(user.phone || '');
    setHouse('');
    setStreet('');
    setLandmark('');
    setCity('Ranchi');
    setPincode('835222');
    setLat(STORE_COORDS.lat);
    setLng(STORE_COORDS.lng);
    setDistanceKm(0);
    setFormError('');
    setViewMode('add');
  };

  const handleOpenEdit = (idx) => {
    const target = userAddresses[idx];
    if (!target) return;
    setEditingIndex(idx);
    setAddrType(target.type || 'Home');
    setRecipientName(target.name || user.name || '');
    setRecipientPhone(target.phone || user.phone || '');
    setHouse(target.house || target.street?.split(',')[0] || '');
    setStreet(target.street || '');
    setLandmark(target.landmark || '');
    setCity(target.city || 'Ranchi');
    setPincode(target.pincode || '835222');
    setLat(target.lat || STORE_COORDS.lat);
    setLng(target.lng || STORE_COORDS.lng);
    setDistanceKm(target.distanceKm || 0);
    setFormError('');
    setViewMode('edit');
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation not supported by your browser.');
      return;
    }
    setLocating(true);
    setFormError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const d = calcDist(STORE_COORDS.lat, STORE_COORDS.lng, userLat, userLng);
        setLat(userLat);
        setLng(userLng);
        setDistanceKm(d);
        setLocating(false);

        if (d > STORE_COORDS.maxRadiusKm) {
          setFormError(`This location is ${d} KM away. We strictly deliver within 5.0 KM of Ratu Hub.`);
        } else {
          try {
            const res = await fetch(`/api/location/reverse-geocode?lat=${userLat}&lng=${userLng}`);
            const data = await res.json();
            if (data.success && data.address) {
              if (data.address.area && !street) setStreet(data.address.area);
              if (data.address.city) setCity(data.address.city);
              if (data.address.pincode) setPincode(data.address.pincode);
            }
          } catch {}
        }
      },
      () => {
        setLocating(false);
        setFormError('Could not detect live GPS. Please enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    const fullStreet = house ? `${house}, ${street}` : street;
    if (!fullStreet.trim()) {
      setFormError('Please enter your house and street/locality address.');
      return;
    }
    if (!pincode || pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Pincode.');
      return;
    }

    if (distanceKm > STORE_COORDS.maxRadiusKm) {
      setFormError(`This location is ${distanceKm} KM away. Delivery is only available within 5.0 KM.`);
      return;
    }

    const payload = {
      name: recipientName.trim() || user.name,
      phone: recipientPhone.trim() || user.phone,
      house: house.trim(),
      street: fullStreet.trim(),
      landmark: landmark.trim(),
      city: city.trim() || 'Ranchi',
      state: 'Jharkhand',
      pincode: pincode.trim(),
      type: addrType,
      lat,
      lng,
      distanceKm
    };

    setSubmitting(true);
    let res;
    if (viewMode === 'add') {
      res = await addUserAddress(payload);
    } else {
      res = await editUserAddress(editingIndex, payload);
    }
    setSubmitting(false);

    if (res && res.success) {
      setViewMode('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {viewMode !== 'list' ? (
              <button 
                type="button"
                onClick={() => setViewMode('list')} 
                className="p-1 -ml-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <MapPin className="w-5 h-5 text-yellow-300" />
            )}
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {viewMode === 'add' ? 'Add New Delivery Address' : viewMode === 'edit' ? 'Edit Delivery Address' : 'My Delivery Locations'}
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100 font-medium">
                {viewMode === 'list' ? 'Manage your delivery addresses (Maximum 2)' : 'Deliveries strictly within 5.0 KM of Ratu Hub'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddressModalOpen(false)}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          
          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              
              {/* Address Count Indicator */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Saved Addresses: <strong className="text-blue-600">{userAddresses.length} / 2</strong></span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  5.0 KM Zone Verified
                </span>
              </div>

              {/* List of Addresses */}
              <div className="space-y-3">
                {userAddresses.map((addr, idx) => {
                  const isActive = idx === activeAddressIndex;
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border-2 transition relative ${
                        isActive 
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' 
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      {/* Top Row: Type Tag & Active Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            addr.type === 'Work' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {addr.type === 'Work' ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                            {addr.type || 'Home'}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {addr.name || user.name}
                          </span>
                        </div>

                        {isActive && (
                          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivering Here
                          </span>
                        )}
                      </div>

                      {/* Address Details */}
                      <div className="text-xs sm:text-sm text-slate-700 space-y-0.5 font-medium">
                        <p className="font-bold text-slate-900 leading-snug">
                          {addr.street || addr.area || 'Ratu Area'}
                        </p>
                        {addr.landmark && (
                          <p className="text-slate-500 text-xs">Landmark: {addr.landmark}</p>
                        )}
                        <p className="text-slate-600 text-xs">
                          {addr.city || 'Ranchi'} - {addr.pincode || '835222'} • Phone: {addr.phone || user.phone}
                        </p>
                        <p className="text-[11px] text-blue-600 font-bold pt-1">
                          📍 {addr.distanceKm || 0} KM from Dandai Phutaltoli Hub
                        </p>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(idx)}
                            className="text-xs font-bold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>

                          {userAddresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Remove this saved address?")) {
                                  deleteUserAddress(idx);
                                }
                              }}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => selectUserAddress(idx)}
                            className="bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            Deliver Here
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Button (Active if < 2) */}
              {userAddresses.length < 2 ? (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="w-full bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-blue-400 text-blue-700 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Second Delivery Address (2/2)</span>
                </button>
              ) : (
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                  Maximum 2 addresses saved. You can edit any address above.
                </div>
              )}

            </div>
          )}

          {/* ADD / EDIT FORM VIEW */}
          {(viewMode === 'add' || viewMode === 'edit') && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Address Label</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddrType(type)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        addrType === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Contact Name *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Amit Kumar"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">10-Digit Mobile *</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9811233445"
                    maxLength={10}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              {/* House / Gali */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">House / Flat / Gali No. *</label>
                <input
                  type="text"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  placeholder="e.g. Flat 3B, House 24, Near Kali Mandir"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Locality / Street */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Colony / Locality / Village *</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Kathitand Chowk, Dandai Phutaltoli, Ratu"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Shiv Mandir / Water Tank"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">City / Town *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ranchi"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">6-Digit Pincode *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 835222"
                    maxLength={6}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Live Location Verification Button */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={locating}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  {locating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Detecting live GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span>📍 Verify Live Location (Distance: {distanceKm} KM)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Form Error */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="flex-1 py-3 px-4 border-2 border-slate-200 hover:border-slate-300 font-bold text-xs sm:text-sm text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{viewMode === 'add' ? 'Save Location' : 'Update Location'}</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
