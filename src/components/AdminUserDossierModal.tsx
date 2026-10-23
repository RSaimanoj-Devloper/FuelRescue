import React, { useState } from 'react';
import {
  User as UserIcon, X, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, Car,
  Fuel, MapPin, Clock, Lock, Key, Trash2, Edit3, Shield, Award, Phone, Mail,
  ExternalLink, Layers, Eye
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminUserDossierModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
  onUserDeleted: (userId: string) => void;
}

export const AdminUserDossierModal: React.FC<AdminUserDossierModalProps> = ({
  user,
  onClose,
  onUserUpdated,
  onUserDeleted
}) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [adminNotes, setAdminNotes] = useState(user.notes || '');
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [nameInput, setNameInput] = useState(user.name || '');
  const [editingContact, setEditingContact] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleToggleStatus = async () => {
    const updatedStatus = !currentUser.isActive;
    try {
      const res = await fetch(`/api/v1/users/${currentUser.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        onUserUpdated(updated);
        notifySuccess(`User ${updatedStatus ? 'Activated' : 'Suspended'} successfully`);
      }
    } catch {
      const updated = { ...currentUser, isActive: updatedStatus };
      setCurrentUser(updated);
      onUserUpdated(updated);
      notifySuccess(`User status changed locally`);
    }
  };

  const handleSaveRole = async () => {
    try {
      const res = await fetch(`/api/v1/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, notes: adminNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        onUserUpdated(updated);
        setEditingRole(false);
        notifySuccess(`Role updated to ${selectedRole}`);
      }
    } catch {
      const updated = { ...currentUser, role: selectedRole, notes: adminNotes };
      setCurrentUser(updated);
      onUserUpdated(updated);
      setEditingRole(false);
      notifySuccess(`User updated locally`);
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      const res = await fetch(`/api/v1/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, phone: phoneInput })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        onUserUpdated(updated);
        setEditingContact(false);
        notifySuccess('User contact information saved');
      }
    } catch {
      const updated = { ...currentUser, name: nameInput, phone: phoneInput };
      setCurrentUser(updated);
      onUserUpdated(updated);
      setEditingContact(false);
      notifySuccess('User contact updated locally');
    }
  };

  const handleDelete = async () => {
    if (confirm(`ADMIN CONFIRMATION: Permanently delete user ${currentUser.name} (${currentUser.email}) from database?`)) {
      try {
        await fetch(`/api/v1/users/${currentUser.id}`, { method: 'DELETE' });
      } catch {}
      onUserDeleted(currentUser.id);
      onClose();
    }
  };

  const lat = currentUser.currentLat || 17.6250;
  const lon = currentUser.currentLon || 78.4790;
  const streetViewUrl = `https://maps.google.com/maps?q=${lat},${lon}&layer=c&cbll=${lat},${lon}&cbp=12,0,0,0,0&output=svembed`;

  // Real-time active status check
  const now = Date.now();
  const lastActiveMs = currentUser.lastActive ? new Date(currentUser.lastActive).getTime() : 0;
  const isOnlineRealTime = currentUser.isActive && (now - lastActiveMs < 5 * 60 * 1000);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col w-full h-full min-h-screen overflow-y-auto">
      {/* Top Fullscreen Header Navigation Bar */}
      <header className="sticky top-0 z-20 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
            title="Return to User Management Table"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Back to Users</span>
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h2>
              {/* Real-time status badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                !currentUser.isActive
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : isOnlineRealTime
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isOnlineRealTime && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />}
                <span>{!currentUser.isActive ? 'SUSPENDED' : isOnlineRealTime ? 'ACTIVE NOW' : 'INACTIVE'}</span>
              </span>

              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              User ID: {currentUser.id} · Registered since {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {actionSuccess && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
        )}

        {/* Top KPI Telemetry Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Total Assistance Requests</span>
            <span className="text-3xl font-black text-orange-400 tabular-nums">
              {currentUser.totalRequests || 1}
            </span>
            <span className="text-[11px] text-slate-500 block">Fuel, Towing & Repairs</span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Total Highway Spend</span>
            <span className="text-3xl font-black text-emerald-400 tabular-nums">
              ₹{currentUser.totalSpent || 798}
            </span>
            <span className="text-[11px] text-slate-500 block">PESO certified canisters</span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Last Active Heartbeat</span>
            <span className="text-xl font-bold font-mono text-white">
              {currentUser.lastActive ? new Date(currentUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {isOnlineRealTime ? '🟢 Live online session' : '⚪ Offline (> 5m ago)'}
            </span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Operational Sector</span>
            <span className="text-sm font-bold text-white truncate block">
              {currentUser.locationName || 'NH 44 Northbound Corridor'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
          </div>
        </div>

        {/* 2-Column Main Information & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Contact, Vehicles & Street View */}
          <div className="space-y-6">
            {/* Contact & Profile Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-400" />
                  <span>Personal & Communication Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingContact(!editingContact)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editingContact ? 'Cancel Edit' : 'Edit Contact'}</span>
                </button>
              </div>

              {editingContact ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Verified Mobile Phone</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                  <button
                    onClick={handleSaveContactInfo}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">Email Address</span>
                    <span className="font-mono text-white text-xs block mt-0.5 break-all">{currentUser.email}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">Phone Number</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs block mt-0.5">{currentUser.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">Assigned Vehicle</span>
                    <span className="font-mono text-white font-bold text-xs block mt-0.5">{currentUser.assignedVehicle || 'TS 09 EA 4821'}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">User Role</span>
                    <span className="text-purple-400 font-bold text-xs block mt-0.5">{currentUser.role}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Google Maps Street View for User Coordinates */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-white">Google Maps Live Street View Location</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Visual highway street view representation of user's current GPS / GNSS coordinates:
              </p>

              <div className="rounded-2xl border border-slate-800 overflow-hidden relative w-full h-64 bg-slate-950">
                <iframe
                  title="Google Maps Street View"
                  src={streetViewUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] text-slate-300 font-mono">
                  📍 {currentUser.locationName || 'Highway Sector'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Admin Operations & Controls */}
          <div className="space-y-6">
            {/* Admin Management Exclusive Operations */}
            <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-3xl space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-extrabold text-white">Administrative Operations</h3>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800">
                  Admin Authority
                </span>
              </div>

              {/* Status Action */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Account Status Toggle</h4>
                    <p className="text-[11px] text-slate-400">Enable or suspend highway dispatch access</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentUser.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {currentUser.isActive ? 'ACCOUNT ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors shadow-md ${
                    currentUser.isActive
                      ? 'bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800'
                      : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-800'
                  }`}
                >
                  {currentUser.isActive ? 'Suspend User Access' : 'Re-Activate User Account'}
                </button>
              </div>

              {/* Role Change Action */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Operational Role Assignment</h4>
                  <p className="text-[11px] text-slate-400">Modify RBAC permissions and default dashboards</p>
                </div>

                {editingRole ? (
                  <div className="space-y-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                    >
                      <option value="DRIVER">Driver / Passenger</option>
                      <option value="PROVIDER">Assistance Provider (Patrol / Tow / Mechanic)</option>
                      <option value="OUTLET">Fuel Outlet Manager</option>
                      <option value="ADMIN">System Administrator</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveRole}
                        className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Confirm New Role
                      </button>
                      <button
                        onClick={() => setEditingRole(false)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingRole(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs text-center"
                  >
                    Change Role (Current: {currentUser.role})
                  </button>
                )}
              </div>

              {/* Internal Admin Log / Flag Notes */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">Administrative Flag Notes</h4>
                <p className="text-[11px] text-slate-400">Internal notes logged for Highway Patrol and dispatchers</p>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. Verified commercial permit TS-2026; priority towing clearance."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRole}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Delete User */}
              <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-900/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Permanent Account Deletion</h4>
                  <p className="text-[11px] text-rose-400/80">Irreversibly remove user from PostgreSQL database</p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
