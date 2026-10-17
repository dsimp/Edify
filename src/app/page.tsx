"use client";

import dynamic from "next/dynamic";
import TopBar from "@/components/ui/TopBar";
import StatementFeed from "@/components/ui/StatementFeed";
import StatementDetail from "@/components/ui/StatementDetail";
import ComposerModal from "@/components/ui/ComposerModal";
import ToastBar from "@/components/ui/ToastBar";

const GlobeScene = dynamic(() => import("@/components/globe/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-0">
      <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white text-slate-950 select-none">
      {/* 1. Living 3D Realistic Globe on Pure White Stage (Immediate on Site Load) */}
      <GlobeScene />

      {/* 2. Minimalist Smooth UI */}
      <TopBar />
      <StatementFeed />
      <StatementDetail />
      <ComposerModal />
      <ToastBar />
    </main>
  );
}
