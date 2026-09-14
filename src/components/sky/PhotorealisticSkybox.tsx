"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";
import { curatedPlaces } from "@/lib/curated-places";
import { getLocalTimeInfo } from "@/lib/time-engine";

export default function PhotorealisticSkybox() {
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);

  const locId = activeLocation?.id || "global";
  const place = curatedPlaces[locId] || curatedPlaces.global;

  // Compute live local solar time
  const timeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );

  // Load the curated high-res real-world photograph
  const texture = useLoader(THREE.TextureLoader, place.photoUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
  });

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1.0, 1.0);

  // Dynamic Time-of-Day Lighting Color
  const { colorTint, opacity } = useMemo(() => {
    switch (timeInfo.period) {
      case "dawn":
        return { colorTint: new THREE.Color("#FFD1DC"), opacity: 0.94 };
      case "day":
        return { colorTint: new THREE.Color("#FFFFFF"), opacity: 0.98 };
      case "night":
        return { colorTint: new THREE.Color("#6B82A8"), opacity: 0.80 };
      case "sunset":
      default:
        return { colorTint: new THREE.Color("#FFE0B2"), opacity: 0.96 };
    }
  }, [timeInfo.period]);

  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Very slow, majestic cinematic rotation
      meshRef.current.rotation.y += delta * 0.0015;
    }
  });

  if (isGlobeView) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* 360° Spherical Panoramic City Skybox (Radius 520, correctly oriented) */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[520, 64, 32]} />
        <meshBasicMaterial
          map={texture}
          color={colorTint}
          transparent
          opacity={opacity}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
