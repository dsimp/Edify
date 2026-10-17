/**
 * Perspectives — economics.
 *
 * Every money rule in the app lives here so it can be tuned in one place
 * (and later mirrored 1:1 on the server, where it must actually be enforced).
 */
import type { EarningEvent, Payout, Statement, SupportEvent } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const ECONOMICS = {
  /** Smallest / largest single support. */
  MIN_SUPPORT_CENTS: 1,
  MAX_SUPPORT_CENTS: 5,
  /** Max one person can give a single statement inside the rolling window. */
  CAP_CENTS_PER_WINDOW: 20,
  WINDOW_MS: 72 * HOUR,

  /** Share of every support that goes to the statement's author (basis points). */
  CREATOR_SHARE_BPS: 8000, // 80% creator / 20% platform

  /** Earnings are held this long before they can be withdrawn (fraud & chargeback buffer). */
  HOLD_MS: 7 * DAY,
  /** Minimum withdrawal. Keeps per-payout processor fees (~25¢ + 0.25%) below ~3%. */
  MIN_PAYOUT_CENTS: 1000,

  /** Wallet top-up presets. Card fees are paid once per top-up, never per support. */
  TOPUP_OPTIONS_CENTS: [500, 1000, 2000],
  /** Card processing pass-through, shown transparently at checkout. */
  CARD_FEE_PCT: 0.029,
  CARD_FEE_FIXED_CENTS: 30,

  /** Undo window after tapping support. */
  UNDO_MS: 5000,
} as const;

export const TICKS_PER_CENT = 100;

export const SUPPORT_AMOUNTS = [1, 2, 3, 4, 5] as const;

/* ------------------------------------------------------------------ */
/* Splits                                                              */
/* ------------------------------------------------------------------ */

/** Split a support into creator and platform shares, in ticks (1/100¢). */
export function splitSupport(cents: number) {
  const totalTicks = cents * TICKS_PER_CENT;
  const creatorTicks = Math.round((totalTicks * ECONOMICS.CREATOR_SHARE_BPS) / 10000);
  return { creatorTicks, platformTicks: totalTicks - creatorTicks };
}

export const creatorSharePct = ECONOMICS.CREATOR_SHARE_BPS / 100;
export const platformSharePct = 100 - creatorSharePct;

/** Pending (on hold) vs. withdrawable earnings, derived from events. */
export function earningsSummary(earnings: EarningEvent[], payouts: Payout[], now: number) {
  let lifetime = 0;
  let pending = 0;
  let nextRelease: number | null = null;
  for (const e of earnings) {
    lifetime += e.ticks;
    const releaseAt = e.at + ECONOMICS.HOLD_MS;
    if (releaseAt > now) {
      pending += e.ticks;
      nextRelease = nextRelease === null ? releaseAt : Math.min(nextRelease, releaseAt);
    }
  }
  const withdrawn = payouts.reduce((s, p) => s + p.ticks, 0);
  return { lifetime, pending, withdrawn, available: lifetime - pending - withdrawn, nextRelease };
}

/* ------------------------------------------------------------------ */
/* 72-hour rolling cap                                                 */
/* ------------------------------------------------------------------ */

/** Events by this user on this statement still inside the rolling window. */
function windowEvents(ledger: SupportEvent[], statementId: string, userId: string, now: number) {
  const since = now - ECONOMICS.WINDOW_MS;
  return ledger.filter((e) => e.statementId === statementId && e.userId === userId && e.at > since);
}

export function givenInWindow(ledger: SupportEvent[], statementId: string, userId: string, now: number) {
  return windowEvents(ledger, statementId, userId, now).reduce((sum, e) => sum + e.cents, 0);
}

export function allowanceRemaining(ledger: SupportEvent[], statementId: string, userId: string, now: number) {
  return Math.max(0, ECONOMICS.CAP_CENTS_PER_WINDOW - givenInWindow(ledger, statementId, userId, now));
}

/** When the oldest in-window support expires and frees allowance again (null if nothing given). */
export function nextAllowanceAt(ledger: SupportEvent[], statementId: string, userId: string, now: number) {
  const events = windowEvents(ledger, statementId, userId, now);
  if (events.length === 0) return null;
  const oldest = Math.min(...events.map((e) => e.at));
  return oldest + ECONOMICS.WINDOW_MS;
}

export type SupportCheck =
  | { ok: true }
  | { ok: false; reason: "own" | "amount" | "cap" | "balance"; message: string };

export function checkSupport(args: {
  statement: Statement;
  userId: string;
  cents: number;
  balanceCents: number;
  ledger: SupportEvent[];
  now: number;
}): SupportCheck {
  const { statement, userId, cents, balanceCents, ledger, now } = args;
  if (statement.authorId === userId) {
    return { ok: false, reason: "own", message: "You can't support your own statement." };
  }
  if (!Number.isInteger(cents) || cents < ECONOMICS.MIN_SUPPORT_CENTS || cents > ECONOMICS.MAX_SUPPORT_CENTS) {
    return { ok: false, reason: "amount", message: "Support must be between 1¢ and 5¢." };
  }
  const remaining = allowanceRemaining(ledger, statement.id, userId, now);
  if (cents > remaining) {
    return {
      ok: false,
      reason: "cap",
      message:
        remaining === 0
          ? "You've given the 20¢ maximum to this statement for now."
          : `You can give ${remaining}¢ more to this statement right now.`,
    };
  }
  if (cents > balanceCents) {
    return { ok: false, reason: "balance", message: "Not enough balance. Top up your wallet." };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/* ------------------------------------------------------------------ */

/**
 * Consensus score — quadratic weighting: (Σ√cᵢ)².
 * 100 people giving 1¢ scores 10,000; 5 people giving 20¢ scores 500.
 * Breadth of agreement beats depth of pockets.
 */
export function consensusScore(s: Pick<Statement, "sqrtSum">) {
  return s.sqrtSum * s.sqrtSum;
}

/** Freshness-aware ranking for news: consensus decays with a ~36h half-life. */
export function risingScore(s: Pick<Statement, "sqrtSum" | "createdAt">, now: number) {
  const ageHours = Math.max(0, (now - s.createdAt) / HOUR);
  return consensusScore(s) / Math.pow(2, ageHours / 36);
}

/* ------------------------------------------------------------------ */
/* Formatting & fees                                                   */
/* ------------------------------------------------------------------ */

export function formatCents(cents: number) {
  if (Math.abs(cents) < 100) return `${cents}¢`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatUSD(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Ticks → dollars with sub-cent precision shown only when it matters. */
export function formatTicks(ticks: number) {
  const dollars = ticks / (TICKS_PER_CENT * 100);
  const precise = ticks % TICKS_PER_CENT !== 0 && Math.abs(dollars) < 1;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: precise ? 3 : 2,
    maximumFractionDigits: precise ? 3 : 2,
  })}`;
}

export function cardFeeCents(topUpCents: number) {
  return Math.round(topUpCents * ECONOMICS.CARD_FEE_PCT + ECONOMICS.CARD_FEE_FIXED_CENTS);
}

export function formatDuration(ms: number) {
  const h = Math.max(0, Math.ceil(ms / HOUR));
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rem = h % 24;
    return rem ? `${d}d ${rem}h` : `${d}d`;
  }
  return `${h}h`;
}
