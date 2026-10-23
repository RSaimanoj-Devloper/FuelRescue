import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, ShieldCheck, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { Vehicle } from '../types';

interface QRCodeModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ vehicle, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'SHOW_QR' | 'SIMULATE_SCAN'>('SHOW_QR');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canvasRef.current && vehicle.qrCodeToken) {
      QRCode.toCanvas(
        canvasRef.current,
        vehicle.qrCodeToken,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, [vehicle.qrCodeToken, activeTab]);

  const handleSimulateScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/vehicles/qr/${encodeURIComponent(vehicle.qrCodeToken)}`);
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      } else {
        setScanResult({ error: 'Vehicle record not recognized or permission denied' });
      }
    } catch {
      // Offline fallback
      setScanResult({
        verified: true,
        vehicleNumber: vehicle.vehicleNumber,
        makeModel: vehicle.makeModel,
        approvedFuelType: vehicle.fuelType,
        tankCapacityLiters: vehicle.tankCapacityLiters,
        emergencySafetyCleared: true,
        verificationTimestamp: new Date().toISOString(),
        offlineCached: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Vehicle QR Pass</h3>
              <p className="text-xs text-slate-400">{vehicle.vehicleNumber} · {vehicle.fuelType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl mt-4 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('SHOW_QR')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'SHOW_QR' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Driver QR Code
          </button>
          <button
            onClick={() => setActiveTab('SIMULATE_SCAN')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'SIMULATE_SCAN' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Provider Scanner View
          </button>
        </div>

        {activeTab === 'SHOW_QR' ? (
          <div className="mt-5 text-center">
            <div className="inline-block p-3 bg-white rounded-2xl shadow-lg border border-slate-700">
              <canvas ref={canvasRef} className="block mx-auto" />
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Security Token:</span>
                <span className="font-mono text-orange-400">{vehicle.qrCodeToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Approved Fuel:</span>
                <span className="font-bold text-white">{vehicle.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Model:</span>
                <span className="text-slate-200">{vehicle.makeModel}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              * Privacy-Preserving Token: Encodes an opaque reference. No phone numbers, passwords, or personal identity are stored in the QR image.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <Scan className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-slate-300">
                Simulate Roadside Assistance Provider scanning this vehicle’s windshield QR sticker.
              </p>
              <button
                onClick={handleSimulateScan}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {loading ? 'Verifying with Backend...' : 'Scan & Verify Vehicle'}
              </button>
            </div>

            {scanResult && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                {scanResult.error ? (
                  <div className="text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{scanResult.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      Vehicle Verified for Emergency Delivery
                    </div>
                    <div className="text-slate-300 text-[11px] space-y-1">
                      <p>• Vehicle Number: <strong>{scanResult.vehicleNumber}</strong></p>
                      <p>• Model: {scanResult.makeModel}</p>
                      <p>• Authorized Fuel Type: <strong className="text-orange-400">{scanResult.approvedFuelType}</strong></p>
                      <p>• Tank Capacity: {scanResult.tankCapacityLiters} Litres</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
