import React, { useState, useEffect } from 'react';
import { Store, Fuel, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, RefreshCw, Save } from 'lucide-react';
import { FuelOutlet } from '../types';
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

  useEffect(() => {
    api.getOutlets().then(list => {
      setOutlets(list);
      if (list.length > 0) {
        setSelectedOutlet(list[0]);
        setPetrolAvailable(list[0].petrolAvailable);
        setDieselAvailable(list[0].dieselAvailable);
        setPetrolPrice(list[0].petrolPrice);
        setDieselPrice(list[0].dieselPrice);
        setHasEmergencyCans(list[0].hasEmergencyCans);
      }
    });
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
          Retail Petroleum Partner Portal
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          Highway Fuel Outlet Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Maintain stock availability, government safety jerrycan supplies, and official PPAC tariff rates for highway emergency dispatch units.
        </p>
      </div>

      {/* Outlet Selection */}
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
