"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { PLACES, PLACE_BY_ID, nearestPlace } from "@/lib/places";
import type { MediaAttachment, StatementKind } from "@/lib/types";
import CrystalCube from "./CrystalCube";

const KIND_OPTIONS: Array<{ id: StatementKind; label: string }> = [
  { id: "opinion", label: "Opinion" },
  { id: "fact", label: "Fact" },
  { id: "experience", label: "Experience" },
  { id: "thought", label: "Thought" },
];

export default function ComposerModal() {
  const composerOpen = useStore((s) => s.composerOpen);
  const setComposerOpen = useStore((s) => s.setComposerOpen);
  const selectedPlaceId = useStore((s) => s.selectedPlaceId);
  const publish = useStore((s) => s.publish);
  const showToast = useStore((s) => s.showToast);

  const initialPlace =
    selectedPlaceId && selectedPlaceId !== "world" && PLACE_BY_ID[selectedPlaceId]
      ? selectedPlaceId
      : "chicago";

  const [kind, setKind] = useState<StatementKind>("opinion");
  const [text, setText] = useState("");
  const [placeId, setPlaceId] = useState<string>(initialPlace);

  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [addingType, setAddingType] = useState<"image" | "video" | "link" | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");

  if (!composerOpen) return null;

  const activePlace = PLACE_BY_ID[placeId] ?? PLACES[0];
  const needsEvidence = kind === "fact" && media.length === 0;
  const canSubmit = text.trim().length >= 5 && !needsEvidence;

  const detectGpsLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestPlace(pos.coords.latitude, pos.coords.longitude);
        setPlaceId(nearest.id);
      },
      () => {},
      { timeout: 6000 },
    );
  };

  const addMediaItem = () => {
    if (!addingType || !mediaUrl.trim() || media.length >= 6) return;
    const item: MediaAttachment = {
      id: `m-${Date.now()}`,
      type: addingType,
      url: mediaUrl.trim(),
      title: mediaTitle.trim() || undefined,
      posterUrl:
        addingType === "video"
          ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
          : undefined,
    };
    setMedia([...media, item]);
    setMediaUrl("");
    setMediaTitle("");
    setAddingType(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || media.length >= 6) return;
    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    setMedia([
      ...media,
      {
        id: `m-file-${Date.now()}`,
        type: isVideo ? "video" : "image",
        url: objectUrl,
        title: file.name.replace(/\.[^/.]+$/, ""),
      },
    ]);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsEvidence) {
      showToast({
        text: "Add at least 1 supporting material for a fact.",
        tone: "error",
      });
      return;
    }
    if (!canSubmit) return;
    publish({
      kind,
      text,
      media,
      placeId: activePlace.id,
    });
    setText("");
    setMedia([]);
    setAddingType(null);
  };

  return (
    <div
      onClick={() => setComposerOpen(false)}
      className="fixed inset-0 z-50 bg-white/55 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[36px] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_32px_100px_-20px_rgba(15,23,42,0.16)] p-6 sm:p-9 animate-zoom-soft"
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-display font-semibold text-slate-950 tracking-tight">
            Voice
          </h2>
          <button
            type="button"
            onClick={() => setComposerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column (7 cols): Inputs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Location Selector */}
            <div className="flex items-center gap-2">
              <select
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                aria-label="Location"
                className="flex-1 rounded-2xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs font-display font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}, {p.country}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={detectGpsLocation}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-display font-medium text-slate-700 transition-colors cursor-pointer shrink-0"
                title="Use current location"
              >
                📍 GPS
              </button>
            </div>

            {/* Kind Pills */}
            <div className="grid grid-cols-4 gap-1.5">
              {KIND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKind(opt.id)}
                  className={`py-2 px-3 rounded-2xl text-xs font-display font-medium border transition-all cursor-pointer ${
                    kind === opt.id
                      ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Statement Text */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 600))}
              rows={4}
              placeholder="Share a statement..."
              className="w-full rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4 text-sm font-display text-slate-950 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 resize-none leading-relaxed transition-colors"
            />

            {/* Cube Sides Attachments */}
            <div className="space-y-2.5">
              {media.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {media.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-800"
                    >
                      <span className="max-w-[140px] truncate">{m.title || m.type}</span>
                      <button
                        type="button"
                        onClick={() => setMedia(media.filter((x) => x.id !== m.id))}
                        className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {media.length < 6 && !addingType && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="py-2 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/70 text-xs text-slate-700 font-display font-medium cursor-pointer transition-colors">
                    <span>+ Upload</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddingType("image")}
                    className="py-2 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/70 text-xs text-slate-700 font-display font-medium cursor-pointer transition-colors"
                  >
                    + Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingType("video")}
                    className="py-2 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/70 text-xs text-slate-700 font-display font-medium cursor-pointer transition-colors"
                  >
                    + Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingType("link")}
                    className="py-2 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/70 text-xs text-slate-700 font-display font-medium cursor-pointer transition-colors"
                  >
                    + Link
                  </button>
                </div>
              )}

              {addingType && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-display font-medium text-slate-600">
                    <span className="capitalize">{addingType}</span>
                    <button
                      type="button"
                      onClick={() => setAddingType(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addMediaItem}
                      disabled={!mediaUrl.trim()}
                      className="px-4 py-1.5 rounded-full bg-slate-950 text-white text-xs font-display font-medium disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-7 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              >
                Voice
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Live 3D Crystal Cube Preview */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <CrystalCube
              media={media}
              statementText={text || "..."}
              placeName={activePlace.name}
              authorName="You"
              size={175}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
