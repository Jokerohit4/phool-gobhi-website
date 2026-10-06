// Client-only in-memory holder for the visitor's last-known GPS fix.
// Mirrors LocationHolder in the customer/partner Flutter apps — a plain
// module-level store that a fire-and-forget geolocation grab writes to and
// outgoing fetches read from, no React state/context involved.
let lat: number | null = null;
let lng: number | null = null;
let outcome: 'granted' | 'denied' | 'unsupported' | 'timeout' | 'error' | null = null;

export const locationHolder = {
  get lat() {
    return lat;
  },
  get lng() {
    return lng;
  },
  get outcome() {
    return outcome;
  },
  get hasFix() {
    return lat !== null && lng !== null;
  },
  update(latitude: number, longitude: number) {
    lat = latitude;
    lng = longitude;
  },
  setOutcome(value: typeof outcome) {
    outcome = value;
  },
  clear() {
    lat = null;
    lng = null;
    outcome = null;
  },
};

// Spread into a fetch() headers object; omits both headers if no fix yet.
export function locationHeaders(): Record<string, string> {
  if (lat === null || lng === null) return {};
  return { 'x-user-lat': String(lat), 'x-user-lng': String(lng) };
}