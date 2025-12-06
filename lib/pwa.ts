// PWA utilities for service worker registration and offline support

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('SW unregistered');
    } catch (error) {
      console.error('SW unregistration failed:', error);
    }
  }
};

export const showUpdateNotification = () => {
  // Create a custom update notification
  const updateDiv = document.createElement('div');
  updateDiv.className = 'fixed top-4 right-4 z-50 max-w-sm';
  updateDiv.innerHTML = `
    <div class="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span class="font-medium">Update Available</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-blue-200 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <p class="text-blue-100 text-sm mt-1">A new version is available. Refresh to update.</p>
      <button onclick="window.location.reload()" class="mt-3 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm font-medium">
        Refresh Now
      </button>
    </div>
  `;
  document.body.appendChild(updateDiv);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (updateDiv.parentElement) {
      updateDiv.remove();
    }
  }, 10000);
};

export const checkOnlineStatus = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !navigator) {
    return true; // Assume online during SSR
  }
  return navigator.onLine;
};

export const addOnlineOfflineListeners = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  // Skip during SSR
  if (typeof window === 'undefined') {
    return () => {}; // Return no-op cleanup function
  }

  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Offline data management
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;

  private constructor() {
    this.isOnline = checkOnlineStatus();
    addOnlineOfflineListeners(
      () => { this.isOnline = true; this.syncPendingData(); },
      () => { this.isOnline = false; }
    );
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  // Store data for later sync when coming back online
  storePendingAction(action: string, data: any): void {
    const pendingActions = this.getPendingActions();
    pendingActions.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('pending-offline-actions', JSON.stringify(pendingActions));
  }

  // Sync pending actions when coming back online
  private async syncPendingActions(): Promise<void> {
    const pendingActions = this.getPendingActions();
    if (pendingActions.length === 0) return;

    for (const pendingAction of pendingActions) {
      try {
        // Attempt to sync each action
        await this.syncAction(pendingAction);
        // Remove successfully synced actions
        this.removePendingAction(pendingAction.id);
      } catch (error) {
        console.error('Failed to sync pending action:', error);
        // Keep failed actions for retry
      }
    }
  }

  private async syncAction(pendingAction: any): Promise<void> {
    // Implement specific sync logic based on action type
    switch (pendingAction.action) {
      case 'save-recommendation':
        // Sync recommendation saving
        console.log('Syncing recommendation save:', pendingAction.data);
        break;
      case 'update-profile':
        // Sync profile updates
        console.log('Syncing profile update:', pendingAction.data);
        break;
      default:
        console.warn('Unknown pending action type:', pendingAction.action);
    }
  }

  private getPendingActions(): any[] {
    try {
      const stored = localStorage.getItem('pending-offline-actions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending actions:', error);
      return [];
    }
  }

  private removePendingAction(id: string): void {
    const pendingActions = this.getPendingActions().filter(action => action.id !== id);
    localStorage.setItem('pending-offline-actions', JSON.stringify(pendingActions));
  }

  private syncPendingData(): void {
    // Sync any pending data when coming back online
    console.log('Syncing pending data...');
    this.syncPendingActions();
  }
}

// Export a function to get the offline manager instance (lazy loading for SSR safety)
export const getOfflineManager = (): OfflineManager => {
  return OfflineManager.getInstance();
};


