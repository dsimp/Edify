"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEdifyStore } from "@/lib/store";
import { atmosphericPresets } from "@/lib/geo-presets";
import { getLocalTimeInfo, timeAtmospheres } from "@/lib/time-engine";

const vertexShader = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 topColor;
uniform vec3 duskColor;
uniform vec3 roseColor;
uniform vec3 coralColor;
uniform vec3 goldenHourColor;
uniform vec3 sunColor;
uniform vec3 sunPosition;
uniform float sunIntensity;
uniform float uSkyOpacity;

varying vec3 vWorldPosition;

void main() {
  vec3 dir = normalize(vWorldPosition);
  float h = dir.y;

  // Rayleigh/Mie Atmospheric Gradient
  vec3 sky;
  if (h > 0.4) {
    sky = mix(duskColor, topColor, smoothstep(0.4, 1.0, h));
  } else if (h > 0.15) {
    sky = mix(roseColor, duskColor, smoothstep(0.15, 0.4, h));
  } else if (h > -0.02) {
    sky = mix(coralColor, roseColor, smoothstep(-0.02, 0.15, h));
  } else if (h > -0.2) {
    sky = mix(goldenHourColor, coralColor, smoothstep(-0.2, -0.02, h));
  } else {
    sky = mix(goldenHourColor * 0.75, goldenHourColor, smoothstep(-1.0, -0.2, h));
  }

  // Sun / Moon emission
  vec3 sunDir = normalize(sunPosition);
  float cosAngle = dot(dir, sunDir);
  
  float innerGlow = pow(max(cosAngle, 0.0), 48.0) * 0.75;
  float wideScatter = pow(max(cosAngle, 0.0), 6.0) * 0.35;

  vec3 sunEmission = sunColor * innerGlow + goldenHourColor * wideScatter;
  vec3 finalColor = sky + sunEmission * sunIntensity;

  gl_FragColor = vec4(finalColor, uSkyOpacity);
}
`;

export default function SkyDome() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const activeLocation = useEdifyStore((s) => s.activeLocation);
  const timeOfDayOverride = useEdifyStore((s) => s.timeOfDayOverride);
  const isGlobeView = useEdifyStore((s) => s.isGlobeView);

  // Compute live time of day for this location
  const localTimeInfo = useMemo(
    () => getLocalTimeInfo(activeLocation?.lng || 0, timeOfDayOverride || undefined),
    [activeLocation?.lng, timeOfDayOverride]
  );
  const currentAtmosphere = timeAtmospheres[localTimeInfo.period];

  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color(currentAtmosphere.topSky) },
      duskColor: { value: new THREE.Color(currentAtmosphere.duskSky) },
      roseColor: { value: new THREE.Color(currentAtmosphere.roseSky) },
      coralColor: { value: new THREE.Color(currentAtmosphere.coralSky) },
      goldenHourColor: { value: new THREE.Color(currentAtmosphere.goldenHourSky) },
      sunColor: { value: new THREE.Color(currentAtmosphere.sunColor) },
      sunPosition: { value: new THREE.Vector3(0, currentAtmosphere.sunElevation, -380) },
      sunIntensity: { value: 0.9 },
      uSkyOpacity: { value: 1.0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      const u = materialRef.current.uniforms;

      // Smoothly fade sky dome out during space orbit to reveal cosmic galaxy
      const targetOpacity = isGlobeView ? 0.0 : 1.0;
      u.uSkyOpacity.value = THREE.MathUtils.lerp(u.uSkyOpacity.value, targetOpacity, delta * 3.0);

      // Smoothly morph sky atmosphere colors into selected location & local time
      const targetTop = new THREE.Color(currentAtmosphere.topSky);
      const targetDusk = new THREE.Color(currentAtmosphere.duskSky);
      const targetRose = new THREE.Color(currentAtmosphere.roseSky);
      const targetCoral = new THREE.Color(currentAtmosphere.coralSky);
      const targetGolden = new THREE.Color(currentAtmosphere.goldenHourSky);
      const targetSun = new THREE.Color(currentAtmosphere.sunColor);

      const lerpSpeed = delta * 2.5;
      u.topColor.value.lerp(targetTop, lerpSpeed);
      u.duskColor.value.lerp(targetDusk, lerpSpeed);
      u.roseColor.value.lerp(targetRose, lerpSpeed);
      u.coralColor.value.lerp(targetCoral, lerpSpeed);
      u.goldenHourColor.value.lerp(targetGolden, lerpSpeed);
      u.sunColor.value.lerp(targetSun, lerpSpeed);
      u.sunPosition.value.y = THREE.MathUtils.lerp(u.sunPosition.value.y, currentAtmosphere.sunElevation, lerpSpeed);

      u.sunIntensity.value = 0.9 + Math.sin(t * 1.2) * 0.02;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}


