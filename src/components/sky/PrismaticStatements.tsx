"use client";

import React, { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";
import { Statement } from "@/lib/types";
import { useFrame } from "@react-three/fiber";

import { getAllSpatialPositions } from "@/lib/spatial-corridor";

/**
 * Prismatic Obsidian Glass Monolith
 * A luxury frosted crystal monolith with glowing auroral refraction,
 * breathing starlight halos, and pure serif typography.
 */
function PrismaticMonolith({
  statement,
  isSelected = false,
  isHovered = false,
  isTop = false,
  onSelect,
}: {
  statement: Statement;
  isSelected?: boolean;
  isHovered?: boolean;
  isTop?: boolean;
  onSelect?: () => void;
}) {
  // Category-specific auroral color accents
  const auraColor = useMemo(() => {
    switch (statement.category) {
      case "wisdom":
        return { halo: "rgba(254, 230, 150, 0.35)", border: "rgba(254, 230, 150, 0.45)", badge: "#FDE68A" };
      case "science":
        return { halo: "rgba(56, 189, 248, 0.35)", border: "rgba(56, 189, 248, 0.45)", badge: "#38BDF8" };
      case "earth":
        return { halo: "rgba(134, 239, 172, 0.32)", border: "rgba(134, 239, 172, 0.45)", badge: "#86EFAC" };
      case "human-stories":
        return { halo: "rgba(244, 114, 182, 0.35)", border: "rgba(244, 114, 182, 0.45)", badge: "#F472B6" };
      case "world-events":
      default:
        return { halo: "rgba(192, 132, 252, 0.35)", border: "rgba(192, 132, 252, 0.45)", badge: "#C084FC" };
    }
  }, [statement.category]);

  return (
    <div
      onClick={onSelect}
      className="relative select-none cursor-pointer group transition-all duration-500 ease-out"
      style={{
        width: "min(460px, 86vw)",
        transform: isHovered || isSelected ? "translateY(-8px) scale(1.03)" : "translateY(0px) scale(1.0)",
      }}
    >
      {/* 1. Breathing Auroral Starlight Nebula Halo (Behind Monolith) */}
      <div
        className="absolute -inset-6 rounded-[36px] pointer-events-none transition-all duration-700"
        style={{
          background: isSelected || isHovered
            ? `radial-gradient(ellipse at 50% 50%, ${auraColor.halo} 0%, rgba(168, 85, 247, 0.18) 50%, transparent 75%)`
            : `radial-gradient(ellipse at 50% 50%, ${auraColor.halo} 0%, rgba(20, 16, 35, 0.08) 50%, transparent 70%)`,
          filter: "blur(24px)",
          opacity: isSelected ? 1 : isHovered ? 0.9 : 0.6,
        }}
      />

      {/* 2. Frosted Obsidian Glass Monolith Body */}
      <div
        className="relative rounded-[26px] p-6 sm:p-7 overflow-hidden transition-all duration-500"
        style={{
          background: isSelected
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(28, 22, 46, 0.85) 40%, rgba(10, 8, 18, 0.94) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(18, 14, 30, 0.76) 40%, rgba(8, 6, 15, 0.90) 100%)",
          backdropFilter: "blur(32px) saturate(190%)",
          WebkitBackdropFilter: "blur(32px) saturate(190%)",
          border: `1px solid ${isSelected ? auraColor.border : "rgba(255, 255, 255, 0.12)"}`,
          boxShadow: isSelected
            ? `0 25px 60px rgba(0, 0, 0, 0.7), 0 0 50px ${auraColor.halo}, inset 0 1px 2px rgba(255, 255, 255, 0.35)`
            : isHovered
            ? `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px ${auraColor.halo}, inset 0 1px 1px rgba(255, 255, 255, 0.25)`
            : "0 15px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.18)",
        }}
      >
        {/* Iridescent Top Specular Light Rim */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
          }}
        />

        {/* 3. Header Metadata (Origin Chip & Category) */}
        <div className="flex items-center justify-between gap-2 mb-3 pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: auraColor.badge,
                border: `1px solid ${auraColor.border}`,
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              ✦ {statement.cityName || statement.countryName || "EARTH"}
            </span>

            <span
              className="text-[10px] font-semibold text-white/50 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              {statement.geoPath.split(".").pop() || "Wisdom"}
            </span>
          </div>

          {isTop && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#FDE68A] bg-[#FDE68A]/15 border border-[#FDE68A]/30 shadow-[0_0_12px_rgba(253,230,138,0.3)]"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              ✦ Most Resonant
            </span>
          )}
        </div>

        {/* 4. Poetic Wisdom Statement in Fraunces Serif */}
        <p
          className="font-serif leading-relaxed text-[#FFFDF9] transition-colors pointer-events-none mb-3"
          style={{
            fontSize: isTop ? "clamp(17px, 1.85vw, 21px)" : "clamp(15px, 1.6vw, 18px)",
            fontFamily: "var(--font-fraunces), serif",
            textShadow: "0 2px 14px rgba(0, 0, 0, 0.7)",
            letterSpacing: "-0.01em",
          }}
        >
          &ldquo;{statement.content}&rdquo;
        </p>

        {/* 5. Author Signature & Quiet Meta */}
        <div
          className="flex items-center justify-between text-xs text-white/60 font-medium pt-2 border-t border-white/10 pointer-events-none"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          <span className="text-white/80 font-semibold">{statement.authorName}</span>
          <div className="flex items-center gap-2">
            {statement.mediaAttachments && statement.mediaAttachments.length > 0 && (
              <span className="text-[10px] text-[#FDE68A] font-semibold flex items-center gap-0.5 bg-[#FDE68A]/10 px-2 py-0.5 rounded-full border border-[#FDE68A]/20">
                ✦ {statement.mediaAttachments.length} Media
              </span>
            )}
            <span className="text-white/40 text-[11px]">📍 {statement.cityName || statement.countryName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonolithNode({
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
  const isSelected = selectedId === statement.id;

  // Gentle weightless levitation physics
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() + rank * 0.7;
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        distanceFactor={13}
        style={{
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: `scale(${scale})`,
          pointerEvents: "auto",
        }}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <PrismaticMonolith
            statement={statement}
            isSelected={isSelected}
            isHovered={hovered}
            isTop={rank === 0}
            onSelect={() => selectStatement(statement.id)}
          />
        </div>
      </Html>
    </group>
  );
}

export default function PrismaticStatements() {
  const statements = useEdifyStore((s) => s.statements);
  const activeCategory = useEdifyStore((s) => s.activeCategory);
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);

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
      .sort((a, b) => b.uniqueSupportersCount - a.uniqueSupportersCount)
      .slice(0, 18);
  }, [statements, activeCategory, activeLocation]);

  const positions = useMemo(
    () => getAllSpatialPositions(sortedStatements.length),
    [sortedStatements.length]
  );

  if (isGlobeView) return null;

  return (
    <group>
      {sortedStatements.map((statement, i) => {
        const pos = positions[i];
        if (!pos) return null;
        return (
          <MonolithNode
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
