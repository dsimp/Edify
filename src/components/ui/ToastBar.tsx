"use client";

import React, { useEffect } from "react";
import { useStore } from "@/lib/store";
import { ECONOMICS } from "@/lib/economics";

export default function ToastBar() {
  const toast = useStore((s) => s.toast);
  const dismissToast = useStore((s) => s.dismissToast);
  const undoSupport = useStore((s) => s.undoSupport);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      dismissToast();
    }, ECONOMICS.UNDO_MS);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-lg backdrop-blur-xl text-xs font-display font-medium ${
          toast.tone === "error"
            ? "bg-rose-950/95 text-white border-rose-800"
            : "bg-slate-950/95 text-white border-slate-800"
        }`}
      >
        <span>{toast.text}</span>
        {toast.undoSupportId && (
          <button
            type="button"
            onClick={() => undoSupport(toast.undoSupportId!)}
            className="px-2.5 py-0.5 rounded-full bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
