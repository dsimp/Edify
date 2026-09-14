export interface AtmospherePreset {
  name: string;
  region: string;
  topSky: string;
  duskSky: string;
  roseSky: string;
  coralSky: string;
  goldenHourSky: string;
  sunColor: string;
  sunElevation: number; // Y position
  deepWater: string;
  shallowWater: string;
  waterGlow: string;
  soundDroneFreq: number; // Hz for 432Hz Solfeggio tuning
  tagline: string;
}

export interface GeoLocationItem {
  id: string;
  name: string;
  country: string;
  continent: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Global';
  lat: number;
  lng: number;
  atmosphere: AtmospherePreset;
}

export const atmosphericPresets: Record<string, AtmospherePreset> = {
  global: {
    name: "World Horizon",
    region: "Global Earth",
    topSky: "#120E21",
    duskSky: "#2A1C40",
    roseSky: "#6E3557",
    coralSky: "#B8533E",
    goldenHourSky: "#DE8A42",
    sunColor: "#FFE0A3",
    sunElevation: 18,
    deepWater: "#0c1b33",
    shallowWater: "#183359",
    waterGlow: "#F4A261",
    soundDroneFreq: 432,
    tagline: "The collective sky of human ideas and world wisdom.",
  },
  asia: {
    name: "Asia Horizon",
    region: "Asia",
    topSky: "#0f1124",
    duskSky: "#271b38",
    roseSky: "#703a5e",
    coralSky: "#c45d47",
    goldenHourSky: "#e69450",
    sunColor: "#ffe7b8",
    sunElevation: 22,
    deepWater: "#08182b",
    shallowWater: "#193c66",
    waterGlow: "#f5a35d",
    soundDroneFreq: 528, // 528 Hz transformation
    tagline: "Dawn mist over calm Eastern waters and ancient temples.",
  },
  americas: {
    name: "Americas Horizon",
    region: "Americas",
    topSky: "#0d1527",
    duskSky: "#1c2a47",
    roseSky: "#524368",
    coralSky: "#a6524b",
    goldenHourSky: "#d97e41",
    sunColor: "#fcd692",
    sunElevation: 16,
    deepWater: "#0b1b36",
    shallowWater: "#173a6e",
    waterGlow: "#e8924b",
    soundDroneFreq: 480,
    tagline: "Pacific coastal golden hour and expansive horizons.",
  },
  europe: {
    name: "Europe Horizon",
    region: "Europe",
    topSky: "#140f26",
    duskSky: "#301d4a",
    roseSky: "#7d3c69",
    coralSky: "#b54e52",
    goldenHourSky: "#d4814c",
    sunColor: "#ffd69e",
    sunElevation: 19,
    deepWater: "#0e1a33",
    shallowWater: "#20345e",
    waterGlow: "#f29b5c",
    soundDroneFreq: 396,
    tagline: "Velvety twilight over historic squares and timeless seas.",
  },
  africa: {
    name: "Africa Horizon",
    region: "Africa",
    topSky: "#170c1e",
    duskSky: "#3d182b",
    roseSky: "#873236",
    coralSky: "#c94c2c",
    goldenHourSky: "#eb8528",
    sunColor: "#ffd175",
    sunElevation: 14,
    deepWater: "#14152e",
    shallowWater: "#26234f",
    waterGlow: "#f08324",
    soundDroneFreq: 432,
    tagline: "Warm Sahara and savannah dusk glowing across the continent.",
  },
  oceania: {
    name: "Oceania Horizon",
    region: "Oceania",
    topSky: "#0a192f",
    duskSky: "#182c47",
    roseSky: "#3f5470",
    coralSky: "#8a6669",
    goldenHourSky: "#cca062",
    sunColor: "#fff0bf",
    sunElevation: 25,
    deepWater: "#06233d",
    shallowWater: "#104f7a",
    waterGlow: "#d9b36c",
    soundDroneFreq: 639,
    tagline: "Aquamarine twilight and endless southern ocean serenity.",
  },
};

export const globalLocations: GeoLocationItem[] = [
  {
    id: "world",
    name: "Global Horizon",
    country: "Worldwide",
    continent: "Global",
    lat: 0,
    lng: 0,
    atmosphere: atmosphericPresets.global,
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    country: "United States",
    continent: "Americas",
    lat: 37.7749,
    lng: -122.4194,
    atmosphere: atmosphericPresets.americas,
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    continent: "Americas",
    lat: 40.7128,
    lng: -74.006,
    atmosphere: atmosphericPresets.americas,
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    continent: "Americas",
    lat: -23.5505,
    lng: -46.6333,
    atmosphere: atmosphericPresets.americas,
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    continent: "Europe",
    lat: 51.5074,
    lng: -0.1278,
    atmosphere: atmosphericPresets.europe,
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    continent: "Europe",
    lat: 48.8566,
    lng: 2.3522,
    atmosphere: atmosphericPresets.europe,
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    continent: "Europe",
    lat: 52.52,
    lng: 13.405,
    atmosphere: atmosphericPresets.europe,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    lat: 35.6762,
    lng: 139.6503,
    atmosphere: atmosphericPresets.asia,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    lat: 35.0116,
    lng: 135.7681,
    atmosphere: atmosphericPresets.asia,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    continent: "Asia",
    lat: 19.076,
    lng: 72.8777,
    atmosphere: atmosphericPresets.asia,
  },
  {
    id: "lagos",
    name: "Lagos",
    country: "Nigeria",
    continent: "Africa",
    lat: 6.5244,
    lng: 3.3792,
    atmosphere: atmosphericPresets.africa,
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    continent: "Africa",
    lat: 30.0444,
    lng: 31.2357,
    atmosphere: atmosphericPresets.africa,
  },
  {
    id: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    continent: "Africa",
    lat: -1.2921,
    lng: 36.8219,
    atmosphere: atmosphericPresets.africa,
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    continent: "Oceania",
    lat: -33.8688,
    lng: 151.2093,
    atmosphere: atmosphericPresets.oceania,
  },
];

/**
 * Converts Latitude/Longitude to 3D Cartesian coordinates on a sphere of radius R
 */
export function latLngToVector3(lat: number, lng: number, radius = 10): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}
