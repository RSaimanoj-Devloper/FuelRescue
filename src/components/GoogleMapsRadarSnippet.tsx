import React, { useState, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  Navigation, MapPin, Fuel, Compass, ExternalLink,
  Car, RefreshCw, AlertCircle, Phone, ArrowUpRight, CheckCircle2, Crosshair
} from 'lucide-react';
import { FuelOutlet, AssistanceProvider, FuelType } from '../types';
import { trackEvent } from '../utils/analytics';

interface GoogleMapsRadarSnippetProps {
  outlets: FuelOutlet[];
  providers: AssistanceProvider[];
  userLat: number;
  userLon: number;
  onLocationPick?: (lat: number, lon: number, description: string) => void;
  onRequestFromOutlet?: (outlet: FuelOutlet) => void;
}

// Inner Recenter Control using useMap hook
const RecenterControl: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  const handleRecenter = useCallback(() => {
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(13);
      trackEvent('map_recenter_clicked', { lat, lng });
    }
  }, [map, lat, lng]);

  return (
    <button
      type="button"
      onClick={handleRecenter}
      className="absolute top-3 right-3 z-10 p-2.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 shadow-xl transition-all flex items-center gap-1.5 text-xs font-bold"
      title="Recenter to my current location"
    >
      <Crosshair className="w-4 h-4 text-orange-400" />
      <span className="hidden sm:inline">My Location</span>
    </button>
  );
};

export const GoogleMapsRadarSnippet: React.FC<GoogleMapsRadarSnippetProps> = ({
  outlets,
  providers,
  userLat,
  userLon,
  onLocationPick,
  onRequestFromOutlet
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'AIzaSyAe6i38wQpahYN-IYvmETpVHBNlkzoWpnY';

  const [selectedOutlet, setSelectedOutlet] = useState<FuelOutlet | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AssistanceProvider | null>(null);
  const [selectedUserMarker, setSelectedUserMarker] = useState(false);
  const [filterFuel, setFilterFuel] = useState<FuelType | 'ALL'>('ALL');
  const [filterEmergencyCans, setFilterEmergencyCans] = useState(false);

  // Filter nearby fuel outlets
  const filteredOutlets = useMemo(() => {
    return outlets.filter((o) => {
      if (filterEmergencyCans && !o.hasEmergencyCans) return false;
      if (filterFuel === 'PETROL') return o.petrolAvailable;
      if (filterFuel === 'DIESEL') return o.dieselAvailable;
      return true;
    });
  }, [outlets, filterFuel, filterEmergencyCans]);

  // Filter providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (filterFuel === 'ALL') return true;
      return p.supportedFuel?.includes(filterFuel);
    });
  }, [providers, filterFuel]);

  // Approximate distance calculation in KM (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Google Maps Directions Link generator
  const getDirectionsUrl = (destLat: number, destLon: number) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}&travelmode=driving`;
  };

  const center = useMemo(() => ({ lat: userLat, lng: userLon }), [userLat, userLon]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Header & Interactive Filter Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Live Highway Fuel &amp; Assistance Map</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                GOOGLE MAPS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive satellite &amp; terrain radar showing your vehicle relative to verified highway fuel stations.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterFuel('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterFuel === 'ALL'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Outlets
            </button>
            <button
              type="button"
              onClick={() => setFilterFuel('PETROL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterFuel === 'PETROL'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Petrol
            </button>
            <button
              type="button"
              onClick={() => setFilterFuel('DIESEL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterFuel === 'DIESEL'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Diesel
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFilterEmergencyCans(!filterEmergencyCans)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterEmergencyCans
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Jerrycans Only
          </button>
        </div>
      </div>

      {/* Main Google Map Container */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950">
        <APIProvider apiKey={apiKey} libraries={['marker', 'places']}>
          <Map
            defaultCenter={center}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            onClick={(e) => {
              if (onLocationPick && e.detail.latLng) {
                const { lat, lng } = e.detail.latLng;
                onLocationPick(
                  Math.round(lat * 10000) / 10000,
                  Math.round(lng * 10000) / 10000,
                  `Highway Map Pin [${lat.toFixed(4)}, ${lng.toFixed(4)}]`
                );
              }
            }}
          >
            <RecenterControl lat={userLat} lng={userLon} />

            {/* 1. User Current Location Advanced Marker */}
            <AdvancedMarker
              position={{ lat: userLat, lng: userLon }}
              title="Your Stranded Location"
              onClick={() => {
                setSelectedUserMarker(true);
                setSelectedOutlet(null);
                setSelectedProvider(null);
                trackEvent('map_user_marker_clicked');
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer">
                <span className="w-9 h-9 rounded-full bg-blue-500/40 animate-ping absolute" />
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-10">
                  <Car className="w-4 h-4" />
                </div>
              </div>
            </AdvancedMarker>

            {/* User Info Window */}
            {selectedUserMarker && (
              <InfoWindow
                position={{ lat: userLat, lng: userLon }}
                onCloseClick={() => setSelectedUserMarker(false)}
              >
                <div className="p-1 text-slate-900 max-w-xs text-xs space-y-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    YOUR CURRENT LOCATION
                  </span>
                  <p className="font-bold text-sm text-slate-900">Stranded Vehicle GPS</p>
                  <p className="text-[11px] text-slate-600">
                    Coordinates: {userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    15-Minute Highway Emergency Response Active
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* 2. Fuel Outlets Advanced Markers */}
            {filteredOutlets.map((outlet) => {
              const distanceKm = calculateDistance(userLat, userLon, outlet.latitude, outlet.longitude);
              return (
                <AdvancedMarker
                  key={outlet.id}
                  position={{ lat: outlet.latitude, lng: outlet.longitude }}
                  title={`${outlet.name} - ${outlet.omc}`}
                  onClick={() => {
                    setSelectedOutlet(outlet);
                    setSelectedProvider(null);
                    setSelectedUserMarker(false);
                    trackEvent('map_outlet_marker_clicked', { outletId: outlet.id, name: outlet.name });
                  }}
                >
                  <Pin
                    background="#ea580c"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={1.1}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Outlet Info Window */}
            {selectedOutlet && (
              <InfoWindow
                position={{ lat: selectedOutlet.latitude, lng: selectedOutlet.longitude }}
                onCloseClick={() => setSelectedOutlet(null)}
              >
                <div className="p-2 text-slate-900 max-w-xs text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                    <span className="px-1.5 py-0.5 rounded font-black text-[10px] bg-orange-100 text-orange-800">
                      {selectedOutlet.omc}
                    </span>
                    <span className="font-bold text-slate-600 text-[11px]">
                      ~{calculateDistance(userLat, userLon, selectedOutlet.latitude, selectedOutlet.longitude)} km away
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {selectedOutlet.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{selectedOutlet.highway}</p>
                  </div>

                  {/* Pricing & Cans */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Petrol</span>
                      <strong className="text-slate-900">
                        {selectedOutlet.petrolAvailable ? `₹${selectedOutlet.petrolPrice}/L` : 'Unavailable'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Diesel</span>
                      <strong className="text-slate-900">
                        {selectedOutlet.dieselAvailable ? `₹${selectedOutlet.dieselPrice}/L` : 'Unavailable'}
                      </strong>
                    </div>
                  </div>

                  {selectedOutlet.hasEmergencyCans && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      <span>Approved Safety Jerrycans in Stock</span>
                    </div>
                  )}

                  {/* Directions & Dispatch CTA */}
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={getDirectionsUrl(selectedOutlet.latitude, selectedOutlet.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('get_directions_clicked', { destination: selectedOutlet.name })}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 transition-colors text-[11px]"
                    >
                      <span>Directions</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>

                    {onRequestFromOutlet && (
                      <button
                        type="button"
                        onClick={() => {
                          onRequestFromOutlet(selectedOutlet);
                          setSelectedOutlet(null);
                        }}
                        className="flex-1 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-center text-[11px] transition-colors"
                      >
                        Request Delivery
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* 3. Assistance Providers / Highway Patrol Markers */}
            {filteredProviders.map((provider) => (
              <AdvancedMarker
                key={provider.id}
                position={{ lat: provider.latitude, lng: provider.longitude }}
                title={`${provider.name} - ${provider.agencyName}`}
                onClick={() => {
                  setSelectedProvider(provider);
                  setSelectedOutlet(null);
                  setSelectedUserMarker(false);
                  trackEvent('map_provider_marker_clicked', { providerId: provider.id });
                }}
              >
                <Pin
                  background="#2563eb"
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={0.95}
                />
              </AdvancedMarker>
            ))}

            {/* Provider Info Window */}
            {selectedProvider && (
              <InfoWindow
                position={{ lat: selectedProvider.latitude, lng: selectedProvider.longitude }}
                onCloseClick={() => setSelectedProvider(null)}
              >
                <div className="p-2 text-slate-900 max-w-xs text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="px-1.5 py-0.5 rounded font-black text-[10px] bg-blue-100 text-blue-800">
                      HIGHWAY RESCUE PATROL
                    </span>
                    <span className="font-bold text-slate-600 text-[11px]">
                      ~{calculateDistance(userLat, userLon, selectedProvider.latitude, selectedProvider.longitude)} km
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{selectedProvider.name}</h4>
                    <p className="text-[11px] text-slate-600">{selectedProvider.agencyName}</p>
                  </div>

                  <p className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                    Vehicle: <strong>{selectedProvider.vehicleType}</strong> ({selectedProvider.vehicleNumber})
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={`tel:${selectedProvider.phone}`}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Patrol</span>
                    </a>
                    <a
                      href={getDirectionsUrl(selectedProvider.latitude, selectedProvider.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map Footer with Directions Legend & Quick Actions */}
      <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
            <span className="text-slate-300 font-medium">Your Stranded Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
            <span className="text-slate-300 font-medium">Fuel Stations ({filteredOutlets.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
            <span className="text-slate-300 font-medium">Rescue Units ({filteredProviders.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/fuel+stations+near+me/@${userLat},${userLon},13z`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('open_google_maps_nearby_clicked')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            <span>Open in Google Maps App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
