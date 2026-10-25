import React from 'react';
import { Shield, Lock, MapPin, Database, CheckCircle2, FileText, ArrowLeft, PhoneCall } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface PrivacyPolicyPageProps {
  onGoHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onGoHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Privacy Policy', active: true }]}
        onHomeClick={onGoHome}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Driver Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            FuelRescue Privacy &amp; Geolocation Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Effective Date: October 2026 · Compliant with the Digital Personal Data Protection (DPDP) Act &amp; NHAI Road Safety Guidelines.
          </p>
        </div>

        {/* Core Commitments Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <h4 className="font-bold text-sm text-white">No Background Tracking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              GPS geolocation is accessed strictly when you actively request roadside fuel assistance or trigger SOS.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">256-Bit Telemetry Encryption</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All communications between your vehicle, dispatchers, and patrol units use end-to-end TLS 1.3 encryption.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h4 className="font-bold text-sm text-white">Zero Data Monetization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never sell or license driver trip logs, phone numbers, or vehicle registration data to commercial advertisers.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs font-mono">1</span>
              <span>Information We Collect and Why</span>
            </h3>
            <p>
              To dispatch authorized emergency fuel delivery and roadside assistance to stranded highway travelers, FuelRescue collects:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li><strong className="text-white">Precise Satellite GNSS Coordinates:</strong> To guide dispatched patrol units directly to your stranded vehicle without requiring manual street address lookup.</li>
              <li><strong className="text-white">Vehicle Details (Registration Number, Fuel Type):</strong> To ensure our responders load the exact required fuel grade (BS-VI Petrol, High-Speed Diesel) and appropriate jerrycan dispensing equipment.</li>
              <li><strong className="text-white">Emergency Contact &amp; Phone:</strong> To enable direct driver-to-responder calling and SMS status updates when internet bandwidth is limited.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs font-mono">2</span>
              <span>Offline-First Storage &amp; IndexedDB Retention</span>
            </h3>
            <p>
              When connectivity is weak or severed on highway corridors, FuelRescue stores emergency records locally in your browser's private IndexedDB sandbox. These cached records are synchronized with our operations center immediately upon network resumption and can be manually cleared anytime in the Offline Sync tab.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs font-mono">3</span>
              <span>Payment Security Standards</span>
            </h3>
            <p>
              FuelRescue complies with Reserve Bank of India (RBI) and National Payments Corporation of India (NPCI) directives. We never store credit/debit card CVVs or net banking passwords. All fuel payments are settled directly via Bharat QR / UPI or authorized roadside POS devices upon delivery.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs font-mono">4</span>
              <span>Your Right to Data Deletion</span>
            </h3>
            <p>
              You maintain the absolute right to inspect, export, or permanently delete your account, registered vehicles, and past rescue logs. Account deletion requests are processed instantly by our automated compliance system or by contacting our 24/7 highway operations desk.
            </p>
          </section>
        </div>

        {/* Footer & Contact */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onGoHome}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Driver Hub</span>
          </button>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>DPO Contact: privacy@fuelrescue.highway</span>
            <span className="text-slate-600">|</span>
            <a href="tel:1033" className="text-orange-400 hover:underline flex items-center gap-1 font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>NHAI 1033 Hotline</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
