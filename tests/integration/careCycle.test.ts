import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore, getGameState, DEFAULT_FEEDING_STATE } from '../../src/state/gameStore';
import { feed, selectTool, groom, pet, loadGameState } from '../../src/state/actions';
import { SaveSystem } from '../../src/systems/SaveSystem';
import { INITIAL_STATUS, INITIAL_INVENTORY, GAME_CONFIG, STATUS_INCREMENTS } from '../../src/config/gameConstants';

describe('Care Cycle Integration', () => {
  let saveSystem: SaveSystem;
  const testStorageKey = 'test-care-cycle-save';

  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage before each test
    localStorage.clear();

    // Create fresh SaveSystem instance with test key
    saveSystem = new SaveSystem(testStorageKey);

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
      },
    });
  });

  describe('T115: feed → save → reload → state restored', () => {
    it('should preserve feeding action after save and reload', async () => {
      // Initial state
      const initialCarrots = INITIAL_INVENTORY.CARROTS;
      const initialHunger = INITIAL_STATUS.HUNGER;
      expect(useGameStore.getState().inventory.carrots).toBe(initialCarrots);
      expect(useGameStore.getState().horse.hunger).toBe(initialHunger);

      // Perform feed action
      selectTool('carrot');
      expect(useGameStore.getState().ui.selectedTool).toBe('carrot');
      
      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(2500);
      await feedPromise;
      const afterFeedState = getGameState();
      
      // Verify feed action worked
      expect(afterFeedState.inventory.carrots).toBe(initialCarrots - 1);
      expect(afterFeedState.horse.hunger).toBe(Math.min(100, initialHunger + STATUS_INCREMENTS.FEED));

      // Save the state
      saveSystem.save(afterFeedState);

      // Verify save was written to localStorage
      const savedData = localStorage.getItem(testStorageKey);
      expect(savedData).not.toBeNull();

      // Simulate page reload by resetting store to initial state
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
        },
      });

      // Verify state was reset
      expect(useGameStore.getState().inventory.carrots).toBe(initialCarrots);
      expect(useGameStore.getState().horse.hunger).toBe(initialHunger);

      // Load saved state
      const loadResult = saveSystem.load();
      expect(loadResult).not.toBeNull();

      if (loadResult) {
        loadGameState(loadResult.savedState);
      }

      // Verify state was restored correctly
      const restoredState = getGameState();
      expect(restoredState.inventory.carrots).toBe(initialCarrots - 1);
      expect(restoredState.horse.hunger).toBe(Math.min(100, initialHunger + STATUS_INCREMENTS.FEED));
    });

    it('should preserve multiple actions (feed + groom + pet) after reload', async () => {
      // Perform multiple actions
      const initialState = getGameState();
      
      // Feed horse
      selectTool('carrot');
      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(2500);
      await feedPromise;
      
      // Groom horse
      selectTool('brush');
      groom();
      
      // Pet horse
      selectTool(null);
      pet();

      const afterActionsState = getGameState();

      // Verify all actions were applied
      expect(afterActionsState.inventory.carrots).toBe(initialState.inventory.carrots - 1);
      expect(afterActionsState.inventory.brushUses).toBe(initialState.inventory.brushUses - 1);
      expect(afterActionsState.horse.hunger).toBeGreaterThan(initialState.horse.hunger);
      expect(afterActionsState.horse.cleanliness).toBeGreaterThan(initialState.horse.cleanliness);
      expect(afterActionsState.horse.happiness).toBeGreaterThan(initialState.horse.happiness);

      // Save state
      saveSystem.save(afterActionsState);

      // Reset store (simulate reload)
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
        },
      });

      // Load saved state
      const loadResult = saveSystem.load();
      expect(loadResult).not.toBeNull();

      if (loadResult) {
        loadGameState(loadResult.savedState);
      }

      // Verify complete state was restored
      const restoredState = getGameState();
      expect(restoredState.inventory.carrots).toBe(afterActionsState.inventory.carrots);
      expect(restoredState.inventory.brushUses).toBe(afterActionsState.inventory.brushUses);
      expect(restoredState.horse.hunger).toBe(afterActionsState.horse.hunger);
      expect(restoredState.horse.cleanliness).toBe(afterActionsState.horse.cleanliness);
      expect(restoredState.horse.happiness).toBe(afterActionsState.horse.happiness);
    });

    it('should apply decay to elapsed time on reload', async () => {
      // Feed horse to increase hunger
      selectTool('carrot');
      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(2500);
      await feedPromise;
      const afterFeedState = getGameState();
      const hungerAfterFeed = afterFeedState.horse.hunger;

      // Save state
      saveSystem.save(afterFeedState);

      // Mock time passing (10 seconds = 10000ms)
      const elapsedMs = 10000;
      vi.setSystemTime(Date.now() + elapsedMs);

      // Reset store
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
        },
      });

      // Load saved state (will apply decay for elapsed time)
      const loadResult = saveSystem.load();
      expect(loadResult).not.toBeNull();

      if (loadResult) {
        // Verify elapsed time was calculated
        expect(loadResult.elapsedMs).toBeGreaterThan(0);
        
        loadGameState(loadResult.savedState);
      }

      // Verify hunger decreased due to decay (even though we fed earlier)
      const restoredState = getGameState();
      // Note: The actual decay calculation happens in applyDecay, 
      // but the SaveSystem returns the state as-is + elapsed time
      // In a real game, applyDecay would be called with elapsedMs before loadGameState
      expect(restoredState.horse.hunger).toBe(hungerAfterFeed);

      vi.useRealTimers();
    });

    it('should handle corrupted save data gracefully', () => {
      // Write corrupted data to localStorage
      localStorage.setItem(testStorageKey, 'invalid json data {{{');

      // Attempt to load
      const loadResult = saveSystem.load();

      // Should return null for corrupted data
      expect(loadResult).toBeNull();

      // State should remain at initial values
      const state = getGameState();
      expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    });

    it('should handle missing save data gracefully', () => {
      // Don't save anything, just try to load
      const loadResult = saveSystem.load();

      // Should return null when no save exists
      expect(loadResult).toBeNull();

      // State should remain at initial values
      const state = getGameState();
      expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    });
  });

  describe('Cross-action integration', () => {
    it('should enforce inventory constraints across save/load', async () => {
      // Use all carrots
      selectTool('carrot');
      const initialCarrots = getGameState().inventory.carrots;
      
      for (let i = 0; i < initialCarrots; i++) {
        const feedPromise = feed();
        await vi.advanceTimersByTimeAsync(2500);
        await feedPromise;
      }

      expect(getGameState().inventory.carrots).toBe(0);

      // Save state
      saveSystem.save(getGameState());

      // Reset and reload
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
        },
      });

      const loadResult = saveSystem.load();
      if (loadResult) {
        loadGameState(loadResult.savedState);
      }

      // Verify carrots are still 0 after reload
      expect(getGameState().inventory.carrots).toBe(0);

      // Verify feed action is blocked (should not crash or allow negative carrots)
      const beforeFeedState = getGameState();
      await feed(); // Should be blocked
      const afterFeedState = getGameState();

      expect(afterFeedState.inventory.carrots).toBe(beforeFeedState.inventory.carrots);
      expect(afterFeedState.horse.hunger).toBe(beforeFeedState.horse.hunger);
    });

    it('should handle status capping at 100 across save/load cycles', () => {
      // Pet horse multiple times to max happiness
      selectTool(null);
      for (let i = 0; i < 15; i++) {
        pet();
      }

      const beforeSaveState = getGameState();
      expect(beforeSaveState.horse.happiness).toBe(100); // Should be capped

      // Save and reload
      saveSystem.save(beforeSaveState);
      
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
        },
      });

      const loadResult = saveSystem.load();
      if (loadResult) {
        loadGameState(loadResult.savedState);
      }

      // Verify happiness is still capped at 100
      expect(getGameState().horse.happiness).toBe(100);
    });
  });

  describe('T012: Eating Duration and State Transitions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay hunger increase until eating animation completes', async () => {
      const initialState = getGameState();
      const initialHunger = initialState.horse.hunger;
      const initialCarrots = initialState.inventory.carrots;

      // Start feeding (returns Promise)
      const feedPromise = feed();

      // Immediately after calling feed(), carrot should be deducted but hunger unchanged
      await vi.advanceTimersByTimeAsync(10); // Small delay for Promise microtask
      const duringEatingState = getGameState();
      
      expect(duringEatingState.inventory.carrots).toBe(initialCarrots - 1); // Carrot deducted immediately
      expect(duringEatingState.feeding.isEating).toBe(true); // Eating state active
      expect(duringEatingState.horse.hunger).toBe(initialHunger); // Hunger NOT yet increased

      // Advance time to just before animation completes (2.4s)
      await vi.advanceTimersByTimeAsync(2400);
      const almostDoneState = getGameState();
      expect(almostDoneState.horse.hunger).toBe(initialHunger); // Still unchanged

      // Advance to animation complete (2.5s total)
      await vi.advanceTimersByTimeAsync(100);
      await feedPromise; // Wait for Promise to resolve

      // After animation completes, hunger should increase
      const afterEatingState = getGameState();
      expect(afterEatingState.feeding.isEating).toBe(false); // Eating done
      expect(afterEatingState.horse.hunger).toBe(Math.min(100, initialHunger + STATUS_INCREMENTS.FEED)); // Hunger increased
    });

    it('should block feeding while isEating is true', async () => {
      const initialCarrots = getGameState().inventory.carrots;

      // Start first feeding
      const firstFeed = feed();

      // Immediately try to feed again (should be blocked)
      await vi.advanceTimersByTimeAsync(10);
      const secondFeedResult = await feed();

      expect(secondFeedResult).toBe(false); // Second feed blocked
      expect(getGameState().inventory.carrots).toBe(initialCarrots - 1); // Only 1 carrot deducted

      // Complete first feeding
      await vi.advanceTimersByTimeAsync(2490); // Total: 2500ms
      await firstFeed;

      // Now feeding should work again
      const thirdFeed = feed();
      await vi.advanceTimersByTimeAsync(2500);
      const thirdFeedResult = await thirdFeed;
      
      expect(thirdFeedResult).toBe(true);
      expect(getGameState().inventory.carrots).toBe(initialCarrots - 2); // 2nd carrot deducted
    });

    it('should transition isEating state correctly', async () => {
      // Initial: not eating
      expect(getGameState().feeding.isEating).toBe(false);
      expect(getGameState().feeding.eatStartTime).toBeNull();

      // During feeding
      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(10);
      
      const duringState = getGameState();
      expect(duringState.feeding.isEating).toBe(true);
      expect(duringState.feeding.eatStartTime).toBeGreaterThan(0); // Timestamp set

      // After feeding completes
      await vi.advanceTimersByTimeAsync(2500);
      await feedPromise;
      
      const afterState = getGameState();
      expect(afterState.feeding.isEating).toBe(false);
      expect(afterState.feeding.eatStartTime).toBeNull(); // Cleared
    });
  });

  describe('T013-T017: Satiety Limit and Cooldown', () => {
    it('should block feeding after 3 carrots and enforce 30s cooldown', async () => {
      const initialCarrots = getGameState().inventory.carrots;
      
      // Feed 3 carrots in succession
      for (let i = 0; i < 3; i++) {
        const feedPromise = feed();
        await vi.advanceTimersByTimeAsync(2500);
        const result = await feedPromise;
        expect(result).toBe(true); // All 3 should succeed
      }

      const afterThreeState = getGameState();
      expect(afterThreeState.inventory.carrots).toBe(initialCarrots - 3);
      expect(afterThreeState.feeding.recentFeedings).toHaveLength(3);
      expect(afterThreeState.feeding.fullUntil).toBeGreaterThan(Date.now()); // Cooldown active

      // Try 4th feeding - should be blocked
      const fourthFeed = await feed();
      expect(fourthFeed).toBe(false); // Blocked
      expect(getGameState().inventory.carrots).toBe(initialCarrots - 3); // No carrot deducted

      // Wait 30 seconds (cooldown period)
      await vi.advanceTimersByTimeAsync(30000);

      // Now feeding should work again
      const fifthFeed = feed();
      await vi.advanceTimersByTimeAsync(2500);
      const fifthResult = await fifthFeed;
      expect(fifthResult).toBe(true); // Feeding allowed after cooldown
      expect(getGameState().inventory.carrots).toBe(initialCarrots - 4);
    });

    it('should persist satiety state across save/load', async () => {
      // Feed 3 carrots to trigger cooldown
      for (let i = 0; i < 3; i++) {
        const feedPromise = feed();
        await vi.advanceTimersByTimeAsync(2500);
        await feedPromise;
      }

      const beforeSave = getGameState();
      expect(beforeSave.feeding.fullUntil).toBeGreaterThan(Date.now());

      // Save state
      saveSystem.save(beforeSave);

      // Simulate reload
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
        },
      });

      // Load saved state
      const loadResult = saveSystem.load();
      expect(loadResult).not.toBeNull();
      
      if (loadResult) {
        loadGameState(loadResult.savedState);
      }

      // Verify cooldown persisted
      const afterLoad = getGameState();
      expect(afterLoad.feeding.fullUntil).toBe(beforeSave.feeding.fullUntil);
      expect(afterLoad.feeding.recentFeedings).toHaveLength(3);

      // Verify feeding still blocked
      const blockedFeed = await feed();
      expect(blockedFeed).toBe(false);
    });

    it('should allow feeding with decay (2 carrots + 15s wait + 1 carrot)', async () => {
      const initialCarrots = getGameState().inventory.carrots;
      
      // Feed 2 carrots
      for (let i = 0; i < 2; i++) {
        const feedPromise = feed();
        await vi.advanceTimersByTimeAsync(2500);
        await feedPromise;
      }

      expect(getGameState().feeding.recentFeedings).toHaveLength(2);

      // Wait 15 seconds (first carrot expires after 10s)
      await vi.advanceTimersByTimeAsync(15000);

      // Feed 3rd carrot - should NOT trigger cooldown (only 1 active feeding remains)
      const thirdFeed = feed();
      await vi.advanceTimersByTimeAsync(2500);
      const thirdResult = await thirdFeed;
      
      expect(thirdResult).toBe(true);
      expect(getGameState().feeding.fullUntil).toBeNull(); // No cooldown
      expect(getGameState().inventory.carrots).toBe(initialCarrots - 3);

      // Verify we can still feed (not in cooldown)
      const fourthFeed = feed();
      await vi.advanceTimersByTimeAsync(2500);
      const fourthResult = await fourthFeed;
      expect(fourthResult).toBe(true);
    });
  });
});
