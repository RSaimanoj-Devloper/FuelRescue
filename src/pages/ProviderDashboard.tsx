import React, { useState, useEffect } from 'react';
import {
  HardHat, MapPin, Fuel, Phone, CheckCircle2, Navigation,
  Clock, DollarSign, ShieldAlert, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { AssistanceRequest, AssistanceProvider } from '../types';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface ProviderDashboardProps {
  onSelectRequest: (requestId: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onSelectRequest }) => {
  const { t, theme } = useTheme();
  const [provider, setProvider] = useState<AssistanceProvider | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [providers, allReqs, notifs] = await Promise.all([
        api.getProviders(),
        api.getRequests(),
        api.getNotifications('PROVIDER')
      ]);
      const current = providers[0] || null;
      setProvider(current);
      setRequests(allReqs);
      setNotifications(notifs);
    } catch (e) {
      console.warn('Error loading provider data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async (newStatus: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY') => {
    if (!provider) return;
    await api.updateProviderStatus(provider.id, newStatus);
    setProvider({ ...provider, status: newStatus });
  };

  const handleClaimRequest = async (reqId: string) => {
    if (!provider) return;
    setUpdatingStatus(reqId);
    try {
      await api.providerClaimRequest(reqId, provider.id);
      await loadData();
    } catch (e) {
      alert('Could not claim request: ' + (e instanceof Error ? e.message : 'Error'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateJobStatus = async (reqId: string, nextStatus: string) => {
    setUpdatingStatus(reqId);
    try {
      await api.updateRequestStatus(reqId, nextStatus, `Updated by provider ${provider?.name}`, 'PROVIDER');
      await loadData();
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-2" />
        <p className="text-sm">Loading assistance provider control room...</p>
      </div>
    );
  }

  // Split requests into Active/Assigned vs Available Unclaimed
  const assignedJobs = requests.filter(r =>
    (r.assignedProviderId === provider?.id || r.assignedProviderName === provider?.name) &&
    !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status)
  );

  const incomingPool = requests.filter(r =>
    (r.status === 'MATCHING' || r.status === 'SYNCED') &&
    !r.assignedProviderId
  );

  const completedHistory = requests.filter(r =>
    (r.assignedProviderId === provider?.id || r.assignedProviderName === provider?.name) &&
    r.status === 'COMPLETED'
  );

  const activeSosAlerts = notifications.filter(n => n.type === 'SOS_EMERGENCY');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Priority Highway SOS Alert Banner for All Service Providers */}
      {activeSosAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/80 shadow-2xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>🚨 Critical Highway SOS Broadcast Received</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px]">
              {activeSosAlerts.length} PRIORITY ALERT{activeSosAlerts.length > 1 ? 'S' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {activeSosAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="p-3 bg-slate-950/90 rounded-2xl border border-red-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{alert.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-0.5">{alert.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  {alert.userPhone && (
                    <a
                      href={`tel:${alert.userPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{alert.userPhone}</span>
                    </a>
                  )}
                  {alert.requestId && (
                    <button
                      onClick={() => handleClaimRequest(alert.requestId)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30"
                    >
                      Respond & Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Header & Availability Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xl">
            <HardHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{provider?.name || 'Ramesh Reddy'}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                MoRTH Verified Unit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {provider?.agencyName} · Patrol Bike ({provider?.vehicleNumber})
            </p>
          </div>
        </div>

        {/* Availability Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Duty Status:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleToggleAvailability(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  provider?.status === st
                    ? st === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white'
                      : st === 'BUSY'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block">Active Jobs</span>
          <span className="text-2xl font-black text-orange-400 mt-1 block tabular-nums">
            {assignedJobs.length}
          </span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block">Incoming Pool</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block tabular-nums">
            {incomingPool.length}
          </span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block">Completed Today</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block tabular-nums">
            {completedHistory.length + 4}
          </span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 block">Today's Earnings</span>
          <span className="text-2xl font-black text-white mt-1 block tabular-nums">
            ₹{(completedHistory.length + 4) * 250}
          </span>
        </div>
      </div>

      {/* Active Assigned Jobs Stepper */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-orange-400" />
          <span>Active Dispatched Jobs ({assignedJobs.length})</span>
        </h3>

        {assignedJobs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No active jobs in your current queue. Review incoming emergency requests below to claim.
          </div>
        ) : (
          <div className="space-y-4">
            {assignedJobs.map((job) => (
              <div key={job.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{job.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {job.status}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-white mt-1">
                      {job.requestedQuantity}L {job.fuelType} for {job.vehicleNumber}
                    </h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.locationDescription}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${job.userPhone}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{job.userPhone}</span>
                    </a>
                    <button
                      onClick={() => onSelectRequest(job.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Status Advancement Controls */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">Advance Job Stage:</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {job.status === 'PROVIDER_ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, 'DISPATCHED')}
                        disabled={updatingStatus === job.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl transition-colors"
                      >
                        Mark as Dispatched (En Route)
                      </button>
                    )}
                    {job.status === 'DISPATCHED' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, 'ARRIVING')}
                        disabled={updatingStatus === job.id}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl transition-colors"
                      >
                        Mark Arriving (At Vehicle)
                      </button>
                    )}
                    {job.status === 'ARRIVING' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, 'DELIVERED')}
                        disabled={updatingStatus === job.id}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold text-white rounded-xl transition-colors"
                      >
                        Confirm Fuel Delivered into Tank
                      </button>
                    )}
                    {job.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                        disabled={updatingStatus === job.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors"
                      >
                        Complete Job & Close Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Assistance Pool (Unclaimed) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Fuel className="w-4 h-4 text-blue-400" />
          <span>Incoming Highway Requests Pool ({incomingPool.length})</span>
        </h3>

        {incomingPool.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No unclaimed emergency requests in your coverage sector at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingPool.map((req) => (
              <div key={req.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                      {req.id} · {req.fuelType}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {req.requestedQuantity} Litres for {req.vehicleNumber}
                    </h4>
                  </div>
                  <span className="text-sm font-extrabold text-orange-400">
                    ₹{req.estimatedCost}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {req.locationDescription}
                </p>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(req.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleClaimRequest(req.id)}
                    disabled={updatingStatus === req.id || provider?.status !== 'AVAILABLE'}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    {updatingStatus === req.id ? 'Claiming...' : 'Claim Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
