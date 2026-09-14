export type WeatherCondition = "clear" | "clouds" | "rain" | "fog" | "snow" | "thunder";

export interface LiveWeatherInfo {
  tempC: number;
  tempF: number;
  condition: WeatherCondition;
  conditionLabel: string;
  conditionIcon: string;
  windSpeedKmh: number;
}

// In-memory 15-minute weather cache
const weatherCache = new Map<string, { data: LiveWeatherInfo; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function parseWmoWeatherCode(code: number): { condition: WeatherCondition; label: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { condition: "clear", label: "Clear Skies", icon: "☀️" };
  if (code === 1 || code === 2) return { condition: "clouds", label: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { condition: "clouds", label: "Overcast", icon: "☁️" };
  if (code >= 45 && code <= 48) return { condition: "fog", label: "Atmospheric Fog", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { condition: "rain", label: "Light Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 65) return { condition: "rain", label: "Gentle Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "snow", label: "Peaceful Snow", icon: "🌨️" };
  if (code >= 80 && code <= 82) return { condition: "rain", label: "Passing Showers", icon: "🌧️" };
  if (code >= 95) return { condition: "thunder", label: "Distant Thunder", icon: "⛈️" };
  return { condition: "clear", label: "Tranquil Air", icon: "✨" };
}

export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeatherInfo> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const json = await res.json();
    const current = json.current_weather;

    const tempC = Math.round(current.temperature);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const { condition, label, icon } = parseWmoWeatherCode(current.weathercode);

    const weatherData: LiveWeatherInfo = {
      tempC,
      tempF,
      condition,
      conditionLabel: label,
      conditionIcon: icon,
      windSpeedKmh: Math.round(current.windspeed),
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  } catch (err) {
    // Elegant fallback if offline
    return {
      tempC: 21,
      tempF: 70,
      condition: "clear",
      conditionLabel: "Tranquil Air",
      conditionIcon: "🌅",
      windSpeedKmh: 8,
    };
  }
}
