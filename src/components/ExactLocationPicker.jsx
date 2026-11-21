import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, CheckCircle2, AlertCircle, 
  Loader2, Crosshair, Sparkles, Store, Compass
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
  { name: "Dandai Phutaltoli (Hub)", lat: 23.414532, lng: 85.216414, pin: "835222" },
  { name: "Ratu Chowk", lat: 23.407221, lng: 85.207812, pin: "835222" },
  { name: "Kathitand Chowk", lat: 23.408420, lng: 85.235140, pin: "835222" },
  { name: "Ratu Chati", lat: 23.411120, lng: 85.219800, pin: "835222" },
  { name: "Tilta / Ratu", lat: 23.427810, lng: 85.201400, pin: "835222" },
  { name: "Bajra / Ratu Rd", lat: 23.389200, lng: 85.253100, pin: "834005" },
  { name: "Pandra / ITI", lat: 23.383100, lng: 85.259800, pin: "834005" }
];

// Haversine formula in KM
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

// Create custom pin icon HTML
function createPinIcon(isDeliverable, isLocating) {
  const color = isDeliverable ? '#16a34a' : '#e11d48';
  const pulseColor = isDeliverable ? 'rgba(34, 197, 94, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  return L.divIcon({
    className: 'custom-location-pin',
    html: `
      <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${pulseColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: 0;"></div>
        <div style="position: relative; z-index: 10; width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="position: absolute; bottom: 2px; width: 8px; height: 8px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(2px);"></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 40]
  });
}

function createHubIcon() {
  return L.divIcon({
    className: 'custom-hub-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #2563eb; color: white; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 10px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 1.5px solid white; margin-bottom: 2px;">
          🏪 RatuMart Hub
        </div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #2563eb; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [100, 36],
    iconAnchor: [50, 36]
  });
}

export default function ExactLocationPicker({
  onLocationVerified,
  currentCoords,
  isDeliverable,
  distanceKm,
  detectedAddress
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [activeAddress, setActiveAddress] = useState(detectedAddress || '');
  const [activeDist, setActiveDist] = useState(distanceKm ?? null);
  const [deliverableState, setDeliverableState] = useState(isDeliverable ?? false);
  const [coordsState, setCoordsState] = useState(currentCoords || { lat: STORE_COORDS.lat, lng: STORE_COORDS.lng });

  // Reverse geocode a set of coordinates & notify parent
  const updateLocationPoint = useCallback(async (lat, lng, accuracy = null) => {
    const dist = calcDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
    const inRange = dist <= STORE_COORDS.maxRadiusKm;

    setActiveDist(dist);
    setDeliverableState(inRange);
    setCoordsState({ lat, lng });
    if (accuracy) setGpsAccuracy(accuracy);

    // Update marker icon & position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createPinIcon(inRange, false));
    }

    try {
      setStatusMessage('Fetching exact locality & house address...');
      const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      let addrDetails = {
        area: '',
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
        addrDetails.formatted = `GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
        setActiveAddress(addrDetails.formatted);
      }

      // Send to parent component
      if (onLocationVerified) {
        onLocationVerified({
          coords: { lat, lng, accuracy },
          distanceKm: dist,
          isDeliverable: inRange,
          address: addrDetails
        });
      }
    } catch (e) {
      const fallback = `GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
      setActiveAddress(fallback);
      if (onLocationVerified) {
        onLocationVerified({
          coords: { lat, lng, accuracy },
          distanceKm: dist,
          isDeliverable: inRange,
          address: { formatted: fallback, area: 'Ratu', city: 'Ranchi', pincode: '835222' }
        });
      }
    } finally {
      setStatusMessage('');
    }
  }, [onLocationVerified]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = coordsState.lat || STORE_COORDS.lat;
    const initialLng = coordsState.lng || STORE_COORDS.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // 5 KM Green Zone circle around Store Hub
    circleRef.current = L.circle([STORE_COORDS.lat, STORE_COORDS.lng], {
      radius: STORE_COORDS.maxRadiusKm * 1000,
      color: '#16a34a',
      fillColor: '#22c55e',
      fillOpacity: 0.12,
      weight: 2.5,
      dashArray: '6, 6'
    }).addTo(map);

    // Store Hub Marker
    L.marker([STORE_COORDS.lat, STORE_COORDS.lng], {
      icon: createHubIcon(),
      interactive: false
    }).addTo(map);

    // Draggable User Delivery Pin
    const pin = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createPinIcon(deliverableState, false),
      zIndexOffset: 1000
    }).addTo(map);

    pin.on('dragend', () => {
      const pos = pin.getLatLng();
      updateLocationPoint(pos.lat, pos.lng);
    });

    // Click anywhere on map to move pin
    map.on('click', (e) => {
      pin.setLatLng(e.latlng);
      updateLocationPoint(e.latlng.lat, e.latlng.lng);
    });

    markerRef.current = pin;
    mapInstanceRef.current = map;

    // Fix leaflet tile rendering inside modals
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Live High-Accuracy Hardware GPS Trigger
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device browser.");
      return;
    }

    setLocating(true);
    setStatusMessage('Acquiring high-accuracy satellite GPS lock...');

    let watchId = null;
    let bestAccuracy = 999999;
    let bestPos = null;

    const finalizePosition = (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 10);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
      }

      updateLocationPoint(lat, lng, acc);
      setLocating(false);
      setStatusMessage('');
    };

    // Watch for 3.5 seconds to refine GPS accuracy
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        if (acc < bestAccuracy) {
          bestAccuracy = acc;
          bestPos = pos;
        }
        // If accuracy is already very high (under 25 meters), lock in immediately
        if (acc <= 25) {
          if (watchId) navigator.geolocation.clearWatch(watchId);
          finalizePosition(pos);
        }
      },
      (err) => {
        // Fallback to single getCurrentPosition
        navigator.geolocation.getCurrentPosition(
          (pos) => finalizePosition(pos),
          () => {
            setLocating(false);
            setStatusMessage('');
            alert("Could not fetch GPS. Please turn on device Location and allow browser permission.");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // Timeout safety: finalize best position after 3.5 seconds
    setTimeout(() => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        if (bestPos) {
          finalizePosition(bestPos);
        } else {
          setLocating(false);
          setStatusMessage('');
        }
      }
    }, 3500);
  };

  // Landmark click
  const handleLandmarkSelect = (lm) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lm.lat, lm.lng], 16, { duration: 0.8 });
    }
    updateLocationPoint(lm.lat, lm.lng, 10);
  };

  return (
    <div className="space-y-3">
      
      {/* Top Header & GPS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blue-600 animate-spin-slow" />
          <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
            Pinpoint Exact Delivery Location
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={locating}
          className="bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {locating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Locating with GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>📍 Detect My Live GPS (Sateek)</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-50 py-1.5 px-3 rounded-lg flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Instruction Banner */}
        <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none flex justify-center">
          <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
            <Compass className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Drag pin or tap map on your exact house / gate</span>
          </div>
        </div>
      </div>

      {/* Quick Ratu Landmarks Shortcut */}
      <div>
        <div className="text-[11px] text-slate-500 font-bold mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span>Or pick your local area in Ratu (5 KM Zone):</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {RATU_LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              type="button"
              onClick={() => handleLandmarkSelect(lm)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg transition active:scale-95"
            >
              {lm.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Geofence Distance & Sateek Location Result Card */}
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
                <span className="text-slate-500 text-[11px] block mt-0.5 font-medium">
                  GPS: {coordsState.lat.toFixed(5)}°N, {coordsState.lng.toFixed(5)}°E {gpsAccuracy ? `• Sateek Accuracy: ±${gpsAccuracy}m` : ''}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Distance to Hub: <strong className={deliverableState ? 'text-emerald-700' : 'text-rose-700'}>{activeDist} KM</strong></span>
              <span className={`font-extrabold flex items-center gap-1 ${deliverableState ? 'text-emerald-600' : 'text-rose-600'}`}>
                {deliverableState ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sateek Delivery Range
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Exceeds 5 KM Maximum Range
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
