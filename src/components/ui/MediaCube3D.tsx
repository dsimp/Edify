"use client";

import React, { useState, useRef, useEffect } from "react";
import { MediaAttachment } from "@/lib/types";

interface MediaCube3DProps {
  attachments: MediaAttachment[];
}

export default function MediaCube3D({ attachments }: MediaCube3DProps) {
  const [rotX, setRotX] = useState(-12);
  const [rotY, setRotY] = useState(30);
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [activeMedia, setActiveMedia] = useState<MediaAttachment | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const autoSpinAnimRef = useRef<number | null>(null);

  const cubeSize = 190; // px cube edge dimension
  const halfSize = cubeSize / 2;

  // Prepare 6 face slots (loop attachments if fewer)
  const faces = Array.from({ length: 6 }).map((_, idx) => {
    if (!attachments || attachments.length === 0) return null;
    return attachments[idx % attachments.length];
  });

  // Smooth Auto-Spin Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isAutoSpin && !isDragging.current && !isPlayingVideo) {
        setRotY((prev) => (prev + 20 * delta) % 360);
      }

      autoSpinAnimRef.current = requestAnimationFrame(loop);
    };

    autoSpinAnimRef.current = requestAnimationFrame(loop);
    return () => {
      if (autoSpinAnimRef.current) cancelAnimationFrame(autoSpinAnimRef.current);
    };
  }, [isAutoSpin, isPlayingVideo]);

  // Pointer / Touch Handlers (with strict stopPropagation to isolate from background 3D scene)
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    setIsAutoSpin(false);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    lastMousePos.current = { x: clientX, y: clientY };

    setRotY((prev) => prev + deltaX * 0.75);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - deltaY * 0.75)));
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    setIsAutoSpin(false);
    setRotY((prev) => prev + e.deltaY * 0.2);
  };

  // Quick snap to specific face
  const snapToFace = (faceIndex: number) => {
    setIsAutoSpin(false);
    setIsPlayingVideo(false);
    switch (faceIndex) {
      case 0: setRotX(0); setRotY(0); break;      // Front
      case 1: setRotX(0); setRotY(-90); break;    // Right
      case 2: setRotX(0); setRotY(-180); break;   // Back
      case 3: setRotX(0); setRotY(90); break;     // Left
      case 4: setRotX(-90); setRotY(0); break;    // Top
      case 5: setRotX(90); setRotY(0); break;     // Bottom
    }
  };

  const faceTransforms = [
    `translateZ(${halfSize}px)`,                              // 0: Front
    `rotateY(90deg) translateZ(${halfSize}px)`,               // 1: Right
    `rotateY(180deg) translateZ(${halfSize}px)`,              // 2: Back
    `rotateY(-90deg) translateZ(${halfSize}px)`,              // 3: Left
    `rotateX(90deg) translateZ(${halfSize}px)`,               // 4: Top
    `rotateX(-90deg) translateZ(${halfSize}px)`,              // 5: Bottom
  ];

  if (!attachments || attachments.length === 0) return null;

  return (
    <div
      data-interactive="true"
      className="cube-stage w-full my-3 select-none pointer-events-auto"
      onWheel={handleWheel}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FDE68A] flex items-center gap-1.5">
          <span>✦</span>
          <span>3D Spatial Evidence Cube</span>
        </span>
        <button
          type="button"
          onClick={() => setIsAutoSpin(!isAutoSpin)}
          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border transition-all cursor-pointer ${
            isAutoSpin
              ? "bg-[#FDE68A]/20 text-[#FDE68A] border-[#FDE68A]/40"
              : "bg-white/5 text-white/50 border-white/10 hover:text-white"
          }`}
        >
          {isAutoSpin ? "Auto-Spinning" : "Spin Paused"}
        </button>
      </div>

      {/* Layered Weightless 3D Cube Stage (No dark box, fully transparent spatial stage) */}
      <div
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="relative w-full h-[240px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1000px" }}
      >
        {/* Soft Radial Ambient Aura Floating Directly Behind Cube */}
        <div
          className="absolute w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(254, 230, 150, 0.22) 0%, rgba(192, 132, 252, 0.16) 45%, transparent 75%)",
            filter: "blur(28px)",
          }}
        />

        {/* Ethereal Ground Starlight Reflection */}
        <div
          className="absolute bottom-2 w-[160px] h-[24px] rounded-full pointer-events-none opacity-60"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(254, 230, 150, 0.45) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 75%)",
            filter: "blur(10px)",
          }}
        />

        {/* 3D Holographic Cube Matrix */}
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {faces.map((item, index) => {
            if (!item) return null;

            return (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMedia(item);
                }}
                className="absolute inset-0 rounded-3xl overflow-hidden border border-white/30 shadow-[0_15px_35px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-[#FDE68A] hover:shadow-[0_0_30px_rgba(254,230,150,0.35)] group/face cursor-pointer select-none"
                style={{
                  transform: faceTransforms[index],
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(26, 20, 42, 0.88) 40%, rgba(8, 6, 16, 0.96) 100%)",
                  backdropFilter: "blur(28px) saturate(190%)",
                  WebkitBackdropFilter: "blur(28px) saturate(190%)",
                  backfaceVisibility: "visible",
                }}
              >
                {/* Iridescent Top Edge Highlight */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(254, 230, 150, 0.7) 50%, transparent 100%)",
                  }}
                />

                {/* 1. Image Face */}
                {item.type === "image" && (
                  <div className="relative w-full h-full">
                    <img
                      src={item.url}
                      alt={item.title || "Evidence"}
                      className="w-full h-full object-cover group-hover/face:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 pointer-events-none" />
                    
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/70 backdrop-blur-md text-[#FDE68A] border border-white/20">
                      📷 Side {index + 1}
                    </div>

                    {item.title && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[10px] font-semibold text-white/95 truncate">
                          {item.title}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Video Face */}
                {item.type === "video" && (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <img
                      src={item.previewUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"}
                      alt={item.title || "Video Preview"}
                      className="w-full h-full object-cover opacity-75 group-hover/face:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                    <div className="absolute w-10 h-10 rounded-full bg-[#F4A261] text-[#1A1224] flex items-center justify-center shadow-lg group-hover/face:scale-110 transition-transform">
                      <span className="text-xs font-black ml-0.5">▶</span>
                    </div>

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/70 backdrop-blur-md text-[#38BDF8] border border-white/20">
                      🎬 Side {index + 1}
                    </div>

                    {item.title && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[10px] font-semibold text-white/95 truncate">
                          {item.title}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Verified Link Face */}
                {item.type === "link" && (
                  <div className="relative w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-br from-[#241E44] to-[#0E0C1F]">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#86EFAC]/25 text-[#86EFAC] border border-[#86EFAC]/40">
                          🔗 Side {index + 1}
                        </span>
                        <span className="text-white/40 text-[10px]">↗</span>
                      </div>

                      <h4 className="text-[11px] font-bold text-[#FFFDF9] line-clamp-2 leading-tight mb-1">
                        {item.title || "Verified Research Link"}
                      </h4>

                      {item.description && (
                        <p className="text-[9px] text-white/60 line-clamp-3 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="text-[8px] text-[#93C5FD] truncate font-mono bg-white/10 px-2 py-0.5 rounded-md">
                      {item.url.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spatial Instruction Overlay */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] text-white/60">
          🖐 Drag freely in 3D • Click any face
        </div>
      </div>

      {/* Quick Snap Face Selector Tabs */}
      <div className="flex items-center justify-center gap-1 mt-1 overflow-x-auto pb-1">
        {attachments.slice(0, 6).map((att, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => snapToFace(idx)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>{att.type === 'image' ? '📷' : att.type === 'video' ? '🎬' : '🔗'}</span>
            <span>Side {idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Lightbox / Video / Link Modal When Clicked */}
      {activeMedia && (
        <div
          onClick={() => {
            setActiveMedia(null);
            setIsPlayingVideo(false);
          }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#140E26] flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {activeMedia.type === 'image' ? '📷' : activeMedia.type === 'video' ? '🎬' : '🔗'}
                </span>
                <h3 className="text-sm font-bold text-[#FDE68A] truncate">
                  {activeMedia.title || "Supporting Material"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveMedia(null);
                  setIsPlayingVideo(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto max-h-[70vh]">
              {activeMedia.type === 'image' && (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title || "High resolution material"}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl"
                />
              )}

              {activeMedia.type === 'video' && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                  {activeMedia.url.includes("youtube.com") || activeMedia.url.includes("youtu.be") ? (
                    <iframe
                      src={`${activeMedia.url.replace("watch?v=", "embed/")}?autoplay=1`}
                      title={activeMedia.title || "Supporting video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeMedia.url}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              {activeMedia.type === 'link' && (
                <div className="w-full p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#86EFAC]/20 text-[#86EFAC] flex items-center justify-center mx-auto text-2xl">
                    🔗
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{activeMedia.title}</h3>
                    {activeMedia.description && (
                      <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
                        {activeMedia.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={activeMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F4A261] to-[#FDE68A] text-[#1A1224] font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                  >
                    <span>Open External Source</span>
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
