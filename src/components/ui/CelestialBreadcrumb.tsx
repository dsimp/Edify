"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useEdifyStore } from "@/lib/store";
import { globalLocations, GeoLocationItem } from "@/lib/geo-presets";
import { getLocalTimeInfo, TimeOfDay } from "@/lib/time-engine";
import { fetchLiveWeather, LiveWeatherInfo } from "@/lib/weather-service";

export default function CelestialBreadcrumb() {
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);
  const toggleGlobeView = useEdifyStore((s) => s.toggleGlobeView);
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const swoopToLocation = useEdifyStore((s) => s.swoopToLocation);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);
  const setTimeOfDayOverride = useEdifyStore((s) => s.setTimeOfDayOverride);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [weather, setWeather] = useState<LiveWeatherInfo | null>(null);

  const continents = ["Global", "Americas", "Europe", "Asia", "Africa", "Oceania"] as const;
  const [selectedContinent, setSelectedContinent] = useState<string>("Global");

  const filteredLocations = selectedContinent === "Global"
    ? globalLocations
    : globalLocations.filter((l) => l.continent === selectedContinent);

  // Fetch live weather
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

  // Compute live local solar time for active location
  const timeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );

  const timeOptions: { id: TimeOfDay | null; label: string; icon: string }[] = [
    { id: null, label: "Live Solar Time", icon: "⚡" },
    { id: "dawn", label: "Dawn", icon: "🌅" },
    { id: "day", label: "Daylight", icon: "☀️" },
    { id: "sunset", label: "Twilight", icon: "🌇" },
    { id: "night", label: "Midnight", icon: "🌙" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* 1. Main Floating Thumb Pill */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto"
        style={{
          background: "rgba(18, 14, 33, 0.86)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border: "1px solid rgba(244, 162, 97, 0.35)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(244, 162, 97, 0.15)",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
      >
        {/* Globe Orbit Toggle Button */}
        <button
          onClick={toggleGlobeView}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: isGlobeView
              ? "linear-gradient(135deg, #F4A261, #FDE68A)"
              : "rgba(255, 255, 255, 0.08)",
            color: isGlobeView ? "#120E21" : "#FFFDF9",
            fontWeight: 700,
            fontSize: "12px",
          }}
          title={isGlobeView ? "Swoop down to Local Sky" : "Enter 3D Space Orbit"}
        >
          <span className="text-sm">{isGlobeView ? "🌅" : "🌍"}</span>
          <span>{isGlobeView ? "Sky View" : "3D Orbit"}</span>
        </button>

        {/* Active Location Trigger Pill */}
        <button
          onClick={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setIsTimeMenuOpen(false);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full cursor-pointer transition-colors hover:bg-white/10"
        >
          <span className="text-xs text-[#FDE68A]">📍</span>
          <span className="text-xs font-semibold text-[#FFFDF9] truncate max-w-[120px] sm:max-w-[180px]">
            {activeLocation?.name || "Global Horizon"}
          </span>
          <span className="text-[10px] text-[#E2D9F3]/60">
            {isDrawerOpen ? "▲" : "▼"}
          </span>
        </button>

        {/* Live Local Time & Weather Badge / Selector */}
        {!isGlobeView && (
          <button
            onClick={() => {
              setIsTimeMenuOpen(!isTimeMenuOpen);
              setIsDrawerOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer transition-all hover:bg-white/10 text-xs font-medium text-[#FDE68A] border-l border-white/10 pl-2.5"
            title="Change Time of Day or View Live Weather & Solar Time"
          >
            <span>{weather?.conditionIcon || timeInfo.periodIcon}</span>
            <span suppressHydrationWarning className="text-[11px] text-[#FFFDF9]/90 hidden sm:inline">
              {timeInfo.localTimeString}
              {weather ? ` • ${weather.tempC}°C` : ""}
            </span>
          </button>
        )}
      </div>

      {/* 2. Time-of-Day Selector Menu */}
      {isTimeMenuOpen && !isGlobeView && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 p-3 rounded-2xl z-50 pointer-events-auto overflow-hidden animate-slide-in-up flex gap-1.5"
          style={{
            background: "rgba(18, 14, 33, 0.94)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(244, 162, 97, 0.4)",
            boxShadow: "0 15px 40px rgba(0, 0, 0, 0.7)",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}
        >
          {timeOptions.map((opt) => {
            const isActive = timeOfDayOverride === opt.id;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setTimeOfDayOverride(opt.id);
                  setIsTimeMenuOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all hover:scale-105"
                style={{
                  background: isActive ? "linear-gradient(135deg, #F4A261, #FDE68A)" : "rgba(255, 255, 255, 0.06)",
                  color: isActive ? "#120E21" : "#E2D9F3",
                }}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Location Switcher Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-[420px] p-4 rounded-3xl z-50 pointer-events-auto overflow-hidden animate-slide-in-up"
          style={{
            background: "rgba(18, 14, 33, 0.94)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(244, 162, 97, 0.35)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(244, 162, 97, 0.2)",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <span className="text-xs font-bold text-[#FDE68A] uppercase tracking-wider">
              Explore Earth Horizons
            </span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-[#E2D9F3] hover:text-white text-xs px-2 py-1 bg-white/10 rounded-full cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Continent Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {continents.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all"
                style={{
                  background: selectedContinent === c ? "rgba(244, 162, 97, 0.3)" : "rgba(255, 255, 255, 0.05)",
                  color: selectedContinent === c ? "#FDE68A" : "#E2D9F3",
                  border: selectedContinent === c ? "1px solid rgba(253, 230, 138, 0.5)" : "1px solid transparent",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Location Grid List */}
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = activeLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    swoopToLocation(loc);
                    setIsDrawerOpen(false);
                  }}
                  className="flex flex-col text-left p-2.5 rounded-2xl cursor-pointer transition-all hover:scale-102"
                  style={{
                    background: isSelected ? "rgba(244, 162, 97, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    border: isSelected ? "1px solid rgba(253, 230, 138, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span className="text-xs font-bold text-[#FFFDF9] truncate">
                    {loc.name}
                  </span>
                  <span className="text-[10px] text-[#E2D9F3]/70 truncate">
                    {loc.country}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


