"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Photoreal-but-vivid Earth.
 * NASA Blue Marble color + SRTM-style elevation + water mask, combined in a
 * custom shader: richer land color, elevation-tinted highlands & snow,
 * turquoise shelves vs. deep ocean, relief shading, ocean glint, and a soft
 * atmospheric rim tuned for a white background.
 */

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uElev;
  uniform sampler2D uWater;
  uniform vec3 uSunDir;
  uniform float uReveal;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
  float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  vec3 sat(vec3 c, float s) { return max(mix(vec3(luma(c)), c, s), 0.0); }

  void main() {
    vec3 day = texture2D(uDay, vUv).rgb;
    float water = smoothstep(0.35, 0.65, texture2D(uWater, vUv).r);
    float h = texture2D(uElev, vUv).r;

    // --- Relief normal from the elevation map -------------------------
    float hE = texture2D(uElev, vUv + vec2(uTexel.x, 0.0)).r;
    float hW = texture2D(uElev, vUv - vec2(uTexel.x, 0.0)).r;
    float hN = texture2D(uElev, vUv + vec2(0.0, uTexel.y)).r;
    float hS = texture2D(uElev, vUv - vec2(0.0, uTexel.y)).r;
    vec3 N = normalize(vNormalW);
    vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-5, 0.0, 0.0));
    vec3 north = cross(N, east);
    float relief = 6.0 * (1.0 - water);
    vec3 Nb = normalize(N - relief * ((hE - hW) * east + (hN - hS) * north));

    // --- Land: vivid satellite color, tinted by elevation ---------------
    vec3 land = sat(day, 1.5) * 1.45;
    float veg = clamp((day.g - max(day.r, day.b)) * 10.0, 0.0, 1.0);
    land = mix(land, land * vec3(0.82, 1.18, 0.78), veg * 0.8);           // lusher greens
    float desert = clamp((day.r - day.b) * 4.0, 0.0, 1.0) * (1.0 - veg);
    land = mix(land, land * vec3(1.12, 0.98, 0.82), desert * 0.6);        // warmer sands
    land = mix(land, toLinear(vec3(0.62, 0.42, 0.30)), smoothstep(0.20, 0.50, h) * 0.38); // terracotta highlands
    land = mix(land, toLinear(vec3(0.46, 0.38, 0.44)), smoothstep(0.42, 0.62, h) * 0.25); // violet rock
    land = mix(land, vec3(0.94, 0.96, 1.0), smoothstep(0.58, 0.86, h) * 0.75);            // snowcaps

    // --- Ocean: deep sapphire to turquoise shelves -----------------------
    float shelf = smoothstep(0.06, 0.32, day.b + day.g * 0.5);
    vec3 deep = toLinear(vec3(0.03, 0.20, 0.50));
    vec3 shallow = toLinear(vec3(0.08, 0.70, 0.82));
    vec3 ocean = mix(deep, shallow, shelf);
    ocean = mix(ocean, sat(day, 1.3) * 1.5, 0.22);
    ocean = mix(ocean, day * 1.1, smoothstep(0.35, 0.7, luma(day)));     // keep sea ice white

    vec3 albedo = mix(land, ocean, water);

    // --- Soft, therapeutic lighting (never a dark side) ------------------
    vec3 L = normalize(uSunDir);
    vec3 V = normalize(cameraPosition - vPosW);
    float diff = max(dot(Nb, L), 0.0);
    vec3 color = albedo * (0.46 + 0.74 * diff);

    vec3 H = normalize(L + V);
    float glint = pow(max(dot(N, H), 0.0), 90.0) * 0.6 * water;
    color += vec3(1.0, 0.98, 0.94) * glint;

    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    color = mix(color, toLinear(vec3(0.60, 0.80, 1.0)), fres * 0.7);

    color = mix(vec3(1.0), color, uReveal);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const HALO_VERT = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HALO_FRAG = /* glsl */ `
  uniform float uReveal;
  varying vec3 vN;
  void main() {
    float a = pow(clamp(-vN.z * 2.2, 0.0, 1.0), 3.0) * 0.55 * uReveal;
    gl_FragColor = vec4(0.55, 0.76, 1.0, a);
    #include <colorspace_fragment>
  }
`;

interface Maps {
  day: THREE.Texture;
  elev: THREE.Texture;
  water: THREE.Texture;
}

function loadTexture(loader: THREE.TextureLoader, url: string, srgb: boolean) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (t) => {
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 8;
        resolve(t);
      },
      undefined,
      reject,
    );
  });
}

export default function Earth() {
  const [maps, setMaps] = useState<Maps | null>(null);
  const [clouds, setClouds] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    Promise.all([
      loadTexture(loader, "/textures/earth-blue-marble.jpg", true),
      loadTexture(loader, "/textures/earth-topology.png", false),
      loadTexture(loader, "/textures/earth-water.png", false),
    ])
      .then(([day, elev, water]) => {
        if (alive) setMaps({ day, elev, water });
        // Clouds are large; load after the planet is visible.
        return loadTexture(loader, "/textures/clouds.png", true);
      })
      .then((c) => {
        if (alive) setClouds(c);
      })
      .catch((err) => console.warn("Earth textures failed to load", err));
    return () => {
      alive = false;
    };
  }, []);

  if (!maps) return null;
  return <EarthBody maps={maps} clouds={clouds} />;
}

function EarthBody({ maps, clouds }: { maps: Maps; clouds: THREE.Texture | null }) {
  const earthMat = useRef<THREE.ShaderMaterial>(null);
  const haloMat = useRef<THREE.ShaderMaterial>(null);
  const cloudMat = useRef<THREE.MeshBasicMaterial>(null);
  const cloudMesh = useRef<THREE.Mesh>(null);
  const sun = useMemo(() => new THREE.Vector3(), []);

  const earthUniforms = useMemo(
    () => ({
      uDay: { value: maps.day },
      uElev: { value: maps.elev },
      uWater: { value: maps.water },
      uSunDir: { value: new THREE.Vector3(-0.5, 0.5, 1) },
      uReveal: { value: 0 },
      uTexel: { value: new THREE.Vector2(1 / 2048, 1 / 1024) },
    }),
    [maps],
  );
  const haloUniforms = useMemo(() => ({ uReveal: { value: 0 } }), []);

  useFrame((state, dt) => {
    const m = earthMat.current;
    if (!m) return;
    // Key light rides with the camera (upper-left), so the globe always looks lit.
    sun.set(-0.55, 0.55, 1).applyQuaternion(state.camera.quaternion).normalize();
    m.uniforms.uSunDir.value.copy(sun);
    const r = Math.min(1, m.uniforms.uReveal.value + dt * 0.8);
    m.uniforms.uReveal.value = r;
    if (haloMat.current) haloMat.current.uniforms.uReveal.value = r;
    if (cloudMat.current) cloudMat.current.opacity = Math.min(0.32, cloudMat.current.opacity + dt * 0.2);
    if (cloudMesh.current) cloudMesh.current.rotation.y += dt * 0.006;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        <shaderMaterial
          ref={earthMat}
          vertexShader={EARTH_VERT}
          fragmentShader={EARTH_FRAG}
          uniforms={earthUniforms}
        />
      </mesh>

      {clouds && (
        <mesh ref={cloudMesh} scale={1.008}>
          <sphereGeometry args={[1, 96, 96]} />
          <meshBasicMaterial
            ref={cloudMat}
            map={clouds}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      <mesh scale={1.16}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={HALO_VERT}
          fragmentShader={HALO_FRAG}
          uniforms={haloUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
