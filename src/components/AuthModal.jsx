import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, ShieldCheck, Mail, User, Phone, 
  Loader2, CheckCircle2, MapPin, Home, 
  ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Navigation
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

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
    setIsCheckoutOpen
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
    if (cart && cart.length > 0) {
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

  // 3. Live Location Detection (GPS)
  const detectLiveLocation = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationChecking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, userLat, userLng);

        setCoords({ lat: userLat, lng: userLng });
        setDistanceKm(dist);
        setLocationVerified(true);
        setLocationChecking(false);

        if (dist <= STORE_COORDS.maxRadiusKm) {
          setIsDeliverable(true);
        } else {
          setIsDeliverable(false);
        }
      },
      (err) => {
        setLocationChecking(false);
        setErrorMessage(
          err.code === 1
            ? 'Location permission denied. Please allow location access to verify delivery range.'
            : 'Could not fetch device location. Please try again or use the test button.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#2874f0] text-white p-5 sm:p-6">
          <div className="flex items-center gap-1.5 text-yellow-300 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RatuMart Local Fashion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {mode === 'login' && 'Sign in to RatuMart'}
            {mode === 'login_otp' && 'Verify Login Code'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'register_otp' && 'Confirm Your Email'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {mode === 'login' && 'Enter your registered Mobile Number or Email Address'}
            {mode === 'login_otp' && `Enter the 6-digit code sent to ${maskedEmail || targetEmail}`}
            {mode === 'register' && 'Fast, passwordless signup with instant 5 KM local delivery'}
            {mode === 'register_otp' && `Enter the 6-digit code sent to ${regEmail}`}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{errorMessage}</span>
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">

          {/* ================= 1. LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleRequestLoginOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Mobile Number or Email Address *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile number or email"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We will send a 6-digit OTP code to your registered email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !loginIdentifier.trim()}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue &amp; Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-blue-600 font-black hover:underline cursor-pointer ml-1"
                >
                  Create account &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ================= 2. LOGIN OTP VERIFY ================= */}
          {mode === 'login_otp' && (
            <form onSubmit={handleVerifyLoginOtp} className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <span className="text-slate-600 block text-[11px]">Verification code sent to</span>
                <strong className="text-slate-900 font-bold block text-xs mt-0.5">{maskedEmail || targetEmail}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-center">
                  Enter 6-Digit OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center py-2.5 tracking-[0.4em] font-black text-lg border-2 border-blue-600 rounded-xl focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || loginOtp.length !== 6}
                className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify &amp; Sign In</span>}
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Phone / Email
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
            <form onSubmit={handleRequestRegisterOtp} className="space-y-3.5 text-xs">
              
              {/* Section 1: Personal Details */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  1. Personal Information
                </span>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Full Name (e.g. Amit Kumar) *"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-Digit Mobile *"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                      required
                    />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Email Address *"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  2. Local Delivery Address
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={regHouse}
                    onChange={(e) => setRegHouse(e.target.value)}
                    placeholder="House / Flat / Gali No. (e.g. House 14, Gali No. 2) *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                    required
                  />
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    placeholder="Colony / Area / Locality (e.g. Dandai Phutaltoli, Kathitand) *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                    required
                  />
                  <input
                    type="text"
                    value={regLandmark}
                    onChange={(e) => setRegLandmark(e.target.value)}
                    placeholder="Landmark (Near Shiv Mandir)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="City (e.g. Ranchi) *"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                      required
                    />
                    <input
                      type="text"
                      value={regPincode}
                      onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-Digit Pincode *"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: 5 KM Live Location Verification */}
              <div className="pt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  3. Live Location Verification (Strict 5 KM Radius)
                </span>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <button
                    type="button"
                    onClick={detectLiveLocation}
                    disabled={locationChecking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {locationChecking ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting GPS Coordinates...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>📍 Verify My Live Location</span>
                      </>
                    )}
                  </button>

                  {/* Location Verification Results */}
                  {locationVerified && isDeliverable && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        Verified: You are within our 5.0 KM delivery zone ({distanceKm} km away). Delivery Available!
                      </span>
                    </div>
                  )}

                  {locationVerified && !isDeliverable && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>
                        Delivery Unavailable: We strictly deliver within a 5.0 KM radius of Ratu, Ranchi. Your location is {distanceKm} KM away.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Registration */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading || !locationVerified || !isDeliverable}
                  className={`w-full font-black py-3 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${
                    locationVerified && isDeliverable
                      ? 'bg-[#2874f0] hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify &amp; Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-slate-600">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="text-blue-600 font-black hover:underline cursor-pointer ml-1"
                  >
                    Sign in &rarr;
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ================= 4. REGISTER OTP VERIFY ================= */}
          {mode === 'register_otp' && (
            <form onSubmit={handleVerifyRegisterOtp} className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <span className="text-emerald-800 block text-[11px] font-semibold">Location verified within 5 KM!</span>
                <span className="text-slate-600 block text-[11px] mt-1">Confirmation code sent to</span>
                <strong className="text-slate-900 font-bold block text-xs">{regEmail}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-center">
                  Enter 6-Digit Email Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center py-2.5 tracking-[0.4em] font-black text-lg border-2 border-emerald-600 rounded-xl focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || regOtp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration &amp; Shop</span>}
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Registration Details
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
