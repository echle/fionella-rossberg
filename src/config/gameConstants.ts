/**
 * Game balance constants
 */

import type { ShopItem } from '../state/types';

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

// Interaction cooldowns
export const COOLDOWNS = {
  PET: 30000, // 30 seconds cooldown between petting
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

// Sprite animation configuration
export const SPRITE_CONFIG = {
  FRAME_RATES: {
    IDLE: 9,
    WALK: 12,
    EAT: 9,
    HAPPY: 12,
    GROOM: 9,
  },
  ANCHOR: {
    X: 0.5, // Center horizontally
    Y: 1.0, // Bottom-aligned (feet on ground)
  },
  SCALE: 0.5, // 512px frames → 256px display size (high-resolution sprites)
  FRAME_SIZE: {
    WIDTH: 512, // Each frame is 512×384px
    HEIGHT: 384,
  },
} as const;

/**
 * Currency system configuration
 * @feature 006-economy-game-clock
 */
export const CURRENCY = {
  STARTING_BALANCE: 50,    // Initial currency on new game
  MAX_BALANCE: 999999,     // Cap to prevent overflow
  REWARDS: {
    FEED: 5,               // Horseshoes earned per feed
    GROOM: 3,              // Horseshoes earned per groom stroke
    PET: 2,                // Horseshoes earned per pet
    GIFT_BONUS: 10,        // Horseshoes from gift box (20% chance)
  },
} as const;

/**
 * Shop items configuration
 * @feature 006-economy-game-clock
 */
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'carrot_single',
    nameKey: 'ui.shop.item.carrot',
    icon: '🥕',
    price: 5,
    reward: { type: 'carrots', amount: 1 },
  },
  {
    id: 'brush_refill',
    nameKey: 'ui.shop.item.brush_refill',
    icon: '🪥',
    price: 8,
    reward: { type: 'brushUses', amount: 50 },
  },
  {
    id: 'carrot_bundle',
    nameKey: 'ui.shop.item.carrot_bundle',
    icon: '📦',
    price: 15,
    reward: { type: 'carrots', amount: 5 },
  },
];

/**
 * Gift spawn configuration
 * @feature 006-economy-game-clock
 */
export const GIFT_CONFIG = {
  SPAWN_INTERVAL: 300,     // Seconds between gift spawns (5 minutes)
  MAX_UNCLAIMED: 3,        // Maximum unclaimed gifts on screen
  SAFE_MARGIN: 50,         // Pixels from viewport edges
  UI_TOP_HEIGHT: 100,      // Status bars area (px)
  UI_BOTTOM_HEIGHT: 120,   // Inventory area (px)
  REWARD_PROBABILITIES: {
    CARROTS: 50,           // 50% chance: 2 carrots
    BRUSH_USES: 30,        // 30% chance: 20 brush uses
    CURRENCY: 20,          // 20% chance: 10 Horseshoes
  },
  REWARD_AMOUNTS: {
    CARROTS: 2,
    BRUSH_USES: 20,
    CURRENCY: 10,
  },
} as const;
