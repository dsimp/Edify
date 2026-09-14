"use client";

import React, { useState } from "react";
import { useEdifyStore } from "@/lib/store";
import MediaCube3D from "./MediaCube3D";

export default function AntePanel() {
  const selectedStatementId = useEdifyStore((s) => s.selectedStatementId);
  const statements = useEdifyStore((s) => s.statements);
  const selectStatement = useEdifyStore((s) => s.selectStatement);
  const anteStatement = useEdifyStore((s) => s.anteStatement);
  const userWallet = useEdifyStore((s) => s.userWallet);
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const statement = statements.find((s) => s.id === selectedStatementId);
  if (!statement) return null;

  const totalAnteUSD = (statement.totalAnteCents / 100).toFixed(2);
  const walletUSD = (userWallet.availableBalanceCents / 100).toFixed(2);
  const isTrending = statement.velocityScore > 30;

  const handleAnte = () => {
    anteStatement(statement.id, selectedAmount);
    setHasSubmitted(true);
    setTimeout(() => setHasSubmitted(false), 2000);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full sm:bottom-24 sm:right-6 sm:left-auto sm:w-[440px] z-50 overflow-hidden rounded-t-[28px] sm:rounded-[26px]"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(22, 16, 36, 0.88) 40%, rgba(8, 6, 15, 0.96) 100%)",
        backdropFilter: "blur(32px) saturate(190%)",
        WebkitBackdropFilter: "blur(32px) saturate(190%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow:
          "0 -10px 40px rgba(0, 0, 0, 0.8), 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(168, 85, 247, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
        animation: "slide-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fontFamily: "var(--font-jakarta), sans-serif",
      }}
    >
      {/* Mobile Drag Indicator Bar */}
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 sm:hidden" />

      {/* Top Iridescent Specular Light Rim */}
      <div
        className="h-[1px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(254, 230, 150, 0.8) 50%, transparent 100%)",
        }}
      />

      <div className="p-5 sm:p-6 relative max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => selectStatement(null)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors text-[#E2D9F3] hover:text-[#FFFDF9] bg-white/10 hover:bg-white/20 cursor-pointer"
        >
          ✕
        </button>

        {/* Category & Status Row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#F4A261]/20 text-[#FDE68A] border border-[#F4A261]/35"
          >
            {statement.category}
          </span>

          {isTrending && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#D97359]/25 text-[#F4A261] border border-[#D97359]/40 flex items-center gap-1"
            >
              <span>🔥</span>
              <span>Trending</span>
            </span>
          )}

          {statement.isCitizenReporter && (
            <span className="text-[10px] bg-[#86EFAC]/20 text-[#86EFAC] px-2 py-0.5 rounded-full font-semibold">
              ✓ Reporter
            </span>
          )}
        </div>

        {/* Statement text */}
        <blockquote
          className="text-lg leading-relaxed mb-4 pr-4 italic"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            color: "#FFFDF9",
            textShadow: "0 2px 10px rgba(19, 15, 36, 0.7)",
          }}
        >
          &ldquo;{statement.content}&rdquo;
        </blockquote>

        {/* Credible Source Link (for News & Truths) */}
        {statement.sourceUrl && (
          <div className="mb-4 text-xs text-[#93C5FD] flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <span>🔗</span>
            <span className="truncate">{statement.sourceUrl}</span>
          </div>
        )}

        {/* Author & Location */}
        <div className="flex items-center gap-2 mb-4 text-xs text-[#E2D9F3]/90">
          <span className="font-semibold text-[#FDE68A]">{statement.authorName}</span>
          <span className="opacity-40">•</span>
          <span className="text-[#FFFDF9]">📍 {statement.cityName}, {statement.countryName}</span>
        </div>

        {/* 3D Supporting Material Cube (Images, Videos, Links on each face) */}
        {statement.mediaAttachments && statement.mediaAttachments.length > 0 && (
          <MediaCube3D attachments={statement.mediaAttachments} />
        )}

        {/* Creator's Own Statement Earnings (Only shown if this is the user's own statement) */}
        {statement.authorId === userWallet.userId ? (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-[#FDE68A]/30 mb-5">
            <div className="text-[11px] mb-0.5 text-[#FDE68A]/80 font-semibold">
              ✨ Your Statement Earnings
            </div>
            <div className="text-base font-extrabold text-[#FDE68A]" style={{ fontFamily: "var(--font-fraunces), serif" }}>
              ${totalAnteUSD} <span className="text-xs font-normal text-white/60">earned</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#86EFAC] font-medium">
              <span>✦</span>
              <span>Resonating in Global Harmony</span>
            </div>
            <span className="text-[11px] text-white/40">Shared Thought</span>
          </div>
        )}

        {/* Ante Action Panel */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#E2D9F3]">
              Micro-Support
            </span>
            <span className="text-white/40 text-[11px]">
              Wallet: ${walletUSD}
            </span>
          </div>

          {/* Simple Dropdown + Submit Action Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="w-full appearance-none bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#FDE68A] focus:outline-none focus:border-[#F4A261] transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                <option value={1} className="bg-[#1C172B] text-[#FFFDF9]">1¢ ($0.01)</option>
                <option value={2} className="bg-[#1C172B] text-[#FFFDF9]">2¢ ($0.02)</option>
                <option value={3} className="bg-[#1C172B] text-[#FFFDF9]">3¢ ($0.03)</option>
                <option value={4} className="bg-[#1C172B] text-[#FFFDF9]">4¢ ($0.04)</option>
                <option value={5} className="bg-[#1C172B] text-[#FFFDF9]">5¢ ($0.05)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
                ▼
              </div>
            </div>

            <button
              onClick={handleAnte}
              disabled={userWallet.availableBalanceCents < selectedAmount}
              className="px-6 py-2.5 rounded-2xl font-bold text-sm select-none transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(244,162,97,0.3)] hover:scale-105 active:scale-95"
              style={{
                background: hasSubmitted
                  ? "linear-gradient(135deg, #86EFAC, #6EE7B7)"
                  : "linear-gradient(135deg, #F4A261, #FDE68A)",
                color: "#1A1224",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              {hasSubmitted ? (
                <>
                  <span>✓</span>
                  <span>Harmonized</span>
                </>
              ) : (
                <>
                  <span>✦</span>
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

