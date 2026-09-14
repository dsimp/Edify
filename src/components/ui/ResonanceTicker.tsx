"use client";

import React from "react";
import { useEdifyStore } from "@/lib/store";

export default function ResonanceTicker() {
  const tickerItems = useEdifyStore((state) => state.tickerItems);

  if (!tickerItems || tickerItems.length === 0) return null;

  // Double the items for seamless infinite loop
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full h-8 flex items-center overflow-hidden pointer-events-auto select-none"
      style={{
        background: "linear-gradient(180deg, rgba(18, 14, 33, 0.45) 0%, transparent 100%)",
        fontFamily: "var(--font-jakarta), sans-serif",
      }}
    >
      <div className="ticker-track">
        {doubled.map((item, index) => (
          <div
            key={`${item.statementId}-${index}`}
            className="flex items-center whitespace-nowrap gap-3"
          >
            {/* Statement text (poetic & truncated) */}
            <span
              className="font-medium text-xs text-[#FFFDF9]/90 tracking-wide"
              style={{
                textShadow: "0 1px 4px rgba(18, 14, 33, 0.9)",
              }}
            >
              &ldquo;{item.content}&rdquo;
            </span>

            {/* Poetic Serene Trend Indicator (No heavy numbers) */}
            <span
              className="text-[11px] font-semibold text-[#86EFAC] flex items-center gap-1"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
            >
              ▲ Rising in Harmony
            </span>

            {/* City Drift */}
            <span
              className="text-[#FBBF24] text-[10px] uppercase tracking-wider font-medium opacity-85"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
            >
              {item.driftVelocity}
            </span>

            {/* Golden Star divider */}
            <span className="text-[#FDE68A]/60 text-[8px] mx-2">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

