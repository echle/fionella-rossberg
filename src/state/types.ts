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
  lastPetTime: number; // Timestamp of last pet action for cooldown
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
  // Feature 006: Economy System with Game Clock
  currency: number;                 // Horseshoes balance (0-999,999)
  gameClock: GameClockState;        // Play session timer
  giftBoxes: GiftBoxState[];        // Unclaimed mystery gifts (max 3)
  isGameOver: boolean;              // All stats = 0 flag
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
  // Feature 006: Economy System with Game Clock
  currency: number;
  gameClock: GameClockState;
  giftBoxes: GiftBoxState[];
  isGameOver: boolean;
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

/**
 * Shop item configuration
 * @feature 006-economy-game-clock
 */
export interface ShopItem {
  id: string;                    // Unique identifier (e.g., "carrot_single")
  nameKey: string;               // i18n translation key (e.g., "shop.item.carrot")
  icon: string;                  // Emoji or sprite key (e.g., "🥕")
  price: number;                 // Cost in Horseshoes
  reward: {
    type: 'carrots' | 'brushUses' | 'currency';
    amount: number;
  };
}

/**
 * Gift box state for time-based rewards
 * @feature 006-economy-game-clock
 */
export interface GiftBoxState {
  id: string;                    // Unique identifier (e.g., "gift_1707926700000")
  spawnTime: number;             // Game clock seconds when spawned (e.g., 300 for 5 min)
  position: { x: number; y: number };  // Screen coordinates
  claimed: boolean;              // Whether reward has been collected
}

/**
 * Game clock state for tracking play session
 * @feature 006-economy-game-clock
 */
export interface GameClockState {
  startTimestamp: number | null;  // Unix timestamp (ms) when clock started
}
