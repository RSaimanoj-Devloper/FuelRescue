import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Fuel, HardHat, Store, ShieldCheck, Download,
  Filter, Search, CheckCircle2, Clock, AlertTriangle, FileText, ChevronRight,
  User as UserIcon, Shield, UserPlus, Bell, AlertOctagon, X, Phone, Mail, Car, MapPin, Eye, Lock,
  Trash2, Radio, Send, Megaphone, ShieldAlert, Zap, RefreshCw, Activity, Gauge, Server, Database, Sliders, Check, Wrench,
  Smartphone, ToggleLeft, ToggleRight, Info, AlertCircle
} from 'lucide-react';
import {
  SystemMetrics, AssistanceRequest, SyncAuditLog, AssistanceProvider,
  User, AppNotification, UserRole, FuelOutlet, HighwaySectorRestriction, SystemDiagnostics, DriverAnnouncement
} from '../types';
import { api } from '../services/api';
import { AdminUserDossierModal } from '../components/AdminUserDossierModal';
import { useTheme } from '../contexts/ThemeContext';

export const AdminDashboard: React.FC = () => {
  const { t, theme } = useTheme();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [providers, setProviders] = useState<AssistanceProvider[]>([]);
  const [outlets, setOutlets] = useState<FuelOutlet[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SyncAuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [sectors, setSectors] = useState<HighwaySectorRestriction[]>([]);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<
    'USERS' | 'NOTIFICATIONS' | 'BROADCAST' | 'INCIDENT_CONTROL' | 'SECTORS' | 'FUEL_REGULATION' | 'PATROL_FLEET' | 'AUDIT_LOGS'
  >('USERS');

  // Selected user for full-screen drilldown dossier
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);

  // Delete User Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add User Modal State
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+91 98490 ');
  const [newUserRole, setNewUserRole] = useState<UserRole>('DRIVER');
  const [newUserPassword, setNewUserPassword] = useState('Secure@123');
  const [newUserVehicle, setNewUserVehicle] = useState('TS 09 AB 1234');
  const [newUserLocation, setNewUserLocation] = useState('NH 44 Northbound Corridor');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);

  // Highway Emergency Broadcast Bulletin State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('WARNING');
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'PROVIDER' | 'DRIVER'>('ALL');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Driver Push Notification & Live Banner State
  const [driverAnnouncements, setDriverAnnouncements] = useState<DriverAnnouncement[]>([]);
  const [broadcastSubTab, setBroadcastSubTab] = useState<'DRIVER_PUSH' | 'FLEET_BULLETIN'>('DRIVER_PUSH');
  const [annCategory, setAnnCategory] = useState<'MAINTENANCE' | 'EMERGENCY' | 'WEATHER' | 'TRAFFIC'>('MAINTENANCE');
  const [annSeverity, setAnnSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('WARNING');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCorridor, setAnnCorridor] = useState('NH 44 (All Sectors)');
  const [annIsPush, setAnnIsPush] = useState(true);
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annFeedback, setAnnFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Force Dispatch State
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<AssistanceRequest | null>(null);
  const [selectedProviderForForceDispatch, setSelectedProviderForForceDispatch] = useState<string>('');
  const [forceDispatchNote, setForceDispatchNote] = useState('Admin emergency high-priority force dispatch order');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // New Sector Caution Declaration Modal
  const [addSectorModalOpen, setAddSectorModalOpen] = useState(false);
  const [newCorridorName, setNewCorridorName] = useState('NH 44 (Hyderabad - Nagpur)');
  const [newSectorKm, setNewSectorKm] = useState('Km 40 to Km 65 (Medchal - Toopran)');
  const [newAlertLevel, setNewAlertLevel] = useState<'CAUTION' | 'SEVERE_RESTRICTION' | 'CLOSED'>('CAUTION');
  const [newHazardType, setNewHazardType] = useState<'DENSE_FOG' | 'ACCIDENT_CLEARANCE' | 'MONSOON_FLOODING' | 'ROADWORK'>('DENSE_FOG');
  const [newAdvisorySpeed, setNewAdvisorySpeed] = useState('45');
  const [newDiversionRoute, setNewDiversionRoute] = useState('Maintain low beam headlights, stay in outer lane');
  const [sectorActionSuccess, setSectorActionSuccess] = useState<string | null>(null);

  // Fuel Pricing Editing State
  const [editingOutlet, setEditingOutlet] = useState<FuelOutlet | null>(null);
  const [editPetrolPrice, setEditPetrolPrice] = useState<number>(109.66);
  const [editDieselPrice, setEditDieselPrice] = useState<number>(97.82);
  const [editEmergencyCans, setEditEmergencyCans] = useState<boolean>(true);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [m, reqs, provs, outs, usrList, audit, notifs, secs, diag, anns] = await Promise.all([
        api.getAdminMetrics(),
        api.getRequests(),
        api.getProviders(),
        api.getOutlets(),
        api.getUsers(),
        api.getAdminLogs(),
        api.getNotifications('ADMIN'),
        api.getSectors(),
        api.getSystemDiagnostics(),
        api.getAdminDriverAnnouncements()
      ]);
      setMetrics(m);
      setRequests(reqs);
      setProviders(provs);
      setOutlets(outs);
      setUsers(usrList);
      setLogs(audit);
      setNotifications(notifs);
      setSectors(secs);
      setDiagnostics(diag);
      setDriverAnnouncements(anns);
    } catch (e) {
      console.warn('Admin data load note:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError(null);
    try {
      const created = await api.createUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        role: newUserRole,
        password: newUserPassword,
        assignedVehicle: newUserVehicle,
        locationName: newUserLocation
      });

      setUsers(prev => [created, ...prev]);
      setAddUserSuccess(`User ${created.name} (${created.email}) added successfully!`);
      setTimeout(() => {
        setAddUserSuccess(null);
        setAddUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
      }, 1500);
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to add user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.deleteUser(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      setDeleteSuccess(`User ${targetUser.name} (${targetUser.email}) permanently removed.`);
      setUserToDelete(null);
      setTimeout(() => setDeleteSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcastLoading(true);
    try {
      await api.broadcastHighwayAlert({
        title: broadcastTitle,
        message: broadcastMessage,
        priority: broadcastPriority,
        targetRole: broadcastTarget
      });
      setBroadcastStatus('Highway Bulletin successfully dispatched to all units!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      loadData();
      setTimeout(() => setBroadcastStatus(null), 3500);
    } catch (err: any) {
      setBroadcastStatus('Failed to transmit broadcast alert');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleCreateDriverAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    setAnnSubmitting(true);
    setAnnFeedback(null);
    try {
      const res = await api.createDriverAnnouncement({
        category: annCategory,
        severity: annSeverity,
        title: annTitle.trim(),
        message: annMessage.trim(),
        affectedCorridor: annCorridor.trim() || 'NH 44 (All Sectors)',
        isPushNotification: annIsPush
      });
      setDriverAnnouncements(prev => [res.announcement, ...prev]);
      setAnnFeedback({
        type: 'success',
        message: `Push notification & announcement banner successfully dispatched to ${res.connectedDriversCount} connected driver device(s)!`
      });
      setAnnTitle('');
      setAnnMessage('');
      setTimeout(() => setAnnFeedback(null), 5000);
      loadData();
    } catch (err: any) {
      setAnnFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch driver announcement'
      });
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleToggleDriverAnnouncement = async (id: string) => {
    try {
      const updated = await api.toggleDriverAnnouncement(id);
      setDriverAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err: any) {
      alert('Failed to update announcement status: ' + err.message);
    }
  };

  const handleDeleteDriverAnnouncement = async (id: string) => {
    if (!confirm('Permanently purge this driver announcement and remove from all active driver displays?')) return;
    try {
      await api.deleteDriverAnnouncement(id);
      setDriverAnnouncements(prev => prev.filter(a => a.id !== id));
      setAnnFeedback({
        type: 'success',
        message: 'Announcement banner successfully deleted from network.'
      });
      setTimeout(() => setAnnFeedback(null), 3500);
    } catch (err: any) {
      alert('Failed to delete announcement: ' + err.message);
    }
  };

  const handleApplyPresetTemplate = (preset: {
    category: 'MAINTENANCE' | 'EMERGENCY' | 'WEATHER' | 'TRAFFIC';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    corridor: string;
  }) => {
    setAnnCategory(preset.category);
    setAnnSeverity(preset.severity);
    setAnnTitle(preset.title);
    setAnnMessage(preset.message);
    setAnnCorridor(preset.corridor);
  };

  const handleForceDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForDispatch || !selectedProviderForForceDispatch) return;
    setDispatchLoading(true);
    try {
      await api.forceDispatchIncident(selectedIncidentForDispatch.id, {
        providerId: selectedProviderForForceDispatch,
        forceStatus: 'DISPATCHED',
        adminNote: forceDispatchNote
      });
      setDispatchSuccess(`Incident ${selectedIncidentForDispatch.id} successfully force-assigned!`);
      setSelectedIncidentForDispatch(null);
      loadData();
      setTimeout(() => setDispatchSuccess(null), 3500);
    } catch (err: any) {
      alert('Error during force dispatch: ' + err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSectorRestriction({
        corridorName: newCorridorName,
        sectorKm: newSectorKm,
        alertLevel: newAlertLevel,
        hazardType: newHazardType,
        advisorySpeedKmh: Number(newAdvisorySpeed),
        diversionRoute: newDiversionRoute
      });
      setSectorActionSuccess('Highway Sector Caution Restriction actively declared on corridor');
      setAddSectorModalOpen(false);
      loadData();
      setTimeout(() => setSectorActionSuccess(null), 3500);
    } catch (err: any) {
      alert('Error declaring sector: ' + err.message);
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    if (confirm('Clear and lift this corridor restriction?')) {
      await api.deleteSectorRestriction(sectorId);
      setSectors(prev => prev.filter(s => s.id !== sectorId));
      setSectorActionSuccess('Sector restriction cleared. Normal speeds resumed.');
      setTimeout(() => setSectorActionSuccess(null), 3000);
    }
  };

  const handleSaveOutletPrice = async () => {
    if (!editingOutlet) return;
    try {
      await api.updateOutletPricing(editingOutlet.id, {
        petrolPrice: editPetrolPrice,
        dieselPrice: editDieselPrice,
        hasEmergencyCans: editEmergencyCans
      });
      setOutlets(prev => prev.map(o => o.id === editingOutlet.id ? {
        ...o,
        petrolPrice: editPetrolPrice,
        dieselPrice: editDieselPrice,
        hasEmergencyCans: editEmergencyCans
      } : o));
      setPriceSaveSuccess(`Updated emergency rates for ${editingOutlet.name}`);
      setEditingOutlet(null);
      setTimeout(() => setPriceSaveSuccess(null), 3500);
    } catch (err: any) {
      alert('Error updating tariff: ' + err.message);
    }
  };

  const handleToggleProviderVerification = async (provider: AssistanceProvider) => {
    const updated = !provider.isVerified;
    try {
      await api.verifyProviderUnit(provider.id, updated);
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, isVerified: updated } : p));
    } catch (err: any) {
      alert('Failed to update provider status: ' + err.message);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const match =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.locationDescription.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const unreadAlertsCount = notifications.filter(n => !n.isRead && n.priority === 'CRITICAL').length;

  const exportCSV = () => {
    const headers = [
      'Request ID', 'Client Request ID', 'Service Type', 'Vehicle Number',
      'Fuel Type', 'Quantity', 'Status', 'Sync Status', 'Cost',
      'Assigned Provider', 'Created At'
    ];

    const rows = filteredRequests.map(r => [
      r.id,
      r.clientRequestId,
      r.serviceType,
      r.vehicleNumber,
      r.fuelType || 'N/A',
      r.requestedQuantity || 0,
      r.status,
      r.syncStatus,
      r.confirmedCost || r.estimatedCost,
      r.assignedProviderName || 'None',
      r.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fuelrescue_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            {t.adminCommandCenter}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {t.adminMetrics}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centralized highway dispatch command, user lifecycle, emergency bulletin dispatch, geofences, and tariffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add New User Action */}
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addUser}</span>
          </button>

          {/* Database Backup Download */}
          <a
            href={api.getSystemBackupUrl()}
            download
            className="px-3.5 py-2 bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Download Full Database Backup Snapshot"
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">JSON Backup</span>
          </a>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {deleteSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {dispatchSuccess && (
        <div className="p-3 bg-blue-950/80 border border-blue-700 text-blue-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {sectorActionSuccess && (
        <div className="p-3 bg-amber-950/80 border border-amber-700 text-amber-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{sectorActionSuccess}</span>
        </div>
      )}

      {priceSaveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{priceSaveSuccess}</span>
        </div>
      )}

      {/* Real-time KPIs with Real Active Users Highlighted */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 rounded-2xl shadow-md">
            <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t.activeUsers}
            </span>
            <span className="text-2xl font-black text-white mt-1 block tabular-nums">
              {metrics.activeUsersNow} <span className="text-xs font-normal text-slate-400">/ {metrics.totalUsers} total</span>
            </span>
          </div>

          {/* SOS Alerts Badge Card */}
          <div
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className="p-4 bg-slate-900 border border-red-500/30 rounded-2xl cursor-pointer hover:border-red-500/60 transition-colors shadow-md"
          >
            <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
              {t.priorityAlerts}
            </span>
            <span className="text-2xl font-black text-red-400 mt-1 block tabular-nums">
              {notifications.filter(n => n.type === 'SOS_EMERGENCY').length}
              {unreadAlertsCount > 0 && (
                <span className="text-xs font-bold text-red-400 ml-1.5 animate-pulse">
                  ({unreadAlertsCount} new)
                </span>
              )}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('INCIDENT_CONTROL')}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-orange-500/50 cursor-pointer rounded-2xl shadow-md transition-colors"
          >
            <span className="text-[11px] font-medium text-slate-400 block">Active Missions</span>
            <span className="text-2xl font-black text-orange-400 mt-1 block tabular-nums">{metrics.activeRequests}</span>
          </div>

          <div
            onClick={() => setActiveTab('SECTORS')}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer rounded-2xl shadow-md transition-colors"
          >
            <span className="text-[11px] font-medium text-slate-400 block">Corridor Geofences</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block tabular-nums">{sectors.length} Active</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md">
            <span className="text-[11px] font-medium text-slate-400 block">Avg Response</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block tabular-nums">{metrics.averageResponseMinutes}m</span>
          </div>

          <div
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer rounded-2xl shadow-md transition-colors"
          >
            <span className="text-[11px] font-medium text-slate-400 block">System Health</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block tabular-nums">100% OK</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Comprehensive 8 Command Consoles */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold max-w-full overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-2 px-3 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'USERS' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t.allUsers} ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'NOTIFICATIONS' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>SOS Alerts ({notifications.length})</span>
          {unreadAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[10px] text-white font-bold">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'BROADCAST' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-amber-300" />
          <span>{t.emergencyBroadcast}</span>
          {driverAnnouncements.some(a => a.isBannerActive) && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-white font-bold animate-pulse">
              {driverAnnouncements.filter(a => a.isBannerActive).length} LIVE
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('INCIDENT_CONTROL')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'INCIDENT_CONTROL' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>{t.incidentControl}</span>
        </button>

        <button
          onClick={() => setActiveTab('SECTORS')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SECTORS' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.corridorSectors} ({sectors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FUEL_REGULATION')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'FUEL_REGULATION' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Fuel className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.fuelPricingReg}</span>
        </button>

        <button
          onClick={() => setActiveTab('PATROL_FLEET')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PATROL_FLEET' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardHat className="w-3.5 h-3.5 text-blue-400" />
          <span>{t.fleetAccreditation}</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.systemHealth}</span>
        </button>
      </div>

      {/* 1. USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search user by name, email, phone number, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Users: <strong className="text-white">{filteredUsers.length}</strong></span>
              <button
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                title="Refresh users list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Real-Time Status</th>
                  <th className="py-3 px-4">Requests</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const now = Date.now();
                  const lastActiveMs = u.lastActive ? new Date(u.lastActive).getTime() : 0;
                  const isOnline = u.isActive && (now - lastActiveMs < 5 * 60 * 1000);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <button
                          onClick={() => setSelectedUserForDossier(u)}
                          className="text-left font-bold text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1.5"
                          title="Open Full-Screen User Dossier"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.name}</span>
                        </button>
                        <span className="block text-[10px] text-slate-500 font-normal font-mono">
                          ID: {u.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{u.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                          u.role === 'PROVIDER' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          u.role === 'OUTLET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {!u.isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Suspended</span>
                          </span>
                        ) : isOnline ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 w-max">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>{t.onlineNow}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span>{t.inactive}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 tabular-nums font-bold text-white">
                        {u.totalRequests || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUserForDossier(u)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                            title="Open Full-Screen User Dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            <span className="hidden sm:inline">Dossier</span>
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                            title="Delete User from System"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">{t.deleteUser}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. NOTIFICATIONS TAB */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-400" />
                <span>Highway Emergency Notifications & SOS Broadcasts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time alerts broadcasted when travelers trigger One-Tap SOS emergency assistance.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800">
              {unreadAlertsCount} Unread Priority Alerts
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No active emergency notifications at this time. All sectors clear.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    n.priority === 'CRITICAL'
                      ? 'bg-red-950/20 border-red-500/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          n.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {n.priority}
                        </span>
                        <h4 className="text-sm font-extrabold text-white">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                      {n.location && (
                        <p className="text-[11px] text-orange-400 flex items-center gap-1 pt-1 font-mono">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>GPS: {n.location.lat}° N, {n.location.lon}° E — {n.location.description}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkNotifRead(n.id)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-semibold"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. HIGHWAY EMERGENCY BROADCAST BULLETIN & DRIVER PUSH ANNOUNCEMENTS */}
      {activeTab === 'BROADCAST' && (
        <div className="space-y-6">
          {/* Header & Status Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-400" />
                  <span>Highway Broadcast & Driver Push Announcement Operations</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send real-time push notifications & persistent warning banners directly to all connected driver dashboards for maintenance alerts or emergency incidents.
                </p>
              </div>

              {/* Status metrics chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{users.filter(u => u.role === 'DRIVER').length} Connected Drivers</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{driverAnnouncements.filter(a => a.isBannerActive).length} Live Banners</span>
                </span>
              </div>
            </div>

            {/* Sub-tab selection */}
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setBroadcastSubTab('DRIVER_PUSH')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  broadcastSubTab === 'DRIVER_PUSH'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Driver Push Notifications & Banners</span>
                <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px]">
                  {driverAnnouncements.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBroadcastSubTab('FLEET_BULLETIN')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  broadcastSubTab === 'FLEET_BULLETIN'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>General Fleet Radio Bulletin</span>
              </button>
            </div>
          </div>

          {/* DRIVER PUSH & ANNOUNCEMENT BANNER INTERFACE */}
          {broadcastSubTab === 'DRIVER_PUSH' && (
            <div className="space-y-6">
              {/* Broadcast Form Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-orange-400" />
                      <span>Compose Driver Push Notification & Live Dashboard Banner</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Targeted specifically to all active driver accounts currently logged in or cruising the highway corridor.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-950/80 border border-orange-800/80 text-orange-300 text-[11px] font-mono">
                    Target: All Drivers ({users.filter(u => u.role === 'DRIVER').length} Accounts)
                  </span>
                </div>

                {/* Feedback alert */}
                {annFeedback && (
                  <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
                    annFeedback.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-700 text-rose-300'
                  }`}>
                    {annFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span className="font-medium">{annFeedback.message}</span>
                  </div>
                )}

                {/* Quick Presets for Maintenance & Emergency */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ⚡ Quick 1-Click Incident & Maintenance Presets
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate({
                        category: 'MAINTENANCE',
                        severity: 'WARNING',
                        title: 'Scheduled Toll Plaza Sensor Calibration & Lane Servicing',
                        message: 'Lanes 3 & 4 at Km 54 Toll Plaza undergoing scheduled sensor maintenance until 02:00. Expect 5-10 min delays; use dedicated FASTag open lanes.',
                        corridor: 'NH 44 - Km 54 Toll Plaza'
                      })}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Toll Maintenance</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Scheduled sensor calibration at Km 54 Toll Plaza.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate({
                        category: 'MAINTENANCE',
                        severity: 'INFO',
                        title: 'Highway Fuel Station Pump Calibration & Filter Servicing',
                        message: 'IOCL Highway Oasis at Km 68 is undergoing routine dispensing calibration. Emergency jerry can fuel delivery remains on standby.',
                        corridor: 'NH 44 Corridor - Km 68'
                      })}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                        <Fuel className="w-3.5 h-3.5" />
                        <span>Pump Calibration</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Routine fuel nozzle and pump calibration at Km 68.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate({
                        category: 'EMERGENCY',
                        severity: 'CRITICAL',
                        title: '🚨 CRITICAL: Zero-Visibility Dense Fog Corridor Warning',
                        message: 'Dense fog blanket reported between Km 35 and Km 70. Reduce speed under 40 km/h, switch ON low-beam fog lights, avoid lane switching.',
                        corridor: 'NH 44 Northbound (Km 35 - 70)'
                      })}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dense Fog Warning</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Zero visibility fog alert, reduce speed under 40 km/h.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetTemplate({
                        category: 'EMERGENCY',
                        severity: 'CRITICAL',
                        title: '🚨 CRITICAL: Highway Accident Clearance & Lane Closure',
                        message: 'Multi-vehicle collision blocking 2 right lanes at Km 88 Southbound. Crane operations in progress. Prepare for immediate stop.',
                        corridor: 'NH 44 Southbound (Km 88)'
                      })}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Pileup Clearance</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Right lanes blocked for accident crane clearance.
                      </p>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCreateDriverAnnouncement} className="space-y-4">
                  {/* Category & Severity & Corridor row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Announcement Category
                      </label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="MAINTENANCE">🛠️ Maintenance & Servicing Alert</option>
                        <option value="EMERGENCY">🚨 Emergency Hazard & Incident</option>
                        <option value="WEATHER">🌧️ Weather & Low Visibility Advisory</option>
                        <option value="TRAFFIC">🚗 Traffic Congestion & Lane Diversion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Severity Level
                      </label>
                      <select
                        value={annSeverity}
                        onChange={(e) => setAnnSeverity(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="CRITICAL">🚨 CRITICAL (Audible Siren + Red Flashing)</option>
                        <option value="WARNING">⚠️ WARNING (High Attention Amber Banner)</option>
                        <option value="INFO">ℹ️ INFO (Standard Corridor Notice)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Target Highway Corridor / Sector
                      </label>
                      <input
                        type="text"
                        value={annCorridor}
                        onChange={(e) => setAnnCorridor(e.target.value)}
                        placeholder="e.g. NH 44 (All Sectors) or Km 35 - 70"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Title / Headline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Banner Headline (Driver Dashboard Top Bar)
                    </label>
                    <input
                      type="text"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. 🛠️ Scheduled Toll Lane Maintenance - Lane 3 Closed at Km 54"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>

                  {/* Directive Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Directive Instructions & Safety Instructions for Drivers
                    </label>
                    <textarea
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      placeholder="Specify detailed instructions for drivers (speed reduction, lane usage, anticipated duration)..."
                      rows={3}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Delivery toggles & action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={annIsPush}
                          onChange={(e) => setAnnIsPush(e.target.checked)}
                          className="w-4 h-4 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-0"
                        />
                        <span className="flex items-center gap-1.5 font-medium">
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span>Simulate Browser Push Notification Pop</span>
                        </span>
                      </label>
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Live Sticky Banner on Driver Dashboard</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={annSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{annSubmitting ? 'Transmitting to Connected Drivers...' : 'Broadcast Push Banner to Drivers'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active & Historical Driver Announcements Registry */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Active Announcements & Connected Driver Delivery Tracker</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitor which banners are currently live on driver dashboards, review device delivery receipts, or instantly recall active bulletins.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total Banners: <strong className="text-white">{driverAnnouncements.length}</strong>
                  </span>
                </div>

                {driverAnnouncements.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No driver announcements dispatched yet. Use the composer above to broadcast maintenance or emergency alerts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {driverAnnouncements.map((ann) => {
                      const isEmergency = ann.category === 'EMERGENCY';
                      const isMaintenance = ann.category === 'MAINTENANCE';

                      return (
                        <div
                          key={ann.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            ann.isBannerActive
                              ? isEmergency
                                ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20'
                                : 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-950/70 border-slate-800/80 opacity-75'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1.5 max-w-3xl">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Live state badge */}
                                {ann.isBannerActive ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>LIVE ON DRIVER SCREENS</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                    RECALLED / INACTIVE
                                  </span>
                                )}

                                {/* Category badge */}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  isEmergency
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : isMaintenance
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {ann.category}
                                </span>

                                {/* Severity */}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                  ann.severity === 'CRITICAL'
                                    ? 'bg-red-600 text-white'
                                    : ann.severity === 'WARNING'
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-blue-600 text-white'
                                }`}>
                                  {ann.severity}
                                </span>

                                {ann.isPushNotification && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                                    <Smartphone className="w-2.5 h-2.5 text-blue-400" />
                                    <span>PUSH DISPATCHED</span>
                                  </span>
                                )}
                              </div>

                              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                {ann.title}
                              </h5>

                              <p className="text-xs text-slate-300 leading-relaxed">
                                {ann.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                                <span className="flex items-center gap-1 text-orange-400">
                                  <MapPin className="w-3 h-3" />
                                  <span>Sector: {ann.affectedCorridor}</span>
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <Users className="w-3 h-3" />
                                  <span>Delivered to {ann.deliveredCount} Driver Devices</span>
                                </span>
                                <span className="text-slate-500">
                                  Dispatched: {new Date(ann.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>

                            {/* Control action buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleDriverAnnouncement(ann.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  ann.isBannerActive
                                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                                }`}
                                title={ann.isBannerActive ? 'Recall banner from driver dashboards' : 'Reactivate banner on driver dashboards'}
                              >
                                {ann.isBannerActive ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-amber-400" />
                                    <span>Recall Banner</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-emerald-400" />
                                    <span>Re-activate</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDriverAnnouncement(ann.id)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                                title="Purge announcement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FLEET RADIO BULLETIN INTERFACE */}
          {broadcastSubTab === 'FLEET_BULLETIN' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-orange-400" />
                    <span>General Highway Patrol Fleet & Station Radio Bulletin</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transmit audio bulletins to all network patrol vehicles, tow units, and highway fuel stations.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orange-950 text-orange-400 border border-orange-800">
                  Fleet Radio Console
                </span>
              </div>

              {broadcastStatus && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{broadcastStatus}</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Target Recipient Audience
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="ALL">All Network Users (Drivers, Patrols, Outlets)</option>
                      <option value="PROVIDER">Assistance Providers & Tow Trucks Only</option>
                      <option value="DRIVER">Highway Drivers & Stranded Travelers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Alert Priority Level
                    </label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="CRITICAL">🚨 CRITICAL EMERGENCY (Immediate Alarm)</option>
                      <option value="WARNING">⚠️ HIGH PRIORITY ADVISORY</option>
                      <option value="INFO">ℹ️ STANDARD HIGHWAY BULLETIN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Advisory Headline / Subject
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. ⚠️ Severe Dense Fog Warning on NH 44 (Km 30 to 75) - Reduce Speed to 40 km/h"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Emergency Directive & Instructions
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter detailed directives for highway travelers and responding rescue units..."
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{broadcastLoading ? 'Transmitting...' : t.sendBroadcast}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. INCIDENT DISPATCH PRIORITY & FORCE REASSIGNMENT (ADMIN EXCLUSIVE) */}
      {activeTab === 'INCIDENT_CONTROL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Incident Priority Dispatch & Force Reassignment Control</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin supervisory override: reassign pending stranded travelers to specific active patrol units or escalate response tier.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              Active Incidents: {requests.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Driver & Contact</th>
                  <th className="py-3 px-4">Service & Vehicle</th>
                  <th className="py-3 px-4">Highway Sector</th>
                  <th className="py-3 px-4">Assigned Unit</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Force Dispatch Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r.id || r.clientRequestId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {r.id}
                      {r.isSosEmergency && (
                        <span className="block text-[9px] font-black text-red-400">SOS ALERT</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{r.userName}</span>
                      <span className="text-[11px] font-mono text-emerald-400">{r.userPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-orange-400">{r.serviceType}</span>
                      <span className="block font-mono text-[11px] text-slate-400">{r.vehicleNumber}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">{r.locationDescription}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {r.assignedProviderName ? (
                        <span className="text-blue-400 font-semibold">{r.assignedProviderName}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Auto-Matching...</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        r.status === 'DISPATCHED' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedIncidentForDispatch(r);
                          setSelectedProviderForForceDispatch(providers[0]?.id || '');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Force Dispatch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. HIGHWAY CORRIDOR SAFETY GEOFENCES (ADMIN EXCLUSIVE) */}
      {activeTab === 'SECTORS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Highway Corridor Geofences & Safety Sector Restriction Controls</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Declare, monitor, and lift sector restrictions (dense fog, multi-vehicle pileups, flood warnings, lane closures).
              </p>
            </div>
            <button
              onClick={() => setAddSectorModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t.declareRestriction}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectors.map((sec) => (
              <div
                key={sec.id}
                className={`p-5 rounded-2xl border transition-all ${
                  sec.alertLevel === 'SEVERE_RESTRICTION' || sec.alertLevel === 'CLOSED'
                    ? 'bg-red-950/20 border-red-500/60'
                    : sec.alertLevel === 'CAUTION'
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    sec.alertLevel === 'SEVERE_RESTRICTION' ? 'bg-red-600 text-white' :
                    sec.alertLevel === 'CAUTION' ? 'bg-amber-500 text-slate-950' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {sec.alertLevel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{sec.hazardType}</span>
                </div>

                <h4 className="text-sm font-bold text-white">{sec.corridorName}</h4>
                <p className="text-xs text-orange-400 font-mono mt-0.5">{sec.sectorKm}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center justify-between">
                    <span>Advisory Speed Limit:</span>
                    <strong className="text-white font-mono">{sec.advisorySpeedKmh} km/h</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Patrol Units En Route:</span>
                    <strong className="text-blue-400 font-mono">{sec.patrolUnitsAssigned} units</strong>
                  </p>
                  {sec.diversionRoute && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 mt-2">
                      <strong className="text-slate-300 block">Advisory:</strong>
                      {sec.diversionRoute}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(sec.declaredAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleDeleteSector(sec.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-lg border border-slate-700"
                  >
                    Lift Restriction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CORRIDOR FUEL TARIFF REGULATION & EMERGENCY RESERVES (ADMIN EXCLUSIVE) */}
      {activeTab === 'FUEL_REGULATION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <span>Highway Subsidized Emergency Fuel Tariff & Canister Reserve Regulation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regulate government ceiling retail prices (Petrol & Diesel) and verify safety canister reserves across OMC highway depots.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Corridor Stations: {outlets.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outlets.map((outlet) => (
              <div key={outlet.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-bold text-[10px] font-mono">
                    {outlet.omc}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    24-Hour Active Depot
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{outlet.name}</h4>
                  <p className="text-xs text-slate-400">{outlet.landmark} · {outlet.highway}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Petrol (MS)</span>
                    <span className="text-lg font-black text-orange-400 tabular-nums">₹{outlet.petrolPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500 block">/ Litre</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Diesel (HSD)</span>
                    <span className="text-lg font-black text-blue-400 tabular-nums">₹{outlet.dieselPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500 block">/ Litre</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Emergency 5L/10L Jerrycans:</span>
                  <span className={`font-bold ${outlet.hasEmergencyCans ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {outlet.hasEmergencyCans ? 'In Stock (40+ units)' : 'Depleted'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setEditingOutlet(outlet);
                      setEditPetrolPrice(outlet.petrolPrice);
                      setEditDieselPrice(outlet.dieselPrice);
                      setEditEmergencyCans(outlet.hasEmergencyCans);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-orange-400" />
                    <span>Regulate Station Tariff & Stock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PATROL FLEET ACCREDITATION & EQUIPMENT INSPECTION (ADMIN EXCLUSIVE) */}
      {activeTab === 'PATROL_FLEET' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>Patrol Unit Accreditation & MoRTH Equipment Compliance</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify roadworthiness, equipment compliance (hydraulic winches, jumpstarters, certified canister mounts), and accreditation licenses.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              Fleet Units: {providers.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((p) => (
              <div key={p.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    p.isVerified ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {p.isVerified ? 'MoRTH Certified' : 'Unaccredited'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.agencyName}</p>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Unit Vehicle:</span>
                    <strong className="text-slate-200">{p.vehicleType}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Plate Number:</span>
                    <span className="font-mono text-orange-400 font-bold">{p.vehicleNumber}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Operational Radius:</span>
                    <span className="font-mono">{p.coverageRadiusKm} km</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Completed Rescues:</span>
                    <strong className="text-emerald-400">{p.completedJobs} missions</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Driver Rating:</span>
                    <span>⭐ {p.rating} / 5.0</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleToggleProviderVerification(p)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      p.isVerified
                        ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{p.isVerified ? 'Revoke MoRTH Accreditation' : 'Grant MoRTH Accreditation'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SYSTEM TELEMETRY, DIAGNOSTICS & AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-6">
          {/* Real-time Diagnostics Panel */}
          {diagnostics && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">System Infrastructure & Database Telemetry</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sync Health: {diagnostics.syncEngineStatus}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Server Uptime</span>
                  <span className="text-lg font-bold font-mono text-white mt-1 block">
                    {Math.floor(diagnostics.uptimeSeconds / 60)}m {diagnostics.uptimeSeconds % 60}s
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Memory Footprint</span>
                  <span className="text-lg font-bold font-mono text-purple-400 mt-1 block">
                    {diagnostics.memoryUsageMb} MB
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Average Query Latency</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
                    {diagnostics.averageResponseLatencyMs} ms
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Corridor Patrol Coverage</span>
                  <span className="text-lg font-bold font-mono text-blue-400 mt-1 block">
                    {diagnostics.activePatrolCoverageKm} KM
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Immutable Audit Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.systemAuditLogs}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Immutable Forensic Highway Ledger</span>
            </div>
            <div className="divide-y divide-slate-800 text-xs font-mono max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-orange-400 font-bold">[{log.eventType || log.action || 'AUDIT'}]</span>{' '}
                    <span className="text-slate-300">{log.message || log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORCE DISPATCH REASSIGNMENT */}
      {selectedIncidentForDispatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Priority Force Dispatch Order</h3>
                  <p className="text-xs text-slate-400">Incident ID: {selectedIncidentForDispatch.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncidentForDispatch(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <p><strong className="text-slate-400">Driver:</strong> {selectedIncidentForDispatch.userName} ({selectedIncidentForDispatch.userPhone})</p>
              <p><strong className="text-slate-400">Service Needed:</strong> {selectedIncidentForDispatch.serviceType} for plate {selectedIncidentForDispatch.vehicleNumber}</p>
              <p><strong className="text-slate-400">Location:</strong> {selectedIncidentForDispatch.locationDescription}</p>
            </div>

            <form onSubmit={handleForceDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assign to Authorized Patrol Unit
                </label>
                <select
                  value={selectedProviderForForceDispatch}
                  onChange={(e) => setSelectedProviderForForceDispatch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-blue-500"
                  required
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.vehicleType} - {p.vehicleNumber}) [Status: {p.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Administrative Dispatch Directive
                </label>
                <input
                  type="text"
                  value={forceDispatchNote}
                  onChange={(e) => setForceDispatchNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForDispatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{dispatchLoading ? 'Dispatching...' : 'Confirm Force Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DECLARE SECTOR RESTRICTION */}
      {addSectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Declare Highway Sector Caution Zone</h3>
                  <p className="text-xs text-slate-400">MoRTH Highway Operations Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setAddSectorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSector} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Highway Corridor</label>
                <input
                  type="text"
                  value={newCorridorName}
                  onChange={(e) => setNewCorridorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sector Kilometer Span</label>
                <input
                  type="text"
                  value={newSectorKm}
                  onChange={(e) => setNewSectorKm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Alert Severity Level</label>
                  <select
                    value={newAlertLevel}
                    onChange={(e) => setNewAlertLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="CAUTION">CAUTION (Amber Warning)</option>
                    <option value="SEVERE_RESTRICTION">SEVERE RESTRICTION (Red Alert)</option>
                    <option value="CLOSED">CORRIDOR CLOSED (Emergency Detour)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Advisory Speed Limit</label>
                  <input
                    type="number"
                    value={newAdvisorySpeed}
                    onChange={(e) => setNewAdvisorySpeed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Driver Advisory & Diversion</label>
                <textarea
                  value={newDiversionRoute}
                  onChange={(e) => setNewDiversionRoute(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSectorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Activate Restriction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT OUTLET FUEL TARIFF */}
      {editingOutlet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Regulate Subsidized Fuel Ceiling</h3>
                <p className="text-xs text-slate-400">{editingOutlet.name}</p>
              </div>
              <button
                onClick={() => setEditingOutlet(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Petrol Cap Rate (₹/Litre)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPetrolPrice}
                  onChange={(e) => setEditPetrolPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Diesel Cap Rate (₹/Litre)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editDieselPrice}
                  onChange={(e) => setEditDieselPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 font-semibold">Emergency Canisters Reserve Available</span>
                <input
                  type="checkbox"
                  checked={editEmergencyCans}
                  onChange={(e) => setEditEmergencyCans(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOutlet(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutletPrice}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Subsidized Tariff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{t.confirmDelete}</h3>
                <p className="text-xs text-slate-400">Database Record Purge</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-sm font-bold text-white">{userToDelete.name}</p>
              <p className="text-xs font-mono text-slate-400">{userToDelete.email} · {userToDelete.phone}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                Assigned Role: {userToDelete.role}
              </span>
            </div>

            <p className="text-xs text-rose-300">
              Are you sure you want to permanently delete this user? All credentials, sessions, and active token authorizations will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : t.deleteUser}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN USER DOSSIER DRILLDOWN MODAL */}
      {selectedUserForDossier && (
        <AdminUserDossierModal
          user={selectedUserForDossier}
          onClose={() => setSelectedUserForDossier(null)}
          onUserUpdated={(updated) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setSelectedUserForDossier(updated);
          }}
          onUserDeleted={(deletedId) => {
            setUsers(prev => prev.filter(u => u.id !== deletedId));
            setSelectedUserForDossier(null);
            setDeleteSuccess('User permanently deleted from PostgreSQL database');
            setTimeout(() => setDeleteSuccess(null), 3000);
          }}
        />
      )}

      {/* MODAL: ADMIN ADDS NEW USER */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t.addUser}</h3>
                  <p className="text-xs text-slate-400">Admin-exclusive user provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addUserError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {addUserError}
              </div>
            )}

            {addUserSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                {addUserSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@fuelrescue.in"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Primary Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">System Privilege Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="DRIVER">DRIVER (Highway Traveler)</option>
                    <option value="PROVIDER">PROVIDER (Highway Patrol & Mechanic)</option>
                    <option value="OUTLET">OUTLET (Fuel Bunk Manager)</option>
                    <option value="ADMIN">ADMIN (System Operations)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Initial Password</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Assigned Plate / Unit Number</label>
                  <input
                    type="text"
                    value={newUserVehicle}
                    onChange={(e) => setNewUserVehicle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Sector / Highway Corridor</label>
                <input
                  type="text"
                  value={newUserLocation}
                  onChange={(e) => setNewUserLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {addUserLoading ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
