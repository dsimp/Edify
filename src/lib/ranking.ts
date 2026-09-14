import { Statement } from './types';

/**
 * Haversine formula to calculate the distance between two points on Earth
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Ranks statements based on the anti-whale algorithm:
 * Score = ln(1 + A) * sqrt(U) * (1 + U/(T+1)) * 1/(t+2)^1.6 * M_geo + lambda * V
 * 
 * Where:
 * A = total ante USD
 * U = unique supporters
 * T = total antes
 * t = hours since posting
 * M_geo = geographic multiplier (boosts local content if userLat/userLng provided)
 * V = velocity score
 * lambda = weight for velocity
 */
export function rankStatements(statements: Statement[], userLat?: number, userLng?: number): Statement[] {
  const ranked = statements.map(stmt => {
    // A = total ante USD
    const A = stmt.totalAnteCents / 100;
    
    // U = unique supporters
    const U = stmt.uniqueSupportersCount;
    
    // T = total antes
    const T = stmt.totalAntesCount;
    
    // t = hours since posting
    const now = new Date();
    const msDiff = now.getTime() - new Date(stmt.createdAt).getTime();
    const t = Math.max(0, msDiff / (1000 * 60 * 60));
    
    // M_geo = Geographic multiplier
    let M_geo = 1.0;
    if (userLat !== undefined && userLng !== undefined) {
      const distance = getDistance(stmt.latitude, stmt.longitude, userLat, userLng);
      // Boost nearby statements: 1.5x if < 50km, 1.2x if < 500km, otherwise 1.0x
      M_geo = distance < 50 ? 1.5 : (distance < 500 ? 1.2 : 1.0);
    }
    
    // V = velocity score
    const V = stmt.velocityScore || 0;
    const lambda = 0.5; // velocity weight
    
    const lnPart = Math.log(1 + A);
    const sqrtPart = Math.sqrt(U);
    const diversityPart = 1 + (U / (T + 1));
    const timeDecayPart = 1 / Math.pow(t + 2, 1.6);
    
    const baseScore = lnPart * sqrtPart * diversityPart * timeDecayPart * M_geo;
    const finalScore = baseScore + lambda * V;
    
    return {
      ...stmt,
      hotScore: finalScore
    };
  });
  
  // Sort descending by calculated hotScore
  return ranked.sort((a, b) => b.hotScore - a.hotScore);
}
