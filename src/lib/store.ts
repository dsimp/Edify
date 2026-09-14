import { create } from 'zustand';
import { Statement, TickerItem, GeoFilter, UserWallet, StatementCategory } from './types';
import { mockStatements, mockTickerItems, mockUserWallet } from './mock-data';
import { globalLocations, GeoLocationItem } from './geo-presets';
import { TimeOfDay } from './time-engine';
import { soundEngine } from './sound-engine';
import { getStatementSpatialPosition } from './spatial-corridor';

interface EdifyState {
  statements: Statement[];
  tickerItems: TickerItem[];
  geoFilter: GeoFilter;
  activeLocation: GeoLocationItem;
  timeOfDayOverride: TimeOfDay | null;
  isGlobeView: boolean;
  isSwooping: boolean;
  activeCategory: StatementCategory;
  userWallet: UserWallet;
  selectedStatementId: string | null;
  cameraTarget: { x: number; y: number; z: number } | null;
  isFlightMode: boolean;
  isSoundEnabled: boolean;
  isEarningsModalOpen: boolean;
  recentAnteAnimation: { statementId: string; amountCents: number; timestamp: number } | null;

  // Actions
  anteStatement: (statementId: string, amountCents: number) => void;
  setGeoFilter: (filter: GeoFilter) => void;
  setActiveLocation: (loc: GeoLocationItem) => void;
  swoopToLocation: (loc: GeoLocationItem) => void;
  setTimeOfDayOverride: (time: TimeOfDay | null) => void;
  setGlobeView: (isGlobe: boolean) => void;
  toggleGlobeView: () => void;
  setActiveCategory: (category: StatementCategory) => void;
  selectStatement: (id: string | null) => void;
  flyToStatement: (id: string) => void;
  toggleFlightMode: () => void;
  toggleSound: () => void;
  setEarningsModalOpen: (isOpen: boolean) => void;
  requestPayout: (amountCents: number) => { success: boolean; message: string };
  addStatement: (payload: { text: string; location: string; category: StatementCategory; sourceUrl?: string; mediaAttachments?: MediaAttachment[] }) => void;
}

export const useEdifyStore = create<EdifyState>((set, get) => ({
  statements: mockStatements,
  tickerItems: mockTickerItems,
  geoFilter: {
    level: 'world',
    path: ['World Horizon'],
    activeNode: null,
  },
  activeLocation: globalLocations[0], // Global Horizon
  timeOfDayOverride: null, // null = Live Solar Time
  isGlobeView: false,
  isSwooping: false,
  activeCategory: 'all',
  userWallet: mockUserWallet,
  selectedStatementId: null,
  cameraTarget: null,
  isFlightMode: true,
  isSoundEnabled: false,
  isEarningsModalOpen: false,
  recentAnteAnimation: null,

  setTimeOfDayOverride: (time) => {
    soundEngine.playChime(time === "night" ? 396 : time === "dawn" ? 528 : 432, 1.8);
    set({ timeOfDayOverride: time });
  },

  setActiveLocation: (loc) => {
    soundEngine.playChime(loc.atmosphere.soundDroneFreq || 480, 2.5);
    set({
      activeLocation: loc,
      isGlobeView: false,
      isSwooping: false,
      selectedStatementId: null,
      geoFilter: {
        level: loc.continent === 'Global' ? 'world' : 'city',
        path: loc.continent === 'Global' ? ['World Horizon'] : [loc.continent, loc.country, loc.name],
        activeNode: {
          id: loc.id,
          name: loc.name,
          nodeType: loc.continent === 'Global' ? 'continent' : 'city',
          parentId: null,
          path: `World.${loc.continent}.${loc.name}`,
        },
      },
    });
  },

  swoopToLocation: (loc) => {
    soundEngine.playChime(528, 3.0);
    set({ isSwooping: true });

    // After camera swoops down through atmosphere (1.6s), activate local sky setting
    setTimeout(() => {
      set({
        activeLocation: loc,
        isGlobeView: false,
        isSwooping: false,
        selectedStatementId: null,
        geoFilter: {
          level: loc.continent === 'Global' ? 'world' : 'city',
          path: loc.continent === 'Global' ? ['World Horizon'] : [loc.continent, loc.country, loc.name],
          activeNode: {
            id: loc.id,
            name: loc.name,
            nodeType: loc.continent === 'Global' ? 'continent' : 'city',
            parentId: null,
            path: `World.${loc.continent}.${loc.name}`,
          },
        },
      });
    }, 1600);
  },

  setGlobeView: (isGlobe) => {
    soundEngine.playChime(432, 2.0);
    set({ isGlobeView: isGlobe, isSwooping: false, selectedStatementId: null });
  },

  toggleGlobeView: () => {
    const nextState = !get().isGlobeView;
    soundEngine.playChime(nextState ? 432 : 528, 2.0);
    set({ isGlobeView: nextState, isSwooping: false, selectedStatementId: null });
  },

  anteStatement: (statementId, amountCents) => {
    if (amountCents < 1 || amountCents > 5) return;
    
    set((state) => {
      if (state.userWallet.availableBalanceCents < amountCents) {
        return state;
      }
      
      // Trigger harmonious sound chime
      soundEngine.playAnteSpark(amountCents);

      // Deduct from user wallet
      const newWallet = {
        ...state.userWallet,
        availableBalanceCents: state.userWallet.availableBalanceCents - amountCents
      };

      // 80% to creator pending balance, 20% platform share
      const creatorShareCents = Math.round(amountCents * 0.8);

      const newStatements = state.statements.map(stmt => {
        if (stmt.id === statementId) {
          return {
            ...stmt,
            totalAnteCents: stmt.totalAnteCents + amountCents,
            totalAntesCount: stmt.totalAntesCount + 1,
            uniqueSupportersCount: stmt.uniqueSupportersCount + 1,
            velocityScore: Math.min(100, stmt.velocityScore + amountCents * 3)
          };
        }
        return stmt;
      });

      return {
        userWallet: newWallet,
        statements: newStatements,
        recentAnteAnimation: {
          statementId,
          amountCents,
          timestamp: Date.now()
        }
      };
    });
  },

  setGeoFilter: (filter) => {
    soundEngine.playChime(480, 1.8);
    set({ geoFilter: filter });
  },

  setActiveCategory: (category) => {
    soundEngine.playChime(540, 1.8);
    set({ activeCategory: category });
  },
  
  selectStatement: (id) => {
    if (id) {
      soundEngine.playChime(528, 2.5); // 528Hz DNA repair / transformation frequency
    }
    set({ selectedStatementId: id });
  },
  
  flyToStatement: (id) => {
    const state = get();
    const sorted = [...state.statements]
      .filter((s) => s.moderationStatus === "approved")
      .filter((s) => state.activeCategory === "all" || s.category === state.activeCategory)
      .sort((a, b) => b.uniqueSupportersCount - a.uniqueSupportersCount);

    const index = sorted.findIndex((s) => s.id === id);
    const pos = index >= 0 ? getStatementSpatialPosition(index) : null;

    soundEngine.playChime(648, 3.0);
    set({ 
      selectedStatementId: id,
      isFlightMode: true,
      isGlobeView: false,
      cameraTarget: pos ? { x: pos.x, y: pos.y, z: pos.z } : null,
    });
  },
  
  toggleFlightMode: () => {
    soundEngine.playChime(432, 1.5);
    set((state) => ({ isFlightMode: !state.isFlightMode }));
  },
  
  toggleSound: () => {
    const isMuted = soundEngine.toggleMute();
    set({ isSoundEnabled: !isMuted });
  },

  setEarningsModalOpen: (isOpen) => {
    if (isOpen) soundEngine.playChime(540, 2.0);
    set({ isEarningsModalOpen: isOpen });
  },

  requestPayout: (amountCents) => {
    const state = get();
    // Rule: $50 minimum threshold (5000 cents)
    if (state.userWallet.withdrawableCents < 5000) {
      return {
        success: false,
        message: 'Minimum payout threshold is $50.00. Keep sharing inspiring thoughts to reach your milestone!'
      };
    }

    if (amountCents > state.userWallet.withdrawableCents) {
      return {
        success: false,
        message: 'Amount exceeds your available withdrawable balance.'
      };
    }

    set({
      userWallet: {
        ...state.userWallet,
        withdrawableCents: state.userWallet.withdrawableCents - amountCents,
        pendingPayoutCents: state.userWallet.pendingPayoutCents + amountCents,
      }
    });

    soundEngine.playChime(720, 3.5);
    return {
      success: true,
      message: `Payout of $${(amountCents / 100).toFixed(2)} initiated to your linked account. Platform fee (20%) deducted at time of ante reception.`
    };
  },
  
  addStatement: (payload) => {
    set((state) => {
      soundEngine.playChime(648, 3.2);
      const newStmt: Statement = {
        id: `stmt-new-${Date.now()}`,
        authorId: 'user-123',
        authorName: 'You (Citizen Voice)',
        isCitizenReporter: true,
        category: (payload.category === 'all' ? 'news' : payload.category) as any,
        content: payload.text,
        sourceUrl: payload.sourceUrl,
        mediaAttachments: payload.mediaAttachments || [],
        languageCode: 'en',
        geoNodeId: payload.location,
        geoPath: `World.Local.${payload.location}`,
        cityName: payload.location,
        countryCode: 'US',
        countryName: 'United States',
        regionName: 'Local',
        latitude: 0,
        longitude: 0,
        totalAnteCents: 0,
        uniqueSupportersCount: 0,
        totalAntesCount: 0,
        moderationStatus: 'approved' as const,
        hotScore: 100,
        velocityScore: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return {
        statements: [newStmt, ...state.statements],
        userWallet: {
          ...state.userWallet,
          statementsCreatedCount: (state.userWallet.statementsCreatedCount || 0) + 1
        }
      };
    });
  },
}));

