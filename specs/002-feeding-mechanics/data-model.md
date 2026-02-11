# Data Model: Enhanced Feeding Mechanics

**Feature**: 002-feeding-mechanics | **Phase**: 1 (Design) | **Date**: 2026-02-11

---

## Overview

This document defines the data structures for timed eating and satiety tracking. All state is stored in the existing Zustand `GameState` with minimal schema changes (one new nested object).

**Design Principles**:
- **Persistence**: Satiety state survives page reloads (via SaveSystem)
- **Transient eating**: In-progress eating does NOT persist (eating resets on reload)
- **Timestamp-based**: All timing uses `Date.now()` for FPS-independent accuracy
- **Lazy pruning**: `recentFeedings` array cleaned on-demand, not every frame

---

## New Interface: FeedingState

### Schema

```typescript
interface FeedingState {
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
```

### Default Values

```typescript
const DEFAULT_FEEDING_STATE: FeedingState = {
  isEating: false,
  eatStartTime: null,
  recentFeedings: [],
  fullUntil: null,
};
```

---

## Extended Interface: GameState

### Before (MVP Baseline)

```typescript
interface GameState {
  version: number;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  ui: UIState;
}
```

### After (with Feeding Enhancement)

```typescript
interface GameState {
  version: number;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  ui: UIState;
  feeding: FeedingState;  // NEW
}
```

**Migration Strategy**:
- SaveSystem.load() checks if `feeding` field exists in loaded data
- If missing (old save file), inject `DEFAULT_FEEDING_STATE`
- Bump `version` from 1 → 2 to indicate schema change

---

## Field Behaviors

### `isEating` (boolean)

**Purpose**: Block all interactions while eating animation plays

**Lifecycle**:
1. Set to `true` when feed() starts
2. Remains `true` for 2.5 seconds (EATING_DURATION)
3. Set to `false` when animation completes
4. **Reset to `false` on page reload** (transient)

**Usage**:
```typescript
// MainGameScene.ts - block interactions
if (state.feeding.isEating) {
  return; // Ignore clicks on horse
}

// UIScene.ts - show progress indicator
if (state.feeding.isEating) {
  this.eatingProgressBar.setVisible(true);
}
```

---

### `eatStartTime` (number | null)

**Purpose**: Calculate eating progress for progress bar

**Lifecycle**:
1. Set to `Date.now()` when feed() starts
2. Used to calculate: `progress = (now - eatStartTime) / EATING_DURATION`
3. Set to `null` when animation completes
4. **Reset to `null` on page reload** (transient)

**Usage**:
```typescript
// UIScene.ts - update progress bar
const elapsed = Date.now() - state.feeding.eatStartTime!;
const progress = Math.min(elapsed / EATING_DURATION, 1.0);
this.progressBar.setScale(progress, 1);
```

**Invariant**: `eatStartTime` is non-null if and only if `isEating` is true

---

### `recentFeedings` (number[])

**Purpose**: Track satiety for 3-carrot limit with 10-second decay

**Lifecycle**:
1. Empty array initially
2. Add `Date.now()` timestamp each time feed() succeeds
3. Entries "expire" after 10 seconds but remain until pruned
4. **Pruned on-demand** in `canFeed()` check (lazy cleanup)
5. **Pruned before save** in SaveSystem (keeps file small)
6. **Pruned on load** in SaveSystem (discard stale timestamps)

**Satiety Calculation** (from research.md Decision D4):
```typescript
function calculateSatietyCount(feedings: number[], now: number): number {
  const cutoff = now - SATIETY_DECAY_MS; // 10 seconds ago
  return feedings.filter(timestamp => timestamp > cutoff).length;
}
```

**Example Timeline**:
```
t=0s:  Feed carrot  → recentFeedings = [0]
t=5s:  Feed carrot  → recentFeedings = [0, 5000]
t=8s:  Feed carrot  → recentFeedings = [0, 5000, 8000]
t=9s:  satietyCount = 3 → BLOCKED (3 active feedings)
t=11s: satietyCount = 2 (first feeding expired at t=10s)
t=16s: satietyCount = 1 (second feeding expired at t=15s)
t=19s: satietyCount = 0 (all expired, can feed again)
```

**Max Array Size**:
- Before pruning: Unbounded (grows 1 entry per 2.5s eating time)
- After pruning: Max 3 entries (since 3 carrots triggers 30s cooldown)
- SaveSystem prunes to keep save file <1 KB

---

### `fullUntil` (number | null)

**Purpose**: Block feeding during 30-second cooldown after hitting satiety limit

**Lifecycle**:
1. Set to `Date.now() + SATIETY_COOLDOWN_MS` when 3rd carrot eaten
2. Blocks feeding while `Date.now() < fullUntil`
3. Set to `null` once cooldown expires
4. **Persisted** across page reloads

**Trigger Condition**:
```typescript
// After adding timestamp to recentFeedings
const satietyCount = calculateSatietyCount(state.feeding.recentFeedings, now);
if (satietyCount >= SATIETY_LIMIT) {
  updateGameState({
    feeding: {
      ...state.feeding,
      fullUntil: Date.now() + SATIETY_COOLDOWN_MS, // 30 seconds
    },
  });
}
```

**Check Before Feeding**:
```typescript
function canFeed(state: GameState, now: number): boolean {
  // Check cooldown
  if (state.feeding.fullUntil !== null && now < state.feeding.fullUntil) {
    return false; // Still in cooldown
  }
  
  // Check satiety (after pruning)
  const satietyCount = calculateSatietyCount(state.feeding.recentFeedings, now);
  if (satietyCount >= SATIETY_LIMIT) {
    return false; // 3 active feedings
  }
  
  return true;
}
```

**UI Integration**:
```typescript
// UIScene.ts - show countdown timer
if (state.feeding.fullUntil && Date.now() < state.feeding.fullUntil) {
  const remaining = Math.ceil((state.feeding.fullUntil - Date.now()) / 1000);
  this.fullnessTimerText.setText(`Ready in ${remaining}s`);
  this.fullnessTimerText.setVisible(true);
} else {
  this.fullnessTimerText.setVisible(false);
}
```

---

## State Transitions

### Happy Path: Feed 3 Carrots Rapidly

```
State 0 (Initial):
  isEating: false
  eatStartTime: null
  recentFeedings: []
  fullUntil: null

[User clicks carrot at t=0s]

State 1 (Eating #1):
  isEating: true
  eatStartTime: 0
  recentFeedings: [0]
  fullUntil: null

[2.5s animation completes at t=2500ms]

State 2 (Done Eating #1):
  isEating: false
  eatStartTime: null
  recentFeedings: [0]
  fullUntil: null

[User clicks carrot at t=3s]

State 3 (Eating #2):
  isEating: true
  eatStartTime: 3000
  recentFeedings: [0, 3000]
  fullUntil: null

[2.5s animation completes at t=5500ms]

State 4 (Done Eating #2):
  isEating: false
  eatStartTime: null
  recentFeedings: [0, 3000]
  fullUntil: null

[User clicks carrot at t=6s]

State 5 (Eating #3):
  isEating: true
  eatStartTime: 6000
  recentFeedings: [0, 3000, 6000]
  fullUntil: null

[2.5s animation completes at t=8500ms]
[Satiety check: 3 active feedings → TRIGGER COOLDOWN]

State 6 (Full - Cooldown Active):
  isEating: false
  eatStartTime: null
  recentFeedings: [0, 3000, 6000]
  fullUntil: 38500  (8500 + 30000)

[User clicks carrot at t=15s → BLOCKED]
  canFeed() returns false (fullUntil > now)

[Cooldown expires at t=38.5s]

State 7 (Cooldown Expired):
  isEating: false
  eatStartTime: null
  recentFeedings: [0, 3000, 6000]  (all expired, but not yet pruned)
  fullUntil: null  (cleared after expiration)

[User clicks carrot at t=39s → canFeed() prunes array]
  After pruning: recentFeedings = []
  satietyCount = 0 → ALLOWED
```

### Edge Case: Page Reload During Eating

```
Before Reload (at t=5s, mid-eating):
  isEating: true   ← TRANSIENT
  eatStartTime: 5000   ← TRANSIENT
  recentFeedings: [0]   ← PERSISTED
  fullUntil: null   ← PERSISTED

After Reload (SaveSystem.load()):
  isEating: false   ← RESET (transient fields not saved)
  eatStartTime: null   ← RESET
  recentFeedings: [0]   ← RESTORED, then PRUNED (if stale)
  fullUntil: null   ← RESTORED

Result: Horse returns to idle, eating animation cancelled, carrot already deducted
```

---

## Validation Rules

### Invariants (must always be true)

1. **Eating consistency**: `(isEating === true) ⟺ (eatStartTime !== null)`
2. **Array bounds**: `recentFeedings.length >= 0` (no negative counts)
3. **Timestamp validity**: All timestamps in `recentFeedings` ≤ `Date.now()`
4. **Cooldown future**: If `fullUntil !== null`, then `fullUntil >= Date.now()` (checked before nulling)
5. **Satiety cap**: After pruning, `calculateSatietyCount() <= 3`

### Corruption Handling

If loaded state violates invariants (corrupted save file):
```typescript
function validateFeedingState(state: FeedingState): FeedingState {
  const now = Date.now();
  
  // Fix eating consistency
  if (state.isEating && state.eatStartTime === null) {
    state.isEating = false; // Prioritize null timestamp
  }
  if (!state.isEating && state.eatStartTime !== null) {
    state.eatStartTime = null;
  }
  
  // Prune invalid timestamps (future timestamps)
  state.recentFeedings = state.recentFeedings.filter(ts => ts <= now);
  
  // Clear expired cooldown
  if (state.fullUntil !== null && now >= state.fullUntil) {
    state.fullUntil = null;
  }
  
  return state;
}
```

---

## Constants (gameConstants.ts)

```typescript
export const FEEDING_CONFIG = {
  /** Duration of eating animation in milliseconds */
  EATING_DURATION: 2500,
  
  /** Maximum carrots before cooldown (satiety limit) */
  SATIETY_LIMIT: 3,
  
  /** Time window for satiety decay per carrot (10 seconds) */
  SATIETY_DECAY_MS: 10000,
  
  /** Cooldown duration after hitting satiety limit (30 seconds) */
  SATIETY_COOLDOWN_MS: 30000,
} as const;
```

---

## Summary

**Schema Changes**:
- Add `feeding: FeedingState` to `GameState`
- 4 new fields: `isEating`, `eatStartTime`, `recentFeedings`, `fullUntil`
- 2 transient (eating state), 2 persisted (satiety state)

**Key Behaviors**:
- Timestamps for FPS-independent timing (research.md D1)
- Lazy pruning for efficiency (research.md D4)
- Transient eating for clean reloads (research.md D2)

**Next Artifacts**:
- contracts/feeding-api.md: Async feed() signature
- quickstart.md: Developer guide for testing and debugging
