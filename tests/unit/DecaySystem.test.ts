import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/state/gameStore';
import { applyDecay } from '../../src/state/actions';
import { INITIAL_STATUS, INITIAL_INVENTORY, DECAY_RATES } from '../../src/config/gameConstants';

describe('DecaySystem', () => {
  beforeEach(() => {
    // Reset store to initial state
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
    });
  });

  describe('applyDecay', () => {
    it('should decrease hunger after 60 seconds', () => {
      const elapsedMs = 60000; // 60 seconds
      const expectedDecay = Math.floor(60 * DECAY_RATES.HUNGER); // 60s * (1/6) = 10

      applyDecay(elapsedMs);

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER - expectedDecay);
    });

    it('should decrease cleanliness after 60 seconds', () => {
      const elapsedMs = 60000;
      const expectedDecay = Math.floor(60 * DECAY_RATES.CLEANLINESS); // 60s * (1/12) = 5

      applyDecay(elapsedMs);

      const state = useGameStore.getState();
      expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS - expectedDecay);
    });

    it('should decrease happiness after 60 seconds', () => {
      const elapsedMs = 60000;
      const expectedDecay = Math.floor(60 * DECAY_RATES.HAPPINESS); // 60s * (1/7.5) = 8

      applyDecay(elapsedMs);

      const state = useGameStore.getState();
      expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS - expectedDecay);
    });

    it('should clamp values at 0 (no negatives)', () => {
      // Set all values to low numbers
      useGameStore.setState({
        ...useGameStore.getState(),
        horse: {
          hunger: 5,
          cleanliness: 3,
          happiness: 2,
        },
      });

      // Apply massive decay (10 minutes)
      applyDecay(600000);

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(0);
      expect(state.horse.cleanliness).toBe(0);
      expect(state.horse.happiness).toBe(0);
    });

    it('should handle 7-day elapsed time correctly', () => {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000; // 604800000ms

      applyDecay(sevenDaysMs);

      const state = useGameStore.getState();
      // All values should be at 0 (far exceeds decay time)
      expect(state.horse.hunger).toBe(0);
      expect(state.horse.cleanliness).toBe(0);
      expect(state.horse.happiness).toBe(0);
    });

    it('should have different decay rates per status', () => {
      const elapsedMs = 12000; // 12 seconds

      applyDecay(elapsedMs);

      const state = useGameStore.getState();

      // Hunger: 12s * (1/6) = 2 decay
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER - 2);

      // Cleanliness: 12s * (1/12) = 1 decay
      expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS - 1);

      // Happiness: 12s * (1/7.5) = 1.6 → floor = 1 decay
      expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS - 1);
    });

    it('should not decay with 0 elapsed time', () => {
      const initialState = useGameStore.getState();

      applyDecay(0);

      const newState = useGameStore.getState();
      expect(newState.horse.hunger).toBe(initialState.horse.hunger);
      expect(newState.horse.cleanliness).toBe(initialState.horse.cleanliness);
      expect(newState.horse.happiness).toBe(initialState.horse.happiness);
    });
  });
});
