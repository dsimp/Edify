export type TimeOfDay = "dawn" | "day" | "sunset" | "night";

export interface TimeAtmosphere {
  period: TimeOfDay;
  label: string;
  icon: string;
  topSky: string;
  duskSky: string;
  roseSky: string;
  coralSky: string;
  goldenHourSky: string;
  sunColor: string;
  sunElevation: number;
  deepWater: string;
  shallowWater: string;
  waterGlow: string;
  droneFrequency: number;
}

/**
 * Calculates the local time and solar period for a given longitude or timezone offset
 */
export function getLocalTimeInfo(lng: number, overrideTime?: TimeOfDay): {
  localTimeString: string;
  period: TimeOfDay;
  periodLabel: string;
  periodIcon: string;
  solarAngle: number; // 0 to 360 degrees
} {
  const now = new Date();
  // UTC time in fractional hours
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  
  // Approximate local solar time using longitude (15 degrees per hour)
  const timezoneOffsetHours = lng / 15;
  let localHour = (utcHours + timezoneOffsetHours + 24) % 24;

  const hoursInt = Math.floor(localHour);
  const minutesInt = Math.floor((localHour - hoursInt) * 60);
  const periodStr = hoursInt >= 12 ? "PM" : "AM";
  const displayHour = hoursInt % 12 === 0 ? 12 : hoursInt % 12;
  const displayMin = minutesInt < 10 ? `0${minutesInt}` : minutesInt;
  const timeString = `${displayHour}:${displayMin} ${periodStr}`;

  let naturalPeriod: TimeOfDay = "sunset";
  if (localHour >= 5 && localHour < 8) {
    naturalPeriod = "dawn";
  } else if (localHour >= 8 && localHour < 17) {
    naturalPeriod = "day";
  } else if (localHour >= 17 && localHour < 20) {
    naturalPeriod = "sunset";
  } else {
    naturalPeriod = "night";
  }

  const finalPeriod = overrideTime || naturalPeriod;

  const meta: Record<TimeOfDay, { label: string; icon: string }> = {
    dawn: { label: "Dawn Awakening", icon: "🌅" },
    day: { label: "Radiant Daylight", icon: "☀️" },
    sunset: { label: "Golden Twilight", icon: "🌇" },
    night: { label: "Cosmic Midnight", icon: "🌙" },
  };

  return {
    localTimeString: timeString,
    period: finalPeriod,
    periodLabel: meta[finalPeriod].label,
    periodIcon: meta[finalPeriod].icon,
    solarAngle: (localHour / 24) * 360,
  };
}

/**
 * Dynamic Atmospheric settings for each Time of Day
 */
export const timeAtmospheres: Record<TimeOfDay, TimeAtmosphere> = {
  dawn: {
    period: "dawn",
    label: "Dawn Awakening",
    icon: "🌅",
    topSky: "#0f1626",
    duskSky: "#232644",
    roseSky: "#6d4a75",
    coralSky: "#bd7686",
    goldenHourSky: "#f2b680",
    sunColor: "#ffe8c2",
    sunElevation: 12,
    deepWater: "#09172e",
    shallowWater: "#17365c",
    waterGlow: "#f2b680",
    droneFrequency: 528, // 528Hz Solfeggio for morning renewal
  },
  day: {
    period: "day",
    label: "Radiant Daylight",
    icon: "☀️",
    topSky: "#142c52",
    duskSky: "#284f80",
    roseSky: "#527fa8",
    coralSky: "#8eb6cf",
    goldenHourSky: "#d4e6f2",
    sunColor: "#fff8e7",
    sunElevation: 65,
    deepWater: "#0c2445",
    shallowWater: "#1d5282",
    waterGlow: "#d4e6f2",
    droneFrequency: 639, // 639Hz Solfeggio for connection & vitality
  },
  sunset: {
    period: "sunset",
    label: "Golden Twilight",
    icon: "🌇",
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
    droneFrequency: 432, // 432Hz Solfeggio for serenity
  },
  night: {
    period: "night",
    label: "Cosmic Midnight",
    icon: "🌙",
    topSky: "#060812",
    duskSky: "#0c1224",
    roseSky: "#182038",
    coralSky: "#243254",
    goldenHourSky: "#394d75",
    sunColor: "#d9e8ff", // Silver moonlight
    sunElevation: -25, // Moon / below horizon
    deepWater: "#040914",
    shallowWater: "#0c192e",
    waterGlow: "#93c5fd",
    droneFrequency: 396, // 396Hz Solfeggio for deep tranquility
  },
};
