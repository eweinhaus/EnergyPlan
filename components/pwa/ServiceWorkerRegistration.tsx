'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

export const ServiceWorkerRegistration: React.FC = () => {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
};

