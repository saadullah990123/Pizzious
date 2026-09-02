'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Detects lost/restored connectivity anywhere in the app and shows a fixed banner.
 * Does not block rendering — pages that are already loaded (e.g. a filled-in
 * checkout form) stay exactly as they are; only new network requests will fail
 * while offline, and components that submit data (CheckoutModal) check
 * `navigator.onLine` themselves before submitting so in-progress form input is
 * never lost.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' && !navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-neutral-900 text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
      <WifiOff className="w-4 h-4 text-brand-flame shrink-0" />
      <span>You&rsquo;re offline. Anything you&rsquo;ve typed is safe, but it can&rsquo;t be submitted until your connection is back.</span>
    </div>
  );
};
