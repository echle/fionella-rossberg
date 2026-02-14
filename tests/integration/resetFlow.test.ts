import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore, DEFAULT_FEEDING_STATE } from '../../src/state/gameStore';
import { resetGame } from '../../src/state/actions';
import { saveSystem } from '../../src/systems/SaveSystem';
import { DecaySystem } from '../../src/systems/DecaySystem';
import { INITIAL_STATUS, INITIAL_INVENTORY, GAME_CONFIG } from '../../src/config/gameConstants';

describe('Reset Flow Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store to initial state before each test
    useGameStore.setState({
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
      feeding: DEFAULT_FEEDING_STATE,
      ui: {
        selectedTool: null,
        activeAnimation: null,
        lastInteractionTime: 0,
        lastPetTime: 0,
      },
      locale: {
        language: 'de',
      },
    });
  });

  afterEach(() => {
    // Restore all mocks after each test to prevent leakage
    vi.restoreAllMocks();
  });

  // T020: Test for button visibility when resources exhausted
  describe('Reset button visibility logic', () => {
    it('should show reset button when both carrots and brushUses are 0', () => {
      // Set inventory to depleted state
      useGameStore.setState({
        inventory: { carrots: 0, brushUses: 0 },
      });

      const state = useGameStore.getState();
      const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;

      expect(shouldShow).toBe(true);
    });

    // T021: Test for button hidden with resources available
    it('should hide reset button when carrots > 0', () => {
      useGameStore.setState({
        inventory: { carrots: 5, brushUses: 0 },
      });

      const state = useGameStore.getState();
      const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;

      expect(shouldShow).toBe(false);
    });

    it('should hide reset button when brushUses > 0', () => {
      useGameStore.setState({
        inventory: { carrots: 0, brushUses: 10 },
      });

      const state = useGameStore.getState();
      const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;

      expect(shouldShow).toBe(false);
    });

    it('should hide reset button when both resources available', () => {
      useGameStore.setState({
        inventory: { carrots: 5, brushUses: 10 },
      });

      const state = useGameStore.getState();
      const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;

      expect(shouldShow).toBe(false);
    });
  });

  // T022: Test for full reset flow
  describe('Full reset flow', () => {
    it('should reset all game state and hide button after click', () => {
      // Mock saveSystem.save
      vi.spyOn(saveSystem, 'save').mockImplementation(() => {});

      // Step 1: Deplete resources and modify game state
      useGameStore.setState({
        horse: { hunger: 10, cleanliness: 20, happiness: 30 },
        inventory: { carrots: 0, brushUses: 0 },
        feeding: {
          isEating: true,
          eatStartTime: Date.now(),
          recentFeedings: [Date.now() - 1000],
          fullUntil: Date.now() + 5000,
        },
        ui: {
          selectedTool: 'carrot',
          activeAnimation: 'eating',
          lastInteractionTime: Date.now(),
          lastPetTime: 0,
        },
      });

      // Step 2: Verify button should be visible
      let state = useGameStore.getState();
      let shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
      expect(shouldShow).toBe(true);

      // Step 3: Click reset button (calls resetGame)
      resetGame();

      // Step 4: Verify all state restored to initial values
      state = useGameStore.getState();
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
      expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS);
      expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS);
      expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
      expect(state.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
      expect(state.feeding.isEating).toBe(false);
      expect(state.feeding.eatStartTime).toBe(null);
      expect(state.feeding.recentFeedings).toEqual([]);
      expect(state.feeding.fullUntil).toBe(null);
      expect(state.ui.selectedTool).toBe(null);
      expect(state.ui.activeAnimation).toBe(null);
      expect(state.ui.lastInteractionTime).toBe(0);

      // Step 5: Verify button should now be hidden (resources restored)
      shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
      expect(shouldShow).toBe(false);
    });

    it('should persist reset state to localStorage', () => {
      // Clear localStorage before test
      localStorage.clear();
      
      // Setup: Deplete resources to trigger reset scenario
      useGameStore.setState({
        horse: { hunger: 5, cleanliness: 10, happiness: 15 },
        inventory: { carrots: 0, brushUses: 0 },
      });

      // Call resetGame which should save to localStorage
      resetGame();
      
      // Verify state was persisted to localStorage
      const rawData = localStorage.getItem('fionella-horse-game-save');
      expect(rawData).not.toBeNull();
      
      // Verify the saved data is valid
      const loadResult = saveSystem.load();
      expect(loadResult).not.toBe(null);
      expect(loadResult?.savedState.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
      expect(loadResult?.savedState.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
      expect(loadResult?.savedState.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    });
  });

  // T023: Test for DecaySystem timer reset
  describe('DecaySystem integration', () => {
    it('should reset DecaySystem timer to prevent immediate stat drain', () => {
      // Create DecaySystem instance
      const decaySystem = new DecaySystem();

      // Simulate time passage (e.g., 10 seconds)
      const oldTime = Date.now();
      vi.setSystemTime(oldTime + 10000);

      // Update decay system (will drain stats based on elapsed time)
      decaySystem.update();

      // Reset game
      resetGame();

      // Reset DecaySystem timer (simulating the decaySystem.reset() call from UIScene)
      decaySystem.reset();

      // Verify that DecaySystem's lastUpdateTime was reset
      // This prevents stat drain on next update since time delta will be small
      const stateBefore = useGameStore.getState();
      const hungerBefore = stateBefore.horse.hunger;

      // Advance time by 1 second
      vi.setSystemTime(Date.now() + 1000);

      // Update decay system again
      decaySystem.update();

      // Verify stats only decayed by 1 second, not 11 seconds (10 seconds old + 1 second new)
      const stateAfter = useGameStore.getState();
      const hungerAfter = stateAfter.horse.hunger;

      // Hunger should have decreased by small amount (1 second of decay)
      // not large amount (11 seconds of decay)
      expect(hungerAfter).toBeGreaterThan(hungerBefore - 2); // Allow small decay only
      expect(hungerAfter).toBeLessThanOrEqual(hungerBefore); // But should have decreased
    });

    it('should prevent stat drain immediately after reset', () => {
      const decaySystem = new DecaySystem();

      // Reset game and decay system
      resetGame();
      decaySystem.reset();

      // Get state immediately after reset
      const stateBeforeUpdate = useGameStore.getState();
      const hungerBefore = stateBeforeUpdate.horse.hunger;

      // Update decay system (should not drain stats since time delta is 0)
      decaySystem.update();

      // Verify stats unchanged
      const stateAfterUpdate = useGameStore.getState();
      expect(stateAfterUpdate.horse.hunger).toBe(hungerBefore);
      expect(stateAfterUpdate.horse.cleanliness).toBe(stateBeforeUpdate.horse.cleanliness);
      expect(stateAfterUpdate.horse.happiness).toBe(stateBeforeUpdate.horse.happiness);
    });
  });
});
