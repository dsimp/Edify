export interface SpatialNodePosition {
  index: number;
  x: number;
  y: number;
  z: number;
  scale: number;
}

/**
 * Generates spacious, undulating 3D celestial coordinates for each statement.
 * Guarantees generous breathing room (~26 depth units) between thoughts.
 */
export function getStatementSpatialPosition(index: number): SpatialNodePosition {
  if (index === 0) {
    // Top Resonant Thought — Center stage in immediate field of view
    return {
      index: 0,
      x: 0,
      y: 0.6,
      z: -22,
      scale: 1.15,
    };
  }

  // Generous spacing along the flight corridor: 26 units between each consecutive thought
  const z = -22 - index * 26;
  
  // Alternating undulating S-curve for celestial panorama
  const angle = index * 1.35;
  const x = Math.sin(angle) * (index % 2 === 0 ? 9.5 : -9.5);
  const y = Math.cos(index * 0.85) * 2.0 + 0.5;
  const scale = 1.0;

  return { index, x, y, z, scale };
}

export function getAllSpatialPositions(count: number): SpatialNodePosition[] {
  return Array.from({ length: count }, (_, i) => getStatementSpatialPosition(i));
}
