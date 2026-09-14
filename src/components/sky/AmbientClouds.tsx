"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Generates an ultra-soft procedural sunset cloud puff texture
 */
function generateCloudTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Multi-lobed cloud puff synthesis
  const lobes = [
    { x: 256, y: 256, r: 180, alpha: 0.8 },
    { x: 180, y: 270, r: 140, alpha: 0.6 },
    { x: 330, y: 270, r: 140, alpha: 0.6 },
    { x: 220, y: 200, r: 120, alpha: 0.7 },
    { x: 290, y: 195, r: 130, alpha: 0.75 },
  ];

  lobes.forEach((lobe) => {
    const grad = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, lobe.r);
    grad.addColorStop(0, `rgba(255, 250, 240, ${lobe.alpha})`);
    grad.addColorStop(0.4, `rgba(255, 230, 200, ${lobe.alpha * 0.6})`);
    grad.addColorStop(0.75, `rgba(244, 162, 97, ${lobe.alpha * 0.2})`);
    grad.addColorStop(1, "rgba(244, 162, 97, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
    ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
}

export default function AmbientClouds() {
  const count = 45;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cloudTexture = useMemo(() => generateCloudTexture(), []);

  const clouds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 600,
        Math.random() * 80 + 5, // Above ocean surface
        -120 - Math.random() * 450
      );
      
      const scaleX = 35 + Math.random() * 45;
      const scaleY = 18 + Math.random() * 25;
      const opacity = 0.08 + Math.random() * 0.16;
      const speed = 0.02 + Math.random() * 0.03;
      const phase = Math.random() * Math.PI * 2;

      arr.push({ position, scaleX, scaleY, opacity, speed, phase, originalX: position.x });
    }
    return arr;
  }, [count]);

  useFrame(({ clock, camera }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const cloud = clouds[i];
      // Slow, therapeutic panoramic drift across the sunset
      const currentX = cloud.originalX + Math.sin(t * cloud.speed + cloud.phase) * 15;
      
      dummy.position.set(currentX, cloud.position.y, cloud.position.z);
      dummy.scale.set(cloud.scaleX, cloud.scaleY, 1);
      dummy.quaternion.copy(camera.quaternion);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!cloudTexture) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={cloudTexture}
        color="#FFE6C7"
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

