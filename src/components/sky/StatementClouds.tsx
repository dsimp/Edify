"use client";

import React, { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";
import { Statement } from "@/lib/types";
import { getLocalTimeInfo } from "@/lib/time-engine";

interface CloudPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
}

function calculateCloudPositions(count: number): CloudPosition[] {
  const positions: CloudPosition[] = [];

  for (let rank = 0; rank < count; rank++) {
    if (rank === 0) {
      // Top Resonant Thought — Center stage in immediate field of view
      positions.push({ x: 0, y: 1.0, z: -26, scale: 1.2 });
    } else if (rank <= 6) {
      // Celestial Tier 1 Arc
      const angle = ((rank - 1) / 5) * Math.PI * 0.7 - Math.PI * 0.35;
      const radius = 14 + rank * 1.6;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * 2.2 - 0.4 + (rank % 2 === 0 ? 2.2 : -1.6);
      const z = -36 - rank * 6.5;
      const scale = Math.max(0.85, 1.05 - rank * 0.035);
      positions.push({ x, y, z, scale });
    } else {
      // Horizon cluster in natural line of sight
      const row = Math.floor((rank - 7) / 4);
      const col = (rank - 7) % 4;
      const spreadX = (col - 1.5) * 15;
      const spreadY = (Math.sin(rank * 1.3)) * 3.5 + 1.2;
      const z = -64 - row * 12;
      const scale = Math.max(0.75, 0.85 - row * 0.04);
      positions.push({ x: spreadX, y: spreadY, z, scale });
    }
  }

  return positions;
}

/**
 * Photorealistic 3-Layer SVG Displacement Cumulus Cloud
 * Uses the exact feTurbulence + feDisplacementMap filter engine.
 * The source ovals are safely clipped outside an overflow-hidden wrapper,
 * leaving only the realistic, puffy, volumetric cumulus box-shadow fluff!
 */
function RealisticCumulusCloud({
  width = 460,
  height = 190,
  seed = 12,
  isSelected = false,
  isHovered = false,
  period = "sunset",
  children,
}: {
  width: number;
  height: number;
  seed: number;
  isSelected?: boolean;
  isHovered?: boolean;
  period?: string;
  children: React.ReactNode;
}) {
  const id = `cumulus-${seed}`;

  // Time-of-day shadow colors
  const shadowColors = useMemo(() => {
    switch (period) {
      case "dawn":
        return {
          back: isSelected ? "rgba(215, 160, 180, 0.75)" : "rgba(205, 185, 215, 0.65)",
          mid: isSelected ? "rgba(255, 240, 230, 0.95)" : "rgba(245, 235, 248, 0.90)",
          front: "rgba(255, 252, 248, 0.98)",
          glow: isSelected ? "0 0 50px rgba(254, 230, 150, 0.55)" : "none",
        };
      case "day":
        return {
          back: isSelected ? "rgba(160, 195, 225, 0.7)" : "rgba(185, 210, 235, 0.6)",
          mid: isSelected ? "rgba(245, 250, 255, 0.96)" : "rgba(238, 245, 252, 0.92)",
          front: "rgba(255, 255, 255, 0.99)",
          glow: isSelected ? "0 0 55px rgba(255, 255, 255, 0.65)" : "none",
        };
      case "night":
        return {
          back: isSelected ? "rgba(45, 60, 95, 0.85)" : "rgba(24, 34, 56, 0.75)",
          mid: isSelected ? "rgba(155, 195, 245, 0.6)" : "rgba(130, 155, 195, 0.5)",
          front: isSelected ? "rgba(220, 235, 255, 0.85)" : "rgba(190, 210, 240, 0.75)",
          glow: isSelected ? "0 0 60px rgba(147, 197, 253, 0.5)" : "none",
        };
      case "sunset":
      default:
        return {
          back: isSelected ? "rgba(235, 155, 95, 0.75)" : "rgba(215, 190, 215, 0.65)",
          mid: isSelected ? "rgba(255, 238, 205, 0.96)" : "rgba(252, 242, 232, 0.92)",
          front: "rgba(255, 254, 245, 0.98)",
          glow: isSelected ? "0 0 55px rgba(254, 230, 150, 0.6)" : "none",
        };
    }
  }, [period, isSelected]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isHovered || isSelected ? "translateY(-6px) scale(1.03)" : "none",
        filter: shadowColors.glow,
      }}
    >
      {/* SVG Turbulence & Displacement Warp Filters */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={`${id}-back`} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011"
              numOctaves="4"
              seed={seed}
            />
            <feDisplacementMap in="SourceGraphic" scale="140" />
          </filter>

          <filter id={`${id}-mid`} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="3"
              seed={seed + 7}
            />
            <feDisplacementMap in="SourceGraphic" scale="115" />
          </filter>

          <filter id={`${id}-front`} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.013"
              numOctaves="3"
              seed={seed + 19}
            />
            <feDisplacementMap in="SourceGraphic" scale="80" />
          </filter>
        </defs>
      </svg>

      {/* 
        CLIPPED CUMULUS CONTAINER:
        Using overflow: hidden so the offset source ovals at left: -260px 
        are completely clipped and invisible, projecting ONLY the realistic fluffy shadows!
      */}
      <div
        style={{
          position: "absolute",
          inset: "-40px -60px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Layer 1: Back Underside Shadow */}
        <div
          style={{
            position: "absolute",
            width: width * 0.72,
            height: height * 0.55,
            left: -width * 0.58,
            top: -height * 0.75,
            borderRadius: "50%",
            background: "#111",
            filter: `url(#${id}-back)`,
            boxShadow: `${width * 0.68}px ${height * 0.95}px 32px 20px ${shadowColors.back}`,
          }}
        />

        {/* Layer 2: Mid Cloud Body Volume */}
        <div
          style={{
            position: "absolute",
            width: width * 0.78,
            height: height * 0.58,
            left: -width * 0.54,
            top: -height * 0.85,
            borderRadius: "50%",
            background: "#111",
            filter: `url(#${id}-mid)`,
            boxShadow: `${width * 0.64}px ${height * 0.95}px 24px 12px ${shadowColors.mid}`,
          }}
        />

        {/* Layer 3: Sunlit Front Highlight Crest */}
        <div
          style={{
            position: "absolute",
            width: width * 0.62,
            height: height * 0.48,
            left: -width * 0.48,
            top: -height * 0.92,
            borderRadius: "50%",
            background: "#000",
            filter: `url(#${id}-front)`,
            boxShadow: `${width * 0.60}px ${height * 0.98}px 18px 8px ${shadowColors.front}`,
          }}
        />
      </div>

      {/* Cloud Core: Statement Content Sanctum */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1.6rem 2.6rem",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CloudNode({
  statement,
  position,
  scale,
  rank,
}: {
  statement: Statement;
  position: [number, number, number];
  scale: number;
  rank: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectStatement = useEdifyStore((s) => s.selectStatement);
  const selectedId = useEdifyStore((s) => s.selectedStatementId);
  const recentAnte = useEdifyStore((s) => s.recentAnteAnimation);
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);

  const localTime = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );

  const isSelected = selectedId === statement.id;
  const isJustAnted = recentAnte?.statementId === statement.id && (Date.now() - recentAnte.timestamp < 2200);
  const isTopStatement = rank === 0;

  const width = isTopStatement ? 460 : 380;
  const height = isTopStatement ? 190 : 155;
  const seed = (rank * 11 + 13) % 97;

  // High-contrast readable typography against cloud fluff
  const textColor = localTime.period === "night" ? "#F5F3FF" : "#1A1528";
  const metaColor = localTime.period === "night" ? "rgba(226, 217, 243, 0.85)" : "rgba(75, 60, 95, 0.8)";

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        distanceFactor={12}
        style={{
          transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: `scale(${scale})`,
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        <div
          onClick={() => selectStatement(statement.id)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="cursor-pointer"
        >
          <RealisticCumulusCloud
            width={width}
            height={height}
            seed={seed}
            isSelected={isSelected}
            isHovered={hovered}
            period={localTime.period}
          >
            {/* 1. Category Badge & Uplift Pill */}
            <div className="flex items-center gap-1.5 mb-1.5 pointer-events-none">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: isSelected ? "rgba(244, 162, 97, 0.9)" : "rgba(244, 162, 97, 0.25)",
                  color: isSelected ? "#120E21" : "#D97359",
                  border: "1px solid rgba(244, 162, 97, 0.4)",
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}
              >
                ✦ {statement.geoPath.split(".").pop() || "Wisdom"}
              </span>

              {isTopStatement && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#86EFAC] bg-[#86EFAC]/20 border border-[#86EFAC]/40 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  Most Resonant
                </span>
              )}
            </div>

            {/* 2. Statement Thought Body in Fraunces Serif */}
            <p
              className="font-serif leading-snug line-clamp-3 transition-colors pointer-events-none"
              style={{
                fontSize: isTopStatement ? "1.1rem" : "0.95rem",
                color: textColor,
                fontFamily: "var(--font-fraunces), serif",
                textShadow: localTime.period === "night" ? "0 2px 8px rgba(0,0,0,0.8)" : "0 1px 2px rgba(255,255,255,0.6)",
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;{statement.content}&rdquo;
            </p>

            {/* Credible Source (if news/discovery) */}
            {statement.sourceUrl && (
              <div
                className="text-[10px] mb-1.5 text-[#3E2C5B]/80 font-medium truncate max-w-[280px]"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                🔗 {statement.sourceUrl}
              </div>
            )}

            {/* Author & Location — Clean, calm, zero numbers */}
            <div
              className="flex items-center justify-center gap-2 text-xs font-semibold"
              style={{
                color: metaColor,
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              <span>{statement.authorName}</span>
              <span className="opacity-40">•</span>
              <span>
                📍 {statement.cityName || statement.countryName}
              </span>
            </div>

            {/* Ante Particle Spark Celebration */}
            {isJustAnted && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                <span className="text-3xl animate-ping opacity-75">✨</span>
                <span className="absolute -top-7 text-xs font-bold tracking-widest text-[#FDE68A] uppercase animate-pulse">
                  ✦ Harmonized in the Sky ✦
                </span>
              </div>
            )}
          </RealisticCumulusCloud>
        </div>
      </Html>
    </group>
  );
}

export default function StatementClouds() {
  const statements = useEdifyStore((s) => s.statements);
  const activeCategory = useEdifyStore((s) => s.activeCategory);
  const activeLocation = useEdifyStore((s) => s.activeLocation);

  const sortedStatements = useMemo(() => {
    return [...statements]
      .filter((s) => s.moderationStatus === "approved")
      .filter((s) => activeCategory === "all" || s.category === activeCategory)
      .filter((s) => {
        if (!activeLocation || activeLocation.continent === "Global" || activeLocation.id === "world") {
          return true;
        }
        return (
          s.cityName?.toLowerCase() === activeLocation.name.toLowerCase() ||
          s.countryName?.toLowerCase() === activeLocation.country.toLowerCase() ||
          s.regionName?.toLowerCase().includes(activeLocation.continent.toLowerCase()) ||
          s.geoPath?.toLowerCase().includes(activeLocation.continent.toLowerCase())
        );
      })
      .sort((a, b) => {
        const scoreA = a.totalAnteCents * 0.7 + a.velocityScore * 100;
        const scoreB = b.totalAnteCents * 0.7 + b.velocityScore * 100;
        return scoreB - scoreA;
      })
      .slice(0, 18); 
  }, [statements, activeCategory, activeLocation]);

  const positions = useMemo(
    () => calculateCloudPositions(sortedStatements.length),
    [sortedStatements.length]
  );

  return (
    <group>
      {sortedStatements.map((statement, i) => {
        const pos = positions[i];
        if (!pos) return null;
        return (
          <CloudNode
            key={statement.id}
            statement={statement}
            position={[pos.x, pos.y, pos.z]}
            scale={pos.scale}
            rank={i}
          />
        );
      })}
    </group>
  );
}



