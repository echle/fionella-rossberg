import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveSystem } from '../../src/systems/SaveSystem';
import { GameState, SavedGameState } from '../../src/state/types';
import { GAME_CONFIG, INITIAL_STATUS, INITIAL_INVENTORY } from '../../src/config/gameConstants';

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let mockGameState: GameState;
  const testStorageKey = 'test-horse-game-save';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create fresh SaveSystem instance with test key
    saveSystem = new SaveSystem(testStorageKey);

    // Setup mock game state
    mockGameState = {
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
    };
  });

  describe('save', () => {
    it('should save game state to LocalStorage', () => {
      saveSystem.save(mockGameState);

      const saved = localStorage.getItem(testStorageKey);
      expect(saved).not.toBeNull();

      const parsed: SavedGameState = JSON.parse(saved!);
      expect(parsed.version).toBe(mockGameState.version);
      expect(parsed.horse).toEqual(mockGameState.horse);
      expect(parsed.inventory).toEqual(mockGameState.inventory);
    });

    it('should not save UI state (only persistent data)', () => {
      saveSystem.save(mockGameState);

      const saved = localStorage.getItem(testStorageKey);
      const parsed = JSON.parse(saved!);

      // UI state should not be in saved data
      expect(parsed.ui).toBeUndefined();
    });

    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw, just log error
      expect(() => saveSystem.save(mockGameState)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SaveSystem] Failed to save'),
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('load', () => {
    it('should return null when no save data exists', () => {
      const result = saveSystem.load();
      expect(result).toBeNull();
    });

    it('should load saved game state', () => {
      // Save data first
      saveSystem.save(mockGameState);

      // Load it back
      const result = saveSystem.load();

      expect(result).not.toBeNull();
      expect(result!.savedState.version).toBe(mockGameState.version);
      expect(result!.savedState.horse).toEqual(mockGameState.horse);
      expect(result!.savedState.inventory).toEqual(mockGameState.inventory);
    });

    it('should calculate elapsed time correctly', () => {
      const pastTimestamp = Date.now() - 60000; // 60 seconds ago
      const pastState: GameState = {
        ...mockGameState,
        timestamp: pastTimestamp,
      };

      saveSystem.save(pastState);

      const result = saveSystem.load();

      expect(result).not.toBeNull();
      expect(result!.elapsedMs).toBeGreaterThanOrEqual(59000); // ~60s (with tolerance)
      expect(result!.elapsedMs).toBeLessThan(61000);
    });

    it('should return null for corrupted save data (invalid JSON)', () => {
      localStorage.setItem(testStorageKey, 'invalid-json{]');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = saveSystem.load();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return null for corrupted save data (invalid schema)', () => {
      const invalidData = {
        version: '1.0.0',
        // Missing timestamp, horse, inventory
      };

      localStorage.setItem(testStorageKey, JSON.stringify(invalidData));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = saveSystem.load();

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SaveSystem] Invalid save data')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should validate all required SavedGameState fields', () => {
      const invalidStates = [
        { ...mockGameState, version: undefined }, // Missing version
        { ...mockGameState, timestamp: undefined }, // Missing timestamp
        { ...mockGameState, horse: undefined }, // Missing horse
        { ...mockGameState, horse: { hunger: 80 } }, // Incomplete horse
        { ...mockGameState, inventory: undefined }, // Missing inventory
        { ...mockGameState, inventory: { carrots: 10 } }, // Incomplete inventory
      ];

      invalidStates.forEach((invalidState) => {
        localStorage.clear();
        localStorage.setItem(testStorageKey, JSON.stringify(invalidState));

        const result = saveSystem.load();
        expect(result).toBeNull();
      });
    });
  });

  describe('clear', () => {
    it('should remove saved game state from LocalStorage', () => {
      saveSystem.save(mockGameState);
      expect(localStorage.getItem(testStorageKey)).not.toBeNull();

      saveSystem.clear();
      expect(localStorage.getItem(testStorageKey)).toBeNull();
    });

    it('should handle clear errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Cannot remove');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => saveSystem.clear()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      removeItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasSave', () => {
    it('should return false when no save exists', () => {
      expect(saveSystem.hasSave()).toBe(false);
    });

    it('should return true when save exists', () => {
      saveSystem.save(mockGameState);
      expect(saveSystem.hasSave()).toBe(true);
    });

    it('should return false on storage errors', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(saveSystem.hasSave()).toBe(false);

      getItemSpy.mockRestore();
    });
  });
});
