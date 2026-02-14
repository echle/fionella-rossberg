/**
 * Type definitions for game state
 */

export type ToolType = 'carrot' | 'brush' | null;

/**
 * Horse animation states for sprite-based animations
 * @feature 003-visual-assets
 */
export type HorseAnimationState =
  | 'idle'      // Default looping state (breathing, tail swish)
  | 'eating'    // Triggered by feed action, 2.5s duration
  | 'grooming'  // Triggered by brush drag, loops while dragging
  | 'happy'     // One-shot animation after grooming/feeding completion
  | 'walking';  // Reserved for future movement feature

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

export interface FeedingState {
  /**
   * Whether horse is currently eating (animation in progress)
   * @transient - NOT persisted in SaveSystem (resets to false on reload)
   */
  isEating: boolean;

  /**
   * Timestamp (ms) when current eating animation started
   * @transient - NOT persisted (cleared on reload)
   * @nullable - null when not eating
   */
  eatStartTime: number | null;

  /**
   * Timestamps (ms) of recent feedings for satiety tracking
   * Entries older than 10 seconds (SATIETY_DECAY_MS) are "expired"
   * but may remain in array until lazy pruning occurs
   * @persisted - Saved to LocalStorage, pruned before save
   */
  recentFeedings: number[];

  /**
   * Timestamp (ms) until which horse is considered "full"
   * Calculated as: lastFullTrigger + SATIETY_COOLDOWN_MS (30s)
   * @persisted - Survives page reload
   * @nullable - null when horse is not full
   */
  fullUntil: number | null;
}

export interface GameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  ui: UIState;
  feeding: FeedingState;
  locale: {
    language: string;  // Current language: "de" or "en"
  };
}

export interface SavedGameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  feeding: FeedingState;
  locale: {
    language: string;
  };
}

/**
 * Translation data structure - nested object for hierarchical keys
 * @feature 005-internationalization-i18n
 */
export interface Translation {
  [key: string]: string | Translation;
}

/**
 * Language configuration
 * @feature 005-internationalization-i18n
 */
export interface LanguageConfig {
  code: string;           // e.g., "de", "en"
  name: string;          // e.g., "Deutsch", "English"
  flag?: string;         // Icon/Emoji (optional)
  isDefault: boolean;
}

/**
 * Locale state for i18n system
 * @feature 005-internationalization-i18n
 */
export interface LocaleState {
  currentLanguage: string;  // e.g., "de" or "en"
  availableLanguages: string[];
  translations: Record<string, Translation>;
}
