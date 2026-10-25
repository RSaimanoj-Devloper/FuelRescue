import React from 'react';
import { Star, ShieldCheck, CheckCircle2, User, Quote } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  vehicle: string;
  corridor: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  avatarSeed: string;
}

const REVIEWS: Review[] = [
  {
    id: 'REV-01',
    author: 'Vikramaditya Rao',
    vehicle: 'Mahindra Scorpio-N',
    corridor: 'NH 44 Medchal Bypass (Km 44)',
    rating: 5,
    date: '3 days ago',
    comment:
      'Ran dry at 1:30 AM returning from Nizamabad with my family. The app worked flawlessly even with spotty 4G. Patrol officer Ramesh reached us in exactly 12 minutes with 10L diesel. Absolutely life-saving service on an empty highway!',
    verified: true,
    avatarSeed: 'vikram'
  },
  {
    id: 'REV-02',
    author: 'Sneha & Ananya Sharma',
    vehicle: 'Hyundai i20 Asta',
    corridor: 'Nehru ORR Exit 8 (Shamshabad)',
    rating: 5,
    date: '1 week ago',
    comment:
      'I was so panicked when my fuel indicator hit zero in heavy thunderstorm rain. Dispatched the request through One-Tap SOS. The real-time tracker kept me calm, and the responder even checked our tire pressure before sending us off. 10/10!',
    verified: true,
    avatarSeed: 'sneha'
  },
  {
    id: 'REV-03',
    author: 'Gurpreet Singh Brar',
    vehicle: 'Tata Prima Multi-Axle Truck',
    corridor: 'NH 65 Choutuppal Toll Plaza',
    rating: 5,
    date: '2 weeks ago',
    comment:
      'We had a fuel lock issue causing fuel pump starvation. FuelRescue dispatched emergency cans and their technician helped de-aerate the diesel line right on the highway shoulder. Professional, transparent rates, and bill generated instantly.',
    verified: true,
    avatarSeed: 'gurpreet'
  }
];

export const ReviewsSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-wider mb-1">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span>Driver Testimonials</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Real Highway Traveler Reviews
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authentic experiences from stranded drivers, families, and commercial truckers rescued across Telangana &amp; National Highways.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-white font-bold text-xs">4.9 / 5.0</span>
          <span className="text-slate-500 text-xs">(3,820+ verified ratings)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{rev.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${rev.avatarSeed}&backgroundColor=ea580c`}
                alt={`Portrait of verified highway traveler ${rev.author}`}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white truncate">{rev.author}</h4>
                  {rev.verified && (
                    <span title="Verified Traveler">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{rev.vehicle}</p>
                <p className="text-[10px] text-orange-400 font-mono truncate">{rev.corridor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
