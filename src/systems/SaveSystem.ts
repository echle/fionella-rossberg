import { GameState, SavedGameState } from '../state/types';
import { GAME_CONFIG } from '../config/gameConstants';

/**
 * SaveSystem handles game state persistence to LocalStorage with elapsed time restoration
 */
export class SaveSystem {
  private readonly storageKey: string;

  constructor(storageKey: string = GAME_CONFIG.SAVE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Save current game state to LocalStorage
   * @param gameState - Full game state to persist
   */
  save(gameState: GameState): void {
    try {
      const savedState: SavedGameState = {
        version: gameState.version,
        timestamp: gameState.timestamp,
        horse: { ...gameState.horse },
        inventory: { ...gameState.inventory },
      };

      const serialized = JSON.stringify(savedState);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      console.error('[SaveSystem] Failed to save game state:', error);
    }
  }

  /**
   * Load game state from LocalStorage
   * @returns Object with savedState and elapsedMs, or null if no save exists or corrupted
   */
  load(): { savedState: SavedGameState; elapsedMs: number } | null {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }

      const savedState: SavedGameState = JSON.parse(serialized);

      // Validate schema
      if (!this.validateSaveData(savedState)) {
        console.warn('[SaveSystem] Invalid save data, resetting to new game');
        return null;
      }

      // Calculate elapsed time since last save
      const now = Date.now();
      const elapsedMs = Math.max(0, now - savedState.timestamp);

      return { savedState, elapsedMs };
    } catch (error) {
      console.error('[SaveSystem] Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Validate save data structure
   * @param data - Parsed JSON data
   * @returns true if valid SavedGameState structure
   */
  private validateSaveData(data: unknown): data is SavedGameState {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const state = data as Partial<SavedGameState>;

    return (
      typeof state.version === 'string' &&
      typeof state.timestamp === 'number' &&
      typeof state.horse === 'object' &&
      state.horse !== null &&
      typeof state.horse.hunger === 'number' &&
      typeof state.horse.cleanliness === 'number' &&
      typeof state.horse.happiness === 'number' &&
      typeof state.inventory === 'object' &&
      state.inventory !== null &&
      typeof state.inventory.carrots === 'number' &&
      typeof state.inventory.brushUses === 'number'
    );
  }

  /**
   * Clear saved game state
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('[SaveSystem] Failed to clear save data:', error);
    }
  }

  /**
   * Check if a save file exists
   * @returns true if save data exists in LocalStorage
   */
  hasSave(): boolean {
    try {
      return localStorage.getItem(this.storageKey) !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const saveSystem = new SaveSystem();
