import type { GameState } from '../state/types';
import { FEEDING_CONFIG } from '../config/gameConstants';

/**
 * Check if horse can currently accept food
 * 
 * Performs all validation checks:
 * - Not in cooldown (fullUntil expired)
 * - Satiety count < 3 (after pruning expired feedings)
 * 
 * @param state - Current game state
 * @param now - Current timestamp (Date.now())
 * @returns true if feeding allowed, false otherwise
 * 
 * @pure - No side effects, safe to call repeatedly
 */
export function canFeed(state: GameState, now: number): boolean {
  // Check cooldown first (fast path)
  if (state.feeding.fullUntil !== null && now < state.feeding.fullUntil) {
    return false; // Still in 30s cooldown
  }

  // Prune expired feedings lazily
  const prunedFeedings = pruneExpiredFeedings(
    state.feeding.recentFeedings,
    FEEDING_CONFIG.SATIETY_DECAY_MS,
    now
  );

  // Check satiety count
  const satietyCount = calculateSatietyCount(prunedFeedings, now);
  if (satietyCount >= FEEDING_CONFIG.SATIETY_LIMIT) {
    return false; // 3 active feedings
  }

  return true;
}

/**
 * Count how many feedings are active (not yet expired)
 * 
 * A feeding is "active" if its timestamp is within SATIETY_DECAY_MS (10s)
 * of the current time.
 * 
 * @param feedings - Array of feeding timestamps (milliseconds)
 * @param now - Current timestamp (Date.now())
 * @returns Number of active feedings (0-3 typically)
 * 
 * @pure - No mutations, deterministic output
 */
export function calculateSatietyCount(
  feedings: number[],
  now: number
): number {
  const cutoff = now - FEEDING_CONFIG.SATIETY_DECAY_MS;
  return feedings.filter(timestamp => timestamp > cutoff).length;
}

/**
 * Remove timestamps older than cutoff from feedings array
 * 
 * Used for lazy cleanup to prevent unbounded array growth.
 * Called on-demand in canFeed() before satiety checks.
 * 
 * @param feedings - Array of feeding timestamps (may contain stale entries)
 * @param cutoffMs - Decay window in milliseconds (e.g., 10000 for 10s)
 * @param now - Current timestamp (Date.now())
 * @returns New array with only recent timestamps
 * 
 * @pure - Returns new array, does not mutate input
 */
export function pruneExpiredFeedings(
  feedings: number[],
  cutoffMs: number,
  now: number = Date.now()
): number[] {
  const cutoff = now - cutoffMs;
  return feedings.filter(timestamp => timestamp > cutoff);
}

/**
 * Check if horse is in fullness cooldown (30s after 3 carrots)
 * 
 * Simpler check than canFeed() - only looks at fullUntil timestamp.
 * Used for UI to show fullness badge and countdown timer.
 * 
 * @param state - Current game state
 * @param now - Current timestamp (Date.now())
 * @returns true if in cooldown, false otherwise
 * 
 * @pure - No side effects
 */
export function isHorseFull(state: GameState, now: number): boolean {
  return state.feeding.fullUntil !== null && now < state.feeding.fullUntil;
}
