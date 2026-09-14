"use client";

import dynamic from "next/dynamic";
import ResonanceTicker from "@/components/ui/ResonanceTicker";
import CategoryLensBar from "@/components/ui/CategoryLensBar";
import CelestialBreadcrumb from "@/components/ui/CelestialBreadcrumb";
import AntePanel from "@/components/ui/AntePanel";
import WalletBadge from "@/components/ui/WalletBadge";
import ModeToggle from "@/components/ui/ModeToggle";
import StatementComposer from "@/components/ui/StatementComposer";
import CreatorEarningsDrawer from "@/components/ui/CreatorEarningsDrawer";
import TwilightListView from "@/components/ui/TwilightListView";

/**
 * Dynamically import the 3D Sky Canvas with SSR disabled for 3D Globe Orbit.
 */
const SkyCanvas = dynamic(() => import("@/components/sky/SkyCanvas"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#130F24] flex items-center justify-center z-0">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4 animate-pulse">🌅</div>
        <h1
          className="text-3xl font-light tracking-wide mb-2"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#FDE68A" }}
        >
          Edify
        </h1>
        <p
          className="text-xs tracking-widest uppercase text-[#E2D9F3]/80"
          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          Entering the World Sky of Wisdom & Truths...
        </p>
        <div className="mt-6 w-48 h-1 mx-auto rounded-full overflow-hidden bg-[#241738]">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #F4A261, #FDE68A)",
              animation: "loading-bar 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* === 1. 3D Living Stage (Flight through clouds in local city / Orbit in cosmic galaxy) === */}
      <SkyCanvas />

      {/* === 2D Serene Reading Mode (When toggled) === */}
      <TwilightListView />

      {/* === HUD Overlay Layer === */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {/* Top Header: Live Resonance Ticker (at the very top) */}
        <div className="fixed top-0 left-0 w-full pointer-events-auto">
          <ResonanceTicker />
        </div>

        {/* Top Controls Row (Responsive Flex Row) */}
        <div className="fixed top-9 left-0 w-full px-3 sm:px-6 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <CategoryLensBar />
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <WalletBadge />
            <ModeToggle />
          </div>
        </div>

        {/* Bottom-Center: Geographic Sky & 3D Globe Orbit Navigator */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 pointer-events-auto">
          <CelestialBreadcrumb />
        </div>

        {/* Mobile Responsive Bottom-Sheet / Right Panel: Ante Interaction */}
        <div className="pointer-events-auto">
          <AntePanel />
        </div>

        {/* Bottom-Right: Create Statement FAB */}
        <div className="pointer-events-auto">
          <StatementComposer />
        </div>

        {/* Creator Income & Payout Modal */}
        <div className="pointer-events-auto">
          <CreatorEarningsDrawer />
        </div>
      </div>
    </main>
  );
}

