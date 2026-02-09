/**
 * Type definitions for game state
 */

export type ToolType = 'carrot' | 'brush' | null;

export interface HorseStatus {
  hunger: number; // 0-100
  cleanliness: number; // 0-100
  happiness: number; // 0-100
}

export interface Inventory {
  carrots: number; // Starting: 10
  brushUses: number; // Starting: 100
}

export interface UIState {
  selectedTool: ToolType;
  activeAnimation: string | null;
  lastInteractionTime: number;
}

export interface GameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  ui: UIState;
}

export interface SavedGameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
}
