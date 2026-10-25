import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, Zap } from 'lucide-react';

export const ResponsePromiseBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/40 shadow-xl ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                ⚡ 15-Minute Highway Response Promise
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                100% SLA BACKED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              If our verified highway fuel patrol or tow unit does not reach your GPS location within the guaranteed dispatch ETA window, your emergency roadside delivery fee is 100% waived.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] block">Avg Arrival Time</span>
            <strong className="text-emerald-400 text-sm font-bold">14.2 Mins</strong>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-[10px] block">SLA Compliance</span>
            <strong className="text-white text-sm font-bold">99.4%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
