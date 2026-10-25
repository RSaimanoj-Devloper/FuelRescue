import React from 'react';
import { Fuel, AlertOctagon, Phone, Clock } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface StickyMobileCtaProps {
  onRequestFuel: () => void;
  onOpenSOS: () => void;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({ onRequestFuel, onOpenSOS }) => {
  return (
    <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 px-3 py-2 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl animate-slideUp">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="leading-tight">
            <span className="text-[11px] font-black text-white block">15-Min Arrival</span>
            <span className="text-[10px] text-slate-400">Guaranteed Response</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRequestFuel();
              trackEvent('sticky_mobile_request_fuel_clicked');
            }}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Request Fuel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenSOS();
              trackEvent('sticky_mobile_sos_clicked');
            }}
            className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-1 active:scale-95 transition-all"
            title="Emergency SOS"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
