import { create } from 'zustand';
import { GameState, FeedingState } from './types';
import { INITIAL_STATUS, INITIAL_INVENTORY, GAME_CONFIG } from '../config/gameConstants';

export const DEFAULT_FEEDING_STATE: FeedingState = {
  isEating: false,
  eatStartTime: null,
  recentFeedings: [],
  fullUntil: null,
};

export const useGameStore = create<GameState>(() => ({
  version: GAME_CONFIG.SAVE_VERSION,
  timestamp: Date.now(),
  horse: {
    hunger: INITIAL_STATUS.HUNGER,
    cleanliness: INITIAL_STATUS.CLEANLINESS,
    happiness: INITIAL_STATUS.HAPPINESS,
  },
  inventory: {
    carrots: INITIAL_INVENTORY.CARROTS,
    brushUses: INITIAL_INVENTORY.BRUSH_USES,
  },
  ui: {
    selectedTool: null,
    activeAnimation: null,
    lastInteractionTime: 0,
  },
  feeding: DEFAULT_FEEDING_STATE,
  locale: {
    language: 'de', // Default language: German
  },
}));

// Helper to get current state
export const getGameState = () => useGameStore.getState();

// Helper to update state
export const updateGameState = (updater: (state: GameState) => Partial<GameState>) => {
  useGameStore.setState((state) => ({
    ...state,
    ...updater(state),
    timestamp: Date.now(),
  }));
};
