"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";
import { atmosphericPresets } from "@/lib/geo-presets";
import { getLocalTimeInfo, timeAtmospheres } from "@/lib/time-engine";

/**
 * Photorealistic Sunset Ocean Shader
 * 
 * Uses multi-directional Gerstner-style wave harmonics,
 * smooth Fresnel reflectance, and deep oceanic indigo-sapphire tones.
 * Zero grid artifacts, zero harsh glares.
 */

const oceanVertexShader = `
uniform float uTime;
varying vec3 vWorldPosition;
varying vec3 vNormal;

// Multi-directional rolling waves
float calculateWaveHeight(vec2 pos, float time) {
  float h = 0.0;
  
  // Wave 1: Gentle rolling swell (heading south-west)
  vec2 d1 = normalize(vec2(0.8, 0.6));
  float w1 = dot(d1, pos) * 0.035 + time * 0.6;
  h += sin(w1) * 0.7;

  // Wave 2: Cross swell (heading south-east)
  vec2 d2 = normalize(vec2(-0.6, 0.8));
  float w2 = dot(d2, pos) * 0.055 + time * 0.8;
  h += sin(w2) * 0.4;

  // Wave 3: Micro ripples
  vec2 d3 = normalize(vec2(0.3, 0.9));
  float w3 = dot(d3, pos) * 0.12 - time * 1.1;
  h += sin(w3) * 0.15;

  return h;
}

void main() {
  vec3 pos = position;
  float h = calculateWaveHeight(pos.xy, uTime);
  pos.z += h;

  // Calculate analytical wave normal using finite differences
  float eps = 0.5;
  float hX = calculateWaveHeight(pos.xy + vec2(eps, 0.0), uTime);
  float hY = calculateWaveHeight(pos.xy + vec2(0.0, eps), uTime);
  vec3 normalWave = normalize(vec3(-(hX - h) / eps, -(hY - h) / eps, 1.0));

  vNormal = normalize(normalMatrix * normalWave);
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const oceanFragmentShader = `
uniform float uTime;
uniform vec3 uSunPosition;
uniform vec3 uDeepWater;
uniform vec3 uShallowWater;
uniform vec3 uSunGlow;
uniform vec3 uHorizonColor;

varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 sunDir = normalize(uSunPosition - vWorldPosition);
  vec3 normal = normalize(vNormal);

  // 1. Fresnel Reflectance
  float cosTheta = clamp(dot(viewDir, normal), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 3.5);

  // 2. Base Water Hue (Deep oceanic twilight)
  vec3 waterColor = mix(uDeepWater, uShallowWater, clamp(fresnel * 0.5, 0.0, 1.0));

  // 3. Gentle Warm Sun Reflection (Soft, warm, non-blinding)
  vec3 halfVector = normalize(sunDir + viewDir);
  float nDotH = max(dot(normal, halfVector), 0.0);
  
  // Soft, warm sun trail towards sunset
  float specular = pow(nDotH, 64.0) * 0.6;
  float broadGlow = pow(nDotH, 12.0) * 0.25;
  vec3 sunReflection = uSunGlow * (specular + broadGlow);

  vec3 finalColor = waterColor + sunReflection * fresnel;

  // 4. Smooth Horizon Atmosphere Blending (seamless edge into sunset)
  float dist = length(cameraPosition - vWorldPosition);
  float fogFactor = smoothstep(60.0, 600.0, dist);
  finalColor = mix(finalColor, uHorizonColor, fogFactor * 0.95);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function RealisticOcean() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);

  // Compute live time of day for this location
  const localTimeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );
  const currentAtmosphere = timeAtmospheres[localTimeInfo.period];

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunPosition: { value: new THREE.Vector3(0, currentAtmosphere.sunElevation, -350) },
      uDeepWater: { value: new THREE.Color(currentAtmosphere.deepWater) },
      uShallowWater: { value: new THREE.Color(currentAtmosphere.shallowWater) },
      uSunGlow: { value: new THREE.Color(currentAtmosphere.waterGlow) },
      uHorizonColor: { value: new THREE.Color(currentAtmosphere.coralSky) },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();

      // Smoothly morph ocean water hues to location atmosphere & time of day
      const u = shaderRef.current.uniforms;
      const targetDeep = new THREE.Color(currentAtmosphere.deepWater);
      const targetShallow = new THREE.Color(currentAtmosphere.shallowWater);
      const targetGlow = new THREE.Color(currentAtmosphere.waterGlow);
      const targetHorizon = new THREE.Color(currentAtmosphere.coralSky);

      const lerpSpeed = delta * 2.5;
      u.uDeepWater.value.lerp(targetDeep, lerpSpeed);
      u.uShallowWater.value.lerp(targetShallow, lerpSpeed);
      u.uSunGlow.value.lerp(targetGlow, lerpSpeed);
      u.uHorizonColor.value.lerp(targetHorizon, lerpSpeed);
      u.uSunPosition.value.y = THREE.MathUtils.lerp(u.uSunPosition.value.y, currentAtmosphere.sunElevation, lerpSpeed);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -32, 0]}>
      <planeGeometry args={[1800, 1800, 96, 96]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={oceanVertexShader}
        fragmentShader={oceanFragmentShader}
        uniforms={uniforms}
        transparent
        opacity={0.82}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


