import React, { useState, useEffect } from 'react';
import {
  AlertOctagon, Phone, ShieldAlert, X, CheckCircle2, Navigation, Clock,
  Radio, Bell, MapPin, Check
} from 'lucide-react';
import { AssistanceRequest, ServiceType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface OneTapSOSModalProps {
  onSOSCreated: (request: AssistanceRequest) => void;
  onClose: () => void;
}

export const OneTapSOSModal: React.FC<OneTapSOSModalProps> = ({ onSOSCreated, onClose }) => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [countdown, setCountdown] = useState<number>(3);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('FUEL');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 17.6250, lon: 78.4790 });
  const [providerCount, setProviderCount] = useState<number>(3);

  // Automatically detect user location for SOS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lon: Math.round(pos.coords.longitude * 10000) / 10000
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (countdown > 0 && !isBroadcasting && !sosSent) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isBroadcasting && !sosSent) {
      triggerSosDispatch();
    }
  }, [countdown, isBroadcasting, sosSent]);

  const triggerSosDispatch = async () => {
    setIsBroadcasting(true);
    try {
      const locationDesc = `HIGHWAY ONE-TAP SOS [${coords.lat}° N, ${coords.lon}° E]: Outer shoulder on NH 44 corridor. Immediate rescue needed.`;

      // 1. Broadcast high-priority alert to all service providers and Admin notifications section
      const broadcastRes = await api.broadcastSos({
        vehicleNumber: user?.assignedVehicle || 'TS 09 EA 4821',
        locationDescription: locationDesc,
        latitude: coords.lat,
        longitude: coords.lon,
        serviceType: selectedService,
        userPhone: user?.phone || '+91 98490 55123',
        userName: user?.name || 'Highway Traveler'
      });

      if (broadcastRes?.alertTransmittedToProviders) {
        setProviderCount(broadcastRes.alertTransmittedToProviders);
      }

      // 2. Create the emergency request
      const req = await api.createRequest({
        id: '',
        userId: user?.id || 'user-driver-demo',
        userName: user?.name || 'Highway Traveler',
        userPhone: user?.phone || '+91 98490 55123',
        vehicleNumber: user?.assignedVehicle || 'TS 09 EA 4821',
        serviceType: selectedService,
        fuelType: 'PETROL',
        requestedQuantity: 5,
        latitude: coords.lat,
        longitude: coords.lon,
        locationDescription: locationDesc,
        situationNotes: `CRITICAL HIGHWAY SOS: Immediate roadside ${selectedService} assistance needed. User hazard lights active.`,
        estimatedCost: selectedService === 'FUEL' ? 798 : selectedService === 'TOW_TRUCK' ? 1450 : 650,
        paymentStatus: 'PENDING',
        isSosEmergency: true
      });

      setSosSent(true);
      setTimeout(() => {
        onSOSCreated(req);
      }, 1600);
    } catch (e) {
      alert('SOS Broadcast error: ' + (e instanceof Error ? e.message : 'Network error'));
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-red-500/80 p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Glowing pulse ring */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-500 font-black tracking-wider text-xs uppercase">
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            <span>Highway Priority SOS Broadcast</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sosSent ? (
          <div className="mt-5 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-red-600/20 border-4 border-red-500 flex items-center justify-center mx-auto shadow-2xl shadow-red-500/50">
                <span className="text-4xl font-black text-white tabular-nums">
                  {countdown > 0 ? countdown : '...'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {countdown > 0 ? `Transmitting Emergency SOS in ${countdown}s` : 'Broadcasting to All Providers & Admin...'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Broadcasting emergency alerts to all patrol units, tow trucks, and the Admin command center with your live coordinates.
              </p>
              <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>GPS Fix: {coords.lat}° N, {coords.lon}° E</span>
              </div>
            </div>

            {/* Quick Service Category Choice */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Primary Emergency Service:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedService('FUEL')}
                  className={`py-2 px-2 rounded-xl font-bold transition-all ${
                    selectedService === 'FUEL'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  ⛽ Fuel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService('TOW_TRUCK')}
                  className={`py-2 px-2 rounded-xl font-bold transition-all ${
                    selectedService === 'TOW_TRUCK'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  🚚 Tow Truck
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService('MECHANIC')}
                  className={`py-2 px-2 rounded-xl font-bold transition-all ${
                    selectedService === 'MECHANIC'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  🔧 Mechanic
                </button>
              </div>
            </div>

            {/* Direct Official Hotline Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="tel:1033"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call NHAI 1033</span>
              </a>
              <a
                href="tel:112"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Police 112</span>
              </a>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Abort SOS
              </button>
              <button
                type="button"
                onClick={triggerSosDispatch}
                disabled={isBroadcasting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Now'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4 py-4 animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-black text-white">Emergency SOS Broadcasted!</h3>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
              <p className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Alert sent to all {providerCount} Highway Service Units</span>
              </p>
              <p className="text-slate-400">Admin operations center notified of stranded vehicle.</p>
            </div>
            <p className="text-xs text-slate-400">
              Opening real-time tracking room...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
