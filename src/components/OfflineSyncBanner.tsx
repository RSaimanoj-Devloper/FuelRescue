import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncNow, simulatedOffline, toggleSimulation } = useNetworkStatus();

  return (
    <div className="w-full">
      {/* Simulation and Network Status Sub-bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected (Online)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              Offline Mode Active
            </span>
          )}

          {pendingCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold">
              {pendingCount} Pending Sync
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Simulated Offline Toggle for Reviewers */}
          <button
            onClick={toggleSimulation}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors border ${
              simulatedOffline
                ? 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {simulatedOffline ? 'Disable Network Simulation' : 'Simulate Offline Mode'}
          </button>

          {isOnline && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-orange-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Emergency Warning if Offline */}
      {!isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2.5 text-amber-200 text-xs sm:text-sm flex items-center justify-between shadow-inner">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                No Internet Connection — Offline-First Mode Engaged
              </p>
              <p className="text-amber-200/90 text-xs mt-0.5">
                New emergency requests are saved safely in your device’s local IndexedDB with unique UUID. They will sync automatically to highway dispatch when internet returns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
