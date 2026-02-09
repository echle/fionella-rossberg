import { updateGameState, getGameState } from './gameStore';
import { clamp } from '../utils/mathUtils';
import {
  STATUS_INCREMENTS,
  DECAY_RATES,
  INITIAL_STATUS,
  INITIAL_INVENTORY,
} from '../config/gameConstants';
import { msToSeconds } from '../utils/timeUtils';
import { ToolType } from './types';
import { saveSystem } from '../systems/SaveSystem';

/**
 * Select or deselect a tool
 */
export function selectTool(tool: ToolType): void {
  const state = getGameState();

  // Toggle: deselect if already selected
  const newTool = state.ui.selectedTool === tool ? null : tool;

  updateGameState(() => ({
    ui: {
      ...state.ui,
      selectedTool: newTool,
    },
  }));
}

/**
 * Feed the horse (increase hunger)
 */
export function feed(): boolean {
  const state = getGameState();

  if (state.inventory.carrots <= 0) {
    console.warn('No carrots available');
    return false;
  }

  updateGameState(() => ({
    horse: {
      ...state.horse,
      hunger: clamp(state.horse.hunger + STATUS_INCREMENTS.FEED, 0, 100),
    },
    inventory: {
      ...state.inventory,
      carrots: state.inventory.carrots - 1,
    },
    ui: {
      ...state.ui,
      activeAnimation: 'eating',
    },
  }));

  // Auto-save after interaction
  saveSystem.save(getGameState());

  return true;
}

/**
 * Groom the horse (increase cleanliness)
 */
export function groom(): boolean {
  const state = getGameState();

  if (state.inventory.brushUses <= 0) {
    console.warn('No brush uses available');
    return false;
  }

  updateGameState(() => ({
    horse: {
      ...state.horse,
      cleanliness: clamp(state.horse.cleanliness + STATUS_INCREMENTS.GROOM, 0, 100),
    },
    inventory: {
      ...state.inventory,
      brushUses: state.inventory.brushUses - 1,
    },
  }));

  // Auto-save after interaction
  saveSystem.save(getGameState());

  return true;
}

/**
 * Pet the horse (increase happiness)
 */
export function pet(): void {
  const state = getGameState();

  updateGameState(() => ({
    horse: {
      ...state.horse,
      happiness: clamp(state.horse.happiness + STATUS_INCREMENTS.PET, 0, 100),
    },
    ui: {
      ...state.ui,
      activeAnimation: 'happy',
    },
  }));

  // Auto-save after interaction
  saveSystem.save(getGameState());
}

/**
 * Apply time-based decay to all stats
 */
export function applyDecay(elapsedMs: number): void {
  const state = getGameState();
  const secondsElapsed = msToSeconds(elapsedMs);

  const hungerDecay = Math.floor(secondsElapsed * DECAY_RATES.HUNGER);
  const cleanlinessDecay = Math.floor(secondsElapsed * DECAY_RATES.CLEANLINESS);
  const happinessDecay = Math.floor(secondsElapsed * DECAY_RATES.HAPPINESS);

  updateGameState(() => ({
    horse: {
      hunger: clamp(state.horse.hunger - hungerDecay, 0, 100),
      cleanliness: clamp(state.horse.cleanliness - cleanlinessDecay, 0, 100),
      happiness: clamp(state.horse.happiness - happinessDecay, 0, 100),
    },
  }));
}

/**
 * Load game state from saved data
 */
export function loadGameState(savedState: Partial<ReturnType<typeof getGameState>>): void {
  updateGameState(() => savedState);
}

/**
 * Reset game to initial state
 */
export function resetGame(): void {
  updateGameState(() => ({
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
  }));
}
