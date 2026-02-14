import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore, DEFAULT_FEEDING_STATE } from '../../src/state/gameStore';
import { feed, selectTool, groom, pet, resetGame } from '../../src/state/actions';
import { INITIAL_STATUS, INITIAL_INVENTORY, CURRENCY } from '../../src/config/gameConstants';
import { saveSystem } from '../../src/systems/SaveSystem';

// Mock saveSystem to prevent LocalStorage writes during tests
vi.mock('../../src/systems/SaveSystem', () => ({
  saveSystem: {
    save: vi.fn(),
    load: vi.fn(),
    clear: vi.fn(),
    hasSave: vi.fn(() => false),
  },
}));

describe('Actions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
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
      feeding: DEFAULT_FEEDING_STATE,
      ui: {
        selectedTool: null,
        activeAnimation: null,
        lastInteractionTime: 0,
      },
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

  describe('selectTool', () => {
    it('should select a tool', () => {
      selectTool('carrot');
      const state = useGameStore.getState();
      expect(state.ui.selectedTool).toBe('carrot');
    });

    it('should deselect tool when clicking same tool again', () => {
      selectTool('carrot');
      expect(useGameStore.getState().ui.selectedTool).toBe('carrot');

      selectTool('carrot');
      expect(useGameStore.getState().ui.selectedTool).toBe(null);
    });

    it('should switch between tools', () => {
      selectTool('carrot');
      expect(useGameStore.getState().ui.selectedTool).toBe('carrot');

      selectTool('brush');
      expect(useGameStore.getState().ui.selectedTool).toBe('brush');
    });
  });

  describe('feed', () => {
    it('should increase hunger by 20 and consume 1 carrot', async () => {
      const initialState = useGameStore.getState();
      const initialHunger = initialState.horse.hunger;
      const initialCarrots = initialState.inventory.carrots;

      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(2500);
      const success = await feedPromise;

      expect(success).toBe(true);

      const newState = useGameStore.getState();
      expect(newState.horse.hunger).toBe(initialHunger + 20);
      expect(newState.inventory.carrots).toBe(initialCarrots - 1);
    });

    it('should clamp hunger at 100', async () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        horse: {
          ...useGameStore.getState().horse,
          hunger: 95,
        },
      });

      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(2500);
      await feedPromise;

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(100);
    });

    it('should fail when no carrots available', async () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        inventory: {
          ...useGameStore.getState().inventory,
          carrots: 0,
        },
      });

      const success = await feed();

      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER); // Unchanged
      expect(state.inventory.carrots).toBe(0); // Still 0
    });

    it('should set eating animation', async () => {
      const feedPromise = feed();
      await vi.advanceTimersByTimeAsync(100); // Check during eating

      const state = useGameStore.getState();
      expect(state.feeding.isEating).toBe(true);
      
      await vi.advanceTimersByTimeAsync(2400);
      await feedPromise;
    });
  });

  describe('groom', () => {
    it('should increase cleanliness by 5 and consume 1 brush use', () => {
      const initialState = useGameStore.getState();
      const initialCleanliness = initialState.horse.cleanliness;
      const initialBrushUses = initialState.inventory.brushUses;

      const success = groom();

      expect(success).toBe(true);

      const newState = useGameStore.getState();
      expect(newState.horse.cleanliness).toBe(initialCleanliness + 5);
      expect(newState.inventory.brushUses).toBe(initialBrushUses - 1);
    });

    it('should clamp cleanliness at 100', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        horse: {
          ...useGameStore.getState().horse,
          cleanliness: 98,
        },
      });

      groom();

      const state = useGameStore.getState();
      expect(state.horse.cleanliness).toBe(100);
    });

    it('should fail when no brush uses available', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        inventory: {
          ...useGameStore.getState().inventory,
          brushUses: 0,
        },
      });

      const success = groom();

      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS); // Unchanged
    });
  });

  describe('pet', () => {
    it('should increase happiness by 10', () => {
      const initialHappiness = useGameStore.getState().horse.happiness;

      pet();

      const state = useGameStore.getState();
      expect(state.horse.happiness).toBe(initialHappiness + 10);
    });

    it('should clamp happiness at 100', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        horse: {
          ...useGameStore.getState().horse,
          happiness: 95,
        },
      });

      pet();

      const state = useGameStore.getState();
      expect(state.horse.happiness).toBe(100);
    });

    it('should never fail (always available)', () => {
      // Pet multiple times to ensure no resource depletion
      for (let i = 0; i < 10; i++) {
        pet();
      }

      const state = useGameStore.getState();
      expect(state.horse.happiness).toBe(100); // Clamped at max
    });

    it('should set happy animation', () => {
      pet();

      const state = useGameStore.getState();
      expect(state.ui.activeAnimation).toBe('happy');
    });
  });

  describe('resetGame', () => {
    beforeEach(() => {
      // Mock saveSystem.save to prevent actual localStorage interaction
      vi.spyOn(saveSystem, 'save').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    // T015: Test for resetGame() horse status reset
    it('should reset horse status to initial values', () => {
      // Modify horse stats
      useGameStore.setState({
        horse: { hunger: 10, cleanliness: 20, happiness: 30 },
      });

      resetGame();

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
      expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS);
      expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS);
    });

    // T016: Test for resetGame() inventory reset
    it('should reset inventory to initial values', () => {
      // Deplete inventory
      useGameStore.setState({
        inventory: { carrots: 0, brushUses: 0 },
      });

      resetGame();

      const state = useGameStore.getState();
      expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
      expect(state.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
    });

    // T017: Test for resetGame() feeding state reset
    it('should reset feeding state to default', () => {
      // Modify feeding state
      useGameStore.setState({
        feeding: {
          isEating: true,
          eatStartTime: Date.now(),
          recentFeedings: [Date.now() - 1000, Date.now() - 2000],
          fullUntil: Date.now() + 5000,
        },
      });

      resetGame();

      const state = useGameStore.getState();
      expect(state.feeding.isEating).toBe(false);
      expect(state.feeding.eatStartTime).toBe(null);
      expect(state.feeding.recentFeedings).toEqual([]);
      expect(state.feeding.fullUntil).toBe(null);
    });

    // T018: Test for resetGame() UI state reset
    it('should reset UI state to initial values', () => {
      // Modify UI state
      useGameStore.setState({
        ui: {
          selectedTool: 'carrot',
          activeAnimation: 'eating',
          lastInteractionTime: Date.now(),
        },
      });

      resetGame();

      const state = useGameStore.getState();
      expect(state.ui.selectedTool).toBe(null);
      expect(state.ui.activeAnimation).toBe(null);
      expect(state.ui.lastInteractionTime).toBe(0);
    });

    // T019: Test for resetGame() saves to localStorage
    it('should save state to localStorage after reset', () => {
      const saveSpy = vi.spyOn(saveSystem, 'save');

      resetGame();

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(useGameStore.getState());
    });
  });
});
