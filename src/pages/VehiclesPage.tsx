import React, { useState, useEffect } from 'react';
import { Car, Plus, QrCode, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Vehicle, FuelType } from '../types';
import { db } from '../offline/db';
import { QRCodeModal } from '../components/QRCodeModal';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<Vehicle | null>(null);

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [tankCapacity, setTankCapacity] = useState<number>(45);

  const loadVehicles = async () => {
    const list = await db.vehicles.toArray();
    setVehicles(list);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;

    const newId = `VEH-${Date.now().toString().slice(-4)}`;
    const qrCodeToken = `FR-VEH-${vehicleNumber.replace(/\s+/g, '')}-SIG${Math.floor(1000 + Math.random() * 9000)}`;

    const newVehicle: Vehicle = {
      id: newId,
      userId: 'user-driver-demo',
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      makeModel: makeModel.trim() || 'Passenger Vehicle',
      fuelType,
      tankCapacityLiters: tankCapacity,
      qrCodeToken,
      createdAt: new Date().toISOString()
    };

    await db.vehicles.put(newVehicle);
    setShowAddModal(false);
    setVehicleNumber('');
    setMakeModel('');
    await loadVehicles();
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Delete this registered vehicle?')) {
      await db.vehicles.delete(id);
      await loadVehicles();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
            Vehicle Management
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Registered Vehicles & QR Identification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fast-track roadside verification with opaque cryptographic QR passes for certified emergency refuelling.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-base font-extrabold text-white block">
                  {v.vehicleNumber}
                </span>
                <span className="text-xs text-slate-400">{v.makeModel}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                v.fuelType === 'PETROL' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}>
                {v.fuelType}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Tank Capacity:</span>
                <span className="font-semibold text-white">{v.tankCapacityLiters} Litres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Token:</span>
                <span className="font-mono text-orange-400 text-[11px] truncate max-w-[200px]">{v.qrCodeToken}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedVehicleForQR(v)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <span>View QR Pass</span>
              </button>

              <button
                onClick={() => handleDeleteVehicle(v.id)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Highway Vehicle</h3>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Vehicle License Plate</label>
                <input
                  type="text"
                  placeholder="e.g. TS 08 FG 5521"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Make & Model</label>
                <input
                  type="text"
                  placeholder="e.g. Maruti Suzuki Brezza 1.5"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Fuel Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFuelType('PETROL')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      fuelType === 'PETROL' ? 'bg-orange-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Petrol
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('DIESEL')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      fuelType === 'DIESEL' ? 'bg-orange-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Diesel
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Fuel Tank Capacity (Litres)</label>
                <input
                  type="number"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
                  min={10}
                  max={120}
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVehicleForQR && (
        <QRCodeModal
          vehicle={selectedVehicleForQR}
          onClose={() => setSelectedVehicleForQR(null)}
        />
      )}
    </div>
  );
};
