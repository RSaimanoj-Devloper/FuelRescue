import React, { useState } from 'react';
import {
  Fuel, Shield, User, Users, ChevronDown, Bell, HardHat, Store, BarChart3,
  BookOpen, Sun, Moon, BatteryLow, Wifi, Globe, LogIn, LogOut, AlertOctagon, Sparkles, Car
} from 'lucide-react';
import { UserRole, LanguageCode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onEmergencyClick: () => void;
  onOpenSOS: () => void;
  onOpenLoginModal: () => void;
  onOpenTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  onEmergencyClick,
  onOpenSOS,
  onOpenLoginModal,
  onOpenTour
}) => {
  const { theme, toggleTheme, language, setLanguage, t, lowBatteryMode, toggleLowBatteryMode, lowNetworkMode, toggleLowNetworkMode } = useTheme();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; badgeClass: string }> = {
    DRIVER: {
      label: 'Highway Driver',
      icon: <User className="w-3.5 h-3.5 text-orange-400" />,
      badgeClass: 'bg-orange-950 text-orange-400 border-orange-800'
    },
    PROVIDER: {
      label: 'Rescue Patrol Unit',
      icon: <HardHat className="w-3.5 h-3.5 text-blue-400" />,
      badgeClass: 'bg-blue-950 text-blue-400 border-blue-800'
    },
    OUTLET: {
      label: 'Fuel Station Manager',
      icon: <Store className="w-3.5 h-3.5 text-emerald-400" />,
      badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800'
    },
    ADMIN: {
      label: 'Operations Admin',
      icon: <BarChart3 className="w-3.5 h-3.5 text-purple-400" />,
      badgeClass: 'bg-purple-950 text-purple-400 border-purple-800'
    }
  };

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentRole === 'ADMIN') onSelectTab('ADMIN');
              else if (currentRole === 'PROVIDER') onSelectTab('PROVIDER');
              else if (currentRole === 'OUTLET') onSelectTab('OUTLET');
              else onSelectTab('DRIVER_HOME');
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                {t.appName}
              </span>
              <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider block mt-0.5">
                {t.emergencyTag}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links - STRICT ROLE-BASED ACCESS CONTROL (RBAC) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
          {currentRole === 'DRIVER' && (
            <>
              <button
                onClick={() => onSelectTab('DRIVER_HOME')}
                className={`whitespace-nowrap transition-colors ${
                  activeTab === 'DRIVER_HOME' ? 'text-orange-400 font-bold' : 'hover:text-white'
                }`}
              >
                {t.driverHub}
              </button>
              <button
                onClick={() => onSelectTab('TRACKER')}
                className={`whitespace-nowrap transition-colors ${
                  activeTab === 'TRACKER' ? 'text-orange-400 font-bold' : 'hover:text-white'
                }`}
              >
                {t.tracker}
              </button>
              <button
                onClick={() => onSelectTab('VEHICLES')}
                className={`whitespace-nowrap transition-colors ${
                  activeTab === 'VEHICLES' ? 'text-orange-400 font-bold' : 'hover:text-white'
                }`}
              >
                {t.vehicles}
              </button>
            </>
          )}

          {currentRole === 'PROVIDER' && (
            <button
              onClick={() => onSelectTab('PROVIDER')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'PROVIDER' ? 'text-orange-400 font-bold' : 'hover:text-white'
              }`}
            >
              {t.providerDispatch}
            </button>
          )}

          {currentRole === 'OUTLET' && (
            <button
              onClick={() => onSelectTab('OUTLET')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'OUTLET' ? 'text-orange-400 font-bold' : 'hover:text-white'
              }`}
            >
              {t.fuelOutlets}
            </button>
          )}

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onSelectTab('ADMIN')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'ADMIN' ? 'text-orange-400 font-bold' : 'hover:text-white'
              }`}
            >
              {t.adminMetrics}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ONE-TAP SOS Trigger: ONLY VISIBLE FOR DRIVER ROLE (Never for Admin, Provider, or Outlet) */}
          {currentRole === 'DRIVER' && (
            <button
              onClick={onOpenSOS}
              title="One-Tap Highway SOS Emergency Broadcast"
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-lg shadow-red-600/30 transition-all border border-red-500 animate-pulse"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span className="uppercase text-[11px] font-bold">{language}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 ${
                      language === l.code ? 'text-orange-400 font-bold bg-slate-800/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Low Battery Mode Toggle */}
          <button
            onClick={toggleLowBatteryMode}
            className={`p-1.5 rounded-lg transition-colors border ${
              lowBatteryMode
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Low Battery Saver Mode"
          >
            <BatteryLow className="w-4 h-4" />
          </button>

          {/* Quick Start Tour Guide Button for Drivers */}
          {currentRole === 'DRIVER' && onOpenTour && (
            <button
              onClick={onOpenTour}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs"
              title="Open Quick Start Tour Guide"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline font-bold text-[11px]">Tour</span>
            </button>
          )}

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Authenticated User Profile (Strict: No Role Switching Allowed!) */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              {roleLabels[currentRole].icon}
              <span className="hidden sm:inline font-bold">{user?.name?.split(' ')[0] || currentRole}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border ${roleLabels[currentRole].badgeClass}`}>
                {currentRole}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                {/* User Credentials & Verified Role */}
                <div className="px-3 pb-2 mb-1 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Authenticated Account
                  </span>
                  <p className="text-sm font-black text-white mt-0.5 truncate">
                    {user?.name || 'Highway Authorized User'}
                  </p>
                  <p className="text-[11px] font-mono text-orange-400 truncate">
                    {user?.email || 'N/A'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleLabels[currentRole].badgeClass}`}>
                      {roleLabels[currentRole].label}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Privileged
                    </span>
                  </div>
                </div>

                {/* Additional user info */}
                {user?.phone && (
                  <div className="px-3 py-1.5 text-slate-400 text-[11px] font-mono border-b border-slate-800/60">
                    Phone: <span className="text-slate-200">{user.phone}</span>
                  </div>
                )}

                <div className="mt-1 pt-1 px-2 space-y-1">
                  {currentRole === 'DRIVER' && onOpenTour && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenTour();
                      }}
                      className="w-full py-1.5 px-2 text-left rounded-lg hover:bg-slate-800 text-amber-300 font-bold flex items-center gap-1.5 text-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quick Start Tour</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full py-1.5 px-2 text-left rounded-lg hover:bg-red-950/50 text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
