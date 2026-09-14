"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import FlightCamera from "./FlightCamera";
import ParticleField from "./ParticleField";
import PrismaticStatements from "./PrismaticStatements";
import InteractiveGlobe from "./InteractiveGlobe";
import CosmicGalaxy from "./CosmicGalaxy";
import { useEdifyStore } from "@/lib/store";

export default function SkyCanvas() {
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        background: "#08060F",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55, near: 0.1, far: 2000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} // Mobile optimized pixel ratio clamping
      >
        <Suspense fallback={null}>
          {/* Ethereal Ambient & Starlight Lighting */}
          <ambientLight intensity={0.8} color="#E2D9F3" />
          <directionalLight
            position={[10, 20, 30]}
            intensity={1.6}
            color="#FDE68A"
          />
          <pointLight
            position={[-15, -10, -10]}
            intensity={0.8}
            color="#C084FC"
          />

          {/* 1. Deep Cosmic Galaxy Starfield & Milky Way Nebulae (Always active) */}
          <CosmicGalaxy />

          {/* 2. Floating Atmospheric Stardust Particle Motes */}
          <ParticleField />

          {/* 3. 3D Interactive World Globe (In Orbit View) */}
          {isGlobeView && <InteractiveGlobe />}

          {/* 4. Prismatic Obsidian Crystal Monoliths (In Thoughts / Horizon View) */}
          {!isGlobeView && <PrismaticStatements />}

          {/* 5. Spatial Flight & Orbit Camera Controller */}
          <FlightCamera />

          {/* 6. Post-Processing: Ethereal Auroral Bloom */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.80}
              luminanceSmoothing={0.65}
              intensity={0.45}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}


