import { updateGameState, getGameState, DEFAULT_FEEDING_STATE } from './gameStore';
import { clamp } from '../utils/mathUtils';
import {
  STATUS_INCREMENTS,
  DECAY_RATES,
  INITIAL_STATUS,
  INITIAL_INVENTORY,
  FEEDING_CONFIG,
  GAME_CONFIG,
  CURRENCY,
  SHOP_ITEMS,
  COOLDOWNS,
} from '../config/gameConstants';
import { msToSeconds } from '../utils/timeUtils';
import { ToolType } from './types';
import { saveSystem } from '../systems/SaveSystem';
import { canFeed, pruneExpiredFeedings, calculateSatietyCount } from '../utils/feedingHelpers';
import { i18nService } from '../services/i18nService';

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
 * Feed the horse (increase hunger) - async with 2.5s eating animation
 * 
 * @returns Promise<boolean> resolves to true if feeding succeeded (after animation completes),
 *                          resolves to false if feeding blocked (no carrots, already eating, or full)
 */
export async function feed(): Promise<boolean> {
  const state = getGameState();
  const now = Date.now();

  // Validation checks (fail fast)
  if (state.inventory.carrots <= 0) {
    console.warn('No carrots available');
    return false;
  }

  if (state.feeding.isEating) {
    console.warn('Horse is already eating');
    return false;
  }

  // Satiety checks (using helpers)
  if (!canFeed(state, now)) {
    console.warn('Horse is full or in cooldown');
    return false;
  }

  // Deduct carrot immediately (prevents double-feeding exploit)
  updateGameState(() => ({
    inventory: {
      ...state.inventory,
      carrots: state.inventory.carrots - 1,
    },
    feeding: {
      ...state.feeding,
      isEating: true,
      eatStartTime: now,
    },
  }));

  // Wait for eating animation (2.5 seconds)
  await new Promise<void>((resolve) => {
    setTimeout(resolve, FEEDING_CONFIG.EATING_DURATION);
  });

  // Apply hunger increment after animation
  const currentState = getGameState();
  const afterEatingTime = Date.now();

  // Add feeding timestamp and check satiety
  const updatedFeedings = [...currentState.feeding.recentFeedings, afterEatingTime];
  const prunedFeedings = pruneExpiredFeedings(
    updatedFeedings,
    FEEDING_CONFIG.SATIETY_DECAY_MS,
    afterEatingTime
  );
  const satietyCount = calculateSatietyCount(prunedFeedings, afterEatingTime);

  // Calculate fullUntil if satiety limit reached
  const newFullUntil = satietyCount >= FEEDING_CONFIG.SATIETY_LIMIT
    ? afterEatingTime + FEEDING_CONFIG.SATIETY_COOLDOWN_MS
    : null;

  updateGameState(() => ({
    horse: {
      ...currentState.horse,
      hunger: clamp(currentState.horse.hunger + STATUS_INCREMENTS.FEED, 0, 100),
    },
    feeding: {
      ...currentState.feeding,
      isEating: false,
      eatStartTime: null,
      recentFeedings: prunedFeedings,
      fullUntil: newFullUntil,
    },
    ui: {
      ...currentState.ui,
      activeAnimation: null,
    },
  }));

  // Auto-save after interaction
  saveSystem.save(getGameState());

  // Feature 006: Award currency for feeding
  earnCurrency(CURRENCY.REWARDS.FEED);

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

  // Feature 006: Award currency for grooming
  earnCurrency(CURRENCY.REWARDS.GROOM);

  return true;
}

/**
 * Pet the horse (increase happiness)
 * Feature 006 Balance: 30s cooldown to prevent currency spam
 */
export function pet(): boolean {
  const state = getGameState();
  const now = Date.now();
  const timeSinceLastPet = now - state.ui.lastPetTime;

  // Check cooldown
  if (timeSinceLastPet < COOLDOWNS.PET) {
    console.log('[pet] On cooldown, remaining:', Math.ceil((COOLDOWNS.PET - timeSinceLastPet) / 1000), 's');
    return false;
  }

  updateGameState(() => ({
    horse: {
      ...state.horse,
      happiness: clamp(state.horse.happiness + STATUS_INCREMENTS.PET, 0, 100),
    },
    ui: {
      ...state.ui,
      activeAnimation: 'happy',
      lastPetTime: now,
    },
  }));

  // Auto-save after interaction
  saveSystem.save(getGameState());

  // Feature 006: Award currency for petting
  earnCurrency(CURRENCY.REWARDS.PET);
  return true;
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
  const currentState = getGameState();
  
  // Preserve locale with fallback to default
  const localeToPreserve = currentState.locale || { language: 'de' };
  
  updateGameState(() => ({
    version: GAME_CONFIG.SAVE_VERSION,
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
      lastPetTime: 0,
    },
    feeding: {
      isEating: false,
      eatStartTime: null,
      recentFeedings: [],
      fullUntil: null,
    },
    locale: localeToPreserve, // Preserve language setting
    // Feature 006: Reset economy state
    currency: CURRENCY.STARTING_BALANCE,
    gameClock: {
      startTimestamp: Date.now(), // Restart clock
    },
    giftBoxes: [],
    isGameOver: false,
  }));

  // Persist reset state
  saveSystem.save(getGameState());
}

/**
 * Currency System Actions
 * @feature 006-economy-game-clock
 */

/**
 * Award Horseshoes to the player
 * @param amount - Horseshoes to add (capped at MAX_BALANCE)
 */
export function earnCurrency(amount: number): void {
  if (amount <= 0 || !Number.isInteger(amount)) {
    console.warn('[earnCurrency] Invalid amount:', amount);
    return;
  }

  const state = getGameState();
  const newCurrency = Math.min(state.currency + amount, CURRENCY.MAX_BALANCE);
  
  // Feature 006 T082: Show toast if max cap reached
  if (state.currency + amount > CURRENCY.MAX_BALANCE) {
    console.log('[earnCurrency] Max currency reached');
    
    // Emit toast event to UIScene
    const scene = (globalThis as any).phaserGame?.scene?.getScene('UIScene');
    if (scene) {
      scene.events.emit('show-toast', 'ui.currency.maxReached');
    }
  }

  updateGameState(() => ({
    currency: newCurrency,
  }));

  // Auto-save after currency change
  saveSystem.save(getGameState());
}

/**
 * Get current currency balance
 * @returns Current Horseshoes balance
 */
export function getCurrencyBalance(): number {
  return getGameState().currency;
}

/**
 * Shop System Actions
 * @feature 006-economy-game-clock
 */

/**
 * Spend Horseshoes for a purchase
 * @param amount - Horseshoes to spend
 * @returns true if successful, false if insufficient funds
 */
export function spendCurrency(amount: number): boolean {
  if (amount <= 0 || !Number.isInteger(amount)) {
    console.warn('[spendCurrency] Invalid amount:', amount);
    return false;
  }

  const state = getGameState();
  
  if (state.currency < amount) {
    console.log('[spendCurrency] Insufficient funds');
    return false;
  }

  updateGameState(() => ({
    currency: state.currency - amount,
  }));

  // Auto-save after currency change
  saveSystem.save(getGameState());
  return true;
}

/**
 * Check if player can afford a purchase
 * @param price - Price to check
 * @returns true if player has enough currency
 */
export function canAfford(price: number): boolean {
  return getGameState().currency >= price;
}

/**
 * Purchase an item from the shop
 * @param itemId - ID of the shop item to purchase
 * @returns true if purchase successful, false if failed
 */
export function purchaseItem(itemId: string): boolean {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  
  if (!item) {
    console.error('[purchaseItem] Item not found:', itemId);
    return false;
  }

  if (!canAfford(item.price)) {
    console.log('[purchaseItem] Cannot afford item:', itemId);
    return false;
  }

  // Deduct currency
  if (!spendCurrency(item.price)) {
    return false;
  }

  // Grant reward based on item type
  const state = getGameState();
  
  switch (item.reward.type) {
    case 'carrots':
      updateGameState(() => ({
        inventory: {
          ...state.inventory,
          carrots: state.inventory.carrots + item.reward.amount,
        },
      }));
      break;
      
    case 'brushUses':
      updateGameState(() => ({
        inventory: {
          ...state.inventory,
          brushUses: state.inventory.brushUses + item.reward.amount,
        },
      }));
      break;
      
    case 'currency':
      updateGameState(() => ({
        currency: state.currency + item.reward.amount,
      }));
      break;
      
    default:
      console.error('[purchaseItem] Unknown reward type:', item.reward.type);
      return false;
  }

  // Save after successful purchase
  saveSystem.save(getGameState());
  console.log(`[purchaseItem] Purchased ${itemId} for ${item.price} 💰`);
  return true;
}

/**
 * Game Clock Actions
 * @feature 006-economy-game-clock
 */

/**
 * Start the game clock (sets startTimestamp to current time)
 */
export function startGameClock(): void {
  const state = getGameState();
  
  if (state.gameClock.startTimestamp !== null) {
    console.warn('[startGameClock] Clock already started');
    return;
  }

  updateGameState(() => ({
    gameClock: {
      startTimestamp: Date.now(),
    },
  }));

  saveSystem.save(getGameState());
  console.log('[startGameClock] Game clock started');
}

/**
 * Get elapsed play time in seconds
 * @returns Elapsed seconds since game clock started (0 if not started)
 */
export function getElapsedSeconds(): number {
  const state = getGameState();
  
  if (state.gameClock.startTimestamp === null) {
    return 0;
  }

  const elapsedMs = Date.now() - state.gameClock.startTimestamp;
  return Math.floor(elapsedMs / 1000);
}

/**
 * Reset the game clock (restart from 0)
 */
export function resetGameClock(): void {
  updateGameState(() => ({
    gameClock: {
      startTimestamp: Date.now(), // Restart clock
    },
    giftBoxes: [], // Clear gifts on clock reset
  }));

  saveSystem.save(getGameState());
  console.log('[resetGameClock] Game clock reset');
}

/**
 * Gift Box Actions
 * @feature 006-economy-game-clock
 */

/**
 * T049: Spawn a gift box at random position
 * @returns GiftBoxState if spawned, null if conditions not met
 */
export function spawnGiftBox(): { id: string; spawnTime: number; position: { x: number; y: number } } | null {
  const state = getGameState();
  const elapsedSeconds = getElapsedSeconds();

  // Check conditions: Must be at 5-minute interval and max 3 unclaimed gifts
  if (state.giftBoxes.length >= 3) {
    console.log('[spawnGiftBox] Max unclaimed gifts reached (3)');
    return null;
  }

  // Generate unique ID
  const giftId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Position will be calculated by GiftSpawnSystem
  const newGift = {
    id: giftId,
    spawnTime: elapsedSeconds,
    position: { x: 0, y: 0 }, // Placeholder - will be set by caller
    claimed: false,
  };

  updateGameState(() => ({
    giftBoxes: [...state.giftBoxes, newGift],
  }));

  saveSystem.save(getGameState());
  console.log(`[spawnGiftBox] Gift spawned at ${elapsedSeconds}s`);
  return newGift;
}

/**
 * T050: Claim a gift box and grant random reward
 * @param giftId - ID of the gift to claim
 * @returns Reward object if successful, null if gift not found
 */
export function claimGiftBox(giftId: string): { type: 'carrots' | 'brushUses' | 'currency'; amount: number } | null {
  const state = getGameState();
  const giftIndex = state.giftBoxes.findIndex((g) => g.id === giftId);

  if (giftIndex === -1) {
    console.error('[claimGiftBox] Gift not found:', giftId);
    return null;
  }

  // T050: Random reward logic (50% 2 carrots, 30% 20 brush, 20% 10 currency)
  const roll = Math.random();
  let reward: { type: 'carrots' | 'brushUses' | 'currency'; amount: number };

  if (roll < 0.5) {
    // 50% chance: 2 carrots
    reward = { type: 'carrots', amount: 2 };
    updateGameState(() => ({
      inventory: {
        ...state.inventory,
        carrots: state.inventory.carrots + 2,
      },
    }));
  } else if (roll < 0.8) {
    // 30% chance: 20 brush uses
    reward = { type: 'brushUses', amount: 20 };
    updateGameState(() => ({
      inventory: {
        ...state.inventory,
        brushUses: state.inventory.brushUses + 20,
      },
    }));
  } else {
    // 20% chance: 10 currency
    reward = { type: 'currency', amount: 10 };
    earnCurrency(10);
  }

  // Remove gift from state
  const newGiftBoxes = [...state.giftBoxes];
  newGiftBoxes.splice(giftIndex, 1);

  updateGameState(() => ({
    giftBoxes: newGiftBoxes,
  }));

  saveSystem.save(getGameState());
  console.log(`[claimGiftBox] Claimed gift: +${reward.amount} ${reward.type}`);
  return reward;
}

/**
 * T051: Clear all gift boxes
 */
export function clearGiftBoxes(): void {
  updateGameState(() => ({
    giftBoxes: [],
  }));

  saveSystem.save(getGameState());
  console.log('[clearGiftBoxes] All gifts cleared');
}

/**
 * Game Over Actions
 * @feature 006-economy-game-clock
 */

/**
 * T060: Check if game over condition is met
 * Game over when all three stats reach zero simultaneously
 */
export function checkGameOver(): void {
  const state = getGameState();

  // T070: Only trigger if ALL three stats are zero
  const allStatsZero = 
    state.horse.hunger === 0 && 
    state.horse.cleanliness === 0 && 
    state.horse.happiness === 0;

  if (allStatsZero && !state.isGameOver) {
    updateGameState(() => ({
      isGameOver: true,
    }));

    saveSystem.save(getGameState());
    console.log('[checkGameOver] Game Over triggered - all stats at zero');
  }
}
