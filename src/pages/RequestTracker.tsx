import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Phone, MapPin, Fuel, Shield, AlertTriangle,
  RefreshCw, QrCode, CreditCard, ChevronRight, XCircle, ArrowLeft, Navigation
} from 'lucide-react';
import { AssistanceRequest, RequestLifecycleStatus } from '../types';
import { api } from '../services/api';
import { QRCodeModal } from '../components/QRCodeModal';
import { SimulatedPaymentModal } from '../components/SimulatedPaymentModal';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface RequestTrackerProps {
  requestId: string;
  onBack: () => void;
}

const LIFECYCLE_STEPS: { status: RequestLifecycleStatus; label: string; desc: string }[] = [
  { status: 'PENDING_SYNC', label: 'Local Saved', desc: 'Stored offline in IndexedDB' },
  { status: 'SYNCED', label: 'Synced', desc: 'Confirmed by highway dispatch' },
  { status: 'MATCHING', label: 'Matching', desc: 'Locating nearest patrol unit' },
  { status: 'PROVIDER_ACCEPTED', label: 'Accepted', desc: 'Patrol unit claimed job' },
  { status: 'DISPATCHED', label: 'Dispatched', desc: 'En route with certified fuel cans' },
  { status: 'ARRIVING', label: 'Arriving', desc: 'Patrol in visual vicinity' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Fuel poured safely into tank' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Journey resumed' }
];

export const RequestTracker: React.FC<RequestTrackerProps> = ({ requestId, onBack }) => {
  const { isOnline, syncNow, isSyncing } = useNetworkStatus();
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getRequestById(requestId);
      if (data) {
        setRequest(data);
      }
    } catch (e) {
      console.warn('Error loading request:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
        <p className="text-sm">Connecting to roadside assistance stream...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl mt-8">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Request Record Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested emergency tracking ID {requestId} could not be located in local or cloud storage.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate current stage index in standard lifecycle
  const currentStatusIndex = LIFECYCLE_STEPS.findIndex(s => s.status === request.status);
  const isCancelled = request.status === 'CANCELLED' || request.status === 'REJECTED';

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this emergency request?')) return;
    setCancelling(true);
    try {
      await api.updateRequestStatus(request.id, 'CANCELLED', 'Cancelled by driver', 'DRIVER');
      await loadData();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with Back and IDs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {request.syncStatus === 'SYNCED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Server Confirmed: {request.id}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-800/80 text-[11px] font-bold text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              Pending Cloud Sync: {request.id}
            </span>
          )}

          {request.syncStatus !== 'SYNCED' && isOnline && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
              title="Force Sync Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Emergency Assistance Tracking
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {request.requestedQuantity}L {request.fuelType} for {request.vehicleNumber}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{request.locationDescription}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-extrabold text-orange-400">
              ₹{request.confirmedCost || request.estimatedCost}
            </div>
            <span className="text-[11px] text-slate-400">
              {request.confirmedCost ? 'Final Confirmed Charge' : 'Estimated Total'}
            </span>
          </div>
        </div>

        {/* Lifecycle Stepper */}
        {!isCancelled ? (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Assistance Lifecycle
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div
                    key={step.status}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                        : isPassed
                        ? 'bg-slate-950/80 border-emerald-900/40 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">
                        0{idx + 1}. {step.label}
                      </span>
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-400">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong>This request has been cancelled:</strong> Status is {request.status}. If you still require emergency assistance, please submit a fresh request.
            </div>
          </div>
        )}

        {/* Assigned Provider Details */}
        {request.assignedProviderName && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                RPU
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400">Assigned Roadside Provider</span>
                <h4 className="text-sm font-bold text-white">{request.assignedProviderName}</h4>
                <p className="text-xs text-slate-400">Rapid Response Motorcycle · Certified Jerrycans</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {request.assignedProviderPhone && (
                <a
                  href={`tel:${request.assignedProviderPhone}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Provider</span>
                </a>
              )}

              {request.etaMinutes && (
                <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                  ETA ~{request.etaMinutes} mins
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons: QR Pass & Simulated Payment */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 border border-slate-700 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Show Vehicle QR Pass</span>
          </button>

          <button
            onClick={() => setShowPayment(true)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              request.paymentStatus === 'SIMULATED_SUCCESS'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {request.paymentStatus === 'SIMULATED_SUCCESS' ? 'View Payment Receipt' : 'Complete Payment (Sandbox)'}
            </span>
          </button>

          {!['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(request.status) && (
            <button
              onClick={handleCancelRequest}
              disabled={cancelling}
              className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Sourced Station Card */}
      {request.outletSourceName && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fuel className="w-4 h-4 text-orange-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Authorized Fuel Source:</span>
              <strong className="text-white">{request.outletSourceName}</strong>
            </div>
          </div>
          <span className="text-emerald-400 font-semibold">Government Certified Supply</span>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeModal
          vehicle={{
            id: request.vehicleId || 'VEH-01',
            userId: request.userId,
            vehicleNumber: request.vehicleNumber,
            makeModel: 'Highway Registered Vehicle',
            fuelType: request.fuelType || 'PETROL',
            tankCapacityLiters: 50,
            qrCodeToken: `FR-VEH-${request.vehicleNumber.replace(/\s+/g, '')}-SIG89`,
            createdAt: request.createdAt
          }}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <SimulatedPaymentModal
          request={request}
          onPaymentSuccess={(updated) => {
            setRequest(updated);
          }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};
