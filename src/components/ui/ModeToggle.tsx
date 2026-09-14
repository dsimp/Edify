"use client";

import React from "react";
import { useEdifyStore } from "@/lib/store";

/**
 * ModeToggle — Toggle between 3D Flight Mode and accessible 2D List Mode.
 * Pill-shaped toggle with glassmorphic styling.
 */
export default function ModeToggle() {
  const isFlightMode = useEdifyStore((s) => s.isFlightMode);
  const toggleFlightMode = useEdifyStore((s) => s.toggleFlightMode);

  return (
    <div
      className="p-1 rounded-full flex items-center"
      style={{
        background: "rgba(26, 22, 43, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(140, 75, 110, 0.3)",
        fontFamily: "var(--font-jakarta), sans-serif",
      }}
    >
      <button
        onClick={() => !isFlightMode && toggleFlightMode()}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
        style={{
          background: isFlightMode ? "rgba(62, 44, 91, 0.8)" : "transparent",
          color: isFlightMode ? "#FFFDF9" : "#E2D9F3",
          boxShadow: isFlightMode ? "0 0 10px rgba(140, 75, 110, 0.4)" : "none",
        }}
      >
        <span>✈️</span>
        <span>Flight</span>
      </button>
      <button
        onClick={() => isFlightMode && toggleFlightMode()}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
        style={{
          background: !isFlightMode ? "rgba(62, 44, 91, 0.8)" : "transparent",
          color: !isFlightMode ? "#FFFDF9" : "#E2D9F3",
          boxShadow: !isFlightMode ? "0 0 10px rgba(140, 75, 110, 0.4)" : "none",
        }}
      >
        <span>▦</span>
        <span>List</span>
      </button>
    </div>
  );
}
