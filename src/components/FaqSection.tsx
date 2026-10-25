import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Check } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  highlight?: string;
}

const FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'How quickly can emergency fuel reach my stranded vehicle on the highway?',
    answer:
      'We operate under our strict 15-Minute Highway Response Promise across high-density sectors like NH 44 (Medchal–Toopran), Nehru ORR, and NH 65. Our rapid response patrols are stationed at strategic highway oases with pre-approved safety jerrycans and dedicated rapid bikes. The average response time is currently 14.2 minutes.',
    highlight: '15-Minute Guaranteed SLA with fee waiver if late.'
  },
  {
    id: 2,
    question: 'Are fuel deliveries authorized and compliant with PESO and safety standards?',
    answer:
      'Yes. Every fuel delivery is conducted strictly in accordance with Petroleum and Explosives Safety Organization (PESO) guidelines. Our responders use UN-certified, anti-static high-density metallic jerrycans (5L, 10L, 20L) equipped with flame arrestors and automatic spill-prevention valves to ensure 100% safety during refueling.',
    highlight: 'UN-certified anti-static metallic jerrycans with flame arrestors.'
  },
  {
    id: 3,
    question: 'What fuel types and quantities can be delivered roadside?',
    answer:
      'We supply both Regular and Premium BS-VI Petrol (Motor Spirit) and High-Speed Diesel (HSD) sourced directly from verified OMC outlets (IOCL, HPCL, BPCL, Shell). Standard emergency delivery increments are 5 Litres, 10 Litres, or up to 25 Litres for commercial transport vehicles, enough to safely reach the next highway fuel station.',
    highlight: 'BS-VI Petrol, High-Speed Diesel, and Mobile EV Boosters.'
  },
  {
    id: 4,
    question: 'Can I pay using UPI QR code, FASTag wallet, or cash on arrival?',
    answer:
      'Yes! All responding patrol units carry dynamic Bharat QR / UPI payment scanners, support direct FASTag wallet charges, debit/credit cards via mobile POS, and cash upon fuel delivery. Digital receipts with tax invoices and OMC outlet source timestamps are issued immediately via SMS and in-app tracker.',
    highlight: 'UPI QR, FASTag, Debit/Credit Card & Cash supported.'
  },
  {
    id: 5,
    question: 'How does the offline mode work if I lose 4G/5G mobile connectivity on remote stretches?',
    answer:
      'FuelRescue is architected with an offline-first IndexedDB engine. When mobile signal drops to 2G or zero bars, your emergency request is securely saved locally on your phone and automatically queued. The app can dispatch an instant encrypted SOS payload via short SMS gateway directly to the nearest highway patrol station, synchronizing automatically when connectivity resumes.',
    highlight: 'Direct SMS Gateway & local IndexedDB sync without internet.'
  }
];

export const FaqSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next !== null) {
      trackEvent('faq_opened', { faqId: id });
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Highway Knowledge Base</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Frequently Asked Questions (5 Key FAQs)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clear, transparent answers about roadside refueling, response promises, safety certifications, and offline mode.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-950 text-orange-400 border border-orange-800">
          5 Verified Answers
        </span>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-slate-950 border-orange-500/60 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4"
              >
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {faq.id}. {faq.question}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isOpen ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 space-y-3 animate-fadeIn text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  <p>{faq.answer}</p>
                  {faq.highlight && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-orange-300 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{faq.highlight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
