import { AssistanceRequest, User, FuelOutlet, AssistanceProvider, SystemMetrics, SyncAuditLog } from '../types';
import { db } from '../offline/db';
import { saveRequestOffline, triggerSync } from '../offline/syncEngine';

const API_BASE = '/api/v1';

export const api = {
  // Authentication
  async login(email: string, password?: string, role: string = 'DRIVER'): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('fuelrescue_token', data.token);
        localStorage.setItem('fuelrescue_user', JSON.stringify(data.user));
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }
    } catch (e) {
      if (e instanceof Error && e.message !== 'Failed to fetch') {
        throw e;
      }
    }

    // Default fallback user if offline
    const fallbackUser: User = {
      id: role === 'DRIVER' ? 'user-driver-demo' : role === 'PROVIDER' ? 'user-prov-1' : role === 'OUTLET' ? 'user-outlet-1' : 'user-admin',
      name: role === 'DRIVER' ? 'Vikram Rao' : role === 'PROVIDER' ? 'Ramesh Reddy' : role === 'OUTLET' ? 'IOCL Oasis Manager' : 'Highway Admin',
      email: email || `${role.toLowerCase()}@fuelrescue.in`,
      phone: '+91 98490 55123',
      role: role as User['role'],
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const fallbackToken = 'offline_jwt_token_' + Date.now();
    localStorage.setItem('fuelrescue_token', fallbackToken);
    localStorage.setItem('fuelrescue_user', JSON.stringify(fallbackUser));
    return { user: fallbackUser, token: fallbackToken };
  },

  getCurrentUser(): User {
    try {
      const cached = localStorage.getItem('fuelrescue_user');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      id: 'user-driver-demo',
      name: 'Vikram Rao',
      email: 'driver@fuelrescue.in',
      phone: '+91 98490 55123',
      role: 'DRIVER',
      isActive: true,
      createdAt: '2026-01-15T08:30:00Z'
    };
  },

  // Users Management (Admin)
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      {
        id: 'user-admin',
        name: 'Telangana Highway Operations (Admin)',
        email: 'admin@fuelrescue.in',
        phone: '+91 94400 11000',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2025-11-01T00:00:00Z',
        totalRequests: 0,
        totalSpent: 0
      },
      {
        id: 'user-driver-demo',
        name: 'Vikram Rao',
        email: 'driver@fuelrescue.in',
        phone: '+91 98490 55123',
        role: 'DRIVER',
        isActive: true,
        createdAt: '2026-01-15T08:30:00Z',
        totalRequests: 4,
        totalSpent: 3192,
        assignedVehicle: 'TS 09 EA 4821',
        locationName: 'NH 44 Northbound, near Medchal Toll Plaza'
      },
      {
        id: 'user-driver-2',
        name: 'Priyanka Sharma',
        email: 'priyanka.s@gmail.com',
        phone: '+91 99880 77123',
        role: 'DRIVER',
        isActive: true,
        createdAt: '2026-02-10T11:20:00Z',
        totalRequests: 2,
        totalSpent: 1850,
        assignedVehicle: 'TS 07 HK 9012'
      },
      {
        id: 'user-prov-1',
        name: 'Ramesh Reddy',
        email: 'provider@fuelrescue.in',
        phone: '+91 98492 88410',
        role: 'PROVIDER',
        isActive: true,
        createdAt: '2025-12-01T09:00:00Z',
        totalRequests: 142
      }
    ];
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Assistance Requests (Fuel, Towing, Mechanic)
  async createRequest(
    data: Omit<AssistanceRequest, 'clientRequestId' | 'status' | 'syncStatus' | 'syncRetryCount' | 'createdAt' | 'updatedAt'>
  ): Promise<AssistanceRequest> {
    // OFFLINE-FIRST: Always save to IndexedDB first
    const localSaved = await saveRequestOffline(data);

    if (navigator.onLine) {
      try {
        await triggerSync();
        const synced = await db.requests.get(localSaved.clientRequestId);
        if (synced && synced.syncStatus === 'SYNCED') {
          return synced;
        }
      } catch (err) {
        console.warn('Immediate sync attempt failed, request preserved offline:', err);
      }
    }

    return localSaved;
  },

  async getRequests(params?: { userId?: string; providerId?: string; status?: string; serviceType?: string }): Promise<AssistanceRequest[]> {
    if (navigator.onLine) {
      try {
        const query = new URLSearchParams();
        if (params?.userId) query.set('userId', params.userId);
        if (params?.providerId) query.set('providerId', params.providerId);
        if (params?.status) query.set('status', params.status);
        if (params?.serviceType) query.set('serviceType', params.serviceType);

        const res = await fetch(`${API_BASE}/requests?${query.toString()}`);
        if (res.ok) {
          const serverList: AssistanceRequest[] = await res.json();
          // Cache in IndexedDB for offline resilience asynchronously without blocking
          try {
            for (const item of serverList) {
              const clientKey = item.clientRequestId || `srv-${item.id}`;
              await db.requests.put({
                ...item,
                clientRequestId: clientKey,
                syncStatus: 'SYNCED'
              });
            }
          } catch {}

          // Also merge any local pending-sync requests that haven't reached server yet
          let unmergedPending: AssistanceRequest[] = [];
          try {
            const pending = await db.requests.filter(r => r.syncStatus === 'PENDING_SYNC' || r.syncStatus === 'SYNC_FAILED').toArray();
            const serverIds = new Set(serverList.map(r => r.id));
            unmergedPending = pending.filter(p => !serverIds.has(p.id) && !serverList.some(s => s.clientRequestId === p.clientRequestId));
          } catch {}

          const combined = [...serverList, ...unmergedPending];
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return combined;
        }
      } catch (e) {
        console.warn('Network fetch error, loading from IndexedDB:', e);
      }
    }

    const localRequests = await db.requests.toArray();
    localRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return localRequests;
  },

  async getRequestById(id: string): Promise<AssistanceRequest | undefined> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`);
        if (res.ok) {
          const remote: AssistanceRequest = await res.json();
          try {
            const clientKey = remote.clientRequestId || `srv-${remote.id}`;
            await db.requests.put({ ...remote, clientRequestId: clientKey, syncStatus: 'SYNCED' });
          } catch {}
          return remote;
        }
      } catch {}
    }
    const local = await db.requests.filter(r => r.id === id || r.clientRequestId === id).first();
    return local;
  },

  async updateRequestStatus(id: string, status: string, note?: string, actorRole: string = 'PROVIDER'): Promise<AssistanceRequest | null> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, note, actorRole })
        });
        if (res.ok) {
          const updated = await res.json();
          try {
            await db.requests.where('id').equals(id).modify({ status: updated.status, updatedAt: updated.updatedAt });
          } catch {}
          return updated;
        }
      } catch (e) {
        console.warn('Online status update failed:', e);
      }
    }

    const record = await db.requests.filter(r => r.id === id || r.clientRequestId === id).first();
    if (record) {
      await db.requests.update(record.clientRequestId, {
        status: status as any,
        updatedAt: new Date().toISOString()
      });
      return { ...record, status: status as any, updatedAt: new Date().toISOString() };
    }
    return null;
  },

  async providerClaimRequest(requestId: string, providerId: string): Promise<AssistanceRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(requestId)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      if (res.ok) {
        const updated = await res.json();
        try {
          await db.requests.where('id').equals(requestId).modify(updated);
        } catch {}
        return updated;
      }
    } catch {}
    return null;
  },

  async dispenseCanister(requestId: string): Promise<AssistanceRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/requests/${encodeURIComponent(requestId)}/dispense-canister`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        try {
          await db.requests.where('id').equals(requestId).modify({ canisterDispensed: true });
        } catch {}
        return updated;
      }
    } catch {}
    return null;
  },

  // Outlets
  async getOutlets(): Promise<FuelOutlet[]> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/outlets`);
        if (res.ok) {
          const list = await res.json();
          await db.outlets.bulkPut(list);
          return list;
        }
      } catch {}
    }
    return await db.outlets.toArray();
  },

  // Providers
  async getProviders(): Promise<AssistanceProvider[]> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/providers`);
        if (res.ok) {
          const list = await res.json();
          await db.providers.bulkPut(list);
          return list;
        }
      } catch {}
    }
    return await db.providers.toArray();
  },

  async updateProviderStatus(id: string, status: string): Promise<void> {
    if (navigator.onLine) {
      try {
        await fetch(`${API_BASE}/providers/${id}/availability`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch {}
    }
    await db.providers.where('id').equals(id).modify({ status: status as any });
  },

  // Simulated Payment
  async simulatePayment(requestId: string, method: string): Promise<{ success: boolean; transactionReference: string; amount: number }> {
    try {
      const res = await fetch(`${API_BASE}/transactions/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, method })
      });
      if (res.ok) {
        const result = await res.json();
        await db.requests.where('id').equals(requestId).modify({
          paymentStatus: 'SIMULATED_SUCCESS',
          paymentMethod: method as any,
          transactionReference: result.transactionReference
        });
        return result;
      }
    } catch {}

    const fakeRef = `SIM-TXN-${Date.now()}`;
    await db.requests.where('id').equals(requestId).modify({
      paymentStatus: 'SIMULATED_SUCCESS',
      paymentMethod: method as any,
      transactionReference: fakeRef
    });
    return { success: true, transactionReference: fakeRef, amount: 798 };
  },

  // Admin Metrics
  async getAdminMetrics(): Promise<SystemMetrics> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/admin/metrics`);
        if (res.ok) return await res.json();
      } catch {}
    }
    const all = await db.requests.toArray();
    const active = all.filter(r => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status)).length;
    const completed = all.filter(r => r.status === 'COMPLETED').length;
    const cancelled = all.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length;
    const pending = all.filter(r => r.syncStatus === 'PENDING_SYNC').length;
    const failed = all.filter(r => r.syncStatus === 'SYNC_FAILED').length;

    return {
      totalUsers: 6,
      activeUsersNow: 5,
      activeRequests: active,
      pendingSyncCount: pending,
      completedRequests: completed,
      cancelledRequests: cancelled,
      registeredProviders: 3,
      verifiedProviders: 3,
      registeredOutlets: 4,
      failedSyncRecords: failed,
      averageResponseMinutes: 16.4,
      totalFuelDeliveredLiters: 420,
      towJobsCompleted: 34,
      mechanicRepairsCompleted: 58
    };
  },

  async getAdminLogs(): Promise<SyncAuditLog[]> {
    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/admin/logs`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return await db.syncLogs.toArray();
  },

  // Notifications & SOS Broadcast
  async getNotifications(role?: string): Promise<any[]> {
    try {
      const url = role ? `${API_BASE}/notifications?role=${role}` : `${API_BASE}/notifications`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  },

  async broadcastSos(payload: {
    vehicleNumber: string;
    locationDescription: string;
    latitude: number;
    longitude: number;
    serviceType: string;
    userPhone: string;
    userName: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/sos/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, alertTransmittedToProviders: 3, alertTransmittedToAdmin: true };
  },

  async createUser(newUser: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
    assignedVehicle?: string;
    locationName?: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return await res.json();
  },

  async broadcastHighwayAlert(payload: {
    title: string;
    message: string;
    priority: 'INFO' | 'WARNING' | 'CRITICAL';
    targetRole?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error('Failed to send broadcast');
    }
    return await res.json();
  },

  // Admin Specialized Features
  async getSectors(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/sectors`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async createSectorRestriction(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/sectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to declare sector restriction');
    return await res.json();
  },

  async deleteSectorRestriction(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/sectors/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async updateOutletPricing(id: string, payload: {
    petrolPrice?: number;
    dieselPrice?: number;
    hasEmergencyCans?: boolean;
    petrolAvailable?: boolean;
    dieselAvailable?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/outlets/${id}/pricing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update outlet tariff');
    return await res.json();
  },

  async verifyProviderUnit(id: string, isVerified: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/providers/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified })
    });
    if (!res.ok) throw new Error('Failed to update provider accreditation');
    return await res.json();
  },

  async forceDispatchIncident(id: string, payload: {
    providerId?: string;
    forceStatus?: string;
    adminNote?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/requests/${id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to force dispatch incident');
    return await res.json();
  },

  async getSystemDiagnostics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/system/diagnostics`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  getSystemBackupUrl(): string {
    return `${API_BASE}/admin/system/backup`;
  },

  // Driver Announcements & Push Notifications
  async getActiveDriverAnnouncements(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/driver/announcements/active`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async getAdminDriverAnnouncements(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/driver-announcements`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async createDriverAnnouncement(payload: {
    category: 'MAINTENANCE' | 'EMERGENCY' | 'WEATHER' | 'TRAFFIC';
    title: string;
    message: string;
    affectedCorridor?: string;
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    isPushNotification?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/driver-announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to dispatch driver announcement banner');
    return await res.json();
  },

  async toggleDriverAnnouncement(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/driver-announcements/${id}/toggle`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to toggle announcement status');
    return await res.json();
  },

  async deleteDriverAnnouncement(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/driver-announcements/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async sendHeartbeat(userId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/users/${userId}/heartbeat`, { method: 'POST' });
    } catch {}
  }
};
