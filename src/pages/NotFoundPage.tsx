import React from 'react';
import { AlertTriangle, Home, Compass, PhoneCall, ArrowLeft, Radio, Shield, Fuel } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { trackEvent } from '../utils/analytics';

interface NotFoundPageProps {
  onGoHome: () => void;
  onGoTracker?: () => void;
  onGoSOS?: () => void;
  onGoFaqs?: () => void;
  onGoPrivacy?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onGoHome,
  onGoTracker,
  onGoSOS,
  onGoFaqs,
  onGoPrivacy
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: '404 Highway Route Not Found', active: true }]}
        onHomeClick={onGoHome}
      />

      {/* Main 404 Hero Card with Clear CTA Above the Fold */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl space-y-6">
        {/* Decorative Beacon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-orange-600/30 to-red-600/20 border-2 border-orange-500/40 text-orange-400 flex items-center justify-center shadow-2xl animate-beaconGlow">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-orange-950 text-orange-400 border border-orange-800">
            ERROR 404 · HIGHWAY SECTOR OFF-GRID
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Lost Highway Signal
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The requested highway coordinate or page route does not exist or has been relocated by traffic operations control.
          </p>
        </div>

        {/* Clear Action Buttons Above the Fold */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onGoHome();
              trackEvent('404_return_home_clicked');
            }}
            className="py-3 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Driver Hub</span>
          </button>

          {onGoSOS && (
            <button
              type="button"
              onClick={() => {
                onGoSOS();
                trackEvent('404_emergency_sos_clicked');
              }}
              className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Emergency One-Tap SOS</span>
            </button>
          )}

          <a
            href="tel:1033"
            onClick={() => trackEvent('404_call_helpline_clicked')}
            className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call NHAI 1033</span>
          </a>
        </div>
      </div>

      {/* Internal Highway Links Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-orange-400" />
          <span>Internal Highway Navigation Directory</span>
        </h3>
        <p className="text-xs text-slate-400">
          Quickly reconnect to essential highway driver services and assistance modules:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onGoHome}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs mb-1">
              <Fuel className="w-4 h-4" />
              <span>Driver Hub &amp; Live Map</span>
            </div>
            <p className="text-[11px] text-slate-400">View current position &amp; nearby fuel stations.</p>
          </button>

          {onGoTracker && (
            <button
              type="button"
              onClick={onGoTracker}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                <Compass className="w-4 h-4" />
                <span>Live Request Tracker</span>
              </div>
              <p className="text-[11px] text-slate-400">Monitor dispatched patrol unit ETA &amp; telemetry.</p>
            </button>
          )}

          {onGoFaqs && (
            <button
              type="button"
              onClick={onGoFaqs}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Shield className="w-4 h-4" />
                <span>5 Highway FAQs</span>
              </div>
              <p className="text-[11px] text-slate-400">Answers on response times, PESO safety &amp; payments.</p>
            </button>
          )}

          {onGoPrivacy && (
            <button
              type="button"
              onClick={onGoPrivacy}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </div>
              <p className="text-[11px] text-slate-400">GPS location privacy &amp; data protection standards.</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
