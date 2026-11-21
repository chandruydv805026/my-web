import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, ShieldCheck, Mail, User, Phone, 
  Loader2, CheckCircle2, MapPin, Home, 
  ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Navigation
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ExactLocationPicker from './ExactLocationPicker';

// Store Center Coordinates: Dandai Phutaltoli, Ratu, Ranchi - 835222
const STORE_COORDS = {
  lat: 23.414532,
  lng: 85.216414,
  name: "Dandai Phutaltoli, Ratu, Ranchi",
  pincode: "835222",
  maxRadiusKm: 5.0
};

// Haversine formula to calculate accurate distance in KM
function calcDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in KM
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

export default function AuthModal() {
  const { 
    isAuthOpen, 
    setIsAuthOpen,
    requestLoginOtp,
    verifyLoginOtp,
    requestRegisterOtp,
    verifyRegisterOtpWithAddress,
    cart,
    buyNowItem,
    setIsCheckoutOpen,
    authModalBackHandlerRef
  } = useShop();

  // Mode: 'login' | 'login_otp' | 'register' | 'register_otp'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regHouse, setRegHouse] = useState('');
  const [regArea, setRegArea] = useState('');
  const [regLandmark, setRegLandmark] = useState('');
  const [regPincode, setRegPincode] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regOtp, setRegOtp] = useState('');

  // Live Location State
  const [locationChecking, setLocationChecking] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [coords, setCoords] = useState(null);
  const [detectedAddress, setDetectedAddress] = useState('');
  const [locationStatusText, setLocationStatusText] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  // Handle Back-Button Hierarchy in AuthModal
  useEffect(() => {
    if (!isAuthOpen || !authModalBackHandlerRef) return;

    authModalBackHandlerRef.current = () => {
      if (mode === 'register_otp') {
        setMode('register');
        setErrorMessage('');
        return true;
      }
      if (mode === 'login_otp') {
        setMode('login');
        setErrorMessage('');
        return true;
      }
      if (mode === 'register') {
        setMode('login');
        setErrorMessage('');
        return true;
      }
      return false; // Closes modal
    };

    return () => {
      if (authModalBackHandlerRef) {
        authModalBackHandlerRef.current = null;
      }
    };
  }, [isAuthOpen, mode, authModalBackHandlerRef]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isAuthOpen) return null;

  const resetAll = () => {
    setErrorMessage('');
    setLoginOtp('');
    setRegOtp('');
    setLoading(false);
  };

  const handleClose = () => {
    setIsAuthOpen(false);
    resetAll();
  };

  const proceedPostAuth = () => {
    setIsAuthOpen(false);
    resetAll();
    if (buyNowItem || (cart && cart.length > 0)) {
      setIsCheckoutOpen(true);
    }
  };

  // 1. Send Login OTP
  const handleRequestLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your Mobile Number or Email Address.');
      return;
    }

    setLoading(true);
    const result = await requestLoginOtp(cleanId);
    setLoading(false);

    if (result.success) {
      setTargetEmail(result.email);
      setMaskedEmail(result.maskedEmail || result.email);
      setMode('login_otp');
      setResendTimer(30);
    } else {
      setErrorMessage(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // 2. Verify Login OTP
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (loginOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyLoginOtp(targetEmail, loginOtp);
    setLoading(false);

    if (result.success) {
      proceedPostAuth();
    } else {
      setErrorMessage(result.message || 'Invalid verification code.');
    }
  };

  // 3. Exact Sateek Live Location Detection (GPS Hardware)
  const detectLiveLocation = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationChecking(true);
    setLocationStatusText('Acquiring high-accuracy GPS satellite fix...');

    const geoOptions = {
      enableHighAccuracy: true, // Forces hardware GPS sensor
      timeout: 15000,           // 15 seconds for GPS satellite lock
      maximumAge: 0             // Strictly no cached/stale locations
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 0);

          setCoords({ lat: userLat, lng: userLng });
          setGpsAccuracy(accuracy);
          setLocationStatusText('Reverse-geocoding your exact street & locality...');

          // Call backend for precise reverse-geocoding & strict distance calculation
          const res = await fetch(`/api/location/reverse-geocode?lat=${userLat}&lng=${userLng}`);
          const data = await res.json();

          if (data.success) {
            setDistanceKm(data.distanceKm);
            setIsDeliverable(data.isDeliverable);
            setLocationVerified(true);
            setDetectedAddress(data.address?.formatted || `${userLat.toFixed(5)}°N, ${userLng.toFixed(5)}°E`);

            // Auto-fill address fields with exact detected details if empty
            if (data.address?.area) {
              setRegArea(prev => prev.trim() ? prev : data.address.area);
            }
            if (data.address?.city) {
              setRegCity(prev => prev.trim() ? prev : data.address.city);
            }
            if (data.address?.pincode) {
              setRegPincode(prev => prev.trim() ? prev : data.address.pincode);
            }
            if (data.address?.state) {
              setRegState(data.address.state);
            }
          } else {
            // Local fallback calculation
            const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, userLat, userLng);
            setDistanceKm(dist);
            setIsDeliverable(dist <= STORE_COORDS.maxRadiusKm);
            setLocationVerified(true);
            setDetectedAddress(`GPS: ${userLat.toFixed(5)}°N, ${userLng.toFixed(5)}°E`);
          }
        } catch (fetchErr) {
          const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, pos.coords.latitude, pos.coords.longitude);
          setDistanceKm(dist);
          setIsDeliverable(dist <= STORE_COORDS.maxRadiusKm);
          setLocationVerified(true);
          setDetectedAddress(`GPS: ${pos.coords.latitude.toFixed(5)}°N, ${pos.coords.longitude.toFixed(5)}°E`);
        } finally {
          setLocationChecking(false);
          setLocationStatusText('');
        }
      },
      (err) => {
        setLocationChecking(false);
        setLocationStatusText('');
        if (err.code === 1) {
          setErrorMessage('Location permission denied. Please allow GPS / Location access in your browser to verify delivery range.');
        } else if (err.code === 2) {
          setErrorMessage('GPS signal unavailable. Please ensure your device Location / GPS is turned ON and try again.');
        } else if (err.code === 3) {
          setErrorMessage('GPS request timed out. Please ensure GPS is active and click "Verify My Live Location" again.');
        } else {
          setErrorMessage('Could not fetch exact live location. Please try again.');
        }
      },
      geoOptions
    );
  };

  // Callback from Interactive ExactLocationPicker
  const handleLocationVerified = ({ coords: newCoords, distanceKm: newDist, isDeliverable: deliverable, address }) => {
    setCoords(newCoords);
    setDistanceKm(newDist);
    setIsDeliverable(deliverable);
    setLocationVerified(true);
    setErrorMessage('');

    if (address?.formatted) setDetectedAddress(address.formatted);

    // Auto-fill address fields if not manually entered
    if (address?.area) setRegArea(prev => prev.trim() ? prev : address.area);
    if (address?.city) setRegCity(prev => prev.trim() ? prev : address.city);
    if (address?.pincode) setRegPincode(prev => prev.trim() ? prev : address.pincode);
    if (address?.state) setRegState(address.state);
  };

  // 4. Request Register OTP
  const handleRequestRegisterOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!locationVerified || !isDeliverable) {
      setErrorMessage('Please verify your live location within 5 KM of Ratu, Ranchi before proceeding.');
      return;
    }

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regHouse.trim() || !regArea.trim()) {
      setErrorMessage('Please fill all required personal and delivery address fields.');
      return;
    }

    setLoading(true);
    const result = await requestRegisterOtp({
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      address: {
        name: regName.trim(),
        phone: regPhone.trim(),
        street: `${regHouse.trim()}, ${regArea.trim()}`,
        landmark: regLandmark.trim(),
        city: regCity.trim(),
        state: regState.trim(),
        pincode: regPincode.trim(),
        type: 'Home'
      },
      location: coords || STORE_COORDS
    });
    setLoading(false);

    if (result.success) {
      setMode('register_otp');
      setResendTimer(30);
    } else {
      setErrorMessage(result.message || 'Failed to start registration.');
    }
  };

  // 5. Verify Register OTP
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (regOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    const result = await verifyRegisterOtpWithAddress(regEmail.trim().toLowerCase(), regOtp);
    setLoading(false);

    if (result.success) {
      proceedPostAuth();
    } else {
      setErrorMessage(result.message || 'Invalid confirmation code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-hidden touch-pan-y">
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[94vh] sm:h-auto sm:max-h-[88vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#2874f0] text-white p-4 sm:p-6 flex-shrink-0 relative">
          
          {/* Top row with Back button (if in sub-mode) and Close button */}
          <div className="flex items-center justify-between mb-2">
            {mode !== 'login' ? (
              <button
                type="button"
                onClick={() => {
                  if (mode === 'register_otp') setMode('register');
                  else setMode('login');
                  setErrorMessage('');
                }}
                className="flex items-center gap-1.5 text-white/95 hover:text-white bg-blue-700/70 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back to {mode === 'register_otp' ? 'Register' : 'Login'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-yellow-300 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>RatuMart Local Fashion</span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            {mode === 'login' && 'Sign in to RatuMart'}
            {mode === 'login_otp' && 'Verify Login Code'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'register_otp' && 'Confirm Your Email'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
            {mode === 'login' && 'Enter your mobile number or email for instant OTP'}
            {mode === 'login_otp' && `Enter the 6-digit code sent to ${maskedEmail || targetEmail}`}
            {mode === 'register' && 'Fast registration with instant 5.0 KM local delivery'}
            {mode === 'register_otp' && `Enter the 6-digit code sent to ${regEmail}`}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">{errorMessage}</span>
              {errorMessage.includes('No account found') && mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="mt-1 text-blue-700 font-black underline hover:text-blue-900 block"
                >
                  Create New Account Now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body - Scrollable without leaking to background */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 no-scrollbar">

          {/* ================= 1. LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleRequestLoginOtp} className="space-y-5 text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  Mobile Number or Email Address *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 sm:top-4" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile number or email"
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  We will send a 6-digit OTP code to your registered email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !loginIdentifier.trim()}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl shadow-lg transition uppercase tracking-wider text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Continue &amp; Send OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center text-xs sm:text-sm text-slate-600 border-t border-slate-100 font-medium">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-blue-600 font-extrabold hover:underline cursor-pointer ml-1"
                >
                  Create account &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. LOGIN OTP VERIFY ================= */}
          {mode === 'login_otp' && (
            <form onSubmit={handleVerifyLoginOtp} className="space-y-5 text-sm">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 text-center">
                <span className="text-slate-600 block text-xs">Verification code sent to</span>
                <strong className="text-slate-900 font-bold block text-sm mt-0.5">{maskedEmail || targetEmail}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 text-center text-xs sm:text-sm">
                  Enter 6-Digit OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center py-3 sm:py-3.5 tracking-[0.4em] font-black text-xl sm:text-2xl border-2 border-blue-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-2xs"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || loginOtp.length !== 6}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl shadow-lg transition uppercase tracking-wider text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify &amp; Sign In</span>}
              </button>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Phone / Email
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleRequestLoginOtp}
                  className="text-blue-600 font-bold hover:underline disabled:text-slate-400"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* ================= 3. CREATE ACCOUNT (REGISTRATION) ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRequestRegisterOtp} className="space-y-5 text-sm">
              
              {/* Section 1: Personal Details */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">1</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                    Personal Information
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">Full Name *</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Enter full name (e.g. Amit Kumar)"
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">10-Digit Mobile *</label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 9811233445"
                          maxLength={10}
                          className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">Email Address (for OTP) *</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 sm:top-3.5" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. amit@gmail.com"
                          className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">2</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                    Local Delivery Address
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">House / Flat / Gali No. *</label>
                    <input
                      type="text"
                      value={regHouse}
                      onChange={(e) => setRegHouse(e.target.value)}
                      placeholder="e.g. House No. 24, Near Kali Mandir"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">Colony / Locality / Village *</label>
                    <input
                      type="text"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      placeholder="e.g. Dandai Phutaltoli, Kathitand"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={regLandmark}
                      onChange={(e) => setRegLandmark(e.target.value)}
                      placeholder="e.g. Near Shiv Mandir / Water Tank"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">City / Town *</label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder="e.g. Ranchi"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-bold text-slate-700">6-Digit Pincode *</label>
                      <input
                        type="text"
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 835222"
                        maxLength={6}
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Exact Sateek 5 KM Live Location Verification */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">3</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                    Exact Live Location Verification (Within 5.0 KM)
                  </span>
                </div>

                <ExactLocationPicker
                  onLocationVerified={handleLocationVerified}
                  currentCoords={coords}
                  isDeliverable={isDeliverable}
                  distanceKm={distanceKm}
                  detectedAddress={detectedAddress}
                />
              </div>

              {/* Submit Registration */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading || !locationVerified || !isDeliverable}
                  className={`w-full font-black py-3.5 sm:py-4 px-4 rounded-xl shadow-lg transition uppercase tracking-wider text-sm sm:text-base flex items-center justify-center gap-2 ${
                    locationVerified && isDeliverable
                      ? 'bg-[#2874f0] hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify &amp; Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center text-xs sm:text-sm text-slate-600 font-medium pb-2">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="text-blue-600 font-extrabold hover:underline cursor-pointer ml-1"
                  >
                    Sign in &rarr;
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ================= 4. REGISTER OTP VERIFY ================= */}
          {mode === 'register_otp' && (
            <form onSubmit={handleVerifyRegisterOtp} className="space-y-5 text-sm">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3.5 text-center">
                <span className="text-emerald-800 block text-xs sm:text-sm font-bold">Location verified within 5 KM!</span>
                <span className="text-slate-600 block text-xs mt-1">Confirmation code sent to</span>
                <strong className="text-slate-900 font-bold block text-sm">{regEmail}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 text-center text-xs sm:text-sm">
                  Enter 6-Digit Email Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center py-3 sm:py-3.5 tracking-[0.4em] font-black text-xl sm:text-2xl border-2 border-emerald-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 shadow-2xs"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || regOtp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 sm:py-4 rounded-xl shadow-lg transition uppercase tracking-wider text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Complete Registration &amp; Shop</span>}
              </button>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleRequestRegisterOtp}
                  className="text-blue-600 font-bold hover:underline disabled:text-slate-400"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
