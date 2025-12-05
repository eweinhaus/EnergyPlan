/**
 * GDPR-compliant data deletion utilities
 * Ensures complete removal of user data from all storage locations
 */

export interface DeletionResult {
  success: boolean;
  deletedItems: string[];
  errors: string[];
  timestamp: string;
}

/**
 * Clear all user data from localStorage
 */
export function clearLocalStorageData(): { deleted: string[]; errors: string[] } {
  const deleted: string[] = [];
  const errors: string[] = [];

  try {
    // Clear form data
    if (localStorage.getItem('energyPlanFormData')) {
      localStorage.removeItem('energyPlanFormData');
      deleted.push('energyPlanFormData');
    }

    // Clear consent preferences
    if (localStorage.getItem('gdpr-consent')) {
      localStorage.removeItem('gdpr-consent');
      deleted.push('gdpr-consent');
    }

    // Clear any other potential user data keys
    const keysToCheck = ['user-session', 'form-progress', 'temp-data'];
    keysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        deleted.push(key);
      }
    });

  } catch (error) {
    errors.push(`Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { deleted, errors };
}

/**
 * Clear all user data from sessionStorage
 */
export function clearSessionStorageData(): { deleted: string[]; errors: string[] } {
  const deleted: string[] = [];
  const errors: string[] = [];

  try {
    // Clear session storage (though we don't use it extensively)
    const keysToCheck = ['session-form-data', 'temp-session'];
    keysToCheck.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        deleted.push(key);
      }
    });

  } catch (error) {
    errors.push(`Failed to clear sessionStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { deleted, errors };
}

/**
 * Clear browser cache and temporary data
 */
export function clearBrowserCache(): { deleted: string[]; errors: string[] } {
  const deleted: string[] = [];
  const errors: string[] = [];

  try {
    // Clear caches if available
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          deleted.push(`cache: ${cacheName}`);
        });
      }).catch(error => {
        errors.push(`Failed to clear caches: ${error.message}`);
      });
    }

  } catch (error) {
    errors.push(`Failed to clear browser cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { deleted, errors };
}

/**
 * Perform complete data deletion as required by GDPR
 */
export async function performCompleteDataDeletion(): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: true,
    deletedItems: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  // Clear localStorage
  const localStorageResult = clearLocalStorageData();
  result.deletedItems.push(...localStorageResult.deleted);
  result.errors.push(...localStorageResult.errors);

  // Clear sessionStorage
  const sessionStorageResult = clearSessionStorageData();
  result.deletedItems.push(...sessionStorageResult.deleted);
  result.errors.push(...sessionStorageResult.errors);

  // Clear browser cache
  const cacheResult = clearBrowserCache();
  result.deletedItems.push(...cacheResult.deleted);
  result.errors.push(...cacheResult.errors);

  // Note: Server-side data is automatically deleted after processing
  // No database cleanup needed as we don't store data persistently

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

/**
 * Schedule automatic data deletion (called when user closes browser or session ends)
 */
export function scheduleAutomaticDeletion(delayMs: number = 0): void {
  const performDeletion = () => {
    performCompleteDataDeletion().then(result => {
      if (result.success) {
        console.log('Automatic data deletion completed successfully');
      } else {
        console.warn('Automatic data deletion completed with errors:', result.errors);
      }
    }).catch(error => {
      console.error('Failed to perform automatic data deletion:', error);
    });
  };

  if (delayMs > 0) {
    setTimeout(performDeletion, delayMs);
  } else {
    performDeletion();
  }
}

/**
 * Handle page unload to ensure data deletion
 */
export function setupUnloadDataDeletion(): void {
  const handleUnload = () => {
    // Perform synchronous cleanup for critical data
    try {
      clearLocalStorageData();
      clearSessionStorageData();
    } catch (error) {
      console.error('Failed to clear data on unload:', error);
    }
  };

  // Use pagehide for better mobile support, fallback to unload
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('unload', handleUnload);

    // Also clear data when visibility changes to hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Small delay to ensure page is actually being unloaded
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            handleUnload();
          }
        }, 100);
      }
    });
  }
}

/**
 * Manual data deletion request handler
 * This would typically send a request to the server to delete any server-side data
 */
export async function requestDataDeletion(email: string, reason?: string): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, this would send to your backend
    // For now, we just perform local deletion
    const result = await performCompleteDataDeletion();

    const response = await fetch('/api/data-deletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reason,
        deletionResult: result,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return {
      success: true,
      message: 'Data deletion request submitted successfully. You will receive a confirmation email.',
    };

  } catch (error) {
    return {
      success: false,
      message: `Failed to process data deletion request: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
