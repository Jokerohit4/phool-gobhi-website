'use client';

import { useEffect } from 'react';
import { fetchAndStoreLocation } from '@/lib/geolocation';

// Fire-and-forget location grab at app boot, same as the apps' service-locator
// wiring — no UI, no permission-rationale copy, just a best-effort GPS fix so
// gym browse/detail requests can carry it. Renders nothing.
export default function LocationBootstrap() {
  useEffect(() => {
    fetchAndStoreLocation();
  }, []);

  return null;
}
