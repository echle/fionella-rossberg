import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, getGameState, updateGameState, DEFAULT_FEEDING_STATE } from '../../src/state/gameStore';
import { INITIAL_STATUS, INITIAL_INVENTORY, CURRENCY } from '../../src/config/gameConstants';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState({
      version: '1.0.0',
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
        language: 'de',
      },
      currency: CURRENCY.STARTING_BALANCE,
      gameClock: {
        startTimestamp: null,
      },
      giftBoxes: [],
      isGameOver: false,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial horse status values', () => {
      const state = getGameState();

      expect(state.horse.hunger).toBe(80);
      expect(state.horse.cleanliness).toBe(70);
      expect(state.horse.happiness).toBe(90);
    });

    it('should have correct initial inventory values', () => {
      const state = getGameState();

      expect(state.inventory.carrots).toBe(10);
      expect(state.inventory.brushUses).toBe(100);
    });

    it('should have null selected tool initially', () => {
      const state = getGameState();

      expect(state.ui.selectedTool).toBeNull();
      expect(state.ui.activeAnimation).toBeNull();
    });

    it('should have valid version and timestamp', () => {
      const state = getGameState();

      expect(state.version).toBe('1.0.0');
      expect(state.timestamp).toBeGreaterThan(0);
    });
  });

  describe('State Updates', () => {
    it('should update timestamp when state changes', () => {
      const initialState = getGameState();
      const initialTimestamp = initialState.timestamp;

      // Wait a tiny bit to ensure timestamp difference
      setTimeout(() => {
        updateGameState((state) => ({
          horse: {
            ...state.horse,
            hunger: 85,
          },
        }));

        const newState = getGameState();
        expect(newState.timestamp).toBeGreaterThan(initialTimestamp);
      }, 10);
    });

    it('should partially update state', () => {
      updateGameState((state) => ({
        horse: {
          ...state.horse,
          hunger: 50,
        },
      }));

      const state = getGameState();
      expect(state.horse.hunger).toBe(50);
      // Other values unchanged
      expect(state.horse.cleanliness).toBe(70);
      expect(state.horse.happiness).toBe(90);
    });
  });
});
