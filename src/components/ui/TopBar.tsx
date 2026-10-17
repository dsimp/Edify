"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PLACES, PLACE_BY_ID } from "@/lib/places";

export default function TopBar() {
  const selectedPlaceId = useStore((s) => s.selectedPlaceId);
  const selectPlace = useStore((s) => s.selectPlace);
  const statements = useStore((s) => s.statements);
  const soundOn = useStore((s) => s.soundOn);
  const toggleSound = useStore((s) => s.toggleSound);
  const setComposerOpen = useStore((s) => s.setComposerOpen);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activePlace =
    selectedPlaceId && selectedPlaceId !== "world" ? PLACE_BY_ID[selectedPlaceId] : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="fixed top-4 sm:top-6 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none">
      {/* Left: Brand, Locations Dropdown next to the Globe, & Back to Globe */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            selectPlace(null);
          }}
          className="px-4 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] text-sm font-display font-medium tracking-tight text-slate-900 transition-all cursor-pointer"
        >
          Perspectives
        </button>

        {/* Locations Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] text-xs font-display font-medium text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              {activePlace
                ? activePlace.name
                : selectedPlaceId === "world"
                  ? "World"
                  : "Locations"}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-60 max-h-[70vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] p-2 animate-fade-in">
              {/* Globe Reset Option */}
              <button
                type="button"
                onClick={() => {
                  selectPlace(null);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-display font-medium transition-colors cursor-pointer ${
                  !selectedPlaceId
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <span>🌍 Spinning Globe</span>
              </button>

              {/* All World Ecosystem Option */}
              <button
                type="button"
                onClick={() => {
                  selectPlace("world");
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-display font-medium transition-colors cursor-pointer mt-0.5 ${
                  selectedPlaceId === "world"
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <span>✦ All Locations</span>
                <span className="text-[11px] opacity-60">{statements.length}</span>
              </button>

              <div className="my-1.5 border-t border-slate-100" />

              {/* Individual City Locations */}
              <div className="space-y-0.5">
                {PLACES.map((place) => {
                  const count = statements.filter((s) => s.placeId === place.id).length;
                  const isActive = selectedPlaceId === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => {
                        selectPlace(place.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left text-xs font-display transition-colors cursor-pointer ${
                        isActive
                          ? "bg-slate-950 text-white font-semibold"
                          : "text-slate-800 hover:bg-slate-100/80 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isActive ? "bg-sky-400" : "bg-emerald-500/80"
                          }`}
                        />
                        <span className="truncate">{place.name}</span>
                        <span
                          className={`text-[10px] truncate ${
                            isActive ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          {place.country}
                        </span>
                      </div>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedPlaceId && (
          <button
            type="button"
            onClick={() => selectPlace(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-xl border border-slate-200/80 text-xs font-display font-medium text-slate-600 hover:text-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all cursor-pointer animate-fade-in"
          >
            <span>←</span>
            <span>Globe</span>
          </button>
        )}
      </div>

      {/* Right: Sound & Voice */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={toggleSound}
          aria-label="Toggle sound"
          className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all cursor-pointer ${
            soundOn
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white/85 hover:bg-white text-slate-500 border-slate-200/80"
          }`}
        >
          {soundOn ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-medium tracking-wide shadow-[0_6px_20px_rgba(15,23,42,0.16)] transition-all cursor-pointer"
        >
          Voice
        </button>
      </div>
    </header>
  );
}
