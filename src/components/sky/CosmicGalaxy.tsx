"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";

/**
 * Cosmic Galaxy Universe Background
 * 
 * Features:
 * - 2,200 multi-spectral 3D twinkling stars
 * - Procedural Milky Way nebula glow & interstellar dust clouds
 * - Smooth fade-in when in 3D Globe Orbit view
 */

const nebulaVertexShader = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const nebulaFragmentShader = `
uniform float uTime;
uniform float uOpacity;
varying vec3 vWorldPosition;

// 3D Simplex-like noise for cosmic nebulae
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = p * 2.0 + vec3(10.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  
  // Cosmic Galaxy Nebula Colors
  vec3 deepSpace = vec3(0.02, 0.015, 0.05); // Deep velvet cosmic void
  vec3 magentaNebula = vec3(0.35, 0.12, 0.42); // Interstellar magenta
  vec3 cyanNebula = vec3(0.08, 0.25, 0.45); // Celestial cyan dust
  vec3 starlightAmber = vec3(0.55, 0.35, 0.2); // Core galactic dust

  // Milky Way band inclination
  float band = 1.0 - abs(dir.y * 0.8 + dir.x * 0.3);
  band = clamp(band, 0.0, 1.0);

  float n1 = fbm(dir * 3.5 + vec3(uTime * 0.01));
  float n2 = fbm(dir * 6.0 - vec3(uTime * 0.015));

  vec3 nebula = mix(deepSpace, cyanNebula, n1 * band * 0.8);
  nebula = mix(nebula, magentaNebula, n2 * band * 0.7);
  nebula += starlightAmber * pow(band, 4.0) * n1 * 0.4;

  gl_FragColor = vec4(nebula, uOpacity);
}
`;

export default function CosmicGalaxy() {
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);
  const opacityRef = useRef(0);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const starsRef = useRef<THREE.Points>(null);

  // Generate 2,200 Star Particles in spherical galaxy field
  const starCount = 2200;
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const spectralColors = [
      new THREE.Color("#FFFFFF"), // Pure white
      new THREE.Color("#93C5FD"), // Celestial blue
      new THREE.Color("#FDE68A"), // Warm golden star
      new THREE.Color("#E2D9F3"), // Lavender stardust
      new THREE.Color("#F472B6"), // Rose stellar spark
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute stars on outer sphere (radius 180 to 450)
      const radius = 180 + Math.random() * 270;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 1.8 + 0.6;
    }

    return [positions, colors, sizes];
  }, [starCount]);

  const nebulaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, 1.0, delta * 3.0);

    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      nebulaMaterialRef.current.uniforms.uOpacity.value = opacityRef.current;
    }

    if (starsRef.current) {
      // Gentle galaxy rotation
      starsRef.current.rotation.y += 0.0003;
      (starsRef.current.material as THREE.PointsMaterial).opacity = opacityRef.current;
    }
  });

  return (
    <group>
      {/* 1. Milky Way Cosmic Nebula Sphere */}
      <mesh>
        <sphereGeometry args={[480, 48, 48]} />
        <shaderMaterial
          ref={nebulaMaterialRef}
          vertexShader={nebulaVertexShader}
          fragmentShader={nebulaFragmentShader}
          uniforms={nebulaUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* 2. Twinkling 3D Cosmic Starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
