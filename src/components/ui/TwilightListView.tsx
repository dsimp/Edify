"use client";

import React, { useState } from "react";
import { useEdifyStore } from "@/lib/store";
import { Statement, StatementCategory } from "@/lib/types";

const categories: { id: StatementCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Horizons", icon: "🌍" },
  { id: "news", label: "World Events", icon: "⚡" },
  { id: "philosophy", label: "Wisdom", icon: "🌌" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "earth", label: "Earth & Nature", icon: "🌿" },
  { id: "culture", label: "Human Stories", icon: "🎨" },
];

export default function TwilightListView() {
  const isFlightMode = useEdifyStore((s) => s.isFlightMode);
  const toggleFlightMode = useEdifyStore((s) => s.toggleFlightMode);
  const statements = useEdifyStore((s) => s.statements);
  const activeCategory = useEdifyStore((s) => s.activeCategory);
  const setActiveCategory = useEdifyStore((s) => s.setActiveCategory);
  const flyToStatement = useEdifyStore((s) => s.flyToStatement);
  const selectStatement = useEdifyStore((s) => s.selectStatement);
  const selectedStatementId = useEdifyStore((s) => s.selectedStatementId);
  const anteStatement = useEdifyStore((s) => s.anteStatement);
  const userWallet = useEdifyStore((s) => s.userWallet);
  const [searchQuery, setSearchQuery] = useState("");

  if (isFlightMode) return null;

  const filteredStatements = statements
    .filter((s) => s.moderationStatus === "approved")
    .filter((s) => activeCategory === "all" || s.category === activeCategory)
    .filter(
      (s) =>
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.cityName && s.cityName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="fixed inset-0 z-40 pt-16 pb-24 px-4 sm:px-8 md:px-12 overflow-y-auto bg-gradient-to-b from-[#0B0816]/95 via-[#161026]/95 to-[#0B0816]/98 backdrop-blur-3xl pointer-events-auto select-none animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Floating Return Header Bar */}
        <div className="sticky top-0 z-20 py-3 bg-[#0B0816]/80 backdrop-blur-xl border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => toggleFlightMode()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F4A261] to-[#FDE68A] text-[#161026] font-extrabold text-xs shadow-[0_0_20px_rgba(244,162,97,0.4)] hover:shadow-[0_0_25px_rgba(253,230,138,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>✈️</span>
              <span>Return to 3D Sky</span>
            </button>

            <span className="text-xs text-white/50 hidden sm:inline">•</span>
            <span className="text-xs text-[#FDE68A] font-semibold hidden sm:inline" style={{ fontFamily: "var(--font-fraunces), serif" }}>
              Twilight Journal
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts & cities..."
              className="w-full bg-white/10 border border-white/15 rounded-full px-4 py-2 pl-9 text-xs text-[#FFFDF9] placeholder-[#E2D9F3]/50 focus:outline-none focus:border-[#F4A261] transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-xs text-[#E2D9F3]/50">🔍</span>
          </div>
        </div>

        {/* Category Lens Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FDE68A] text-[#161026] shadow-[0_0_15px_rgba(253,230,138,0.4)]"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <span>{cat.icon}</span> <span className="ml-1">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Statements Stream */}
        <div className="space-y-4">
          {filteredStatements.map((stmt, index) => {
            const totalAnteUSD = (stmt.totalAnteCents / 100).toFixed(2);
            const isSelected = selectedStatementId === stmt.id;
            const hasMedia = stmt.mediaAttachments && stmt.mediaAttachments.length > 0;

            return (
              <div
                key={stmt.id}
                onClick={() => flyToStatement(stmt.id)}
                className={`group/card relative rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border cursor-pointer ${
                  isSelected
                    ? "bg-white/15 border-[#FDE68A] shadow-[0_0_35px_rgba(253,230,138,0.25)]"
                    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#F4A261]/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    {/* Category & Rank */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="bg-[#F4A261]/20 text-[#FDE68A] border border-[#F4A261]/30 px-2.5 py-0.5 rounded-full uppercase font-bold">
                        {stmt.category}
                      </span>
                      {stmt.isCitizenReporter && (
                        <span className="bg-[#86EFAC]/20 text-[#86EFAC] px-2 py-0.5 rounded-full font-semibold">
                          ✓ Verified Reporter
                        </span>
                      )}
                      {hasMedia && (
                        <span className="bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span>🎲</span>
                          <span>3D Evidence Cube ({stmt.mediaAttachments?.length} Sides)</span>
                        </span>
                      )}
                    </div>

                    {/* Statement Content */}
                    <p
                      className="text-lg md:text-xl text-[#FFFDF9] leading-relaxed italic group-hover/card:text-[#FDE68A] transition-colors"
                      style={{ fontFamily: "var(--font-fraunces), serif" }}
                    >
                      &ldquo;{stmt.content}&rdquo;
                    </p>

                    {/* Author & Geo Location */}
                    <div className="text-xs text-[#E2D9F3]/80 flex flex-wrap items-center gap-2 pt-1">
                      <span className="font-semibold text-[#FDE68A]">{stmt.authorName}</span>
                      <span className="opacity-40">•</span>
                      <span>📍 {stmt.cityName}, {stmt.countryName}</span>
                      {stmt.authorId === userWallet.userId && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="text-[#FDE68A] font-semibold">Your Statement (${totalAnteUSD} earned)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Trigger Pill */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToStatement(stmt.id);
                      }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#F4A261] to-[#FDE68A] text-[#161026] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    >
                      <span>{hasMedia ? "🎲 View 3D Cube" : "✦ Fly to Thought"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
