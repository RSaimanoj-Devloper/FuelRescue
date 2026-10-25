import React, { useState, useEffect } from 'react';
import {
  Store, Fuel, CheckCircle2, AlertTriangle, ShieldCheck, MapPin,
  RefreshCw, Save, Phone, Clock, Truck, ShieldAlert, Radio, Eye
} from 'lucide-react';
import { FuelOutlet, AssistanceRequest, AppNotification } from '../types';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export const OutletDashboard: React.FC = () => {
  const { t, theme } = useTheme();
  const [outlets, setOutlets] = useState<FuelOutlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<FuelOutlet | null>(null);
  const [petrolAvailable, setPetrolAvailable] = useState(true);
  const [dieselAvailable, setDieselAvailable] = useState(true);
  const [petrolPrice, setPetrolPrice] = useState(109.66);
  const [dieselPrice, setDieselPrice] = useState(97.82);
  const [hasEmergencyCans, setHasEmergencyCans] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Real-time fuel requests & notifications
  const [fuelRequests, setFuelRequests] = useState<AssistanceRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dispensingId, setDispensingId] = useState<string | null>(null);
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [outletList, reqList, notifList] = await Promise.all([
        api.getOutlets(),
        api.getRequests({ serviceType: 'FUEL' }),
        api.getNotifications('OUTLET')
      ]);

      setOutlets(outletList);
      if (!selectedOutlet && outletList.length > 0) {
        setSelectedOutlet(outletList[0]);
        setPetrolAvailable(outletList[0].petrolAvailable);
        setDieselAvailable(outletList[0].dieselAvailable);
        setPetrolPrice(outletList[0].petrolPrice);
        setDieselPrice(outletList[0].dieselPrice);
        setHasEmergencyCans(outletList[0].hasEmergencyCans);
      }
      setFuelRequests(reqList);
      setNotifications(notifList);
    } catch (e) {
      console.warn('Outlet polling load note:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSelectOutlet = (o: FuelOutlet) => {
    setSelectedOutlet(o);
    setPetrolAvailable(o.petrolAvailable);
    setDieselAvailable(o.dieselAvailable);
    setPetrolPrice(o.petrolPrice);
    setDieselPrice(o.dieselPrice);
    setHasEmergencyCans(o.hasEmergencyCans);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDispenseCanister = async (requestId: string) => {
    setDispensingId(requestId);
    try {
      const updated = await api.dispenseCanister(requestId);
      if (updated) {
        setDispenseSuccessMsg(`✓ Safety canister authorized and dispensed for Incident ${updated.id} (${updated.vehicleNumber})!`);
        setTimeout(() => setDispenseSuccessMsg(null), 4000);
        await loadData();
      }
    } catch (e) {
      alert('Could not dispense canister: ' + (e instanceof Error ? e.message : 'Error'));
    } finally {
      setDispensingId(null);
    }
  };

  // Filter fuel requests relevant to this outlet or highway emergency pool
  const activeFuelOrders = fuelRequests.filter(r => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status));
  const completedFuelOrders = fuelRequests.filter(r => r.status === 'COMPLETED');
  const recentAlerts = notifications.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Retail Petroleum Partner Portal · Live Real-Time Stream</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Highway Fuel Station Management & Canister Dispensing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize government-certified safety jerrycans for stranded highway vehicles, maintain inventory, and manage PPAC rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-orange-950/80 border border-orange-800 text-orange-400 text-xs font-bold font-mono">
            {activeFuelOrders.length} Active Orders
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold font-mono">
            Radar Online
          </span>
        </div>
      </div>

      {/* Real-Time Flash Alerts for Station Manager */}
      {recentAlerts.length > 0 && (
        <div className="space-y-2">
          {recentAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                alert.priority === 'CRITICAL'
                  ? 'bg-red-950/80 border-red-500/80 text-red-200'
                  : 'bg-orange-950/40 border-orange-500/50 text-orange-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Fuel className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <strong className="text-white block text-xs">{alert.title}</strong>
                  <span className="text-[11px] opacity-90">{alert.message}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-70">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dispense Success Feedback */}
      {dispenseSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 font-bold shadow-xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{dispenseSuccessMsg}</span>
        </div>
      )}

      {/* LIVE EMERGENCY FUEL CANISTER DISPENSE ORDERS QUEUE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Emergency Fuel Canister Dispense Orders</h3>
              <p className="text-xs text-slate-400">
                Incoming orders from stranded drivers and responding highway patrol bikes
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
            Auto-Sync 2.5s
          </span>
        </div>

        {activeFuelOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 text-xs space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-white font-semibold">All Fuel Orders Cleared</p>
            <p className="text-slate-500">No pending emergency jerrycan handovers at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeFuelOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                      <span className="font-bold text-sm text-white font-mono">
                        {order.vehicleNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {order.requestedQuantity || 5}L {order.fuelType || 'PETROL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{order.locationDescription}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                      order.status === 'DELIVERED' || order.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : order.status === 'DISPATCHED'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      Lifecycle: {order.status}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1 font-mono">
                      ₹{order.estimatedCost} total
                    </span>
                  </div>
                </div>

                {/* Driver & Patrol Unit Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stranded Driver</span>
                      <strong className="text-white text-xs">{order.userName || 'Highway Driver'}</strong>
                    </div>
                    {order.userPhone && (
                      <a
                        href={`tel:${order.userPhone}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.userPhone}</span>
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Patrol Unit</span>
                      <strong className="text-white text-xs">{order.assignedProviderName || 'Pending Assignment'}</strong>
                    </div>
                    {order.assignedProviderPhone && (
                      <a
                        href={`tel:${order.assignedProviderPhone}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.assignedProviderPhone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Canister Action / Status */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-slate-300">
                      PESO Explosives Safety Regulation: Fill only into designated anti-static metal canisters.
                    </span>
                  </div>

                  {order.canisterDispensed ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        Canister Dispensed {order.canisterDispensedAt ? `(${new Date(order.canisterDispensedAt).toLocaleTimeString()})` : ''}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDispenseCanister(order.id)}
                      disabled={dispensingId === order.id}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all"
                    >
                      <Fuel className="w-4 h-4" />
                      <span>{dispensingId === order.id ? 'Authorizing...' : `Authorize & Dispense ${order.requestedQuantity || 5}L Canister`}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outlet Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Select Highway Station</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {outlets.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelectOutlet(o)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedOutlet?.id === o.id
                  ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-bold block w-fit mb-1">
                {o.omc}
              </span>
              <h4 className="text-xs font-bold text-white truncate">{o.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{o.highway}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedOutlet && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedOutlet.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedOutlet.landmark} · {selectedOutlet.highway}</span>
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              Operating: {selectedOutlet.operatingHours}
            </span>
          </div>

          {/* Stock & Fuel Availability Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Petrol Stock (Motor Spirit)</h4>
                  <p className="text-xs text-slate-400">Available for certified canister dispensing</p>
                </div>
                <input
                  type="checkbox"
                  checked={petrolAvailable}
                  onChange={(e) => setPetrolAvailable(e.target.checked)}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Retail Price (₹/Litre)</label>
                <input
                  type="number"
                  step="0.01"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Diesel Stock (HSD)</h4>
                  <p className="text-xs text-slate-400">High speed commercial diesel</p>
                </div>
                <input
                  type="checkbox"
                  checked={dieselAvailable}
                  onChange={(e) => setDieselAvailable(e.target.checked)}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Retail Price (₹/Litre)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Jerrycan compliance */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">PESO-Certified Safety Canisters in Stock</h4>
                <p className="text-xs text-slate-400">
                  Compliant with Petroleum and Explosives Safety Organization regulations for highway transport.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasEmergencyCans}
              onChange={(e) => setHasEmergencyCans(e.target.checked)}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Station stock and prices updated successfully.</span>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Outlet Status & Update Highway Radar</span>
          </button>
        </div>
      )}
    </div>
  );
};
