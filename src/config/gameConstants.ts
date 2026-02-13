/**
 * Game balance constants
 */

// Decay rates (value decrease per interval)
export const DECAY_RATES = {
  HUNGER: 1 / 6, // -1 per 6 seconds (~10 minutes to 0)
  CLEANLINESS: 1 / 12, // -1 per 12 seconds (~20 minutes to 0)
  HAPPINESS: 1 / 7.5, // -1 per 7.5 seconds (~12.5 minutes to 0)
} as const;

// Status increments per action
export const STATUS_INCREMENTS = {
  FEED: 20, // Hunger +20 per carrot
  GROOM: 5, // Cleanliness +5 per brush stroke
  PET: 10, // Happiness +10 per pet
} as const;

// Initial inventory values
export const INITIAL_INVENTORY = {
  CARROTS: 10,
  BRUSH_USES: 100,
} as const;

// Initial horse status values
export const INITIAL_STATUS = {
  HUNGER: 80,
  CLEANLINESS: 70,
  HAPPINESS: 90,
} as const;

// Game configuration
export const GAME_CONFIG = {
  SAVE_KEY: 'fionella-horse-game-save',
  SAVE_VERSION: '1.0.0',
  AUTO_SAVE_INTERVAL: 10000, // 10 seconds
  INTERACTION_COOLDOWN: 100, // 100ms to prevent spam
} as const;

// Feeding mechanics configuration
export const FEEDING_CONFIG = {
  EATING_DURATION: 2500, // 2.5 seconds eating animation
  SATIETY_LIMIT: 3, // Maximum carrots before cooldown
  SATIETY_DECAY_MS: 10000, // Each carrot expires after 10 seconds
  SATIETY_COOLDOWN_MS: 30000, // 30 seconds cooldown after hitting limit
} as const;
