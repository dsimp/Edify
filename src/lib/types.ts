export type StatementCategory = 'all' | 'news' | 'philosophy' | 'science' | 'earth' | 'culture';

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string;
  title?: string;
  description?: string;
  previewUrl?: string;
}

export interface Statement {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isCitizenReporter?: boolean;
  category: 'news' | 'philosophy' | 'science' | 'earth' | 'culture';
  content: string; // max 1000 chars
  sourceUrl?: string; // Optional credible reference for news / facts
  mediaAttachments?: MediaAttachment[]; // Attached images, videos, or verified research links
  languageCode: string;
  geoNodeId: string;
  geoPath: string; // e.g. 'World.Americas.USA.CA.SanFrancisco'
  cityName?: string;
  stateName?: string;
  countryCode: string;
  countryName: string;
  regionName: string;
  latitude: number;
  longitude: number;
  totalAnteCents: number;
  uniqueSupportersCount: number;
  totalAntesCount: number;
  moderationStatus: 'pending' | 'approved' | 'quarantined' | 'removed';
  hotScore: number;
  velocityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ante {
  id: string;
  statementId: string;
  userId: string;
  amountCents: number; // 1-5
  createdAt: Date;
}

export interface UserWallet {
  userId: string;
  availableBalanceCents: number;
  pendingPayoutCents: number;
  withdrawableCents: number;
  lifetimeEarnedCents: number;
  statementsCreatedCount: number;
}

export interface GeoNode {
  id: string;
  name: string;
  nodeType: 'continent' | 'region' | 'country' | 'state' | 'city';
  parentId: string | null;
  path: string;
  isoCode?: string;
}

export interface TickerItem {
  statementId: string;
  category?: 'news' | 'philosophy' | 'science' | 'earth' | 'culture';
  content: string; // truncated
  resonantMinds: number; // unique supporters
  harmonyIndex: number; // % change in last hour
  driftVelocity: string; // e.g. 'Rising in Tokyo'
  trend: 'up' | 'stable' | 'reflective';
}

export interface GeoFilter {
  level: 'world' | 'region' | 'country' | 'state' | 'city';
  path: string[];
  activeNode: GeoNode | null;
}

