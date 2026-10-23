import React, { useState, useEffect } from 'react';
import {
  Fuel, MapPin, Navigation, Car, AlertTriangle, ArrowRight,
  ShieldCheck, Check, Clock, Phone, Info, Truck, Wrench, BatteryCharging
} from 'lucide-react';
import { FuelType, ServiceType, AssistanceRequest, Vehicle } from '../types';
import { api } from '../services/api';
import { db } from '../offline/db';
import { RoadsideSafetyNotice } from '../components/RoadsideSafetyNotice';
import { GnssSatelliteLocator } from '../components/GnssSatelliteLocator';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface EmergencyRequestFormProps {
  onSuccess: (request: AssistanceRequest) => void;
  onCancel: () => void;
  initialServiceType?: ServiceType;
}

const HIGHWAY_PRESETS = [
  { name: 'NH 44 - Near Medchal Toll Plaza (Km 42)', lat: 17.6289, lon: 78.4812, desc: 'NH 44 Northbound, parked on shoulder 1 km past Medchal Toll' },
  { name: 'NH 65 - Near Choutuppal Bypass (Km 36)', lat: 17.2514, lon: 78.9023, desc: 'NH 65 Eastbound toward Vijayawada, near Choutuppal flyover' },
  { name: 'Hyderabad ORR - Exit 6 Shamshabad', lat: 17.2403, lon: 78.4294, desc: 'Nehru Outer Ring Road Exit 6, Airport approach shoulder' },
  { name: 'NH 44 - Kompally Junction Bypass', lat: 17.5380, lon: 78.4850, desc: 'NH 44 near Kompally Cineplanet junction' },
  { name: 'NH 44 - Shadnagar Highway Junction (Km 58)', lat: 17.0682, lon: 78.2091, desc: 'NH 44 Southbound toward Bengaluru, Shadnagar bypass' }
];

export const EmergencyRequestForm: React.FC<EmergencyRequestFormProps> = ({
  onSuccess,
  onCancel,
  initialServiceType = 'FUEL'
}) => {
  const { isOnline } = useNetworkStatus();
  const { t } = useTheme();
  const { user } = useAuth();

  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [towRequirement, setTowRequirement] = useState<'FLATBED' | 'WHEEL_LIFT' | 'ACCIDENT_RECOVERY'>('FLATBED');
  const [mechanicIssue, setMechanicIssue] = useState<'BATTERY_JUMPSTART' | 'TYRE_PUNCTURE' | 'ENGINE_OVERHEAT' | 'ELECTRICAL_BRAKE'>('BATTERY_JUMPSTART');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState(user?.assignedVehicle || 'TS 09 EA 4821');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [requestedQuantity, setRequestedQuantity] = useState<number>(5);
  const [latitude, setLatitude] = useState<number>(17.6250);
  const [longitude, setLongitude] = useState<number>(78.4790);
  const [locationDescription, setLocationDescription] = useState('NH 44 Northbound, outer shoulder near Medchal');
  const [situationNotes, setSituationNotes] = useState('Stranded on highway shoulder. Hazard lights on.');
  const [userName, setUserName] = useState(user?.name || 'Vikram Rao');
  const [userPhone, setUserPhone] = useState(user?.phone || '+91 98490 55123');

  const [step, setStep] = useState<'FORM' | 'CONFIRMATION'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    db.vehicles.toArray().then((list) => {
      setVehicles(list);
      if (list.length > 0) {
        setSelectedVehicleId(list[0].id);
        setVehicleNumber(list[0].vehicleNumber);
        setFuelType(list[0].fuelType);
      }
    });
  }, []);

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const found = vehicles.find((v) => v.id === vId);
    if (found) {
      setVehicleNumber(found.vehicleNumber);
      setFuelType(found.fuelType);
    }
  };

  const handleCoordinatesFromSatellite = (lat: number, lon: number, accuracy: number, corridor: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationDescription(`${corridor} [GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}, ±${accuracy}m]`);
  };

  const handlePresetSelect = (preset: typeof HIGHWAY_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    setLocationDescription(preset.desc);
  };

  // Pricing calculation based on Service Type
  let totalEstimate = 0;
  if (serviceType === 'FUEL') {
    const fuelRate = fuelType === 'PETROL' ? 109.66 : 97.82;
    totalEstimate = Math.round(fuelRate * requestedQuantity) + 250;
  } else if (serviceType === 'TOW_TRUCK') {
    totalEstimate = 1450;
  } else if (serviceType === 'MECHANIC') {
    totalEstimate = 650;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newReq = await api.createRequest({
        id: '',
        userId: user?.id || 'user-driver-demo',
        userName,
        userPhone,
        serviceType,
        towRequirement: serviceType === 'TOW_TRUCK' ? towRequirement : undefined,
        mechanicIssue: serviceType === 'MECHANIC' ? mechanicIssue : undefined,
        vehicleId: selectedVehicleId || undefined,
        vehicleNumber,
        fuelType: serviceType === 'FUEL' ? fuelType : undefined,
        requestedQuantity: serviceType === 'FUEL' ? requestedQuantity : undefined,
        latitude,
        longitude,
        locationDescription,
        situationNotes,
        estimatedCost: totalEstimate,
        paymentStatus: 'PENDING'
      });

      onSuccess(newReq);
    } catch (e) {
      alert('Failed to save emergency request: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <RoadsideSafetyNotice />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {step === 'FORM' ? (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                Highway Emergency Protocol
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {t.selectService}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Approved assistance units carry fuel canisters, hydraulic flatbed cranes, or mobile mechanics directly to your GPS coordinates.
              </p>
            </div>

            {/* Service Category Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setServiceType('FUEL')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  serviceType === 'FUEL'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Fuel className="w-5 h-5 text-orange-400" />
                  {serviceType === 'FUEL' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.fuelService}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Emergency petrol & diesel jerrycans</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('TOW_TRUCK')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  serviceType === 'TOW_TRUCK'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  {serviceType === 'TOW_TRUCK' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.towingService}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Flatbed & wheel-lift recovery</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('MECHANIC')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  serviceType === 'MECHANIC'
                    ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  {serviceType === 'MECHANIC' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.mechanicService}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Battery jump, puncture, overheat</p>
                </div>
              </button>
            </div>

            {/* Towing Specific Configuration */}
            {serviceType === 'TOW_TRUCK' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <label className="text-xs font-bold text-white block">Towing Recovery Requirement</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['FLATBED', 'WHEEL_LIFT', 'ACCIDENT_RECOVERY'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTowRequirement(mode)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-[11px] ${
                        towRequirement === mode ? 'bg-orange-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mechanic Specific Configuration */}
            {serviceType === 'MECHANIC' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <label className="text-xs font-bold text-white block">Mechanical Breakdown Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BATTERY_JUMPSTART', label: 'Battery Dead / Jumpstart Required' },
                    { id: 'TYRE_PUNCTURE', label: 'Tyre Puncture / Spare Replacement' },
                    { id: 'ENGINE_OVERHEAT', label: 'Engine Overheating / Coolant Leak' },
                    { id: 'ELECTRICAL_BRAKE', label: 'Electrical / Brake Jam Check' }
                  ].map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setMechanicIssue(issue.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-medium text-[11px] ${
                        mechanicIssue === issue.id ? 'bg-orange-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{t.vehicleNumber}</span>
                <span className="text-slate-500 font-normal">Registered or manual entry</span>
              </label>

              {vehicles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVehicleChange(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVehicleId === v.id
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{v.vehicleNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono">
                          {v.fuelType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{v.makeModel}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.vehicleNumber}</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TS 09 EA 4821"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t.contactPhone}</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+91 98490 55123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fuel Details if Fuel selected */}
            {serviceType === 'FUEL' && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-bold text-slate-300">Fuel Grade</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFuelType('PETROL')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      fuelType === 'PETROL'
                        ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fuel className="w-4 h-4" />
                    <span>{t.petrol}</span>
                    <span className="text-[11px] opacity-80">₹109.66/L</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFuelType('DIESEL')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      fuelType === 'DIESEL'
                        ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fuel className="w-4 h-4" />
                    <span>{t.diesel}</span>
                    <span className="text-[11px] opacity-80">₹97.82/L</span>
                  </button>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      {t.quantity}: <span className="text-orange-400">{requestedQuantity} Litres</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Safe emergency limit: 25L
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[3, 5, 8, 10, 15].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setRequestedQuantity(qty)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          requestedQuantity === qty
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {qty}L
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Satellite GNSS Hardware Receiver */}
            <GnssSatelliteLocator onCoordinatesAcquired={handleCoordinatesFromSatellite} />

            {/* Landmark Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">{t.location}</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {HIGHWAY_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-orange-500 hover:text-white"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <textarea
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('CONFIRMATION')}
                className="flex-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>{t.reviewConfirm}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                Pre-Dispatch Verification
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Confirm Emergency Request
              </h2>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Service Category:</span>
                <span className="font-bold text-orange-400">{serviceType} ASSISTANCE</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Vehicle Plate:</span>
                <span className="font-mono font-bold text-white">{vehicleNumber}</span>
              </div>
              <div className="flex justify-between items-start py-1 border-b border-slate-800/80">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="font-mono text-slate-200 text-right">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Contact:</span>
                <span className="text-white font-medium">{userPhone} ({userName})</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-white">
                <span>Estimated Charge:</span>
                <span className="text-orange-400">₹{totalEstimate}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Saving & Transmitting...' : 'Confirm & Dispatch Emergency Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
