"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEdifyStore } from "@/lib/store";
import { curatedPlaces, CuratedPlaceScene } from "@/lib/curated-places";
import { fetchLiveWeather, LiveWeatherInfo } from "@/lib/weather-service";
import { getLocalTimeInfo } from "@/lib/time-engine";

export default function PhotorealisticBackdrop() {
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);

  const locId = activeLocation?.id || "global";
  const place = curatedPlaces[locId] || curatedPlaces.global;

  const [currentScene, setCurrentScene] = useState<CuratedPlaceScene>(place);
  const [prevScene, setPrevScene] = useState<CuratedPlaceScene | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [weather, setWeather] = useState<LiveWeatherInfo | null>(null);

  // Compute live local solar time
  const timeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );

  // Fetch live weather from Open-Meteo for active city
  useEffect(() => {
    let isMounted = true;
    if (activeLocation && activeLocation.lat && activeLocation.lng) {
      fetchLiveWeather(activeLocation.lat, activeLocation.lng).then((data) => {
        if (isMounted) setWeather(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [activeLocation?.lat, activeLocation?.lng]);

  // Dual-buffer smooth crossfade when destination changes
  useEffect(() => {
    if (place.id !== currentScene.id) {
      setPrevScene(currentScene);
      setCurrentScene(place);
      setIsCrossfading(true);

      const timer = setTimeout(() => {
        setIsCrossfading(false);
        setPrevScene(null);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [place, currentScene]);

  // Compute dynamic atmospheric overlay gradient based on Time of Day and Weather
  const atmosphericOverlay = useMemo(() => {
    const isRain = weather?.condition === "rain";
    const isFog = weather?.condition === "fog";

    switch (timeInfo.period) {
      case "dawn":
        return isRain
          ? "linear-gradient(180deg, rgba(20, 25, 45, 0.75) 0%, rgba(109, 74, 117, 0.55) 50%, rgba(18, 14, 33, 0.85) 100%)"
          : "linear-gradient(180deg, rgba(15, 22, 38, 0.55) 0%, rgba(109, 74, 117, 0.35) 50%, rgba(18, 14, 33, 0.75) 100%)";
      case "day":
        return isRain
          ? "linear-gradient(180deg, rgba(25, 45, 75, 0.65) 0%, rgba(40, 79, 128, 0.45) 50%, rgba(18, 14, 33, 0.8) 100%)"
          : "linear-gradient(180deg, rgba(20, 44, 82, 0.4) 0%, rgba(82, 127, 168, 0.25) 50%, rgba(18, 14, 33, 0.7) 100%)";
      case "night":
        return "linear-gradient(180deg, rgba(6, 8, 18, 0.82) 0%, rgba(12, 18, 36, 0.68) 50%, rgba(6, 8, 18, 0.92) 100%)";
      case "sunset":
      default:
        return isFog
          ? "linear-gradient(180deg, rgba(18, 14, 33, 0.7) 0%, rgba(110, 53, 87, 0.5) 50%, rgba(18, 14, 33, 0.88) 100%)"
          : "linear-gradient(180deg, rgba(18, 14, 33, 0.5) 0%, rgba(110, 53, 87, 0.3) 50%, rgba(18, 14, 33, 0.82) 100%)";
    }
  }, [timeInfo.period, weather?.condition]);

  if (isGlobeView) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Previous Buffer (Fades Out) */}
      {prevScene && isCrossfading && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${prevScene.photoUrl})`,
            opacity: 0,
            filter: "brightness(0.9) saturate(1.1)",
          }}
        />
      )}

      {/* 2. Current Buffer (Fades In) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${currentScene.photoUrl})`,
          opacity: 1,
          filter:
            timeInfo.period === "night"
              ? "brightness(0.65) saturate(0.85) contrast(1.1)"
              : "brightness(0.88) saturate(1.15)",
          transform: "scale(1.02)",
        }}
      />

      {/* 3. Live Time-of-Day & Weather Atmospheric Mood Overlay */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: atmosphericOverlay,
          backdropFilter: weather?.condition === "fog" ? "blur(4px)" : "blur(1px)",
        }}
      />

      {/* 4. Rain Mist Effect (If raining in that city) */}
      {weather?.condition === "rain" && (
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
      )}

      {/* 5. Subtle Photographer Credit Pill (Bottom Left) */}
      <div className="absolute bottom-3 left-4 pointer-events-auto z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white/60 hover:text-white/90 transition-opacity">
        <span>📷</span>
        <span>{currentScene.photographer}</span>
        <span>•</span>
        <span className="text-[#FDE68A]">{currentScene.name}</span>
      </div>
    </div>
  );
}
