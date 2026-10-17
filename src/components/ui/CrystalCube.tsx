"use client";

import React, { useEffect, useRef, useState } from "react";
import type { MediaAttachment } from "@/lib/types";
import { sound } from "@/lib/sound";

interface CrystalCubeProps {
  media: MediaAttachment[];
  statementText?: string;
  placeName?: string;
  authorName?: string;
  size?: number;
}

const FACE_TARGETS: Array<[number, number]> = [
  [0, 0],     // Front
  [0, -90],   // Right
  [0, -180],  // Back
  [0, 90],    // Left
  [-90, 0],   // Top
  [90, 0],    // Bottom
];

export default function CrystalCube({
  media,
  statementText,
  placeName,
  authorName,
  size = 196,
}: CrystalCubeProps) {
  const [rotX, setRotX] = useState(-14);
  const [rotY, setRotY] = useState(28);
  const [focusedFace, setFocusedFace] = useState<number | null>(null);
  const [lightboxItem, setLightboxItem] = useState<MediaAttachment | null>(null);

  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const half = size / 2;

  // Map 6 crystal faces: each supporting material is represented on an individual side of the cube
  const faces: Array<{ item: MediaAttachment | null; index: number }> = Array.from(
    { length: 6 },
    (_, i) => ({
      item: media[i] ?? (media.length > 0 ? media[i % media.length] : null),
      index: i,
    }),
  );

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      if (!dragging.current && focusedFace === null && !lightboxItem) {
        setRotY((y) => (y + dt * 15) % 360);
        setRotX(-14 + Math.sin(now * 0.001) * 6);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [focusedFace, lightboxItem]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const scheduleAutoResume = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setFocusedFace(null);
    }, 5500);
  };

  const selectDotFace = (idx: number) => {
    sound.chime(600 + idx * 45, 0.9, 0.06);
    if (focusedFace === idx) {
      setFocusedFace(null);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      return;
    }
    setFocusedFace(idx);
    const [tx, ty] = FACE_TARGETS[idx] ?? [0, 0];
    setRotX(tx);
    setRotY(ty);
    scheduleAutoResume();
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    dragging.current = true;
    moved.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x, y };
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    e.stopPropagation();
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      moved.current = true;
      setFocusedFace(null);
    }
    lastPos.current = { x, y };
    setRotY((prev) => prev + dx * 0.7);
    setRotX((prev) => Math.max(-75, Math.min(75, prev - dy * 0.7)));
  };

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    dragging.current = false;
  };

  const transforms = [
    `translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div className="w-full select-none flex flex-col items-center">
      {/* Pure 3D Crystal Cube Stage */}
      <div
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        className="relative w-full h-[256px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1100px" }}
      >
        {/* Prismatic Caustic Floor Dispersion */}
        <div
          className="pointer-events-none absolute bottom-3 w-48 h-7 rounded-full opacity-75"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(56,189,248,0.28) 0%, rgba(16,185,129,0.16) 50%, transparent 78%)",
            filter: "blur(12px)",
          }}
        />

        {/* 3D Cube Object */}
        <div
          className={`relative ${
            focusedFace !== null
              ? "transition-transform duration-500 ease-out"
              : "transition-transform duration-150 ease-out"
          }`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Internal Refractive Crystal Core Planes */}
          <div
            className="pointer-events-none absolute inset-4 rounded-2xl border border-sky-300/35"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(186,230,253,0.2), rgba(167,243,208,0.18))",
              transform: "rotateY(45deg)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-4 rounded-2xl border border-indigo-300/25"
            style={{
              background:
                "linear-gradient(225deg, rgba(255,255,255,0.45), rgba(186,230,253,0.16), rgba(224,231,255,0.18))",
              transform: "rotateX(45deg)",
            }}
          />

          {faces.map(({ item, index }) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (moved.current) return;
                if (item) setLightboxItem(item);
              }}
              className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-300 group/face cursor-pointer"
              style={{
                transform: transforms[index],
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.78) 52%, rgba(236,253,245,0.76) 100%)",
                backdropFilter: "blur(16px) saturate(165%)",
                WebkitBackdropFilter: "blur(16px) saturate(165%)",
                border: "1.5px solid rgba(255, 255, 255, 0.96)",
                boxShadow:
                  "0 14px 34px -10px rgba(15, 23, 42, 0.16), inset 0 0 0 1px rgba(56, 189, 248, 0.28), inset 0 2px 14px rgba(255, 255, 255, 0.92)",
                backfaceVisibility: "visible",
              }}
            >
              {/* Prismatic top specular edge */}
              <div
                className="pointer-events-none absolute top-0 inset-x-0 h-[2px] z-20"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(56,189,248,0.85), rgba(255,255,255,1), rgba(16,185,129,0.75))",
                }}
              />

              {item ? (
                <>
                  {item.type === "image" && (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.title || ""}
                        className="w-full h-full object-cover opacity-95 group-hover/face:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-white/20 pointer-events-none" />
                      {item.title && (
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <p className="text-[11px] font-medium text-white truncate drop-shadow">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {item.type === "video" && (
                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.posterUrl ||
                          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={item.title || ""}
                        className="w-full h-full object-cover opacity-85 group-hover/face:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/25" />
                      <div className="relative z-10 w-10 h-10 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-lg group-hover/face:scale-110 transition-transform">
                        <span className="text-xs ml-0.5">▶</span>
                      </div>
                      {item.title && (
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <p className="text-[11px] font-medium text-white truncate drop-shadow">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {item.type === "link" && (
                    <div className="relative w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-white/95 via-sky-50/85 to-emerald-50/75">
                      <div className="flex items-center justify-end">
                        <span className="text-xs text-slate-400 group-hover/face:text-slate-900 transition-colors">
                          ↗
                        </span>
                      </div>

                      <div className="space-y-1 my-auto">
                        <p className="text-xs font-display font-semibold text-slate-900 line-clamp-3 leading-snug">
                          {item.title || item.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>

                      <div className="text-[10px] text-sky-700 truncate font-medium">
                        {item.url.replace(/^https?:\/\//, "").split("/")[0]}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-br from-white/92 via-sky-50/45 to-emerald-50/40">
                  <div className="w-2 h-2 rounded-full bg-sky-400/60" />
                  <p className="text-xs font-display text-slate-700 line-clamp-4 leading-relaxed">
                    {statementText}
                  </p>
                  <div className="text-[10px] text-slate-400 truncate font-medium">
                    {placeName} {authorName ? `· ${authorName}` : ""}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6 Minimal Dots Underneath the Crystal Cube (One per Side) */}
      <div className="flex items-center justify-center gap-2.5 pt-1 pb-1">
        {faces.map((_, idx) => {
          const hasDedicatedMedia = idx < media.length;
          const isFocused = focusedFace === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                selectDotFace(idx);
              }}
              aria-label={`Cube side ${idx + 1}`}
              className="p-1.5 group focus:outline-none cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isFocused
                    ? "w-5 h-2 bg-slate-900 shadow-xs"
                    : hasDedicatedMedia
                      ? "w-2 h-2 bg-emerald-500/85 group-hover:bg-slate-900 group-hover:scale-125"
                      : "w-1.5 h-1.5 bg-slate-300 group-hover:bg-slate-500 group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Clean Lightbox Modal when a crystal face is clicked */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-white/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h4 className="text-sm font-display font-semibold text-slate-900 truncate">
                {lightboxItem.title || "Material"}
              </h4>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex items-center justify-center bg-slate-50/50 max-h-[72vh] overflow-auto">
              {lightboxItem.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.title || ""}
                  className="max-h-[62vh] w-auto rounded-2xl shadow-md object-contain"
                />
              )}

              {lightboxItem.type === "video" && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                  {lightboxItem.url.includes("youtube.com") || lightboxItem.url.includes("youtu.be") ? (
                    <iframe
                      src={`${lightboxItem.url.replace("watch?v=", "embed/")}?autoplay=1`}
                      title={lightboxItem.title || "Video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={lightboxItem.url}
                      poster={lightboxItem.posterUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}

              {lightboxItem.type === "link" && (
                <div className="text-center py-6 px-4 space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <h5 className="text-base font-display font-semibold text-slate-900">
                      {lightboxItem.title || "Source"}
                    </h5>
                    {lightboxItem.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {lightboxItem.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={lightboxItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold transition-all shadow-sm"
                  >
                    <span>Open</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
