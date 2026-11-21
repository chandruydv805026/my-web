import React, { useState, useCallback } from 'react';
import { 
  MapPin, Navigation, CheckCircle2, AlertCircle, 
  Loader2, Crosshair, Sparkles
} from 'lucide-react';

// Store Center Coordinates: Dandai Phutaltoli, Ratu, Ranchi - 835222
export const STORE_COORDS = {
  lat: 23.414532,
  lng: 85.216414,
  name: "Dandai Phutaltoli, Ratu, Ranchi",
  pincode: "835222",
  maxRadiusKm: 5.0
};

// Popular Landmarks within Ratu 5 KM Zone for instant 1-tap positioning
const RATU_LANDMARKS = [
  { name: "Dandai Phutaltoli (Hub)", lat: 23.414532, lng: 85.216414, pin: "835222", desc: "Store Location" },
  { name: "Ratu Chowk", lat: 23.407221, lng: 85.207812, pin: "835222", desc: "~1.1 KM" },
  { name: "Kathitand Chowk", lat: 23.408420, lng: 85.235140, pin: "835222", desc: "~2.0 KM" },
  { name: "Ratu Chati", lat: 23.411120, lng: 85.219800, pin: "835222", desc: "~0.5 KM" },
  { name: "Tilta / Ratu", lat: 23.427810, lng: 85.201400, pin: "835222", desc: "~2.1 KM" },
  { name: "Bajra / Ratu Rd", lat: 23.389200, lng: 85.253100, pin: "834005", desc: "~4.7 KM" },
  { name: "Pandra / ITI", lat: 23.383100, lng: 85.259800, pin: "834005", desc: "~4.9 KM" }
];

// Haversine distance in KM
export function calcDistanceKm(lat1, lon1, lat2, lon2) {
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

export default function ExactLocationPicker({
  onLocationVerified,
  currentCoords,
  isDeliverable,
  distanceKm,
  detectedAddress
}) {
  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedLandmark, setSelectedLandmark] = useState('');
  const [activeAddress, setActiveAddress] = useState(detectedAddress || '');
  const [activeDist, setActiveDist] = useState(distanceKm ?? null);
  const [deliverableState, setDeliverableState] = useState(isDeliverable ?? false);
  const [coordsState, setCoordsState] = useState(currentCoords || null);
  const [accuracyState, setAccuracyState] = useState(null);

  // Update location and verify against 5 KM geofence
  const updateLocationPoint = useCallback(async (lat, lng, accuracy = null, landmarkName = '') => {
    const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
    const inRange = dist <= STORE_COORDS.maxRadiusKm;

    setActiveDist(dist);
    setDeliverableState(inRange);
    setCoordsState({ lat, lng });
    if (accuracy) setAccuracyState(accuracy);
    if (landmarkName) setSelectedLandmark(landmarkName);

    try {
      setStatusMessage('Verifying exact locality...');
      const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      let addrDetails = {
        area: landmarkName || '',
        town: 'Ratu',
        city: 'Ranchi',
        pincode: '835222',
        state: 'Jharkhand',
        formatted: ''
      };

      if (data.success && data.address) {
        addrDetails = data.address;
        setActiveAddress(data.address.formatted || `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`);
      } else {
        const fallback = landmarkName 
          ? `${landmarkName}, Ratu, Ranchi - 835222`
          : `GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
        addrDetails.formatted = fallback;
        setActiveAddress(fallback);
      }

      if (onLocationVerified) {
        onLocationVerified({
          coords: { lat, lng, accuracy },
          distanceKm: dist,
          isDeliverable: inRange,
          address: addrDetails
        });
      }
    } catch (e) {
      const fallback = landmarkName 
        ? `${landmarkName}, Ratu, Ranchi - 835222`
        : `GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
      setActiveAddress(fallback);
      if (onLocationVerified) {
        onLocationVerified({
          coords: { lat, lng, accuracy },
          distanceKm: dist,
          isDeliverable: inRange,
          address: { formatted: fallback, area: landmarkName || 'Ratu', city: 'Ranchi', pincode: '835222' }
        });
      }
    } finally {
      setStatusMessage('');
    }
  }, [onLocationVerified]);

  // 1-Click Fast Live Location Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please select your local area below.");
      return;
    }

    setLocating(true);
    setStatusMessage('Capturing location...');
    setSelectedLandmark('');

    // High accuracy single-shot query with instant fallback for laptops
    const onGeoSuccess = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 10);
      setLocating(false);
      updateLocationPoint(lat, lng, acc);
    };

    const onGeoError = (err) => {
      // If high accuracy failed (very common on laptop / PC), try low accuracy once immediately
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (fallbackErr) => {
          setLocating(false);
          setStatusMessage('');
          if (fallbackErr.code === 1) {
            alert("Location permission was blocked. Please allow browser location or select your area below.");
          } else {
            alert("Could not detect automatic location. Please click your area below (e.g. Kathitand, Ratu Chowk).");
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  };

  // 1-Tap Landmark Click
  const handleLandmarkSelect = (lm) => {
    setSelectedLandmark(lm.name);
    updateLocationPoint(lm.lat, lm.lng, 10, lm.name);
  };

  return (
    <div className="space-y-3.5">
      
      {/* Header & Detect Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
            Pinpoint Exact Delivery Location
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={locating}
          className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {locating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>📍 Detect My Live Location</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-50 py-2 px-3 rounded-xl flex items-center gap-2 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Quick Ratu Landmarks Shortcut */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
        <div className="text-xs text-slate-700 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-extrabold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            Or pick your local area in Ratu (5 KM Zone):
          </span>
          <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Within 5 KM
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {RATU_LANDMARKS.map((lm) => {
            const isSelected = selectedLandmark === lm.name;
            return (
              <button
                key={lm.name}
                type="button"
                onClick={() => handleLandmarkSelect(lm)}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>📍</span>
                <span>{lm.name}</span>
                <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {lm.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Result Card */}
      {activeDist !== null && (
        <div className={`p-4 rounded-2xl border-2 space-y-2.5 shadow-xs transition-all animate-in fade-in ${
          deliverableState 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
              {deliverableState ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Exact Delivery Location Confirmed!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Outside 5.0 KM Delivery Radius</span>
                </>
              )}
            </div>

            <span className={`font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              deliverableState ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {deliverableState ? `${activeDist} KM (Deliverable)` : `${activeDist} KM (Out of Zone)`}
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200/80 text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-start gap-2">
              <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${deliverableState ? 'text-emerald-600' : 'text-rose-600'}`} />
              <div>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                  {activeAddress || 'Dandai Phutaltoli, Ratu, Ranchi - 835222'}
                </span>
                {coordsState && (
                  <span className="text-slate-500 text-[11px] block mt-0.5 font-medium">
                    Coordinates: {coordsState.lat?.toFixed(5)}°N, {coordsState.lng?.toFixed(5)}°E {accuracyState ? `• Accuracy: ±${accuracyState}m` : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Distance to Hub: <strong className={deliverableState ? 'text-emerald-700' : 'text-rose-700'}>{activeDist} KM</strong></span>
              <span className={`font-extrabold flex items-center gap-1 ${deliverableState ? 'text-emerald-600' : 'text-rose-600'}`}>
                {deliverableState ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fast Delivery Available
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Exceeds 5.0 KM Maximum Range
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
