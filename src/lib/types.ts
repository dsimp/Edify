/**
 * Perspectives — core domain types.
 */

/** What kind of perspective a statement is. Facts must carry supporting material. */
export type StatementKind = "fact" | "opinion" | "experience" | "thought";

export interface MediaAttachment {
  id: string;
  type: "image" | "video" | "link";
  url: string;
  title?: string;
  description?: string;
  /** Poster frame for videos. */
  posterUrl?: string;
}

export interface Statement {
  id: string;
  authorId: string;
  authorName: string;
  kind: StatementKind;
  text: string;
  /** Up to 6 supporting materials — one per crystal cube face. */
  media: MediaAttachment[];
  /** The place this statement is allocated to (see places.ts). */
  placeId: string;
  createdAt: number; // epoch ms

  /** Public, transparent support totals. */
  totalCents: number;
  supporters: number;
  supports: number;
  /**
   * Σ √(cents given by each supporter). Used for "consensus" ranking:
   * (Σ√c)² rewards many people agreeing over a few people paying a lot.
   */
  sqrtSum: number;
}

/** A single support action (stored in the ledger for the 72h cap). */
export interface SupportEvent {
  id: string;
  statementId: string;
  userId: string;
  cents: number;
  at: number; // epoch ms
}

/** Spending balance (whole cents) — funded by card top-ups. */
export interface Wallet {
  balanceCents: number;
}

/**
 * Creator earnings are tracked in "ticks" (1 tick = 1/100 of a cent) so an 80%
 * share of a 1¢ support (0.8¢) is stored exactly with no rounding drift.
 * Pending vs. available is derived from `at` + the hold period.
 */
export interface EarningEvent {
  id: string;
  statementId: string;
  ticks: number;
  at: number;
}

export interface Payout {
  id: string;
  ticks: number;
  at: number;
}

export interface Place {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}
