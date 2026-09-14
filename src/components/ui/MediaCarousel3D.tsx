"use client";

import React, { useState, useRef } from "react";
import { MediaAttachment } from "@/lib/types";

interface MediaCarousel3DProps {
  attachments: MediaAttachment[];
}

export default function MediaCarousel3D({ attachments }: MediaCarousel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  if (!attachments || attachments.length === 0) return null;

  const count = attachments.length;

  const nextSlide = () => {
    setIsPlayingVideo(false);
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const prevSlide = () => {
    setIsPlayingVideo(false);
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) {
      prevSlide();
    } else if (deltaX < -45) {
      nextSlide();
    }
    isDragging.current = false;
  };

  return (
    <div className="w-full my-4 select-none">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FDE68A] flex items-center gap-1.5">
          <span>✦</span>
          <span>Supporting Material & Evidence ({count})</span>
        </span>
        <span className="text-[10px] text-white/40 font-medium">
          Swipe or tap to explore
        </span>
      </div>

      {/* 3D Carousel Stage */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[220px] sm:h-[240px] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10"
        style={{ perspective: "800px" }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {attachments.map((item, index) => {
            // Calculate 3D Offset relative to active index
            let offset = index - activeIndex;
            if (offset < -Math.floor(count / 2)) offset += count;
            if (offset > Math.floor(count / 2)) offset -= count;

            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            const translateX = offset * 140; // Horizontal spread
            const translateZ = isCenter ? 0 : -80 - Math.abs(offset) * 40; // Depth push back
            const rotateY = offset * -25; // 3D Y-axis rotation angle
            const scale = isCenter ? 1.0 : 0.82;
            const opacity = isCenter ? 1.0 : Math.max(0.3, 0.65 - Math.abs(offset) * 0.2);

            return (
              <div
                key={item.id || index}
                onClick={() => {
                  if (!isCenter) {
                    setIsPlayingVideo(false);
                    setActiveIndex(index);
                  }
                }}
                className={`absolute w-[220px] sm:w-[260px] h-[175px] sm:h-[195px] rounded-2xl overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                  isCenter ? "shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_30px_rgba(244,162,97,0.25)] ring-1 ring-[#FDE68A]/40" : "opacity-60 hover:opacity-85"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex: 20 - Math.abs(offset),
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(20,16,32,0.85) 100%)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* 1. Image Attachment */}
                {item.type === "image" && (
                  <div
                    onClick={() => isCenter && setSelectedImage(item.url)}
                    className="relative w-full h-full group/card"
                  >
                    <img
                      src={item.url}
                      alt={item.title || "Supporting visual"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#FDE68A] border border-white/15">
                      📷 Image
                    </div>

                    {item.title && (
                      <div className="absolute bottom-2.5 left-3 right-3 text-left">
                        <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">
                          {item.title}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Video Attachment */}
                {item.type === "video" && (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    {isCenter && isPlayingVideo ? (
                      item.url.includes("youtube.com") || item.url.includes("youtu.be") ? (
                        <iframe
                          src={`${item.url.replace("watch?v=", "embed/")}?autoplay=1`}
                          title={item.title || "Supporting video"}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div
                        onClick={() => isCenter && setIsPlayingVideo(true)}
                        className="relative w-full h-full flex items-center justify-center group/vid"
                      >
                        <img
                          src={item.previewUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"}
                          alt={item.title || "Video preview"}
                          className="w-full h-full object-cover opacity-75 group-hover/vid:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        
                        {/* Play Button */}
                        <div className="absolute w-11 h-11 rounded-full bg-[#F4A261]/90 group-hover/vid:bg-[#FDE68A] text-[#1A1224] flex items-center justify-center shadow-lg transform transition-transform group-hover/vid:scale-110">
                          <span className="text-sm font-black ml-0.5">▶</span>
                        </div>

                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#38BDF8] border border-white/15">
                          🎬 Video
                        </div>

                        {item.title && (
                          <div className="absolute bottom-2.5 left-3 right-3 text-left">
                            <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Verified Link Attachment */}
                {item.type === "link" && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1E1B38] to-[#0E0C1F] hover:from-[#262248] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#86EFAC]/20 text-[#86EFAC] border border-[#86EFAC]/30">
                          🔗 Verified Link
                        </span>
                        <span className="text-white/40 text-xs">↗</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-[#FFFDF9] line-clamp-2 leading-snug mb-1">
                        {item.title || "Primary Research & Evidence"}
                      </h4>
                      
                      {item.description && (
                        <p className="text-[10px] text-white/60 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="text-[9px] text-[#93C5FD] truncate font-mono bg-white/5 px-2 py-1 rounded-md">
                      {item.url.replace(/^https?:\/\//, '')}
                    </div>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Left / Right Chevron Controls */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center text-xs border border-white/15 transition-all hover:scale-110 cursor-pointer"
              aria-label="Previous media"
            >
              ❮
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center text-xs border border-white/15 transition-all hover:scale-110 cursor-pointer"
              aria-label="Next media"
            >
              ❯
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {attachments.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsPlayingVideo(false);
                setActiveIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex
                  ? "w-5 bg-[#FDE68A]"
                  : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal for High-Res Image View */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={selectedImage}
              alt="High resolution material"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center font-bold text-sm border border-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
