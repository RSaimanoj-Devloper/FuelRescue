import { db } from './db';
import { AssistanceRequest, SyncAuditLog } from '../types';

type SyncListener = (syncing: boolean, count: number) => void;
const listeners = new Set<SyncListener>();

let isSyncing = false;

export function subscribeToSyncStatus(listener: SyncListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(syncing: boolean, pendingCount: number) {
  listeners.forEach((listener) => listener(syncing, pendingCount));
}

// Generate client-side UUID
export function generateClientRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'req_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

/**
 * Save request in local IndexedDB first (Offline-First Rule)
 */
export async function saveRequestOffline(
  data: Omit<AssistanceRequest, 'clientRequestId' | 'status' | 'syncStatus' | 'syncRetryCount' | 'createdAt' | 'updatedAt'>
): Promise<AssistanceRequest> {
  const clientRequestId = generateClientRequestId();
  const now = new Date().toISOString();

  const newRequest: AssistanceRequest = {
    ...data,
    id: data.id || `LOCAL-${clientRequestId.slice(0, 8)}`,
    clientRequestId,
    status: 'PENDING_SYNC',
    syncStatus: 'PENDING_SYNC',
    syncRetryCount: 0,
    createdAt: now,
    updatedAt: now
  };

  // Save to Dexie IndexedDB
  await db.requests.put(newRequest);

  // Log to audit trail
  const log: SyncAuditLog = {
    id: 'log-' + generateClientRequestId().slice(0, 8),
    clientRequestId,
    eventType: 'OFFLINE_SAVED',
    message: `Emergency request saved to local storage with ID ${newRequest.id}. Pending backend sync.`,
    timestamp: now,
    success: true
  };
  await db.syncLogs.put(log);

  // Try immediate sync if online
  if (navigator.onLine) {
    triggerSync();
  }

  return newRequest;
}

/**
 * Trigger background/foreground synchronization
 */
export async function triggerSync(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };

  const pending = await db.requests
    .filter((req) => req.syncStatus === 'PENDING_SYNC' || req.syncStatus === 'SYNC_FAILED')
    .toArray();

  if (pending.length === 0) {
    notifyListeners(false, 0);
    return { synced: 0, failed: 0 };
  }

  isSyncing = true;
  notifyListeners(true, pending.length);

  let synced = 0;
  let failed = 0;

  for (const req of pending) {
    try {
      // Set to syncing state
      await db.requests.update(req.clientRequestId, {
        syncStatus: 'SYNCING',
        lastSyncAttempt: new Date().toISOString()
      });

      const response = await fetch('/api/v1/requests/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Request-Id': req.clientRequestId
        },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const serverResult: AssistanceRequest = await response.json();
      const syncTime = new Date().toISOString();

      // Update local record to SYNCED
      await db.requests.update(req.clientRequestId, {
        id: serverResult.id,
        status: serverResult.status,
        syncStatus: 'SYNCED',
        synchronizedAt: syncTime,
        assignedProviderId: serverResult.assignedProviderId,
        assignedProviderName: serverResult.assignedProviderName,
        assignedProviderPhone: serverResult.assignedProviderPhone,
        outletSourceId: serverResult.outletSourceId,
        outletSourceName: serverResult.outletSourceName,
        etaMinutes: serverResult.etaMinutes,
        updatedAt: syncTime
      });

      // Add audit log
      await db.syncLogs.put({
        id: 'log-' + generateClientRequestId().slice(0, 8),
        clientRequestId: req.clientRequestId,
        eventType: 'SYNC_SUCCESS',
        message: `Successfully synchronized with server. Confirmed Server ID: ${serverResult.id}. Assigned Status: ${serverResult.status}.`,
        timestamp: syncTime,
        success: true
      });

      // Notification
      await db.notifications.put({
        id: 'notif-' + generateClientRequestId().slice(0, 8),
        userId: req.userId,
        title: 'Emergency Request Synchronized',
        message: `Your fuel assistance request for ${req.vehicleNumber} (${req.requestedQuantity}L ${req.fuelType}) is confirmed by server [ID: ${serverResult.id}]. Finding nearby provider.`,
        timestamp: syncTime,
        read: false,
        type: 'SYNC',
        requestId: serverResult.id
      });

      synced++;
    } catch (err: unknown) {
      failed++;
      const errorMessage = err instanceof Error ? err.message : 'Network sync failed';
      const retryCount = (req.syncRetryCount || 0) + 1;

      await db.requests.update(req.clientRequestId, {
        syncStatus: 'SYNC_FAILED',
        syncRetryCount: retryCount,
        lastSyncError: errorMessage,
        lastSyncAttempt: new Date().toISOString()
      });

      await db.syncLogs.put({
        id: 'log-' + generateClientRequestId().slice(0, 8),
        clientRequestId: req.clientRequestId,
        eventType: 'SYNC_ERROR',
        message: `Sync failed (attempt ${retryCount}): ${errorMessage}. Retaining record for retry.`,
        timestamp: new Date().toISOString(),
        success: false
      });
    }
  }

  isSyncing = false;
  const remaining = await getPendingSyncCount();
  notifyListeners(false, remaining);

  return { synced, failed };
}

export async function getPendingSyncCount(): Promise<number> {
  return await db.requests
    .filter((req) => req.syncStatus === 'PENDING_SYNC' || req.syncStatus === 'SYNC_FAILED')
    .count();
}

// Auto-register window online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    triggerSync();
  });

  // Listen to Service Worker message
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'TRIGGER_BACKGROUND_SYNC') {
        triggerSync();
      }
    });
  }
}
