import type { Place } from "./types";

/**
 * City hubs. Statements are allocated to the nearest hub to the author —
 * coarse on purpose, so nobody's exact location is ever published.
 */
export const PLACES: Place[] = [
  { id: "san-francisco", name: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { id: "los-angeles", name: "Los Angeles", country: "United States", lat: 34.0522, lng: -118.2437 },
  { id: "chicago", name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298 },
  { id: "new-york", name: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { id: "toronto", name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { id: "mexico-city", name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { id: "bogota", name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721 },
  { id: "sao-paulo", name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { id: "buenos-aires", name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { id: "reykjavik", name: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426 },
  { id: "london", name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { id: "paris", name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { id: "berlin", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { id: "istanbul", name: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784 },
  { id: "cairo", name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { id: "lagos", name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
  { id: "nairobi", name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { id: "mumbai", name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { id: "singapore", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "seoul", name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { id: "sydney", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
];

export const PLACE_BY_ID: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));

/** Lat/lng → point on a sphere. Matches three.js SphereGeometry UV layout. */
export function latLngToVector3(lat: number, lng: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

/** Great-circle distance in km. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestPlace(lat: number, lng: number): Place {
  let best = PLACES[0];
  let bestD = Infinity;
  for (const p of PLACES) {
    const d = distanceKm(lat, lng, p.lat, p.lng);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function formatCoords(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}  ${Math.abs(lng).toFixed(2)}°${ew}`;
}
