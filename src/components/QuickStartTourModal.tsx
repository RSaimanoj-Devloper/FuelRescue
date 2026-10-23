import React, { useState } from 'react';
import {
  AlertOctagon, Fuel, Truck, Wrench, Satellite, Shield,
  ChevronRight, ChevronLeft, X, Sparkles, Navigation,
  BatteryLow, CheckCircle2, PhoneCall, Radio, Eye
} from 'lucide-react';

interface QuickStartTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSOS?: () => void;
  onRequestFuel?: () => void;
}

export const QuickStartTourModal: React.FC<QuickStartTourModalProps> = ({
  isOpen,
  onClose,
  onOpenSOS,
  onRequestFuel
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to FuelRescue Highway Aid',
      tagline: '24/7 National Expressway Emergency Roadside Assistance',
      icon: <Fuel className="w-8 h-8 text-orange-400" />,
      accentColor: 'from-orange-500 to-amber-500',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            FuelRescue provides rapid emergency response for travelers stranded on National and State Expressways across India.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Fuel className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">Emergency Fuel</span>
              <span className="text-[10px] text-slate-400 block">5L / 10L Cans</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">Tow Truck</span>
              <span className="text-[10px] text-slate-400 block">Flatbed Recovery</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">Mobile Mechanic</span>
              <span className="text-[10px] text-slate-400 block">On-Spot Repairs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>Built with offline-first GNSS satellite positioning for zero-network conditions.</span>
          </div>
        </div>
      )
    },
    {
      id: 'sos',
      title: 'One-Tap Emergency SOS Broadcast',
      tagline: 'Life-Safety & Immediate High-Priority Dispatch',
      icon: <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />,
      accentColor: 'from-red-600 to-rose-600',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            In hazardous roadside situations (stalled in traffic, highway shoulder at night, health or accident risk), press the prominent red <strong className="text-red-400">SOS Button</strong>.
          </p>

          {/* Interactive Mockup of SOS Button */}
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 animate-pulse shrink-0 border-2 border-red-300/40">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-black text-white block">ONE-TAP SOS BUTTON</span>
                <span className="text-[11px] text-red-300 block">Instant broadcast — no typing required</span>
              </div>
            </div>
            {onOpenSOS && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSOS();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shrink-0"
              >
                Try SOS
              </button>
            )}
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Simultaneous Multi-Alert:</strong> Instantly notifies all nearby Highway Patrol units, tow trucks, and the Central Authority Operations Center.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Instant Positioning:</strong> Pulls high-accuracy GNSS coordinates without waiting for network signal.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Always Accessible:</strong> Visible in both the top navigation bar and prominently on the central Driver Dashboard.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Driver Dashboard & Service Hub',
      tagline: 'Easily Request Roadside Aid & View Highway Radar',
      icon: <Navigation className="w-8 h-8 text-amber-400" />,
      accentColor: 'from-amber-500 to-orange-500',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Your Driver Dashboard is the central command center for all roadside assistance needs:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <span className="font-bold text-white block">Emergency Hero Action Buttons</span>
                  <span className="text-[11px] text-slate-400">Request Fuel (Petrol/Diesel), Tow Truck, or Mechanic with 1 click</span>
                </div>
              </div>
              <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Top Hero
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <span className="font-bold text-white block">Interactive Highway Radar Map</span>
                  <span className="text-[11px] text-slate-400">View real-time distance to 4 OMC outlets and 3 patrol units</span>
                </div>
              </div>
              <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Radar View
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <span className="font-bold text-white block">My Registered Vehicles & QR Pass</span>
                  <span className="text-[11px] text-slate-400">Digital safety verification QR pass for instant highway clearance</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                QR Passes
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'satellite',
      title: 'GNSS Satellite Locator & Street View',
      tagline: 'High Precision Positioning Without Mobile Data',
      icon: <Satellite className="w-8 h-8 text-cyan-400" />,
      accentColor: 'from-cyan-500 to-blue-600',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Never worry about getting stranded in dead zones with zero cell reception:
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Multi-Constellation GNSS Receiver</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                ±1.8m Satellite Precision
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Utilizes your smartphone's built-in GNSS chip (GPS, NavIC, Galileo, GLONASS) to pinpoint your exact highway kilometer stone and coordinates even with mobile data turned completely off.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Street View</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Visual 360° highway preview to confirm your shoulder positioning.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Queue</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Automatically stores requests locally in IndexedDB and syncs when reconnected.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tracker',
      title: 'Live Tracking & Smart Safeguards',
      tagline: 'Real-Time ETA, Provider Contacts & Battery Saver',
      icon: <BatteryLow className="w-8 h-8 text-amber-400" />,
      accentColor: 'from-amber-500 to-emerald-500',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Follow every step of your assistance request with complete transparency and built-in safety safeguards:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Real-Time Patrol ETA & Direct Contact</strong>
                <p className="text-slate-400 text-[11px]">
                  View your assigned patrol officer's name, response vehicle number, arrival countdown, and tap to call directly.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <BatteryLow className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Automatic Low Battery Saver (&lt; 20%)</strong>
                <p className="text-slate-400 text-[11px]">
                  When your smartphone battery drops below 20%, FuelRescue automatically toggles into Low Battery Mode, cutting screen brightness and disabling high-power animations to keep your phone alive.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>You are now ready to navigate FuelRescue! Tap below to start exploring.</span>
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header with Progress */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block">
                Quick Start Guide · Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-950 h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full transition-all duration-300 ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content Body */}
        <div className="p-6 sm:p-7 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-tr ${current.accentColor} bg-opacity-20 flex items-center justify-center shadow-lg shadow-orange-500/10`}>
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {current.title}
              </h2>
              <p className="text-xs text-orange-400 font-semibold mt-0.5">
                {current.tagline}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {current.content}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-semibold transition-colors px-2 py-1"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all active:scale-95`}
            >
              <span>{isLast ? 'Got It! Start Exploring' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
