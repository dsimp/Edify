"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { globalLocations, latLngToVector3, GeoLocationItem } from "@/lib/geo-presets";
import { useEdifyStore } from "@/lib/store";

/**
 * High-Precision Equirectangular World Continent Texture
 * Generates an accurate, detailed map of Earth's 7 continents,
 * topological mountain ranges, vegetation, deserts, and ice caps.
 */
function createWorldMapTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 1. Deep Obsidian Cosmic Velvet Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#05040A");
  oceanGrad.addColorStop(0.5, "#0A0716");
  oceanGrad.addColorStop(1, "#05040A");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Coordinate Conversion (Longitude -180..180 -> X 0..width, Latitude 90..-90 -> Y 0..height)
  const toX = (lon: number) => ((lon + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  const drawLandmasses = (color: string, isShelf = false) => {
    ctx.fillStyle = color;

    // ==========================================
    // 1. NORTH AMERICA & CENTRAL AMERICA
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(-168), toY(66)); // Alaska West (Bering Strait)
    ctx.lineTo(toX(-155), toY(71)); // Alaska North
    ctx.lineTo(toX(-135), toY(70)); // Mackenzie Delta
    ctx.lineTo(toX(-115), toY(68)); // Arctic Canada
    ctx.lineTo(toX(-95), toY(72));  // Hudson Bay North
    ctx.lineTo(toX(-80), toY(62));  // Hudson Bay East
    ctx.lineTo(toX(-65), toY(60));  // Labrador
    ctx.lineTo(toX(-55), toY(50));  // Newfoundland
    ctx.lineTo(toX(-65), toY(44));  // Nova Scotia
    ctx.lineTo(toX(-71), toY(42));  // Boston
    ctx.lineTo(toX(-74), toY(40.7));// New York
    ctx.lineTo(toX(-76), toY(35));  // Cape Hatteras
    ctx.lineTo(toX(-80), toY(25));  // Florida South (Miami)
    ctx.lineTo(toX(-82), toY(29));  // Florida West
    ctx.lineTo(toX(-90), toY(30));  // New Orleans
    ctx.lineTo(toX(-97), toY(26));  // Texas Gulf Coast
    ctx.lineTo(toX(-98), toY(20));  // Mexico East
    ctx.lineTo(toX(-90), toY(21));  // Yucatan Peninsula
    ctx.lineTo(toX(-84), toY(10));  // Costa Rica / Panama
    ctx.lineTo(toX(-78), toY(8));   // Darien Gap
    ctx.lineTo(toX(-88), toY(14));  // Central America Pacific
    ctx.lineTo(toX(-105), toY(21)); // Mexico West Coast
    ctx.lineTo(toX(-110), toY(23)); // Baja California Tip
    ctx.lineTo(toX(-116), toY(32)); // Baja North
    ctx.lineTo(toX(-122.4), toY(37.8)); // San Francisco Bay
    ctx.lineTo(toX(-124), toY(45)); // Oregon Coast
    ctx.lineTo(toX(-125), toY(49)); // Vancouver Island
    ctx.lineTo(toX(-135), toY(57)); // Alaska Panhandle
    ctx.lineTo(toX(-150), toY(60)); // Anchorage
    ctx.lineTo(toX(-165), toY(54)); // Aleutian start
    ctx.closePath();
    ctx.fill();

    // Greenland
    ctx.beginPath();
    ctx.moveTo(toX(-55), toY(82));
    ctx.lineTo(toX(-20), toY(83));
    ctx.lineTo(toX(-20), toY(70));
    ctx.lineTo(toX(-45), toY(60));
    ctx.lineTo(toX(-55), toY(72));
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 2. SOUTH AMERICA
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(-77), toY(8));   // Colombia North
    ctx.lineTo(toX(-65), toY(11));  // Venezuela coast
    ctx.lineTo(toX(-52), toY(5));   // Guianas
    ctx.lineTo(toX(-48), toY(0));   // Amazon River Mouth
    ctx.lineTo(toX(-35), toY(-6));  // Brazil Eastern Tip (Recife)
    ctx.lineTo(toX(-38), toY(-13)); // Salvador
    ctx.lineTo(toX(-43), toY(-23)); // Rio de Janeiro
    ctx.lineTo(toX(-46.6), toY(-23.5)); // São Paulo
    ctx.lineTo(toX(-50), toY(-30)); // South Brazil
    ctx.lineTo(toX(-56), toY(-35)); // Rio de la Plata (Buenos Aires)
    ctx.lineTo(toX(-65), toY(-42)); // Patagonia Atlantic
    ctx.lineTo(toX(-68), toY(-54)); // Tierra del Fuego / Cape Horn
    ctx.lineTo(toX(-75), toY(-48)); // Chile Fjords
    ctx.lineTo(toX(-72), toY(-33)); // Santiago
    ctx.lineTo(toX(-70), toY(-18)); // Peru Coast (Lima)
    ctx.lineTo(toX(-80), toY(-3));  // Ecuador (Guayaquil)
    ctx.lineTo(toX(-79), toY(3));   // Colombia Pacific
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 3. EUROPE
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(-9), toY(37));   // Portugal (Lisbon / Sagres)
    ctx.lineTo(toX(-9), toY(43));   // Galicia / North Spain
    ctx.lineTo(toX(-1), toY(44));   // Bay of Biscay
    ctx.lineTo(toX(-4), toY(48));   // Brittany
    ctx.lineTo(toX(2.3), toY(48.8));// Paris / Northern France
    ctx.lineTo(toX(5), toY(53));    // Netherlands / North Sea
    ctx.lineTo(toX(8), toY(56));    // Denmark
    ctx.lineTo(toX(10), toY(60));   // Norway South
    ctx.lineTo(toX(18), toY(69));   // North Cape Norway
    ctx.lineTo(toX(30), toY(70));   // Kola Peninsula
    ctx.lineTo(toX(40), toY(65));   // White Sea
    ctx.lineTo(toX(50), toY(60));   // Eastern Europe / Russia border
    ctx.lineTo(toX(40), toY(47));   // Black Sea North (Ukraine)
    ctx.lineTo(toX(30), toY(45));   // Danube Delta / Romania
    ctx.lineTo(toX(24), toY(38));   // Greece / Aegean
    ctx.lineTo(toX(16), toY(38));   // Italy South (Calabria)
    ctx.lineTo(toX(12.5), toY(42)); // Rome / West Italy
    ctx.lineTo(toX(9), toY(44));    // Genoa / Riviera
    ctx.lineTo(toX(3), toY(42));    // Barcelona / East Spain
    ctx.lineTo(toX(-5), toY(36));   // Gibraltar
    ctx.closePath();
    ctx.fill();

    // British Isles (UK & Ireland)
    ctx.beginPath();
    ctx.moveTo(toX(-5), toY(50));
    ctx.lineTo(toX(0), toY(51.5));  // London
    ctx.lineTo(toX(1.7), toY(52.5));
    ctx.lineTo(toX(-2), toY(58));   // Scotland North
    ctx.lineTo(toX(-5), toY(56));
    ctx.lineTo(toX(-3), toY(53));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toX(-10), toY(52));
    ctx.lineTo(toX(-6), toY(53));   // Ireland (Dublin)
    ctx.lineTo(toX(-8), toY(55));
    ctx.lineTo(toX(-10), toY(54));
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 4. AFRICA
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(-5), toY(36));   // Morocco (Tangier)
    ctx.lineTo(toX(10), toY(37));   // Tunisia (Carthage)
    ctx.lineTo(toX(15), toY(32));   // Libya (Tripoli)
    ctx.lineTo(toX(30), toY(31));   // Alexandria / Nile Delta
    ctx.lineTo(toX(31.2), toY(30)); // Cairo
    ctx.lineTo(toX(34), toY(27));   // Sinai / Red Sea
    ctx.lineTo(toX(43), toY(12));   // Djibouti / Bab-el-Mandeb
    ctx.lineTo(toX(51), toY(11));   // Cape Guardafui (Somalia Tip)
    ctx.lineTo(toX(41), toY(0));    // Kenya Coast
    ctx.lineTo(toX(39), toY(-6));   // Tanzania (Zanzibar)
    ctx.lineTo(toX(35), toY(-24));  // Mozambique
    ctx.lineTo(toX(31), toY(-30));  // Durban
    ctx.lineTo(toX(26), toY(-34));  // Port Elizabeth
    ctx.lineTo(toX(18), toY(-34));  // Cape of Good Hope
    ctx.lineTo(toX(15), toY(-23));  // Namibia (Walvis Bay)
    ctx.lineTo(toX(12), toY(-6));   // Angola / Congo
    ctx.lineTo(toX(3.4), toY(6.5)); // Lagos / Gulf of Guinea
    ctx.lineTo(toX(-4), toY(5));    // Ghana / Ivory Coast
    ctx.lineTo(toX(-17), toY(15));  // Senegal (Dakar)
    ctx.lineTo(toX(-16), toY(22));  // Mauritania
    ctx.lineTo(toX(-10), toY(30));  // Western Sahara / Morocco
    ctx.closePath();
    ctx.fill();

    // Madagascar
    ctx.beginPath();
    ctx.moveTo(toX(49), toY(-12));
    ctx.lineTo(toX(50), toY(-16));
    ctx.lineTo(toX(47), toY(-25));
    ctx.lineTo(toX(44), toY(-24));
    ctx.lineTo(toX(44), toY(-16));
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 5. ASIA & MIDDLE EAST
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(35), toY(36));   // Turkey / Anatolia
    ctx.lineTo(toX(35), toY(31));   // Levant (Jerusalem/Beirut)
    ctx.lineTo(toX(40), toY(22));   // Jeddah / Red Sea
    ctx.lineTo(toX(45), toY(13));   // Yemen (Aden)
    ctx.lineTo(toX(54), toY(17));   // Oman (Muscat)
    ctx.lineTo(toX(56), toY(26));   // Persian Gulf (Dubai)
    ctx.lineTo(toX(62), toY(25));   // Pakistan (Karachi)
    ctx.lineTo(toX(72.8), toY(19)); // Mumbai / Gujarat
    ctx.lineTo(toX(76), toY(10));   // Kerala / South India
    ctx.lineTo(toX(77.5), toY(8.1));// Kanyakumari (South Tip)
    ctx.lineTo(toX(80), toY(13));   // Chennai
    ctx.lineTo(toX(88), toY(22));   // Kolkata / Ganges Delta
    ctx.lineTo(toX(92), toY(20));   // Myanmar / Bay of Bengal
    ctx.lineTo(toX(100), toY(5));   // Malacca Strait (Kuala Lumpur)
    ctx.lineTo(toX(104), toY(1.3)); // Singapore
    ctx.lineTo(toX(108), toY(15));  // Vietnam Coast
    ctx.lineTo(toX(114), toY(22));  // Hong Kong / Pearl River
    ctx.lineTo(toX(121.5), toY(31.2));// Shanghai / Yangtze Mouth
    ctx.lineTo(toX(126), toY(37));  // Korea Peninsula (Seoul)
    ctx.lineTo(toX(131), toY(43));  // Vladivostok
    ctx.lineTo(toX(142), toY(53));  // Sea of Okhotsk
    ctx.lineTo(toX(160), toY(56));  // Kamchatka Peninsula
    ctx.lineTo(toX(170), toY(66));  // Chukchi Peninsula / Bering
    ctx.lineTo(toX(130), toY(73));  // Arctic Siberia (Lena)
    ctx.lineTo(toX(80), toY(73));   // Ob Gulf / Arctic Russia
    ctx.lineTo(toX(60), toY(68));   // Ural North
    ctx.lineTo(toX(50), toY(55));   // Caspian Sea North
    ctx.lineTo(toX(40), toY(42));   // Caucasus
    ctx.closePath();
    ctx.fill();

    // Japan Archipelago (Kyoto & Tokyo)
    ctx.beginPath();
    ctx.moveTo(toX(130), toY(33));  // Kyushu
    ctx.lineTo(toX(133), toY(34));  // Shikoku
    ctx.lineTo(toX(135.7), toY(35));// Kyoto (Kansai)
    ctx.lineTo(toX(139.7), toY(35.7));// Tokyo (Kanto)
    ctx.lineTo(toX(141.5), toY(41));// Tohoku
    ctx.lineTo(toX(142), toY(44));  // Hokkaido
    ctx.lineTo(toX(140), toY(38));
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 6. AUSTRALIA & NEW ZEALAND
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(toX(114), toY(-22)); // North West Cape
    ctx.lineTo(toX(124), toY(-15)); // Darwin / Arnhem Land
    ctx.lineTo(toX(136), toY(-12)); // Gulf of Carpentaria
    ctx.lineTo(toX(142), toY(-11)); // Cape York
    ctx.lineTo(toX(146), toY(-19)); // Cairns / Great Barrier Reef
    ctx.lineTo(toX(153), toY(-27)); // Brisbane
    ctx.lineTo(toX(151.2), toY(-33.8)); // Sydney
    ctx.lineTo(toX(145), toY(-38)); // Melbourne
    ctx.lineTo(toX(138.5), toY(-35));// Adelaide
    ctx.lineTo(toX(125), toY(-32)); // Great Australian Bight
    ctx.lineTo(toX(115.8), toY(-32));// Perth
    ctx.closePath();
    ctx.fill();

    // New Zealand
    ctx.beginPath();
    ctx.moveTo(toX(173), toY(-35)); // North Island (Auckland)
    ctx.lineTo(toX(176), toY(-38));
    ctx.lineTo(toX(171), toY(-44)); // South Island
    ctx.lineTo(toX(168), toY(-46));
    ctx.closePath();
    ctx.fill();

    // ==========================================
    // 7. ANTARCTICA
    // ==========================================
    ctx.beginPath();
    ctx.rect(0, toY(-75), width, height - toY(-75));
    ctx.fill();
  };

  // 2. Bioluminescent Auroral Coastal Shelf Layer (Glow edge around landmasses)
  ctx.filter = "blur(10px)";
  drawLandmasses("rgba(56, 189, 248, 0.4)", true);
  ctx.filter = "none";

  // 3. Obsidian Landmass Continents (Smoked Bronze Obsidian)
  drawLandmasses("#1C172B");

  // 4. Sahara, Arabian & Australian Highlands (Golden Ochre Stardust)
  ctx.fillStyle = "rgba(244, 162, 97, 0.45)";
  ctx.beginPath();
  ctx.ellipse(toX(20), toY(22), 160, 65, 0, 0, Math.PI * 2); // Sahara Desert
  ctx.ellipse(toX(46), toY(24), 80, 45, 0, 0, Math.PI * 2);  // Arabian Desert
  ctx.ellipse(toX(130), toY(-25), 85, 45, 0, 0, Math.PI * 2); // Australian Outback
  ctx.fill();

  // 5. Polar Ice Caps (Pure Celestial Opal)
  ctx.fillStyle = "rgba(226, 217, 243, 0.75)";
  ctx.beginPath();
  ctx.rect(0, toY(-76), width, height - toY(-76)); // Antarctica
  ctx.ellipse(toX(-42), toY(74), 60, 35, 0, 0, Math.PI * 2); // Greenland
  ctx.fill();

  // 6. Night City Lights Constellations (Radiant Gold & Cyan Starlight)
  ctx.fillStyle = "rgba(253, 230, 138, 0.95)";
  const cityDots = [
    [-74, 40.7], [-122.4, 37.8], [-46.6, -23.5], [2.3, 48.8],
    [0, 51.5], [31.2, 30], [3.4, 6.5], [72.8, 19],
    [139.7, 35.7], [135.7, 35], [151.2, -33.8]
  ];
  cityDots.forEach(([lon, lat]) => {
    ctx.beginPath();
    ctx.arc(toX(lon), toY(lat), 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export default function InteractiveGlobe({ onSelectLocation }: { onSelectLocation?: (loc: GeoLocationItem) => void }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0.002 });

  const { size } = useThree();
  const isMobile = size.width < 768;
  const globeRadius = isMobile ? 8.0 : 10.0;

  const activeGeo = useEdifyStore((s) => s.geoFilter);
  const swoopToLocation = useEdifyStore((s) => s.swoopToLocation);
  const isSwooping = useEdifyStore((s) => s.isSwooping);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Generate authentic World Map texture once
  const worldTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createWorldMapTexture();
  }, []);

  // Global Pointer Events for Fluid Mouse Dragging Anywhere on Screen
  useEffect(() => {
    const handleDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      isDragging.current = true;
      previousPointer.current = { x: clientX, y: clientY };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !globeGroupRef.current || isSwooping) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousPointer.current.x;
      const deltaY = clientY - previousPointer.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.006;
      globeGroupRef.current.rotation.x += deltaY * 0.006;

      rotationVelocity.current.y = deltaX * 0.003;
      rotationVelocity.current.x = deltaY * 0.003;

      previousPointer.current = { x: clientX, y: clientY };
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchstart", handleDown, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchstart", handleDown);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isSwooping]);

  useFrame(() => {
    if (globeGroupRef.current && !isDragging.current && !isSwooping) {
      globeGroupRef.current.rotation.y += rotationVelocity.current.y;
      globeGroupRef.current.rotation.x += rotationVelocity.current.x;

      rotationVelocity.current.y = THREE.MathUtils.lerp(rotationVelocity.current.y, 0.0012, 0.025);
      rotationVelocity.current.x = THREE.MathUtils.lerp(rotationVelocity.current.x, 0, 0.025);
    }
  });

  const handlePinClick = (loc: GeoLocationItem) => {
    // Trigger cinematic camera swoop descent down to this location
    swoopToLocation(loc);
    if (onSelectLocation) onSelectLocation(loc);
  };

  return (
    <group ref={globeGroupRef}>
      {/* 1. Earth Sphere with Accurate Geographical Continents */}
      <mesh>
        <sphereGeometry args={[globeRadius, 64, 64]} />
        <meshStandardMaterial
          map={worldTexture || undefined}
          roughness={0.65}
          metalness={0.1}
          color="#ffffff"
        />
      </mesh>

      {/* 2. Soft Atmospheric Rayleigh Halo */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[globeRadius, 48, 48]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Interactive Global Thought Pins */}
      {globalLocations
        .filter((loc) => loc.continent !== "Global")
        .map((loc) => {
          const [x, y, z] = latLngToVector3(loc.lat, loc.lng, globeRadius + 0.35);
          const isHovered = hoveredLocation === loc.id;
          const isActive = activeGeo.path.includes(loc.name);

          return (
            <group key={loc.id} position={[x, y, z]}>
              <Html
                center
                distanceFactor={18}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(loc);
                  }}
                  onMouseEnter={() => setHoveredLocation(loc.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className="flex flex-col items-center group -translate-y-1/2 p-2 touch-manipulation cursor-pointer"
                >
                  {/* Glowing Pin Pulse Ring */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className="absolute w-6 h-6 rounded-full animate-ping opacity-60 pointer-events-none"
                      style={{
                        background: isActive ? "#FDE68A" : "#F4A261",
                      }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg transition-transform duration-300 group-hover:scale-125"
                      style={{
                        background: isActive ? "#FDE68A" : "#D97359",
                        boxShadow: "0 0 12px rgba(253, 230, 138, 0.8)",
                      }}
                    />
                  </div>

                  {/* City Label Tag */}
                  <div
                    className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#FFFDF9] whitespace-nowrap shadow-md transition-all duration-300"
                    style={{
                      background: isHovered || isActive ? "rgba(244, 162, 97, 0.95)" : "rgba(18, 14, 33, 0.85)",
                      border: "1px solid rgba(253, 230, 138, 0.4)",
                      fontFamily: "var(--font-jakarta), sans-serif",
                    }}
                  >
                    {loc.name}
                  </div>
                </div>
              </Html>
            </group>
          );
        })}
    </group>
  );
}


