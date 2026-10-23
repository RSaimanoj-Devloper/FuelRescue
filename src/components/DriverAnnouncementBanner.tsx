import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Wrench, X, BellRing, ShieldAlert,
  ChevronRight, Volume2, Info, MapPin, Radio, AlertOctagon, Check
} from 'lucide-react';
import { DriverAnnouncement } from '../types';
import { api } from '../services/api';

export const DriverAnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<DriverAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dismissed_driver_banners') || '[]');
    } catch {
      return [];
    }
  });

  const loadActiveAnnouncements = async () => {
    try {
      const active = await api.getActiveDriverAnnouncements();
      setAnnouncements(active);

      // Web Push Notification & Audible Ping simulation if new emergency announcement arrives
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const unseen = active.find(a => !dismissedIds.includes(a.id) && a.isPushNotification);
        if (unseen && !sessionStorage.getItem(`pushed_${unseen.id}`)) {
          sessionStorage.setItem(`pushed_${unseen.id}`, 'true');
          try {
            new Notification(unseen.title, {
              body: unseen.message,
              icon: '/icon.svg'
            });
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadActiveAnnouncements();
    const interval = setInterval(loadActiveAnnouncements, 4000);
    return () => clearInterval(interval);
  }, [dismissedIds]);

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    sessionStorage.setItem('dismissed_driver_banners', JSON.stringify(updated));
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-3 mb-4 animate-fadeIn">
      {visibleAnnouncements.map((ann) => {
        const isEmergency = ann.category === 'EMERGENCY' || ann.severity === 'CRITICAL';
        const isMaintenance = ann.category === 'MAINTENANCE';

        return (
          <div
            key={ann.id}
            className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-2xl border-2 transition-all ${
              isEmergency
                ? 'bg-gradient-to-r from-red-950/95 via-slate-950 to-red-950/95 border-red-500 shadow-red-900/30 text-white'
                : isMaintenance
                ? 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 border-amber-500/80 shadow-amber-950/40 text-slate-100'
                : 'bg-gradient-to-r from-blue-950/90 via-slate-950 to-blue-950/90 border-blue-500/80 shadow-blue-950/40 text-slate-100'
            }`}
          >
            {/* Top Badge Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isEmergency ? 'bg-red-600 text-white' :
                  isMaintenance ? 'bg-amber-500 text-slate-950' :
                  'bg-blue-500 text-white'
                }`}>
                  {isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  {isEmergency ? '🚨 CRITICAL HIGHWAY ALERT' : isMaintenance ? '🛠️ SCHEDULED MAINTENANCE' : 'ℹ️ HIGHWAY ADVISORY'}
                </span>

                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-orange-400 animate-pulse" />
                  <span>Push Broadcast</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={(e) => handleDismiss(ann.id, e)}
                  className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-slate-400 hover:text-white transition-colors"
                  title="Dismiss this announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Headline & Body */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                isEmergency ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                isMaintenance ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {isEmergency ? <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" /> :
                 isMaintenance ? <Wrench className="w-5 h-5 text-amber-400" /> :
                 <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ann.message}
                </p>

                {ann.affectedCorridor && (
                  <p className="text-[11px] font-mono text-orange-400 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Sector: {ann.affectedCorridor}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Footer Directives */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[10px] text-slate-400">
                Issued by: <strong className="text-slate-200">{ann.createdBy || 'Highway Operations Admin'}</strong> · Broadcast to connected driver devices
              </span>
              <button
                onClick={(e) => handleDismiss(ann.id, e)}
                className="px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700/80 transition-all ml-auto"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Acknowledge Notice</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
