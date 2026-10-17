import { create } from "zustand";
import type { EarningEvent, MediaAttachment, Payout, Statement, StatementKind, SupportEvent, Wallet } from "./types";
import { SAMPLE_STATEMENTS } from "./sample-data";
import { ECONOMICS, checkSupport, earningsSummary, splitSupport, type SupportCheck } from "./economics";
import { sound } from "./sound";

export const ME = { id: "me", name: "You" } as const;

export type SortMode = "top" | "rising" | "new";
export type PlaceSelection = string | null;

export interface Toast {
  id: number;
  text: string;
  tone: "info" | "success" | "error";
  undoSupportId?: string;
}

export interface PublishInput {
  kind: StatementKind;
  text: string;
  media: MediaAttachment[];
  placeId: string;
}

interface State {
  statements: Statement[];
  wallet: Wallet;
  ledger: SupportEvent[];
  earnings: EarningEvent[];
  payouts: Payout[];

  selectedPlaceId: PlaceSelection;
  openStatementId: string | null;
  kindFilter: StatementKind | "all";
  sort: SortMode;
  composerOpen: boolean;
  walletOpen: boolean;
  soundOn: boolean;
  toast: Toast | null;

  selectPlace: (id: PlaceSelection) => void;
  openStatement: (id: string | null) => void;
  setKindFilter: (k: StatementKind | "all") => void;
  setSort: (s: SortMode) => void;
  setComposerOpen: (open: boolean) => void;
  setWalletOpen: (open: boolean) => void;
  toggleSound: () => void;
  showToast: (t: Omit<Toast, "id">) => void;
  dismissToast: () => void;

  support: (statementId: string, cents: number) => SupportCheck;
  undoSupport: (supportId: string) => void;
  publish: (input: PublishInput) => string;
  topUp: (cents: number) => void;
  withdraw: () => { ok: boolean; message: string };
}

const DAY = 86_400_000;
const NOW = Date.now();

const MY_STATEMENT: Statement = {
  id: "st-me-0",
  authorId: ME.id,
  authorName: ME.name,
  kind: "thought",
  text: "We don't need everyone to agree. We need everyone to be heard — and then let the world decide what's worth backing.",
  media: [],
  placeId: "chicago",
  createdAt: NOW - 12 * DAY,
  totalCents: 2256,
  supporters: 1031,
  supports: 1240,
  sqrtSum: 1031 * Math.sqrt(2.19),
};

const SEED_EARNINGS: EarningEvent[] = [
  { id: "e1", statementId: MY_STATEMENT.id, ticks: 98_000, at: NOW - 11 * DAY },
  { id: "e2", statementId: MY_STATEMENT.id, ticks: 50_500, at: NOW - 9 * DAY },
  { id: "e3", statementId: MY_STATEMENT.id, ticks: 21_400, at: NOW - 3 * DAY },
  { id: "e4", statementId: MY_STATEMENT.id, ticks: 10_580, at: NOW - 1 * DAY },
];

let toastSeq = 1;
let idSeq = 1;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

export const useStore = create<State>((set, get) => {
  const applyToStatement = (s: Statement, userTotalBefore: number, cents: number, sign: 1 | -1): Statement => {
    const before = userTotalBefore;
    const after = before + sign * cents;
    return {
      ...s,
      totalCents: s.totalCents + sign * cents,
      supports: s.supports + sign,
      supporters: s.supporters + (sign === 1 && before === 0 ? 1 : sign === -1 && after === 0 ? -1 : 0),
      sqrtSum: s.sqrtSum + Math.sqrt(after) - Math.sqrt(before),
    };
  };

  const simulateSupporters = (statementId: string) => {
    let remaining = 6 + Math.floor(Math.random() * 5);
    const tick = () => {
      if (remaining-- <= 0) return;
      const cents = 1 + Math.floor(Math.random() * 5);
      const { creatorTicks } = splitSupport(cents);
      set((state) => ({
        statements: state.statements.map((s) => (s.id === statementId ? applyToStatement(s, 0, cents, 1) : s)),
        earnings: [...state.earnings, { id: uid("earn"), statementId, ticks: creatorTicks, at: Date.now() }],
      }));
      sound.chime(864, 1.2, 0.05);
      setTimeout(tick, 3500 + Math.random() * 5000);
    };
    setTimeout(tick, 4000);
  };

  return {
    statements: [MY_STATEMENT, ...SAMPLE_STATEMENTS],
    wallet: { balanceCents: 2000 },
    ledger: [],
    earnings: SEED_EARNINGS,
    payouts: [],

    selectedPlaceId: null,
    openStatementId: null,
    kindFilter: "all",
    sort: "top",
    composerOpen: false,
    walletOpen: false,
    soundOn: true,
    toast: null,

    selectPlace: (id) => {
      if (id) sound.chime(id === "world" ? 432 : 528, 2.4);
      set({ selectedPlaceId: id, openStatementId: null, kindFilter: "all" });
    },

    openStatement: (id) => {
      if (id) sound.chime(648, 2.0);
      set({ openStatementId: id });
    },

    setKindFilter: (kindFilter) => set({ kindFilter }),
    setSort: (sort) => set({ sort }),
    setComposerOpen: (composerOpen) => set({ composerOpen }),
    setWalletOpen: (walletOpen) => set({ walletOpen }),

    toggleSound: () => {
      const next = !get().soundOn;
      sound.setEnabled(next);
      set({ soundOn: next });
    },

    showToast: (t) => set({ toast: { ...t, id: toastSeq++ } }),
    dismissToast: () => set({ toast: null }),

    support: (statementId, cents) => {
      const state = get();
      const statement = state.statements.find((s) => s.id === statementId);
      if (!statement) return { ok: false, reason: "amount", message: "Unavailable" };
      const now = Date.now();
      const check = checkSupport({
        statement,
        userId: ME.id,
        cents,
        balanceCents: state.wallet.balanceCents,
        ledger: state.ledger,
        now,
      });
      if (!check.ok) {
        get().showToast({ text: check.message, tone: "error" });
        return check;
      }

      const myTotal = state.ledger
        .filter((e) => e.statementId === statementId && e.userId === ME.id)
        .reduce((sum, e) => sum + e.cents, 0);
      const event: SupportEvent = { id: uid("sup"), statementId, userId: ME.id, cents, at: now };

      sound.support(cents);
      set({
        wallet: { balanceCents: state.wallet.balanceCents - cents },
        ledger: [...state.ledger, event],
        statements: state.statements.map((s) => (s.id === statementId ? applyToStatement(s, myTotal, cents, 1) : s)),
        toast: {
          id: toastSeq++,
          text: `+${cents}¢ dropped in cup`,
          tone: "success",
          undoSupportId: event.id,
        },
      });
      return check;
    },

    undoSupport: (supportId) => {
      const state = get();
      const event = state.ledger.find((e) => e.id === supportId);
      if (!event || Date.now() - event.at > ECONOMICS.UNDO_MS + 1000) return;
      const ledger = state.ledger.filter((e) => e.id !== supportId);
      const myTotalAfterUndo = ledger
        .filter((e) => e.statementId === event.statementId && e.userId === ME.id)
        .reduce((sum, e) => sum + e.cents, 0);
      set({
        ledger,
        wallet: { balanceCents: state.wallet.balanceCents + event.cents },
        statements: state.statements.map((s) =>
          s.id === event.statementId ? applyToStatement(s, myTotalAfterUndo + event.cents, event.cents, -1) : s,
        ),
        toast: { id: toastSeq++, text: "Undone", tone: "info" },
      });
    },

    publish: (input) => {
      const id = uid("st");
      const statement: Statement = {
        id,
        authorId: ME.id,
        authorName: ME.name,
        kind: input.kind,
        text: input.text.trim(),
        media: input.media.slice(0, 6),
        placeId: input.placeId,
        createdAt: Date.now(),
        totalCents: 0,
        supporters: 1,
        supports: 1,
        sqrtSum: 1,
      };
      sound.chime(720, 3);
      set((state) => ({
        statements: [statement, ...state.statements],
        composerOpen: false,
        selectedPlaceId: input.placeId,
        openStatementId: id,
        toast: { id: toastSeq++, text: "Voiced", tone: "success" },
      }));
      simulateSupporters(id);
      return id;
    },

    topUp: (cents) => {
      sound.chime(540, 2);
      set((state) => ({
        wallet: { balanceCents: state.wallet.balanceCents + cents },
      }));
    },

    withdraw: () => {
      const state = get();
      const { available } = earningsSummary(state.earnings, state.payouts, Date.now());
      const minTicks = ECONOMICS.MIN_PAYOUT_CENTS * 100;
      if (available < minTicks) {
        return { ok: false, message: "Minimum payout not yet reached." };
      }
      const ticks = Math.floor(available / 100) * 100;
      sound.chime(864, 3);
      set({ payouts: [...state.payouts, { id: uid("po"), ticks, at: Date.now() }] });
      return { ok: true, message: "Transfer initiated." };
    },
  };
});
