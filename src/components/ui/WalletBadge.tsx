"use client";

import React from "react";
import { useEdifyStore } from "@/lib/store";

export default function WalletBadge() {
  const isSoundEnabled = useEdifyStore((s) => s.isSoundEnabled);
  const toggleSound = useEdifyStore((s) => s.toggleSound);
  const setEarningsModalOpen = useEdifyStore((s) => s.setEarningsModalOpen);

  return (
    <div className="flex items-center gap-2">
      {/* Ambient Sound Serenity Audio Toggle */}
      <button
        onClick={toggleSound}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 select-none group"
        style={{
          background: isSoundEnabled ? "rgba(244, 162, 97, 0.22)" : "rgba(26, 22, 43, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: isSoundEnabled ? "1px solid rgba(253, 230, 138, 0.5)" : "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: isSoundEnabled ? "0 0 18px rgba(244, 162, 97, 0.25)" : "none",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
        title={isSoundEnabled ? "432Hz Sound Active (Click to Mute)" : "Click to Play Serene 432Hz Soundscape"}
      >
        <span className="text-xs">{isSoundEnabled ? "🎵" : "🔇"}</span>
        <span className="text-[11px] font-medium" style={{ color: isSoundEnabled ? "#FDE68A" : "#E2D9F3" }}>
          {isSoundEnabled ? "432Hz" : "Sound"}
        </span>
      </button>

      {/* Profile Sanctuary & Earnings (Click to open, no permanent numbers) */}
      <button
        onClick={() => setEarningsModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 select-none hover:scale-105"
        style={{
          background: "rgba(26, 22, 43, 0.65)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(244, 162, 97, 0.25)",
          fontFamily: "var(--font-jakarta), sans-serif",
        }}
        title="Open Profile, Creator Income & Sanctuary"
      >
        <span className="text-xs">👤</span>
        <span className="text-[11px] font-medium text-[#FFFDF9]/90">Sanctuary</span>
      </button>
    </div>
  );
}


