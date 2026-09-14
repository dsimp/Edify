"use client";

import React, { useState } from 'react';
import { useEdifyStore } from '@/lib/store';
import { StatementCategory, MediaAttachment } from '@/lib/types';

export default function StatementComposer() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('San Francisco');
  const [category, setCategory] = useState<StatementCategory>('news');
  const [sourceUrl, setSourceUrl] = useState('');
  
  // Media Attachments state
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isAddingMedia, setIsAddingMedia] = useState<'image' | 'video' | 'link' | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  
  const addStatement = useEdifyStore((state) => state.addStatement);
  const maxChars = 1000;

  const handleAddMedia = () => {
    if (!mediaUrl.trim() || !isAddingMedia) return;

    const newAttachment: MediaAttachment = {
      id: `media-${Date.now()}`,
      type: isAddingMedia,
      url: mediaUrl.trim(),
      title: mediaTitle.trim() || undefined,
      previewUrl: isAddingMedia === 'video' ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' : undefined,
    };

    setAttachments([...attachments, newAttachment]);
    setMediaUrl('');
    setMediaTitle('');
    setIsAddingMedia(null);
  };

  const removeMedia = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0) return;
    
    addStatement({ 
      text, 
      location, 
      category, 
      sourceUrl: sourceUrl.trim() || undefined,
      mediaAttachments: attachments.length > 0 ? attachments : undefined
    });

    setText('');
    setSourceUrl('');
    setAttachments([]);
    setIsAddingMedia(null);
    setIsOpen(false);
  };

  const cities = [
    'San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 
    'Paris', 'Sydney', 'Toronto', 'Kyoto', 'Lagos', 'Cairo', 'Mumbai', 'Global Horizon'
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#F4A261] to-[#D97359] flex items-center justify-center text-[#FFFDF9] shadow-[0_0_25px_rgba(244,162,97,0.5)] hover:shadow-[0_0_35px_rgba(253,230,138,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 z-40 cursor-pointer"
        aria-label="Release a thought or news"
        title="Release a Thought / Citizen Dispatch"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#130F24]/85 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#241738]/95 border border-[#8C4B6E]/50 rounded-3xl shadow-2xl relative"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#130F24]/40">
              <div>
                <h2 className="text-xl text-[#FDE68A] font-bold" style={{ fontFamily: "var(--font-fraunces), serif" }}>
                  Release to the World Sky
                </h2>
                <p className="text-xs text-[#E2D9F3]/70 mt-0.5">
                  Share citizen news, world events, science, or deep human wisdom.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#E2D9F3] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#E2D9F3] uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'news', label: '⚡ World Event' },
                    { id: 'philosophy', label: '🌌 Wisdom' },
                    { id: 'science', label: '🔬 Science' },
                    { id: 'earth', label: '🌿 Earth & Nature' },
                    { id: 'culture', label: '🎨 Human Story' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as StatementCategory)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#F4A261]/25 border-[#FDE68A] text-[#FDE68A] font-bold'
                          : 'bg-white/5 border-white/10 text-[#E2D9F3]/70 hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thought Text */}
              <div>
                <label className="block text-xs font-semibold text-[#E2D9F3] uppercase tracking-wider mb-2">
                  Statement / Thought
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                  placeholder="What truth, breakthrough, or reflection needs to be brought to light?"
                  rows={4}
                  className="w-full bg-[#130F24]/60 border border-white/15 rounded-2xl p-4 text-[#FFFDF9] placeholder-[#E2D9F3]/40 focus:outline-none focus:border-[#F4A261] focus:ring-1 focus:ring-[#F4A261] resize-none transition-all text-sm leading-relaxed"
                />
                <div className="flex justify-between mt-1 text-[11px] text-[#E2D9F3]/60">
                  <span>Share your insight with the world horizon.</span>
                  <span className={text.length >= maxChars - 20 ? 'text-[#D97359]' : ''}>
                    {text.length} / {maxChars}
                  </span>
                </div>
              </div>

              {/* Supporting Media & Evidence Attachments */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#FDE68A] uppercase tracking-wider flex items-center gap-1.5">
                    <span>✦</span>
                    <span>Supporting Material (3D Evidence Cube)</span>
                  </label>
                  <span className="text-[10px] text-white/50">{attachments.length} attached</span>
                </div>

                {/* Attached Media List */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/15 text-xs text-[#FFFDF9]"
                      >
                        <span>{att.type === 'image' ? '📷' : att.type === 'video' ? '🎬' : '🔗'}</span>
                        <span className="max-w-[140px] truncate font-medium">{att.title || att.url}</span>
                        <button
                          type="button"
                          onClick={() => removeMedia(att.id)}
                          className="ml-1 text-white/40 hover:text-white text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Media Action Buttons */}
                {!isAddingMedia ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingMedia('image')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E2D9F3] hover:text-[#FFFDF9] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>📷</span>
                      <span>Add Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingMedia('video')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E2D9F3] hover:text-[#FFFDF9] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>🎬</span>
                      <span>Add Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingMedia('link')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E2D9F3] hover:text-[#FFFDF9] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>🔗</span>
                      <span>Add Link</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-2.5 rounded-xl bg-black/30 border border-[#F4A261]/30 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-[#FDE68A] font-semibold">
                      <span>Add {isAddingMedia === 'image' ? 'Image' : isAddingMedia === 'video' ? 'Video' : 'Link'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingMedia(null);
                          setMediaUrl('');
                          setMediaTitle('');
                        }}
                        className="text-white/40 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={isAddingMedia === 'image' ? "Image URL (e.g. https://.../photo.jpg)" : isAddingMedia === 'video' ? "Video URL (e.g. YouTube or MP4 link)" : "Verified Link (https://...)"}
                      className="w-full bg-[#130F24] border border-white/15 rounded-lg p-2 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F4A261]"
                    />

                    <input
                      type="text"
                      value={mediaTitle}
                      onChange={(e) => setMediaTitle(e.target.value)}
                      placeholder="Title or Caption (optional)"
                      className="w-full bg-[#130F24] border border-white/15 rounded-lg p-2 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F4A261]"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingMedia(null)}
                        className="px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMedia}
                        disabled={!mediaUrl.trim()}
                        className="px-4 py-1 rounded-lg bg-[#F4A261] text-[#1A1224] text-xs font-bold disabled:opacity-40"
                      >
                        Attach to 3D Deck
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Source Link & Origin Location Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2D9F3] uppercase tracking-wider mb-1">
                    Origin Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#130F24]/60 border border-white/15 rounded-xl p-2.5 text-xs text-[#FFFDF9] focus:outline-none focus:border-[#F4A261]"
                  >
                    {cities.map(city => (
                      <option key={city} value={city} className="bg-[#241738]">{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E2D9F3] uppercase tracking-wider mb-1">
                    Publisher Source (Optional)
                  </label>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="e.g. Nature, AP, Local eyewitness"
                    className="w-full bg-[#130F24]/60 border border-white/15 rounded-xl p-2.5 text-xs text-[#FFFDF9] placeholder-[#E2D9F3]/35 focus:outline-none focus:border-[#F4A261]"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs text-[#E2D9F3] hover:text-[#FFFDF9] hover:bg-white/10 transition-all font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={text.trim().length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D97359] to-[#F4A261] text-[#FFFDF9] text-xs font-bold shadow-[0_0_20px_rgba(244,162,97,0.35)] hover:shadow-[0_0_25px_rgba(253,230,138,0.55)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  Release to Sky ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
