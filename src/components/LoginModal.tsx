import React, { useState } from 'react';
import { Lock, Mail, Shield, User, HardHat, Store, BarChart3, X, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { login, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRolePreset, setSelectedRolePreset] = useState<UserRole>('DRIVER');

  const [showPassword, setShowPassword] = useState(false);

  const handleRolePreset = (r: UserRole) => {
    setSelectedRolePreset(r);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password, selectedRolePreset);
    setLoading(false);
    if (ok) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sign In to FuelRescue</h3>
              <p className="text-xs text-slate-400">Role-Based Access Control System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Select Target Role */}
        <div className="mt-4">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            Target Account Role:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['DRIVER', 'PROVIDER', 'OUTLET', 'ADMIN'] as UserRole[]).map((r) => {
              const descs: Record<UserRole, string> = {
                DRIVER: 'Passenger & fleet vehicle',
                PROVIDER: 'Patrol & mobile rescue',
                OUTLET: 'Fuel depot partner',
                ADMIN: 'Command authority'
              };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRolePreset(r)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedRolePreset === r
                      ? 'bg-orange-500/15 border-orange-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{r.toLowerCase()}</span>
                    {selectedRolePreset === r && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {descs[r]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-14 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-mono tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRolePreset}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
