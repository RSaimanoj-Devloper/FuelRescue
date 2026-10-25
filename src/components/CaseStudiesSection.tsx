import React from 'react';
import { BookOpen, Clock, ShieldCheck, MapPin, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface CaseStudy {
  id: string;
  corridor: string;
  vehicle: string;
  incidentType: string;
  challenge: string;
  solution: string;
  outcomeTime: string;
  litersDelivered?: string;
  passengerImpact: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'CS-01',
    corridor: 'NH 44 Northbound (Km 48 Medchal Sector)',
    vehicle: 'Toyota Fortuner (Family Traveling with Elderly Parents)',
    incidentType: 'Midnight Fuel Exhaustion in Remote Corridor',
    challenge: 'Vehicle stalled at 02:15 AM on an unlit shoulder during winter dense fog with zero fuel stations within 18 km.',
    solution: 'Driver triggered One-Tap SOS on FuelRescue. Rapid Patrol Unit #4 was dispatched from Km 42 Oasis with 10L Petrol and safety flares.',
    outcomeTime: '13 Minutes Arrival',
    litersDelivered: '10 Litres Petrol (BS-VI)',
    passengerImpact: 'Family safely refueled on-shoulder under illuminated patrol safety cones without entering traffic.'
  },
  {
    id: 'CS-02',
    corridor: 'Nehru Outer Ring Road (ORR Expressway Exit 6 Shamshabad)',
    vehicle: 'Tata Nexon EV (Stranded on Airport Corridor)',
    incidentType: 'Critical Battery Depletion 4km before Charger',
    challenge: 'Driver returning to airport encountered unexpected traffic diversion, resulting in battery dropping to 0% on fast expressway lane.',
    solution: 'Highway Patrol unit arrived with emergency hydraulic flatbed tow truck and high-output DC portable emergency booster.',
    outcomeTime: '16 Minutes Arrival',
    litersDelivered: 'Mobile 15-Minute Emergency EV Boost',
    passengerImpact: 'Avoided costly vehicle seizure, reached airport terminal on schedule.'
  },
  {
    id: 'CS-03',
    corridor: 'NH 65 (Choutuppal Logistics Corridor)',
    vehicle: 'Ashok Leyland 16-Wheeler Freight Truck (Pharmaceutical Cargo)',
    incidentType: 'Fuel Siphon Failure & Severe Diesel Starvation',
    challenge: 'Time-critical medicine freight stalled blocking commercial lane, risking severe penalty and cargo spoiling.',
    solution: 'Heavy Assistance unit refueled with 40L High-Speed Diesel and performed manual primer valve de-aeration.',
    outcomeTime: '17 Minutes Arrival',
    litersDelivered: '40 Litres Diesel + Primer Air Bleed',
    passengerImpact: 'Full commercial freight recovered without cargo temperature breach.'
  }
];

interface CaseStudiesProps {
  onRequestClick?: () => void;
  className?: string;
}

export const CaseStudiesSection: React.FC<CaseStudiesProps> = ({ onRequestClick, className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Proven Reliability &amp; Field Operations</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Real Highway Rescue Case Studies
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-world documented recoveries demonstrating our 15-minute response promise, certified fuel safety, and emergency logistics.
          </p>
        </div>

        {onRequestClick && (
          <button
            type="button"
            onClick={() => {
              onRequestClick();
              trackEvent('case_studies_request_fuel_clicked');
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
          >
            <span>Request Fuel Delivery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Case Study Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {CASE_STUDIES.map((cs) => (
          <div
            key={cs.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-orange-400 border border-slate-700">
                  {cs.id}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>{cs.outcomeTime}</span>
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors">
                  {cs.incidentType}
                </h4>
                <p className="text-xs text-orange-300/90 font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{cs.corridor}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Vehicle: {cs.vehicle}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-rose-400 block mb-0.5">Challenge</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{cs.challenge}</p>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">Solution</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{cs.solution}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">{cs.litersDelivered}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safely Rescued</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
