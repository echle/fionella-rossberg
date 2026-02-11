# API Contract: Feeding Actions

**Feature**: 002-feeding-mechanics | **Phase**: 1 (Design) | **Date**: 2026-02-11

---

## Overview

This document specifies the API changes for timed feeding mechanics. The primary change is refactoring `feed()` from a synchronous boolean return to an asynchronous Promise-based API that resolves after the 2.5-second eating animation.

**Breaking Changes**:
- `feed(): boolean` → `feed(): Promise<boolean>`
- All callers must `await feed()` or handle Promise rejection

**New Exports**:
- Pure helper functions for satiety logic (testable without game state)

---

## Modified Action: `feed()`

### Before (MVP Baseline)

```typescript
// src/state/actions.ts
export function feed(): boolean {
  const state = useGameStore.getState();

  // Check if carrot available
  if (state.inventory.carrots <= 0) {
    return false;
  }

  // Deduct carrot and apply hunger immediately
  updateGameState({
    horse: {
      ...state.horse,
      hunger: Math.min(state.horse.hunger + STATUS_INCREMENTS.FEED, 100),
    },
    inventory: {
      ...state.inventory,
      carrots: state.inventory.carrots - 1,
    },
  });

  saveSystem.save();
  return true;
}
```

### After (Enhanced Feeding)

```typescript
// src/state/actions.ts
export async function feed(): Promise<boolean> {
  const state = useGameStore.getState();
  const now = Date.now();

  // Validation checks (fail fast)
  if (state.inventory.carrots <= 0) {
    return false; // No carrots
  }

  if (state.feeding.isEating) {
    return false; // Already eating
  }

  // Satiety checks (using helpers)
  if (!canFeed(state, now)) {
    return false; // Too full or in cooldown
  }

  // Deduct carrot immediately (prevents double-feeding exploit)
  updateGameState({
    inventory: {
      ...state.inventory,
      carrots: state.inventory.carrots - 1,
    },
    feeding: {
      ...state.feeding,
      isEating: true,
      eatStartTime: now,
    },
  });

  // Wait for eating animation (2.5 seconds)
  await new Promise<void>((resolve) => {
    // Animation duration from constants
    setTimeout(resolve, FEEDING_CONFIG.EATING_DURATION);
  });

  // Apply hunger increment after animation
  const currentState = useGameStore.getState();
  const newRecentFeedings = [...currentState.feeding.recentFeedings, now];
  
  // Check if this feeding triggers cooldown (3 carrots within decay window)
  const satietyCount = calculateSatietyCount(newRecentFeedings, now);
  const newFullUntil = satietyCount >= FEEDING_CONFIG.SATIETY_LIMIT
    ? now + FEEDING_CONFIG.SATIETY_COOLDOWN_MS
    : null;

  updateGameState({
    horse: {
      ...currentState.horse,
      hunger: Math.min(currentState.horse.hunger + STATUS_INCREMENTS.FEED, 100),
    },
    feeding: {
      isEating: false,
      eatStartTime: null,
      recentFeedings: newRecentFeedings,
      fullUntil: newFullUntil,
    },
  });

  saveSystem.save();
  return true;
}
```

### API Signature

```typescript
/**
 * Feed a carrot to the horse (async with 2.5s eating animation)
 * 
 * @returns Promise<boolean>
 *   Resolves to `true` if feeding succeeded (after animation completes)
 *   Resolves to `false` if feeding blocked (no carrots, already eating, or full)
 * 
 * @throws Never throws - all failures return false
 * 
 * @sideEffects
 *   - Deducts 1 carrot immediately (before animation)
 *   - Sets `isEating` to true during animation
 *   - Increments hunger by 20 after animation
 *   - Adds timestamp to `recentFeedings` array
 *   - May set `fullUntil` if satiety limit reached
 *   - Saves state to LocalStorage after completion
 * 
 * @example
 * // MainGameScene.ts
 * if (state.ui.selectedTool === 'carrot') {
 *   const success = await feed();
 *   if (success) {
 *     await this.horse.playEatingAnimation(); // 2.5s animation
 *   }
 * }
 */
export async function feed(): Promise<boolean>;
```

### Breaking Change Migration

**Old Pattern**:
```typescript
// MainGameScene.ts (MVP)
const success = feed();
if (success) {
  this.horse.playEatingAnimation(); // Fire and forget
}
```

**New Pattern**:
```typescript
// MainGameScene.ts (Enhanced)
const success = await feed();
if (success) {
  await this.horse.playEatingAnimation(); // Wait for animation
}
```

**Timeline Comparison**:
```
OLD (MVP):
t=0ms:   Click → feed() returns true
t=1ms:   playEatingAnimation() starts
t=1ms:   Hunger +20, carrot -1 (INSTANT)
t=400ms: Animation finishes (but hunger already updated)

NEW (Enhanced):
t=0ms:   Click → feed() starts, carrot -1 (INSTANT)
t=0ms:   playEatingAnimation() starts
t=2500ms: Animation finishes
t=2500ms: feed() resolves, hunger +20 (DELAYED)
```

---

## New Helper Functions (feedingHelpers.ts)

### `canFeed()`

```typescript
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
 * 
 * @example
 * const now = Date.now();
 * if (canFeed(state, now)) {
 *   await feed();
 * } else {
 *   console.log('Horse is full or in cooldown');
 * }
 */
export function canFeed(state: GameState, now: number): boolean {
  // Check cooldown first (fast path)
  if (state.feeding.fullUntil !== null && now < state.feeding.fullUntil) {
    return false; // Still in 30s cooldown
  }

  // Prune expired feedings lazily
  const prunedFeedings = pruneExpiredFeedings(
    state.feeding.recentFeedings,
    FEEDING_CONFIG.SATIETY_DECAY_MS
  );

  // Check satiety count
  const satietyCount = calculateSatietyCount(prunedFeedings, now);
  if (satietyCount >= FEEDING_CONFIG.SATIETY_LIMIT) {
    return false; // 3 active feedings
  }

  return true;
}
```

---

### `calculateSatietyCount()`

```typescript
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
 * 
 * @example
 * const feedings = [1000, 5000, 8000]; // 3 feedings at t=1s, 5s, 8s
 * calculateSatietyCount(feedings, 11000); // Returns 2 (first expired)
 * calculateSatietyCount(feedings, 19000); // Returns 0 (all expired)
 */
export function calculateSatietyCount(
  feedings: number[],
  now: number
): number {
  const cutoff = now - FEEDING_CONFIG.SATIETY_DECAY_MS;
  return feedings.filter(timestamp => timestamp > cutoff).length;
}
```

---

### `pruneExpiredFeedings()`

```typescript
/**
 * Remove timestamps older than cutoff from feedings array
 * 
 * Used for lazy cleanup to prevent unbounded array growth.
 * Called on-demand in canFeed() before satiety checks.
 * 
 * @param feedings - Array of feeding timestamps (may contain stale entries)
 * @param cutoffMs - Decay window in milliseconds (e.g., 10000 for 10s)
 * @returns New array with only recent timestamps
 * 
 * @pure - Returns new array, does not mutate input
 * 
 * @example
 * const feedings = [0, 5000, 15000, 20000];
 * const pruned = pruneExpiredFeedings(feedings, 10000);
 * // With now=25000, pruned = [15000, 20000] (0 and 5000 expired)
 */
export function pruneExpiredFeedings(
  feedings: number[],
  cutoffMs: number
): number[] {
  const cutoff = Date.now() - cutoffMs;
  return feedings.filter(timestamp => timestamp > cutoff);
}
```

---

### `isHorseFull()`

```typescript
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
 * 
 * @example
 * // UIScene.ts
 * if (isHorseFull(state, Date.now())) {
 *   this.fullnessBadge.setVisible(true);
 *   const remaining = state.feeding.fullUntil! - Date.now();
 *   this.timerText.setText(`${Math.ceil(remaining / 1000)}s`);
 * }
 */
export function isHorseFull(state: GameState, now: number): boolean {
  return state.feeding.fullUntil !== null && now < state.feeding.fullUntil;
}
```

---

## Integration Points

### MainGameScene.ts Changes

```typescript
// OLD: Synchronous feed
horse.on('pointerdown', () => {
  if (state.ui.selectedTool === 'carrot') {
    const success = feed();
    if (success) {
      this.horse.playEatingAnimation();
    }
  }
});

// NEW: Async feed with blocking
horse.on('pointerdown', async () => {
  const state = getGameState();
  
  // Block ALL interactions during eating
  if (state.feeding.isEating) {
    console.log('Horse is eating, wait...');
    return;
  }
  
  if (state.ui.selectedTool === 'carrot') {
    const success = await feed();
    if (success) {
      await this.horse.playEatingAnimation();
      console.log('Eating complete!');
    } else {
      console.log('Cannot feed (full or no carrots)');
    }
  } else if (state.ui.selectedTool === null) {
    pet();
    this.horse.playHappyAnimation();
  }
});
```

### Horse.ts Animation Contract

```typescript
// OLD: void return (fire and forget)
playEatingAnimation(): void {
  this.scene.tweens.add({
    targets: this,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 400,
    yoyo: true,
  });
}

// NEW: Promise return (awaitable)
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: FEEDING_CONFIG.EATING_DURATION,
      yoyo: true,
      onComplete: () => resolve(),
    });
  });
}
```

### UIScene.ts Polling Pattern

```typescript
// Add to update() loop for real-time UI updates
update(time: number, delta: number): void {
  const state = getGameState();
  const now = Date.now();
  
  // Update eating progress bar
  if (state.feeding.isEating && state.feeding.eatStartTime) {
    const elapsed = now - state.feeding.eatStartTime;
    const progress = Math.min(elapsed / FEEDING_CONFIG.EATING_DURATION, 1.0);
    this.eatingProgressBar.setScale(progress, 1);
    this.eatingProgressBar.setVisible(true);
  } else {
    this.eatingProgressBar.setVisible(false);
  }
  
  // Update fullness countdown (updated separately at 1 Hz in timer event)
  // See research.md D3 for rationale
}
```

---

## Testing Strategy

### Unit Tests (feedingHelpers.test.ts)

```typescript
describe('calculateSatietyCount', () => {
  it('counts feedings within 10s window', () => {
    const feedings = [0, 5000, 8000];
    expect(calculateSatietyCount(feedings, 9000)).toBe(3); // All active
    expect(calculateSatietyCount(feedings, 11000)).toBe(2); // First expired
    expect(calculateSatietyCount(feedings, 19000)).toBe(0); // All expired
  });
});

describe('canFeed', () => {
  it('blocks feeding during cooldown', () => {
    const state = {
      feeding: {
        fullUntil: Date.now() + 5000, // Cooldown active
        recentFeedings: [],
      },
    } as GameState;
    expect(canFeed(state, Date.now())).toBe(false);
  });
  
  it('blocks feeding at satiety limit', () => {
    const now = Date.now();
    const state = {
      feeding: {
        fullUntil: null,
        recentFeedings: [now - 2000, now - 1000, now], // 3 active
      },
    } as GameState;
    expect(canFeed(state, now)).toBe(false);
  });
});
```

### Integration Tests (careCycle.test.ts)

```typescript
it('should complete eating animation before hunger increase', async () => {
  const before = getGameState();
  expect(before.horse.hunger).toBe(50);
  
  await feed(); // Wait for full animation
  
  const after = getGameState();
  expect(after.horse.hunger).toBe(70); // +20 after 2.5s
  expect(after.feeding.isEating).toBe(false); // Animation done
});

it('should trigger cooldown after 3 rapid feedings', async () => {
  await feed(); // 1st carrot
  await feed(); // 2nd carrot
  await feed(); // 3rd carrot
  
  const state = getGameState();
  expect(state.feeding.fullUntil).not.toBeNull();
  expect(state.feeding.fullUntil! - Date.now()).toBeCloseTo(30000, -2);
});
```

---

## Error Handling

**No Exceptions**: All failures return `false`, never throw errors

**Failure Reasons**:
- `state.inventory.carrots <= 0` → No carrots available
- `state.feeding.isEating === true` → Already eating (prevent double-feeding)
- `canFeed(state, now) === false` → Full or in cooldown

**UI Feedback** (recommended):
```typescript
const success = await feed();
if (!success) {
  const state = getGameState();
  if (state.inventory.carrots <= 0) {
    showMessage('No carrots left!');
  } else if (state.feeding.isEating) {
    showMessage('Horse is eating...');
  } else if (isHorseFull(state, Date.now())) {
    const remaining = Math.ceil((state.feeding.fullUntil! - Date.now()) / 1000);
    showMessage(`Horse is full! Ready in ${remaining}s`);
  }
}
```

---

## Performance Considerations

**Timing Precision**:
- `setTimeout` accuracy: ±4ms on modern browsers (research.md D1)
- Use `Date.now()` for progress calculation, not frame counters

**Memory Impact**:
- `recentFeedings` array: Max 3 × 8 bytes = 24 bytes (negligible)
- Lazy pruning: No per-frame overhead (research.md D4)

**CPU Usage**:
- `canFeed()`: O(n) filter operations, n ≤ 3 (< 0.01ms)
- UI updates: 60 Hz progress bar, 1 Hz timer text (< 1% CPU)

---

## Summary

**API Changes**:
- `feed()` now returns `Promise<boolean>` (breaking change)
- 4 new pure helper functions for satiety logic

**Integration**:
- All callers must `await feed()` or handle Promise
- Horse animation returns Promise for synchronization
- UI polls state in `update()` for progress bar

**Next Steps**:
- Update types.ts with FeedingState interface
- Create feedingHelpers.ts with pure functions
- Refactor Horse.ts animation to return Promise
- Update MainGameScene.ts to handle async feed()
