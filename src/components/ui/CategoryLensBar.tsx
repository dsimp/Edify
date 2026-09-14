"use client";

import React from "react";
import { useEdifyStore } from "@/lib/store";
import { StatementCategory } from "@/lib/types";

const categories: { id: StatementCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Horizons", icon: "🌍" },
  { id: "news", label: "World Events", icon: "⚡" },
  { id: "philosophy", label: "Wisdom", icon: "🌌" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "earth", label: "Earth & Nature", icon: "🌿" },
  { id: "culture", label: "Human Stories", icon: "🎨" },
];

export default function CategoryLensBar() {
  const activeCategory = useEdifyStore((s) => s.activeCategory);
  const setActiveCategory = useEdifyStore((s) => s.setActiveCategory);

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#130F24]/70 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-x-auto max-w-[92vw] sm:max-w-none scrollbar-none px-1.5 pointer-events-auto">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap select-none cursor-pointer"
            style={{
              background: isActive
                ? "linear-gradient(135deg, rgba(244,162,97,0.9), rgba(253,230,138,0.9))"
                : "transparent",
              color: isActive ? "#1C152B" : "#E2D9F3",
              boxShadow: isActive ? "0 0 15px rgba(244,162,97,0.4)" : "none",
              fontWeight: isActive ? 700 : 500,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
