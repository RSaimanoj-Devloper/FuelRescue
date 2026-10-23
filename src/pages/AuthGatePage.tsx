import React, { useState } from 'react';
import {
  Fuel, Shield, Lock, Mail, User, Phone, Check, ArrowRight,
  AlertCircle, Eye, EyeOff, Globe, ShieldCheck, Car, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole, LanguageCode } from '../types';

export const AuthGatePage: React.FC = () => {
  const { login, register, loginError } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DRIVER');

  // Login form state - starts empty with no demo credentials
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmailOrPhone, setRegEmailOrPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('DRIVER');

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' }
  ];

  const handleSelectRolePreset = (r: UserRole) => {
    setSelectedRole(r);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(identifier, password, selectedRole);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmailOrPhone || !regPassword) return;
    setLoading(true);
    const isEmail = regEmailOrPhone.includes('@');
    const emailVal = isEmail ? regEmailOrPhone : `${regUsername || 'user'}@fuelrescue.in`;
    const phoneVal = !isEmail ? regEmailOrPhone : '+91 98490 55123';
    await register(regName, emailVal, regPassword, phoneVal, regRole);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans">
      {/* Top Bar with Language Selector */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-slate-900 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Instagram gradient icon badge */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 flex items-center justify-center shadow-md shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Fuel className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <span className="text-base font-black tracking-tight text-white italic">FuelRescue</span>
        </div>

        {/* Language selector in Instagram style */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === l.code ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold' : 'hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container - Instagram App Card Aesthetic */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[390px] space-y-3">
          {/* Primary Instagram Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 sm:p-9 shadow-2xl relative">
            {/* Instagram Style Brand Wordmark */}
            <div className="text-center mb-6 space-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2.5px] shadow-lg shadow-rose-500/20 mb-3">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Fuel className="w-7 h-7 text-rose-400" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-serif italic bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                FuelRescue
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                National Highway Emergency Assistance
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {mode === 'LOGIN' ? (
              /* Instagram Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* Identifier Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Phone number, username, or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 transition-colors"
                    required
                  />
                </div>

                {/* Password Input with Instagram Show/Hide toggle */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-14 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 font-mono tracking-wider transition-colors"
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors select-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>

                {/* Log In Button - Instagram style */}
                <button
                  type="submit"
                  disabled={loading || !identifier || !password}
                  className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Logging in...' : 'Log In'}</span>
                </button>

                {/* Instagram Divider "OR" */}
                <div className="flex items-center my-4">
                  <div className="flex-1 h-[1px] bg-slate-800" />
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    OR
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-800" />
                </div>

                {/* Select Account Role Type */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center">
                    Select Account Role:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['DRIVER', 'PROVIDER', 'OUTLET', 'ADMIN'] as UserRole[]).map((r) => {
                      const isSelected = selectedRole === r;
                      const roleMeta: Record<UserRole, { label: string; desc: string; icon: string }> = {
                        DRIVER: { label: 'Driver / Traveler', desc: 'Personal & commercial vehicles', icon: '🚗' },
                        PROVIDER: { label: 'Highway Patrol', desc: 'Tow truck & mobile mechanic', icon: '🚨' },
                        OUTLET: { label: 'Fuel Station', desc: 'OMC bunk partner depot', icon: '⛽' },
                        ADMIN: { label: 'Authority Admin', desc: 'Central command & operations', icon: '🛡️' }
                      };
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSelectRolePreset(r)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-rose-500/15 border-rose-500 text-white font-bold shadow-md shadow-rose-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">
                              {roleMeta[r].icon} {roleMeta[r].label}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                            {roleMeta[r].desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Help Links */}
                <div className="text-center pt-2">
                  <a
                    href="tel:1033"
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors font-medium inline-flex items-center gap-1"
                  >
                    <span>Emergency Highway Helpline? Call 1033</span>
                  </a>
                </div>
              </form>
            ) : (
              /* Instagram Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <p className="text-xs text-slate-400 text-center mb-3">
                  Sign up to access immediate highway roadside assistance and satellite dispatch.
                </p>

                <input
                  type="text"
                  placeholder="Mobile Number or Email"
                  value={regEmailOrPhone}
                  onChange={(e) => setRegEmailOrPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 font-mono"
                  required
                />

                <input
                  type="text"
                  placeholder="Full Legal Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600"
                  required
                />

                <input
                  type="text"
                  placeholder="Vehicle Number or Plate (e.g. TS 09 EA 4821)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 uppercase font-mono"
                />

                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Password (Min 6 characters)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-3 pr-14 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 font-mono tracking-wider"
                    required
                  />
                  {regPassword.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      {showRegPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setRegRole('DRIVER')}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold ${
                      regRole === 'DRIVER'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🚗 Driver Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('PROVIDER')}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold ${
                      regRole === 'PROVIDER'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🚨 Patrol / Tow Unit
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !regName || !regEmailOrPhone || !regPassword}
                  className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Secondary Instagram Switch Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-300">
            {mode === 'LOGIN' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="font-bold text-rose-400 hover:text-rose-300 ml-1 transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-rose-400 hover:text-rose-300 ml-1 transition-colors"
                >
                  Log in
                </button>
              </p>
            )}
          </div>

          {/* Official MoRTH Highway Safety Notice */}
          <div className="text-center space-y-1 text-[11px] text-slate-500 pt-2">
            <p className="flex items-center justify-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MoRTH Highway Emergency Network · 24/7 Dispatch</span>
            </p>
          </div>
        </div>
      </main>

      {/* Instagram-Style Clean Footer Links */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950/80 text-center text-[11px] text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-400">
          <span>About</span>
          <span>•</span>
          <span>Help Center</span>
          <span>•</span>
          <span>National Highway 1033</span>
          <span>•</span>
          <span>Emergency Police 112</span>
          <span>•</span>
          <span>Privacy</span>
          <span>•</span>
          <span>Terms & Conditions</span>
          <span>•</span>
          <span>Locations</span>
          <span>•</span>
          <span>Language</span>
        </div>
        <p className="text-[10px] text-slate-600">
          © 2026 FuelRescue from Ministry of Road Transport & Highways. High-accuracy GNSS without mobile data.
        </p>
      </footer>
    </div>
  );
};
