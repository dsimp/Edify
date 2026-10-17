"use client";

import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { PLACES, PLACE_BY_ID } from "@/lib/places";
import { consensusScore } from "@/lib/economics";
import type { Statement, StatementKind } from "@/lib/types";

const KINDS: Array<{ id: StatementKind | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "fact", label: "Fact" },
  { id: "opinion", label: "Opinion" },
  { id: "experience", label: "Experience" },
  { id: "thought", label: "Thought" },
];

/**
 * Generates a smooth, deterministic SVG stock/momentum wave for a statement
 * based on its support strength — without showing any dollar figures.
 */
function StockWave({ statement, strength }: { statement: Statement; strength: number }) {
  const path = useMemo(() => {
    const seed = statement.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const pts: Array<[number, number]> = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = t * 88;
      // Rising trend proportional to support strength + gentle organic wave
      const baseline = 22 - t * (10 + strength * 8);
      const wave = Math.sin(seed * 0.3 + i * 1.1) * 2.8;
      const y = Math.max(3, Math.min(25, baseline + wave));
      pts.push([x, y]);
    }
    return pts.map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  }, [statement.id, strength]);

  return (
    <svg width="88" height="28" viewBox="0 0 88 28" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${statement.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#grad-${statement.id})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatementFeed() {
  const selectedPlaceId = useStore((s) => s.selectedPlaceId);
  const selectPlace = useStore((s) => s.selectPlace);
  const statements = useStore((s) => s.statements);
  const kindFilter = useStore((s) => s.kindFilter);
  const setKindFilter = useStore((s) => s.setKindFilter);
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const openStatement = useStore((s) => s.openStatement);
  const setComposerOpen = useStore((s) => s.setComposerOpen);

  const place = selectedPlaceId && selectedPlaceId !== "world" ? PLACE_BY_ID[selectedPlaceId] : null;

  const ranked = useMemo(() => {
    if (!selectedPlaceId) return [];
    const list = statements
      .filter((s) => (selectedPlaceId === "world" ? true : s.placeId === selectedPlaceId))
      .filter((s) => (kindFilter === "all" ? true : s.kind === kindFilter))
      .sort((a, b) =>
        sort === "new" ? b.createdAt - a.createdAt : consensusScore(b) - consensusScore(a),
      );
    return list;
  }, [statements, selectedPlaceId, kindFilter, sort]);

  if (!selectedPlaceId) return null;

  const maxScore = Math.max(1, ...ranked.map((s) => consensusScore(s)));

  return (
    <section className="fixed inset-0 z-20 bg-white/78 backdrop-blur-2xl flex flex-col pt-20 pb-8 px-4 sm:px-10 overflow-y-auto animate-zoom-soft">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {/* Location Setting Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-display font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{place ? place.country : "Global"}</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => selectPlace(selectedPlaceId === "world" ? PLACES[0].id : "world")}
                className="text-slate-500 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
              >
                {selectedPlaceId === "world" ? "By City" : "All Locations"}
              </button>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-light tracking-tight text-slate-900 mt-1">
              {place ? place.name : "World"}
            </h1>
          </div>

          {/* Minimal Stock | New Toggle + Smooth Kind Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stock | New Segmented Toggle */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100/90 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setSort("top")}
                className={`px-3 py-1 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                  sort !== "new"
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Stock
              </button>
              <button
                type="button"
                onClick={() => setSort("new")}
                className={`px-3 py-1 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                  sort === "new"
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                New
              </button>
            </div>

            <span className="hidden sm:inline-block w-px h-4 bg-slate-200" />

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKindFilter(k.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer whitespace-nowrap ${
                    kindFilter === k.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-slate-500 border border-slate-200/70"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ecosystem Market Grid — sized & ordered by Support / Stock */}
        {ranked.length === 0 ? (
          <div className="my-auto text-center py-16 space-y-4">
            <p className="text-base text-slate-400 font-display font-light">
              No statements voiced here yet.
            </p>
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-display font-medium cursor-pointer"
            >
              Voice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 py-6">
            {ranked.map((stmt, idx) => {
              const score = consensusScore(stmt);
              const strength = Math.min(1, Math.max(0.15, Math.sqrt(score / maxScore)));
              const isLead = idx === 0 && ranked.length > 1 && sort !== "new";
              const stmtPlace = PLACE_BY_ID[stmt.placeId];

              return (
                <article
                  key={stmt.id}
                  onClick={() => openStatement(stmt.id)}
                  className={`${
                    isLead ? "md:col-span-12 p-7 sm:p-9" : "md:col-span-6 p-6"
                  } group relative rounded-3xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_60px_-15px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-5`}
                >
                  {/* Top Bar: Ecosystem Rank + Live Support Stock Wave */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-display font-medium capitalize">
                        {stmt.kind}
                      </span>
                      {selectedPlaceId === "world" && stmtPlace && (
                        <span className="text-xs font-display text-slate-400">
                          {stmtPlace.name}
                        </span>
                      )}
                    </div>

                    {/* Ecosystem Stock Wave + Momentum Dot */}
                    <div className="flex items-center gap-2.5" title="Support momentum">
                      <StockWave statement={stmt} strength={strength} />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80 group-hover:scale-125 transition-transform" />
                    </div>
                  </div>

                  {/* Statement Text */}
                  <p
                    className={`${
                      isLead
                        ? "text-xl sm:text-3xl font-display font-light leading-snug"
                        : "text-base sm:text-lg font-display font-normal leading-relaxed"
                    } text-slate-900 tracking-tight`}
                  >
                    &ldquo;{stmt.text}&rdquo;
                  </p>

                  {/* Support Stock Fill Bar */}
                  <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.round(strength * 100)}%` }}
                    />
                  </div>

                  {/* Bottom Meta: Author + Cube + Cup icons */}
                  <div className="flex items-center justify-between text-xs font-display text-slate-400 pt-1">
                    <span className="font-medium text-slate-600">{stmt.authorName}</span>

                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                      {stmt.media.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span>⬡</span>
                          <span>Cube</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors text-[11px] font-medium">
                        <span>☕</span>
                        <span>Cup</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
