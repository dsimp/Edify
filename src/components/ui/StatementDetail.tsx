"use client";

import React, { useState } from "react";
import { ME, useStore } from "@/lib/store";
import { PLACE_BY_ID } from "@/lib/places";
import {
  ECONOMICS,
  SUPPORT_AMOUNTS,
  allowanceRemaining,
  givenInWindow,
} from "@/lib/economics";
import { useNow } from "@/lib/use-now";
import CrystalCube from "./CrystalCube";

export default function StatementDetail() {
  const openStatementId = useStore((s) => s.openStatementId);
  const statements = useStore((s) => s.statements);
  const openStatement = useStore((s) => s.openStatement);
  const support = useStore((s) => s.support);
  const ledger = useStore((s) => s.ledger);
  const wallet = useStore((s) => s.wallet);
  const now = useNow();

  const [cupExpanded, setCupExpanded] = useState(false);
  const [droppingCents, setDroppingCents] = useState<number | null>(null);

  const statement = statements.find((s) => s.id === openStatementId);
  if (!statement) return null;

  const place = PLACE_BY_ID[statement.placeId];
  const isOwn = statement.authorId === ME.id;
  const given = givenInWindow(ledger, statement.id, ME.id, now);
  const remaining = allowanceRemaining(ledger, statement.id, ME.id, now);
  const cupFillPct = Math.min(
    100,
    Math.max(14, (given / ECONOMICS.CAP_CENTS_PER_WINDOW) * 100),
  );

  const handleDropCoin = (cents: (typeof SUPPORT_AMOUNTS)[number]) => {
    setDroppingCents(cents);
    support(statement.id, cents);
    setTimeout(() => {
      setDroppingCents(null);
    }, 520);
  };

  return (
    <div
      onClick={() => openStatement(null)}
      className="fixed inset-0 z-40 bg-white/55 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-[36px] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_32px_100px_-20px_rgba(15,23,42,0.16)] px-6 py-7 sm:px-10 sm:py-9 flex flex-col items-center text-center animate-zoom-soft"
      >
        {/* Minimal Close Button */}
        <button
          type="button"
          onClick={() => openStatement(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Author & Location */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium tracking-tight">
          <span className="font-display font-semibold text-slate-900">
            {statement.authorName}
          </span>
          {place && (
            <>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {place.name}, {place.country}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Statement */}
        <p className="mt-4 text-lg sm:text-2xl font-display font-medium text-slate-950 leading-snug tracking-tight max-w-xl">
          &ldquo;{statement.text}&rdquo;
        </p>

        {/* Slow-Spinning 3D Crystal Cube */}
        <div className="w-full my-2">
          <CrystalCube
            media={statement.media}
            statementText={statement.text}
            placeName={place?.name}
            authorName={statement.authorName}
            size={188}
          />
        </div>

        {/* The "Cup" — Hover or Click to reveal 1¢ - 5¢ options */}
        <div
          onMouseEnter={() => setCupExpanded(true)}
          onMouseLeave={() => setCupExpanded(false)}
          className="relative flex flex-col items-center pt-2"
        >
          {/* 1¢ - 5¢ Options Popover (Revealed on Hover or Click of the Cup) */}
          <div
            className={`flex items-center gap-2 mb-3 transition-all duration-300 ${
              cupExpanded
                ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                : "opacity-0 translate-y-3 pointer-events-none scale-95"
            }`}
          >
            {SUPPORT_AMOUNTS.map((cents) => {
              const disabled = isOwn || cents > remaining || cents > wallet.balanceCents;
              return (
                <button
                  key={cents}
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropCoin(cents);
                  }}
                  className={`w-11 h-11 rounded-full font-display text-xs font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    disabled
                      ? "bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed"
                      : "bg-white hover:bg-slate-950 text-slate-900 hover:text-white border border-slate-200/90 hover:border-slate-950 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
                  }`}
                >
                  {cents}¢
                </button>
              );
            })}
          </div>

          {/* Animated Coin Dropping Into the Cup */}
          {droppingCents !== null && (
            <div className="pointer-events-none absolute top-9 z-20 w-7 h-7 rounded-full bg-emerald-500 text-white font-display text-[10px] font-bold flex items-center justify-center shadow-md animate-coin-drop">
              {droppingCents}¢
            </div>
          )}

          {/* Interactive Cup Vessel */}
          <button
            type="button"
            onClick={() => setCupExpanded((v) => !v)}
            className="group relative flex flex-col items-center focus:outline-none cursor-pointer"
            aria-label="Support Cup"
          >
            {/* Cup Rim & Glass Vessel SVG */}
            <div
              className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                cupExpanded
                  ? "bg-slate-950 text-white shadow-[0_14px_34px_-8px_rgba(15,23,42,0.35)] scale-105"
                  : "bg-slate-50/90 hover:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-sm"
              }`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                {/* Cup Rim */}
                <ellipse
                  cx="16"
                  cy="8"
                  rx="10"
                  ry="2.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                {/* Cup Body */}
                <path
                  d="M6 8L8.5 23C8.8 24.8 10.4 26 12.2 26H19.8C21.6 26 23.2 24.8 23.5 23L26 8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Subtle Liquid / Coin Resonance Fill */}
                <path
                  d="M8.8 18.5C11.5 17.5 14.5 19.5 17.5 18.5C19.8 17.8 21.5 18.2 23.1 18.8L22.4 22.6C22.2 23.8 21.1 24.6 19.8 24.6H12.2C10.9 24.6 9.8 23.8 9.6 22.6L8.8 18.5Z"
                  fill={cupExpanded ? "rgba(52, 211, 153, 0.45)" : "rgba(14, 165, 233, 0.25)"}
                />
              </svg>

              {/* Subtle Fill Bar at bottom of Cup */}
              <div className="w-8 h-1 rounded-full bg-slate-200/60 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${cupFillPct}%` }}
                />
              </div>
            </div>

            <span className="mt-1.5 text-[11px] font-display font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
              Cup
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
