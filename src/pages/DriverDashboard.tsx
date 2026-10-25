import React, { useState, useEffect } from 'react';
import {
  Fuel, MapPin, AlertTriangle, ArrowRight, ShieldAlert, Car,
  Clock, CheckCircle2, QrCode, Phone, Plus, History, RefreshCw, Eye, ChevronRight,
  Truck, Wrench, AlertOctagon, Satellite, Sparkles, Navigation, Shield
} from 'lucide-react';
import { AssistanceRequest, FuelOutlet, AssistanceProvider, Vehicle, ServiceType } from '../types';
import { api } from '../services/api';
import { db } from '../offline/db';
import { GoogleMapsRadarSnippet } from '../components/GoogleMapsRadarSnippet';
import { ResponsePromiseBadge } from '../components/ResponsePromiseBadge';
import { FaqSection } from '../components/FaqSection';
import { CaseStudiesSection } from '../components/CaseStudiesSection';
import { ReviewsSection } from '../components/ReviewsSection';
import { TeamSection } from '../components/TeamSection';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { QRCodeModal } from '../components/QRCodeModal';
import { RoadsideSafetyNotice } from '../components/RoadsideSafetyNotice';
import { GnssSatelliteLocator } from '../components/GnssSatelliteLocator';
import { DriverAnnouncementBanner } from '../components/DriverAnnouncementBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface DriverDashboardProps {
  onRequestServiceClick: (serviceType: ServiceType) => void;
  onSelectRequest: (requestId: string) => void;
  onOpenSOS: () => void;
  onOpenTour?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  onRequestServiceClick,
  onSelectRequest,
  onOpenSOS,
  onOpenTour,
  onNavigateTab
}) => {
  const { isOnline, pendingCount } = useNetworkStatus();
  const { t } = useTheme();
  const { user } = useAuth();

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [outlets, setOutlets] = useState<FuelOutlet[]>([]);
  const [providers, setProviders] = useState<AssistanceProvider[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Highway driver location
  const [driverLat, setDriverLat] = useState(17.6250);
  const [driverLon, setDriverLon] = useState(78.4790);

  const loadAll = async () => {
    try {
      const [reqs, outs, provs, vehs] = await Promise.all([
        api.getRequests(),
        api.getOutlets(),
        api.getProviders(),
        db.vehicles.toArray()
      ]);
      setRequests(reqs);
      setOutlets(outs);
      setProviders(provs);
      setVehicles(vehs);
    } catch (e) {
      console.warn('Dashboard load note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeRequest = requests.find(r => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status));
  const pastRequests = requests.filter(r => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Driver Hub & Roadside Radar', active: true }]} />

      {/* 0. Live Admin Push Announcement Banner (Emergency & Maintenance alerts) */}
      <DriverAnnouncementBanner />

      {/* 1. Roadside Safety Advisory */}
      <RoadsideSafetyNotice />

      {/* 2. Emergency Hero Banner + ONE-TAP SOS Trigger */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Fuel className="w-3.5 h-3.5" />
              <span>{t.emergencyTag}</span>
            </div>

            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold tracking-wide transition-all text-white border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Quick Start Tour</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t.strandedTitle}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-white/90">
            {t.strandedSubtitle}
          </p>

          {/* Action Row: One-Tap SOS & Services (Clear CTA above the fold) */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* ONE-TAP SOS BUTTON */}
            <button
              onClick={onOpenSOS}
              className="py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 active:scale-95 text-white font-black text-sm sm:text-base shadow-2xl shadow-red-900/60 border-2 border-red-400/80 flex items-center gap-2.5 transition-all animate-pulse"
            >
              <AlertOctagon className="w-5 h-5 text-white" />
              <span>{t.oneTapSos}</span>
            </button>

            <button
              onClick={() => onRequestServiceClick('FUEL')}
              className="py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all border border-orange-500/40"
            >
              <Fuel className="w-4 h-4 text-orange-400" />
              <span>{t.requestFuel} (15-Min Arrival)</span>
            </button>

            <button
              onClick={() => onRequestServiceClick('TOW_TRUCK')}
              className="py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4 text-blue-400" />
              <span>{t.requestTowing}</span>
            </button>

            <button
              onClick={() => onRequestServiceClick('MECHANIC')}
              className="py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all"
            >
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>{t.requestMechanic}</span>
            </button>
          </div>
        </div>

        {/* Backdrop Decorative Symbol */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 flex items-center justify-center pointer-events-none">
          <Fuel className="w-72 h-72 -mr-16" />
        </div>
      </div>

      {/* 2.1 15-Minute Response Time Promise Banner */}
      <ResponsePromiseBadge />

      {/* 3. GNSS Satellite Direct Positioning Radar */}
      <GnssSatelliteLocator
        onCoordinatesAcquired={(lat, lon) => {
          setDriverLat(lat);
          setDriverLon(lon);
        }}
      />

      {/* 4. Active Emergency Request Card (If active) */}
      {activeRequest && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-orange-500/70 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Active Roadside Assistance Case
              </span>
              <span className="font-mono text-xs text-white font-bold bg-slate-800 px-2 py-0.5 rounded">
                {activeRequest.id}
              </span>
              {activeRequest.isSosEmergency && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                  SOS PRIORITY
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-lg">
                Status: {activeRequest.status}
              </span>
              <button
                onClick={() => onSelectRequest(activeRequest.id)}
                className="py-1 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>Live Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Requested Service</span>
              <strong className="text-white text-sm">
                {activeRequest.serviceType === 'FUEL' ? `${activeRequest.requestedQuantity}L ${activeRequest.fuelType}` :
                 activeRequest.serviceType === 'TOW_TRUCK' ? 'Tow Truck Flatbed Recovery' : 'On-Spot Mobile Mechanic'}
              </strong>
              <p className="text-slate-400 mt-0.5">{activeRequest.vehicleNumber}</p>
            </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Highway Patrol</span>
                <strong className="text-white text-sm">
                  {activeRequest.assignedProviderName || 'Matching Patrol Unit...'}
                </strong>
                <p className="text-slate-400 mt-0.5">
                  {activeRequest.etaMinutes ? `Estimated Arrival: ~${activeRequest.etaMinutes} mins` : 'Patrol unit dispatch in progress'}
                </p>
                {activeRequest.serviceType === 'FUEL' && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                    activeRequest.canisterDispensed
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  }`}>
                    {activeRequest.canisterDispensed ? '✓ Canister Released by Bunk' : '⏳ Awaiting Canister Handover'}
                  </span>
                )}
              </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Location</span>
              <p className="text-slate-200 truncate">{activeRequest.locationDescription}</p>
              <span className="text-orange-400 font-bold block mt-0.5">
                Total: ₹{activeRequest.confirmedCost || activeRequest.estimatedCost}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Interactive Highway Radar Map using Google Maps Platform */}
      <GoogleMapsRadarSnippet
        outlets={outlets}
        providers={providers}
        userLat={driverLat}
        userLon={driverLon}
        onLocationPick={(lat, lon) => {
          setDriverLat(lat);
          setDriverLon(lon);
        }}
        onRequestFromOutlet={() => {
          onRequestServiceClick('FUEL');
        }}
      />

      {/* 6. Registered Vehicles & Emergency QR Codes */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-orange-400" />
            <span>My Registered Vehicles</span>
          </h3>
          <span className="text-xs text-slate-400">
            QR passes allow roadside safety and fuel capacity checks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">{v.vehicleNumber}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-orange-400 font-mono">
                    {v.fuelType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{v.makeModel}</p>
              </div>

              <button
                onClick={() => setSelectedVehicleForQR(v)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-white transition-colors"
                title="View Emergency QR Pass"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Recent Requests History */}
      {pastRequests.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-orange-400" />
            <span>Assistance History ({pastRequests.length})</span>
          </h3>

          <div className="divide-y divide-slate-800/80 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            {pastRequests.map((req) => (
              <div key={req.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/30">
                <div>
                  <span className="font-mono font-bold text-white">{req.id}</span>
                  <p className="text-slate-400 mt-0.5">
                    {req.serviceType} · {req.vehicleNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {req.status}
                  </span>
                  <span className="font-bold text-white">₹{req.confirmedCost || req.estimatedCost}</span>
                  <button
                    onClick={() => onSelectRequest(req.id)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Documented Highway Case Studies */}
      <CaseStudiesSection onRequestClick={() => onRequestServiceClick('FUEL')} />

      {/* 9. Real Traveler Reviews */}
      <ReviewsSection />

      {/* 10. 5 Highway Assistance FAQs */}
      <FaqSection />

      {/* 11. Operational Leadership Team Showcase */}
      <TeamSection />

      {/* 12. Internal Links Directory Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-400" />
              <span>Internal Highway Services &amp; Compliance Directory</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct internal links to emergency trackers, offline sync, safety compliance, and legal guidelines.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">15-Min Response Guarantee</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('TRACKER')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-white block">Live Request Tracker</strong>
                <span className="text-[11px] text-slate-400">Patrol telemetry &amp; ETA</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('VEHICLES')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-white block">Registered Vehicles</strong>
                <span className="text-[11px] text-slate-400">QR passes &amp; tank capacities</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('PRIVACY_POLICY')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-purple-400 block">Privacy Policy</strong>
                <span className="text-[11px] text-slate-400">GPS &amp; DPDP compliance</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('THANK_YOU')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-emerald-400 block">Thank You Page</strong>
                <span className="text-[11px] text-slate-400">Order arrival countdown</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('NOT_FOUND')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-amber-400 block">Custom 404 Page</strong>
                <span className="text-[11px] text-slate-400">Lost signal route recovery</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('OFFLINE_SYNC')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
              >
                <strong className="text-blue-400 block">Offline SMS Sync</strong>
                <span className="text-[11px] text-slate-400">Local IndexedDB records</span>
              </button>
            </>
          )}

          <a
            href="tel:1033"
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all col-span-2 sm:col-span-2"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <strong className="text-white">NHAI 24/7 Road Safety Helpline (1033)</strong>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Toll-free emergency dispatch coordination across Indian National Highways</span>
          </a>
        </div>
      </div>

      {selectedVehicleForQR && (
        <QRCodeModal
          vehicle={selectedVehicleForQR}
          onClose={() => setSelectedVehicleForQR(null)}
        />
      )}
    </div>
  );
};
