import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateSatietyCount,
  canFeed,
  pruneExpiredFeedings,
  isHorseFull,
} from '../../src/utils/feedingHelpers';
import type { GameState } from '../../src/state/types';
import { FEEDING_CONFIG } from '../../src/config/gameConstants';

// Helper to create mock GameState
function createMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    horse: { hunger: 50, cleanliness: 50, happiness: 50 },
    inventory: { carrots: 5, brushUses: 5 },
    ui: { selectedTool: null, activeAnimation: null, lastInteractionTime: 0 },
    feeding: {
      isEating: false,
      eatStartTime: null,
      recentFeedings: [],
      fullUntil: null,
    },
    ...overrides,
  } as GameState;
}

describe('calculateSatietyCount', () => {
  it('counts only feedings within 10s window', () => {
    const now = 20000; // 20 seconds
    const feedings = [0, 5000, 8000, 11000, 15000]; // 0s, 5s, 8s, 11s, 15s

    const count = calculateSatietyCount(feedings, now);

    // Only feedings > (20000 - 10000) = > 10000 should count
    // That's: 11000, 15000 = 2 feedings
    expect(count).toBe(2);
  });

  it('counts all feedings if all within window', () => {
    const now = 9000; // 9 seconds
    const feedings = [0, 3000, 6000]; // All within 10s of now

    expect(calculateSatietyCount(feedings, now)).toBe(3);
  });

  it('counts zero feedings if all expired', () => {
    const now = 25000; // 25 seconds
    const feedings = [0, 5000, 8000]; // All > 10s ago

    expect(calculateSatietyCount(feedings, now)).toBe(0);
  });

  it('handles empty array', () => {
    expect(calculateSatietyCount([], Date.now())).toBe(0);
  });

  it('handles exact boundary (10s ago)', () => {
    const now = 10000;
    const feedings = [0, 1]; // 0 is exactly 10s ago, 1 is 9999ms ago

    // Cutoff is now - 10000 = 0
    // Filter: timestamp > 0, so 0 is NOT included, but 1 is
    expect(calculateSatietyCount(feedings, now)).toBe(1);
  });
});

describe('pruneExpiredFeedings', () => {
  it('removes timestamps older than cutoff', () => {
    const now = 25000;

    const feedings = [0, 5000, 15000, 20000];
    const pruned = pruneExpiredFeedings(feedings, 10000, now); // 10s cutoff

    // Cutoff = 25000 - 10000 = 15000
    // Keep only > 15000: [20000]
    expect(pruned).toEqual([20000]);
  });

  it('keeps all timestamps if none expired', () => {
    const now = 5000;

    const feedings = [0, 2000, 4000];
    const pruned = pruneExpiredFeedings(feedings, 10000, now);

    // Cutoff = 5000 - 10000 = -5000 (all timestamps > -5000)
    expect(pruned).toEqual([0, 2000, 4000]);
  });

  it('returns empty array if all expired', () => {
    const now = 50000;

    const feedings = [0, 10000, 20000];
    const pruned = pruneExpiredFeedings(feedings, 10000, now);

    // Cutoff = 50000 - 10000 = 40000 (no timestamps > 40000)
    expect(pruned).toEqual([]);
  });

  it('does not mutate original array', () => {
    const now = 25000;

    const feedings = [0, 5000, 15000, 20000];
    const original = [...feedings];
    
    pruneExpiredFeedings(feedings, 10000, now);

    expect(feedings).toEqual(original); // Original unchanged
  });
});

describe('canFeed', () => {
  it('allows feeding when no restrictions', () => {
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: null,
      },
    });

    expect(canFeed(state, Date.now())).toBe(true);
  });

  it('blocks feeding during cooldown', () => {
    const now = 10000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: now + 5000, // Cooldown active for 5 more seconds
      },
    });

    expect(canFeed(state, now)).toBe(false);
  });

  it('allows feeding after cooldown expires', () => {
    const now = 40000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: 39000, // Cooldown expired 1s ago
      },
    });

    expect(canFeed(state, now)).toBe(true);
  });

  it('blocks feeding at satiety limit (3 active feedings)', () => {
    const now = 10000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [2000, 5000, 8000], // 3 feedings within 10s
        fullUntil: null,
      },
    });

    expect(canFeed(state, now)).toBe(false);
  });

  it('allows feeding with only 2 active feedings', () => {
    const now = 15000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [0, 8000, 12000], // First expired, 2 active
        fullUntil: null,
      },
    });

    expect(canFeed(state, now)).toBe(true);
  });

  it('handles satiety decay correctly (2 feedings + 15s gap + 1 more)', () => {
    const now = 20000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [0, 3000], // Both > 10s ago (expired)
        fullUntil: null,
      },
    });

    // Both feedings expired, should allow feeding
    expect(canFeed(state, now)).toBe(true);
  });
});

describe('isHorseFull', () => {
  it('returns true when in cooldown', () => {
    const now = 10000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: now + 10000, // 10s remaining
      },
    });

    expect(isHorseFull(state, now)).toBe(true);
  });

  it('returns false when cooldown expired', () => {
    const now = 40000;
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: 35000, // Expired 5s ago
      },
    });

    expect(isHorseFull(state, now)).toBe(false);
  });

  it('returns false when fullUntil is null', () => {
    const state = createMockState({
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [],
        fullUntil: null,
      },
    });

    expect(isHorseFull(state, Date.now())).toBe(false);
  });
});
