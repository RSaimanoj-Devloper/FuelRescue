import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertCircle, Phone } from 'lucide-react';

export const RoadsideSafetyNotice: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              National Highway Safety Checklist (MoRTH Protocol)
            </h4>
            <p className="text-xs text-slate-400">
              Your safety comes first before fuel assistance. Follow these guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          aria-label="Toggle safety tips"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-semibold text-orange-300 block mb-1">1. Park on Outer Shoulder</span>
            Turn on hazard warning blinkers immediately. Steer as far left as possible away from high-speed lanes.
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-semibold text-orange-300 block mb-1">2. Stand Behind Crash Barrier</span>
            Passengers should exit from the left side and wait safely behind the metal crash barrier, never on the roadway.
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-semibold text-orange-300 block mb-1">3. Highway Emergency Services</span>
            For medical or accident emergencies, dial NHAI <strong>1033</strong> or Police <strong>112</strong> immediately.
          </div>
        </div>
      )}
    </div>
  );
};
