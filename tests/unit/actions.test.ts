import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/state/gameStore';
import { feed, selectTool, groom, pet } from '../../src/state/actions';
import { INITIAL_STATUS, INITIAL_INVENTORY } from '../../src/config/gameConstants';

describe('Actions', () => {
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
    it('should increase hunger by 20 and consume 1 carrot', () => {
      const initialState = useGameStore.getState();
      const initialHunger = initialState.horse.hunger;
      const initialCarrots = initialState.inventory.carrots;

      const success = feed();

      expect(success).toBe(true);

      const newState = useGameStore.getState();
      expect(newState.horse.hunger).toBe(initialHunger + 20);
      expect(newState.inventory.carrots).toBe(initialCarrots - 1);
    });

    it('should clamp hunger at 100', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        horse: {
          ...useGameStore.getState().horse,
          hunger: 95,
        },
      });

      feed();

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(100);
    });

    it('should fail when no carrots available', () => {
      useGameStore.setState({
        ...useGameStore.getState(),
        inventory: {
          ...useGameStore.getState().inventory,
          carrots: 0,
        },
      });

      const success = feed();

      expect(success).toBe(false);

      const state = useGameStore.getState();
      expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER); // Unchanged
      expect(state.inventory.carrots).toBe(0); // Still 0
    });

    it('should set eating animation', () => {
      feed();

      const state = useGameStore.getState();
      expect(state.ui.activeAnimation).toBe('eating');
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
});
