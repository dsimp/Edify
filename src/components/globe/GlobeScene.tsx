"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import Earth from "./Earth";
import { PLACES, PLACE_BY_ID, latLngToVector3 } from "@/lib/places";
import { consensusScore } from "@/lib/economics";
import { useStore } from "@/lib/store";
import type { Place } from "@/lib/types";

function targetRotationForLatLng(lat: number, lng: number): { rx: number; ry: number } {
  const [vx, vy, vz] = latLngToVector3(lat, lng, 1);
  const ry = Math.atan2(-vx, vz);
  const rx = Math.asin(Math.max(-1, Math.min(1, vy)));
  return { rx, ry };
}

function shortestAngleDelta(from: number, to: number) {
  const twoPi = Math.PI * 2;
  return ((to - from + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function LocationPin({
  place,
  activityLevel,
  isSelected,
  isHovered,
  onHover,
  onSelect,
}: {
  place: Place;
  /** 0.2 to 1.0 normalized ecosystem activity/stock for this location */
  activityLevel: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const pinRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const pulseMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const facingRef = useRef(true);
  const [facing, setFacing] = useState(true);
  const pinDownPos = useRef<{ x: number; y: number } | null>(null);

  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);

  const [x, y, z] = useMemo(
    () => latLngToVector3(place.lat, place.lng, 1.013),
    [place.lat, place.lng],
  );

  // Compute quaternion so 3D surface rings lie flush against the sphere tangent plane
  const surfaceQuat = useMemo(() => {
    const normal = new THREE.Vector3(x, y, z).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [x, y, z]);

  const phaseOffset = useMemo(
    () => (place.id.charCodeAt(0) * 1.7 + place.id.length * 0.9) % (Math.PI * 2),
    [place.id],
  );

  // Keep <group ref={pinRef}> permanently mounted so world position is tracked
  // continuously while turning the globe in any direction, and animate 3D pulse ring.
  useFrame((state) => {
    const g = pinRef.current;
    if (!g) return;
    g.getWorldPosition(worldPos);
    camDir.copy(state.camera.position).normalize();
    const dot = worldPos.normalize().dot(camDir);
    const vis = dot > 0.06;
    if (vis !== facingRef.current) {
      facingRef.current = vis;
      setFacing(vis);
      if (!vis && isHovered) {
        onHover(null);
      }
    }

    // Animate 3D surface pulse ring proportional to city ecosystem activity
    if (pulseRingRef.current && pulseMatRef.current && vis) {
      const speed = 0.65 + activityLevel * 0.85;
      const cycle = (state.clock.elapsedTime * speed + phaseOffset) % 1;
      const maxScale = 1.4 + activityLevel * 1.8 + (isHovered ? 0.6 : 0);
      const s = 1 + cycle * maxScale;
      pulseRingRef.current.scale.set(s, s, 1);
      pulseMatRef.current.opacity = (1 - cycle) * (0.35 + activityLevel * 0.5);
    }
  });

  const ringColor = isHovered || isSelected ? "#38bdf8" : activityLevel > 0.6 ? "#10b981" : "#38bdf8";

  return (
    <group ref={pinRef} position={[x, y, z]} quaternion={surfaceQuat}>
      {/* 3D Surface Base Ring + Expanding Ecosystem Activity Pulse Ring */}
      <mesh visible={facing}>
        <ringGeometry args={[0.016, 0.024 + activityLevel * 0.008, 32]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={facing ? 0.65 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={pulseRingRef} visible={facing}>
        <ringGeometry args={[0.02, 0.028, 32]} />
        <meshBasicMaterial
          ref={pulseMatRef}
          color={ringColor}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Surface Hitbox Sphere for direct Three.js click/hover reliability */}
      <mesh
        visible={facing}
        onClick={(e) => {
          if (!facingRef.current) return;
          e.stopPropagation();
          onSelect(place.id);
        }}
        onPointerOver={(e) => {
          if (!facingRef.current) return;
          e.stopPropagation();
          onHover(place.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial
          color={isHovered || isSelected ? "#38bdf8" : "#ffffff"}
          transparent
          opacity={facing ? 0.95 : 0}
        />
      </mesh>

      <Html
        center
        zIndexRange={[10, 0]}
        style={{
          pointerEvents: facing ? "auto" : "none",
          opacity: facing ? 1 : 0,
          transition: "opacity 180ms ease",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          data-pin="true"
          onPointerDown={(e) => {
            e.stopPropagation();
            pinDownPos.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!facingRef.current) return;
            if (pinDownPos.current) {
              const dx = Math.abs(e.clientX - pinDownPos.current.x);
              const dy = Math.abs(e.clientY - pinDownPos.current.y);
              pinDownPos.current = null;
              if (dx + dy > 10) return;
            }
            onSelect(place.id);
          }}
          onMouseEnter={() => {
            if (facingRef.current) onHover(place.id);
          }}
          onMouseLeave={() => onHover(null)}
          className="group relative flex flex-col items-center justify-center p-3 cursor-pointer focus:outline-none"
        >
          {/* Glowing Pinpoint Dot scaled subtly by ecosystem activity */}
          <span className="relative flex items-center justify-center">
            <span
              className={`absolute rounded-full transition-all duration-300 ${
                isHovered || isSelected
                  ? "w-8 h-8 bg-sky-400/45 animate-ping"
                  : activityLevel > 0.6
                    ? "w-6 h-6 bg-emerald-400/35 animate-pulse"
                    : "w-4 h-4 bg-sky-400/25"
              }`}
            />
            <span
              className={`relative rounded-full border border-white transition-all duration-200 ${
                isHovered || isSelected
                  ? "w-3.5 h-3.5 bg-sky-400 scale-125 shadow-[0_0_16px_rgba(56,189,248,1)]"
                  : activityLevel > 0.6
                    ? "w-3 h-3 bg-white shadow-[0_0_12px_rgba(16,185,129,0.95)]"
                    : "w-2.5 h-2.5 bg-white shadow-[0_0_9px_rgba(255,255,255,0.9)]"
              }`}
            />
          </span>

          {/* Location label ONLY appears on hover */}
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-display font-medium tracking-tight whitespace-nowrap shadow-[0_8px_24px_rgba(15,23,42,0.18)] border border-slate-200/80 transition-all duration-200 ${
              isHovered
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-1 scale-95 pointer-events-none"
            }`}
          >
            {place.name}
          </div>
        </button>
      </Html>
    </group>
  );
}

function GlobeRig() {
  const groupRef = useRef<THREE.Group>(null);

  const selectedPlaceId = useStore((s) => s.selectedPlaceId);
  const selectPlace = useStore((s) => s.selectPlace);
  const statements = useStore((s) => s.statements);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0.0014 });

  const activePlace =
    selectedPlaceId && selectedPlaceId !== "world" ? PLACE_BY_ID[selectedPlaceId] : null;

  // Compute normalized ecosystem activity/stock per location (0.25 .. 1.0)
  const activityByPlace = useMemo(() => {
    const raw: Record<string, number> = {};
    let maxVal = 1;
    for (const p of PLACES) {
      const cityStatements = statements.filter((s) => s.placeId === p.id);
      const scoreSum = cityStatements.reduce((acc, s) => acc + Math.sqrt(consensusScore(s)), 0);
      raw[p.id] = scoreSum;
      if (scoreSum > maxVal) maxVal = scoreSum;
    }
    const normalized: Record<string, number> = {};
    for (const p of PLACES) {
      normalized[p.id] = Math.min(1, Math.max(0.25, raw[p.id] / maxVal));
    }
    return normalized;
  }, [statements]);

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest("[data-globe-stage='true']")) return;
      if (target.closest("[data-pin='true']")) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      isDragging.current = true;
      prevPointer.current = { x: clientX, y: clientY };
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !groupRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevPointer.current.x;
      const dy = clientY - prevPointer.current.y;

      groupRef.current.rotation.y += dx * 0.0055;
      groupRef.current.rotation.x = THREE.MathUtils.clamp(
        groupRef.current.rotation.x + dy * 0.0055,
        -1.15,
        1.15,
      );

      vel.current.y = dx * 0.002;
      vel.current.x = dy * 0.002;
      prevPointer.current = { x: clientX, y: clientY };
    };

    const onUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const isMobile = state.size.width < 768;

    if (activePlace && !isDragging.current) {
      const { rx, ry } = targetRotationForLatLng(activePlace.lat, activePlace.lng);
      g.rotation.y += shortestAngleDelta(g.rotation.y, ry) * Math.min(1, dt * 4.5);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rx, Math.min(1, dt * 4.5));
    } else if (!isDragging.current && !hoveredId) {
      // Pause spin gently when hovering a pin so it is effortless to click
      g.rotation.y += vel.current.y;
      g.rotation.x += vel.current.x;
      vel.current.y = THREE.MathUtils.lerp(vel.current.y, 0.0014, 0.03);
      vel.current.x = THREE.MathUtils.lerp(vel.current.x, 0, 0.04);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.12, 0.015);
    }

    // Zoom deeply into the clicked location setting when active
    const targetZ = activePlace ? (isMobile ? 1.55 : 1.42) : isMobile ? 3.1 : 2.62;
    const cam = state.camera;
    cam.position.set(
      THREE.MathUtils.lerp(cam.position.x, 0, Math.min(1, dt * 3.8)),
      THREE.MathUtils.lerp(cam.position.y, 0, Math.min(1, dt * 3.8)),
      THREE.MathUtils.lerp(cam.position.z, targetZ, Math.min(1, dt * 3.8)),
    );
    cam.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} rotation={[0.15, -0.6, 0]}>
      <Earth />

      {/* Show location pinpoints + 3D surface pulse rings when on the globe view */}
      {!selectedPlaceId &&
        PLACES.map((place) => (
          <LocationPin
            key={place.id}
            place={place}
            activityLevel={activityByPlace[place.id] ?? 0.35}
            isSelected={selectedPlaceId === place.id}
            isHovered={hoveredId === place.id}
            onHover={setHoveredId}
            onSelect={(id) => {
              setHoveredId(null);
              selectPlace(id);
            }}
          />
        ))}
    </group>
  );
}

export default function GlobeScene() {
  return (
    <div
      data-globe-stage="true"
      className="fixed inset-0 z-0 bg-white cursor-grab active:cursor-grabbing"
    >
      <Canvas
        camera={{ position: [0, 0, 2.62], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[-4, 4, 6]} intensity={1.4} />
        <GlobeRig />
      </Canvas>
    </div>
  );
}
