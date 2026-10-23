import { useState, useEffect } from 'react';
import { subscribeToSyncStatus, triggerSync, getPendingSyncCount } from '../offline/syncEngine';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      if (!simulatedOffline) {
        setIsOnline(true);
        triggerSync();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending count
    getPendingSyncCount().then(setPendingCount);

    const unsubscribe = subscribeToSyncStatus((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [simulatedOffline]);

  const toggleSimulation = () => {
    setSimulatedOffline((prev) => {
      const next = !prev;
      setIsOnline(!next);
      if (!next) {
        triggerSync();
      }
      return next;
    });
  };

  const syncNow = async () => {
    if (!isOnline) {
      return { synced: 0, failed: 0, message: 'Cannot sync while offline. Check connection.' };
    }
    return await triggerSync();
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow,
    simulatedOffline,
    toggleSimulation
  };
}
