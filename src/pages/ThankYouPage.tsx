import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, MapPin, Phone, ShieldCheck,
  ChevronRight, Car, Fuel, Download, Home, Navigation, AlertTriangle
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { trackEvent } from '../utils/analytics';

interface ThankYouPageProps {
  requestId?: string;
  serviceType?: string;
  vehicleNumber?: string;
  locationDescription?: string;
  onGoTracker: () => void;
  onGoHome: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  requestId = 'FR-2026-8919',
  serviceType = 'FUEL',
  vehicleNumber = 'TS 09 AB 1234',
  locationDescription = 'NH 44 Northbound Km 42 (Medchal Sector)',
  onGoTracker,
  onGoHome
}) => {
  // Countdown timer for 15-minute guaranteed SLA (900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(840); // 14 mins remaining

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Assistance Request', onClick: onGoHome },
          { label: 'Dispatch Confirmation', active: true }
        ]}
        onHomeClick={onGoHome}
      />

      {/* Main Thank You & Arrival Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-emerald-500/50 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                DISPATCH TRANSMITTED TO PATROL FLEET
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Thank You! Help Is On The Way.
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Emergency Case ID: <strong className="font-mono text-white">{requestId}</strong>
              </p>
            </div>
          </div>

          {/* 15-Min SLA Timer Countdown */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Guaranteed ETA Window
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-orange-400 block">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              15-Min Promise Active
            </span>
          </div>
        </div>

        {/* Dispatch Order Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Service Requested</span>
            <strong className="text-white text-sm">
              {serviceType === 'FUEL' ? 'Emergency 10L Petrol / Diesel' : serviceType}
            </strong>
            <p className="text-slate-400 mt-1 font-mono">{vehicleNumber}</p>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Assigned Patrol Unit</span>
            <strong className="text-white text-sm">Ramesh Reddy (Patrol Unit #4)</strong>
            <p className="text-emerald-400 mt-1 font-mono">En Route (3.2 km away)</p>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Incident Location</span>
            <p className="text-slate-200 truncate">{locationDescription}</p>
            <p className="text-slate-400 mt-1">Payment: UPI QR / FASTag / Cash on Arrival</p>
          </div>
        </div>

        {/* Safety Directives While Waiting */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Critical Roadside Safety Checklist While You Wait:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-200/90 list-disc list-inside">
            <li>Remain inside your vehicle with seatbelts buckled.</li>
            <li>Switch ON your hazard warning blinkers immediately.</li>
            <li>Never attempt to walk across active highway lanes.</li>
            <li>Keep doors locked if stranded on an unlit shoulder.</li>
          </ul>
        </div>

        {/* Clear Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onGoHome}
            className="py-3 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 flex items-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Driver Hub</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href="tel:1033"
              className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Responder</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onGoTracker();
                trackEvent('thank_you_view_tracker_clicked');
              }}
              className="py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all"
            >
              <span>Track Responder in Real-Time</span>
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
