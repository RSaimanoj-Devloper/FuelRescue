import React, { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  WifiOff, ArrowRight, ShieldCheck, Eye, Trash2
} from 'lucide-react';
import { AssistanceRequest, SyncAuditLog } from '../types';
import { db } from '../offline/db';
import { triggerSync } from '../offline/syncEngine';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflineSyncPageProps {
  onSelectRequest: (requestId: string) => void;
}

export const OfflineSyncPage: React.FC<OfflineSyncPageProps> = ({ onSelectRequest }) => {
  const { isOnline, isSyncing, pendingCount, syncNow, simulatedOffline, toggleSimulation } = useNetworkStatus();
  const [offlineRequests, setOfflineRequests] = useState<AssistanceRequest[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [reqs, logs] = await Promise.all([
        db.requests.toArray(),
        db.syncLogs.toArray()
      ]);
      setOfflineRequests(reqs.reverse());
      setSyncLogs(logs.reverse());
    } catch (e) {
      console.warn('Offline page load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    await syncNow();
    await loadData();
  };

  const handleClearSynced = async () => {
    if (confirm('Clear local history of successfully synchronized requests?')) {
      const synced = await db.requests.filter(r => r.syncStatus === 'SYNCED').toArray();
      for (const r of synced) {
        await db.requests.delete(r.clientRequestId);
      }
      await loadData();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
            IndexedDB Offline Persistence Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Offline Storage & Synchronization Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspect locally stored requests, background sync queue, and cryptographic idempotency records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              simulatedOffline
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {simulatedOffline ? 'Exit Offline Simulation' : 'Simulate Disconnected Network'}
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Local IndexedDB Records</span>
            <span className="text-xl font-bold text-white tabular-nums">{offlineRequests.length}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Pending Cloud Sync</span>
            <span className="text-xl font-bold text-amber-400 tabular-nums">{pendingCount}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Synchronized to Aiven DB</span>
            <span className="text-xl font-bold text-emerald-400 tabular-nums">
              {offlineRequests.filter(r => r.syncStatus === 'SYNCED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">IndexedDB Request Queue</h3>
          {offlineRequests.some(r => r.syncStatus === 'SYNCED') && (
            <button
              onClick={handleClearSynced}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Synced History</span>
            </button>
          )}
        </div>

        {offlineRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No emergency requests stored in local IndexedDB. Create an emergency request to see offline persistence.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Local vs Server ID</th>
                  <th className="py-3 px-3">Client UUID</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Fuel / Qty</th>
                  <th className="py-3 px-3">Sync State</th>
                  <th className="py-3 px-3">Retries</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {offlineRequests.map((r) => (
                  <tr key={r.clientRequestId} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{r.id}</span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 truncate max-w-[140px]" title={r.clientRequestId}>
                      {r.clientRequestId}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">{r.vehicleNumber}</td>
                    <td className="py-3 px-3 font-sans">
                      {r.requestedQuantity}L {r.fuelType}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.syncStatus === 'SYNCED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : r.syncStatus === 'SYNC_FAILED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {r.syncStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums">{r.syncRetryCount || 0}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => onSelectRequest(r.id || r.clientRequestId)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Track</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sync Logs Audit View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white">Device Audit Trail & Synchronization Events</h3>
        <div className="divide-y divide-slate-800 text-xs font-mono max-h-72 overflow-y-auto">
          {syncLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className={`font-bold ${log.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  [{log.eventType}]
                </span>{' '}
                <span className="text-slate-300">{log.message}</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
