"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";

import { getAllSpatialPositions } from "@/lib/spatial-corridor";

export default function FlightCamera() {
  const pointer = useRef({ x: 0, y: 0 });
  const flightZ = useRef(-4);
  const flightX = useRef(0);
  const flightY = useRef(0);
  const isDragging = useRef(false);
  const previousTouch = useRef({ x: 0, y: 0 });
  const lastScrollTime = useRef(0);

  const isGlobeView = useEdifyStore((state) => state.isGlobeView);
  const isSwooping = useEdifyStore((state) => state.isSwooping);
  const cameraTarget = useEdifyStore((state) => state.cameraTarget);
  const statements = useEdifyStore((state) => state.statements);

  const { size } = useThree();
  const isMobile = size.width < 768;

  const spatialPositions = getAllSpatialPositions(18);

  useEffect(() => {
    const isInteractiveElement = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      return !!target.closest(
        'button, input, select, textarea, a, [data-interactive="true"], .pointer-events-auto, [role="dialog"], .cube-stage'
      );
    };

    // 1. Mouse Wheel Scroll Flight (Fly forward/backward through spacious corridor)
    const handleWheel = (e: WheelEvent) => {
      if (isGlobeView || isInteractiveElement(e.target)) return;
      lastScrollTime.current = performance.now();
      // Scroll down = fly forward into thoughts, scroll up = pull back
      flightZ.current = Math.max(-460, Math.min(12, flightZ.current - e.deltaY * 0.045));
    };

    // 2. Pointer & Touch Navigation
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (isGlobeView || isInteractiveElement(e.target)) return;
      isDragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousTouch.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (isInteractiveElement(e.target) && !isDragging.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      pointer.current.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(clientY / window.innerHeight) * 2 + 1;

      if (isDragging.current && !isGlobeView) {
        lastScrollTime.current = performance.now();
        const deltaX = clientX - previousTouch.current.x;
        const deltaY = clientY - previousTouch.current.y;

        // Pan horizontally and vertically through the cosmic space
        flightX.current = Math.max(-30, Math.min(30, flightX.current - deltaX * 0.035));
        flightY.current = Math.max(-15, Math.min(20, flightY.current + deltaY * 0.035));

        // Touch vertical swipe thrust forward/backward
        if ("touches" in e && Math.abs(deltaY) > Math.abs(deltaX)) {
          flightZ.current = Math.max(-460, Math.min(12, flightZ.current - deltaY * 0.06));
        }

        previousTouch.current = { x: clientX, y: clientY };
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isGlobeView]);

  useFrame((state, delta) => {
    let targetPos: THREE.Vector3;

    if (isSwooping) {
      // Cinematic dive curve down through atmospheric space
      targetPos = new THREE.Vector3(0, -3.5, 4);
    } else if (isGlobeView) {
      // Space Orbit View
      targetPos = new THREE.Vector3(0, 0, isMobile ? 26 : 22);
    } else if (cameraTarget) {
      // Focused Statement Target
      targetPos = new THREE.Vector3(cameraTarget.x, cameraTarget.y + 1, cameraTarget.z + 10);
    } else {
      // Soft-Snap to Nearest Statement when in proximity
      const timeSinceScroll = performance.now() - lastScrollTime.current;
      const isSettling = timeSinceScroll > 150 && !isDragging.current;

      let nearestStation: { x: number; y: number; z: number } | null = null;
      let minDistanceZ = Infinity;

      for (const pos of spatialPositions) {
        const stationZ = pos.z + 12; // 12 units in front of the monolith
        const distZ = Math.abs(flightZ.current - stationZ);
        if (distZ < minDistanceZ) {
          minDistanceZ = distZ;
          nearestStation = { x: pos.x, y: pos.y, z: stationZ };
        }
      }

      // If within proximity pocket (< 9.5 units), apply gentle magnetic soft-snap centering
      if (nearestStation && minDistanceZ < 9.5) {
        const proximity = 1.0 - minDistanceZ / 9.5;
        const smoothSnap = proximity * proximity * (3 - 2 * proximity); // Smooth cubic ease

        // Softly center the camera X & Y directly in front of the statement
        flightX.current = THREE.MathUtils.lerp(flightX.current, nearestStation.x, delta * 3.5 * smoothSnap);
        flightY.current = THREE.MathUtils.lerp(flightY.current, nearestStation.y, delta * 3.5 * smoothSnap);

        // Softly ease Z to reading pocket when user is settling
        if (isSettling) {
          flightZ.current = THREE.MathUtils.lerp(flightZ.current, nearestStation.z, delta * 2.8 * smoothSnap);
        }
      }

      const currentZ = isMobile ? flightZ.current + 2 : flightZ.current;
      targetPos = new THREE.Vector3(flightX.current, flightY.current, currentZ);
    }

    // Smooth camera flight lerp
    const lerpSpeed = isSwooping ? delta * 3.5 : delta * 3.0;
    state.camera.position.lerp(targetPos, lerpSpeed);

    // Subtle Parallax Look-Ahead Tilt
    if (!isGlobeView && !isSwooping) {
      const targetRotX = pointer.current.y * 0.04 + (flightY.current * 0.008);
      const targetRotY = -pointer.current.x * 0.05 - (flightX.current * 0.012);
      state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, delta * 3.0);
      state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, targetRotY, delta * 3.0);
    } else {
      state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, 0, delta * 3.0);
      state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, 0, delta * 3.0);
    }
  });

  return null;
}


