import React, { useState, useCallback } from 'react';
import { Navigation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Store Center Coordinates: Dandai Phutaltoli, Ratu, Ranchi - 835222
export const STORE_COORDS = {
  lat: 23.414532,
  lng: 85.216414,
  name: "Dandai Phutaltoli, Ratu, Ranchi",
  pincode: "835222",
  maxRadiusKm: 5.0
};

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
  distanceKm
}) {
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeDist, setActiveDist] = useState(distanceKm ?? null);
  const [deliverableState, setDeliverableState] = useState(isDeliverable ?? false);

  // Update location and check distance
  const updateLocationPoint = useCallback(async (lat, lng, accuracy = null) => {
    const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
    const inRange = dist <= STORE_COORDS.maxRadiusKm;

    setActiveDist(dist);
    setDeliverableState(inRange);

    // Immediately notify parent component
    if (onLocationVerified) {
      onLocationVerified({
        coords: { lat, lng, accuracy },
        distanceKm: dist,
        isDeliverable: inRange,
        address: { area: 'Ratu', town: 'Ratu', city: 'Ranchi', pincode: '835222' }
      });
    }

    // Background reverse geocode for address autofill
    try {
      const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success && data.address && onLocationVerified) {
        onLocationVerified({
          coords: { lat, lng, accuracy },
          distanceKm: dist,
          isDeliverable: inRange,
          address: data.address
        });
      }
    } catch (e) {
      // background silent
    }
  }, [onLocationVerified]);

  // Fast 1-click location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setErrorMessage('');

    const onGeoSuccess = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 10);
      setLocating(false);
      updateLocationPoint(lat, lng, acc);
    };

    const onGeoError = () => {
      // Fast fallback for laptop / PC WiFi location
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (fallbackErr) => {
          setLocating(false);
          if (fallbackErr.code === 1) {
            setErrorMessage("Location permission denied. Please allow location in your browser.");
          } else {
            setErrorMessage("Could not detect location. Please check your network or browser settings.");
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* 1-Click Detect Button */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {locating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Detecting Location...</span>
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            <span>📍 Detect My Live Location</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Location Confirmation Text (In English) */}
      {activeDist !== null && deliverableState && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Exact location confirmed</span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold pl-6">
            You are {activeDist} km away from RatuMart Hub.
          </p>
        </div>
      )}

      {activeDist !== null && !deliverableState && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Location out of delivery range</span>
          </div>
          <p className="text-xs text-rose-700 font-semibold pl-6">
            You are {activeDist} km away from RatuMart Hub. We only deliver within 5 km.
          </p>
        </div>
      )}
    </div>
  );
}
