import React from 'react';
import { Users, Shield, Award, PhoneCall } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  badge: string;
  photoUrl: string;
  bio: string;
}

const TEAM: TeamMember[] = [
  {
    id: 'TM-01',
    name: 'Capt. Arvinder Singh (Retd.)',
    role: 'Head of Highway Emergency Operations',
    experience: '18 Years (Ex-Army Corps of EME)',
    badge: 'OPERATIONS COMMAND',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Oversees rapid dispatch protocols, military-grade crisis handling, and telemetry integration across 450 km of highway corridors.'
  },
  {
    id: 'TM-02',
    name: 'Dr. Priya Nambiar',
    role: 'Director of Dispatch Logistics & Telemetry',
    experience: '12 Years (Intelligent Transport Systems)',
    badge: 'TELEMETRY ARCHITECT',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Pioneered low-bandwidth satellite fallback and automatic nearest patrol clustering to achieve sub-15 minute response times.'
  },
  {
    id: 'TM-03',
    name: 'Mohammed Ismail',
    role: 'Chief Highway Patrol Marshal (NH 44 North)',
    experience: '14 Years Highway Safety & Tow Recovery',
    badge: 'FIELD MARSHAL',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    bio: 'Directs on-road mobile refueling units, fire prevention safety protocols, and heavy vehicle recovery operations.'
  },
  {
    id: 'TM-04',
    name: 'Divya Kulkarni',
    role: 'Lead Safety Protocol Coordinator',
    experience: '9 Years Emergency Services Dispatch',
    badge: '24/7 COMMAND DESK',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    bio: 'Coordinates 24/7 National Emergency Hotline (1033) relays, police coordination, and driver SOS priority queues.'
  }
];

export const TeamSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Operational Leadership</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Meet the Highway Emergency Team
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Certified emergency response coordinators, ex-defense fleet marshals, and telemetry engineers safeguarding travelers 24 hours a day.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
          24/7 Highway Command Desk
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEAM.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                <img
                  src={member.photoUrl}
                  alt={`Professional portrait of ${member.name}, ${member.role} at FuelRescue`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-black/80 backdrop-blur-md text-orange-400 border border-orange-500/30">
                  {member.badge}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-orange-400 transition-colors">
                  {member.name}
                </h4>
                <p className="text-xs text-orange-300/90 font-medium">{member.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{member.experience}</p>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {member.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
