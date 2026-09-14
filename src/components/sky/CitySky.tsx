"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEdifyStore } from "@/lib/store";
import { CITY_PACKS, CityPack } from "@/lib/cityPacks";
import QuoteCloud from "./QuoteCloud";
import { Statement } from "@/lib/types";
import { getLocalTimeInfo } from "@/lib/time-engine";
import { fetchLiveWeather, LiveWeatherInfo } from "@/lib/weather-service";

interface CloudInstance {
  id: string;
  statement: Statement;
  depth: number; // 0 = passing camera, 1 = distant horizon
  x: number;
  y: number;
}

function seedCityClouds(statements: Statement[]): CloudInstance[] {
  if (statements.length === 0) return [];
  const count = Math.min(statements.length, 7);
  return statements.slice(0, count).map((stmt, i) => ({
    id: `${stmt.id}-${i}-${Math.random().toString(36).substring(7)}`,
    statement: stmt,
    depth: 0.25 + (i / count) * 0.65,
    x: 0.18 + ((i * 0.38) % 0.64),
    y: 0.22 + ((i * 0.28) % 0.44),
  }));
}

export default function CitySky() {
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);
  const isFlightMode = useEdifyStore((s) => s.isFlightMode);
  const statements = useEdifyStore((s) => s.statements);
  const selectedStatementId = useEdifyStore((s) => s.selectedStatementId);
  const selectStatement = useEdifyStore((s) => s.selectStatement);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);

  const cityName = activeLocation?.name || "San Francisco";
  const pack: CityPack = CITY_PACKS[cityName] || CITY_PACKS["San Francisco"];

  // Compute live local solar time and weather
  const timeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );
  const [weather, setWeather] = useState<LiveWeatherInfo | null>(null);

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

  // 1. Filter statements strictly for this active city in Flight mode
  const cityStatements = useMemo(() => {
    if (!activeLocation || activeLocation.continent === "Global" || activeLocation.id === "world") {
      return statements;
    }
    const filtered = statements.filter((s) => {
      return (
        s.cityName?.toLowerCase() === activeLocation.name.toLowerCase() ||
        s.countryName?.toLowerCase() === activeLocation.country.toLowerCase() ||
        s.regionName?.toLowerCase().includes(activeLocation.continent.toLowerCase()) ||
        s.geoPath?.toLowerCase().includes(activeLocation.continent.toLowerCase())
      );
    });
    // Fallback if city has few quotes
    return filtered.length > 0 ? filtered : statements.slice(0, 8);
  }, [statements, activeLocation]);

  // 2. Depth-tracked flying cloud field
  const [clouds, setClouds] = useState<CloudInstance[]>(() => seedCityClouds(cityStatements));
  const [whiteout, setWhiteout] = useState(0);
  const prevCity = useRef(cityName);
  const pointerParallax = useRef({ x: 0, y: 0 });
  const userThrust = useRef(0); // Additional speed from wheel / drag
  const cameraPan = useRef({ x: 0, y: 0 }); // Camera pan offset from drag
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 3. Fog Whiteout transition when switching cities
  useEffect(() => {
    if (prevCity.current === cityName) {
      setClouds(seedCityClouds(cityStatements));
      return;
    }

    setWhiteout(1);
    const timer = setTimeout(() => {
      prevCity.current = cityName;
      setClouds(seedCityClouds(cityStatements));
      setWhiteout(0);
    }, 450);

    return () => clearTimeout(timer);
  }, [cityName, cityStatements]);

  // 4. Interactive User Flight Controls (Scroll Wheel & Touch / Mouse Drag)
  useEffect(() => {
    if (isGlobeView) return;

    // Mouse Wheel / Trackpad Pinch Flight Thrust
    const handleWheel = (e: WheelEvent) => {
      // Scroll down = accelerate forward, scroll up = fly backward
      userThrust.current += e.deltaY * 0.0012;
      userThrust.current = Math.max(-0.4, Math.min(0.6, userThrust.current));
    };

    // Pointer / Touch Drag Start
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStart.current = { x: clientX, y: clientY };
    };

    // Pointer / Touch Drag Move
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      // Mouse Parallax
      pointerParallax.current.x = (clientX / window.innerWidth - 0.5) * 24;
      pointerParallax.current.y = (clientY / window.innerHeight - 0.5) * 16;

      if (isDragging.current) {
        const deltaX = clientX - dragStart.current.x;
        const deltaY = clientY - dragStart.current.y;

        // Pan horizontally and vertically to look around the sky
        cameraPan.current.x = Math.max(-40, Math.min(40, cameraPan.current.x + deltaX * 0.04));
        cameraPan.current.y = Math.max(-25, Math.min(25, cameraPan.current.y + deltaY * 0.04));

        // Vertical drag also adds flight thrust
        userThrust.current += -deltaY * 0.0008;
        userThrust.current = Math.max(-0.4, Math.min(0.6, userThrust.current));

        dragStart.current = { x: clientX, y: clientY };
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isGlobeView]);

  // 5. Real-time continuous flight animation loop with user momentum
  useEffect(() => {
    if (!isFlightMode || isGlobeView) return;
    let raf: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Base serene forward speed + user thrust momentum
      const currentSpeed = 0.04 + userThrust.current;
      // Smooth deceleration on user thrust
      userThrust.current *= 0.94;

      setClouds((prev) =>
        prev.map((c, i) => {
          let depth = c.depth - currentSpeed * dt;

          // Forward recycling (blows past camera)
          if (depth < -0.06) {
            const nextStmt = cityStatements[(i + 1) % Math.max(cityStatements.length, 1)];
            return {
              id: `${nextStmt?.id || "c"}-${Date.now()}-${i}`,
              statement: nextStmt || c.statement,
              depth: 0.98,
              x: 0.12 + Math.random() * 0.76,
              y: 0.18 + Math.random() * 0.42,
            };
          }

          // Reverse recycling (when flying backward)
          if (depth > 1.05) {
            const prevStmt = cityStatements[(i - 1 + cityStatements.length) % Math.max(cityStatements.length, 1)];
            return {
              id: `${prevStmt?.id || "c"}-${Date.now()}-${i}`,
              statement: prevStmt || c.statement,
              depth: 0.05,
              x: 0.12 + Math.random() * 0.76,
              y: 0.18 + Math.random() * 0.42,
            };
          }

          return { ...c, depth };
        })
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isFlightMode, isGlobeView, cityStatements]);

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sync pan & parallax to state at RAF rate for silky smooth 60fps tracking
  useEffect(() => {
    let animId: number;
    const syncPan = () => {
      setPanOffset({
        x: cameraPan.current.x + pointerParallax.current.x,
        y: cameraPan.current.y + pointerParallax.current.y,
      });
      animId = requestAnimationFrame(syncPan);
    };
    animId = requestAnimationFrame(syncPan);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (isGlobeView) return null;

  const currentGrade = pack.grade[timeInfo.period] || pack.grade.sunset;

  return (
    <div
      onPointerDown={() => setHasInteracted(true)}
      onWheel={() => setHasInteracted(true)}
      className="fixed inset-0 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ perspective: "900px", zIndex: 0 }}
    >
      {/* Plane 1: Far Layer (Distant sky + coastal hills / fog bank, subtle blur & slow drift) */}
      <div
        className="absolute inset-[-40px] bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${pack.far})`,
          transform: `scale(1.1) translate3d(${panOffset.x * 0.3}px, ${panOffset.y * 0.3}px, 0)`,
          filter: timeInfo.period === "night" ? "brightness(0.65) saturate(0.85) blur(5px)" : "brightness(0.85) saturate(1.1) blur(5px)",
          transition: "filter 0.7s ease",
          willChange: "transform",
        }}
      />

      {/* Plane 2: Mid Layer (Iconic landmark vista at 40% opacity, masked to dissolve into horizon fog) */}
      <div
        className="absolute inset-[-20px] bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${pack.mid})`,
          opacity: 0.42,
          filter: "blur(1.5px)",
          transform: `translate3d(${panOffset.x * 0.65}px, ${panOffset.y * 0.65}px, 0)`,
          maskImage: "linear-gradient(180deg, transparent 0%, #000 24%, #000 64%, transparent 84%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 24%, #000 64%, transparent 84%)",
          transition: "opacity 0.7s ease",
          willChange: "transform",
        }}
      />

      {/* Plane 3: Grade Layer (Time of Day & Weather atmospheric grade) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: currentGrade,
          backdropFilter: weather?.condition === "fog" ? "blur(3px)" : "none",
        }}
      />

      {/* Plane 4: The 3D Cloud Field with depth-tracked continuous flight & pan steering */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate3d(${panOffset.x * 0.9}px, ${panOffset.y * 0.9}px, 0)`,
          willChange: "transform",
        }}
      >
        {clouds.map((c) => (
          <QuoteCloud
            key={c.id}
            statement={c.statement}
            depth={c.depth}
            x={c.x}
            y={c.y}
            isSelected={selectedStatementId === c.statement.id}
            onSelect={(id) => selectStatement(id)}
          />
        ))}
      </div>

      {/* Plane 5: Near Layer (Blurred ambient mist wisps that wipe across the lens) */}
      <div
        className="absolute -bottom-10 left-0 right-0 h-48 pointer-events-none opacity-45"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 50%, transparent 80%)",
          filter: "blur(24px)",
          transform: `translate3d(${panOffset.x * 1.2}px, ${panOffset.y * 1.2}px, 0)`,
        }}
      />

      {/* Plane 6: Fog Whiteout Layer (Smooth cloud-dive transition when changing cities) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-in-out"
        style={{
          opacity: whiteout,
          background: pack.fog,
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Subtle Flight Controls Navigation Hint (fades out after interaction) */}
      {!hasInteracted && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-pulse">
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] text-[#FDE68A] tracking-wider uppercase flex items-center gap-2">
            <span>✨ Scroll or swipe up/down to fly</span>
            <span className="opacity-40">•</span>
            <span>Drag to steer</span>
          </div>
        </div>
      )}
    </div>
  );
}
