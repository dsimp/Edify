"use client";

import React from "react";
import { Statement } from "@/lib/types";

interface QuoteCloudProps {
  statement: Statement;
  depth: number; // 0 = close / flying past, 1 = distant horizon
  x: number; // 0 to 1 across screen width
  y: number; // 0 to 1 across screen height
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export default function QuoteCloud({
  statement,
  depth,
  x,
  y,
  isSelected = false,
  onSelect,
}: QuoteCloudProps) {
  // Depth-based physical motion calculations
  const scale = Math.max(0.6, 1.45 - depth * 0.95);
  const blur = depth < 0.25 ? 7 : depth > 0.78 ? 3 : 0;
  const opacity = depth < 0.2 ? 0.35 : depth > 0.82 ? 0.38 : 0.96;
  const isReadable = depth >= 0.25 && depth <= 0.82;

  return (
    <article
      onClick={() => isReadable && onSelect && onSelect(statement.id)}
      className="absolute transition-all duration-300 pointer-events-auto select-none group"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity,
        zIndex: Math.round((1 - depth) * 100),
        width: "min(440px, 86vw)",
        cursor: isReadable ? "pointer" : "default",
        willChange: "transform, filter, opacity",
      }}
    >
      {/* 1. Volumetric Cumulus Puff Fluff Body */}
      <div
        className="absolute inset-[-30px_-40px] pointer-events-none rounded-full transition-all duration-500"
        style={{
          background: isSelected
            ? "radial-gradient(ellipse at 50% 35%, rgba(255, 252, 240, 0.92) 0%, rgba(254, 230, 150, 0.75) 48%, rgba(222, 138, 66, 0.25) 80%, transparent 100%)"
            : "radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.88) 0%, rgba(255, 245, 235, 0.65) 45%, rgba(240, 220, 205, 0.2) 75%, transparent 100%)",
          filter: "blur(18px)",
          boxShadow: isSelected
            ? "0 0 50px 20px rgba(254, 230, 150, 0.5), inset 0 0 30px rgba(255,255,255,0.8)"
            : "0 0 35px 10px rgba(255, 255, 255, 0.25)",
        }}
      />

      {/* 2. Middle Hero Quote Body (Only rendered when in readable mid-ground depth) */}
      {isReadable && (
        <div
          className="relative z-10 p-5 sm:p-6 text-center transition-all duration-300"
          style={{
            transform: isSelected ? "scale(1.04)" : "none",
          }}
        >
          {/* City Origin Chip & Category Pill */}
          <div className="flex items-center justify-center gap-1.5 mb-2 pointer-events-none">
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors"
              style={{
                background: isSelected ? "rgba(254, 230, 150, 0.95)" : "rgba(255, 185, 130, 0.9)",
                color: "#2A1810",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              ✦ {statement.cityName || statement.countryName || "WISDOM"}
            </span>

            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white/90 bg-black/30 backdrop-blur-md uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              {statement.geoPath.split(".").pop() || "Wisdom"}
            </span>
          </div>

          {/* Statement Text in Fraunces Serif */}
          <p
            className="font-serif leading-snug line-clamp-3 text-[#1A1224] sm:text-[#181122] transition-colors pointer-events-none"
            style={{
              fontSize: "clamp(15px, 1.8vw, 19px)",
              fontFamily: "var(--font-fraunces), serif",
              textShadow: "0 1px 3px rgba(255, 255, 255, 0.9)",
              letterSpacing: "-0.01em",
            }}
          >
            &ldquo;{statement.content}&rdquo;
          </p>

          {/* Author Meta */}
          <div
            className="mt-2.5 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#4A385E] pointer-events-none"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            <span>{statement.authorName}</span>
            <span className="opacity-40">•</span>
            <span>📍 {statement.cityName || statement.countryName}</span>
          </div>
        </div>
      )}
    </article>
  );
}
