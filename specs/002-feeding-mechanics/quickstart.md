# Developer Quickstart: Enhanced Feeding Mechanics

**Feature**: 002-feeding-mechanics | **Phase**: 1 (Design) | **Date**: 2026-02-11

---

## Overview

This guide helps developers implement, test, and debug timed feeding with satiety tracking. Covers common patterns, testing strategies, and troubleshooting tips.

**Target Audience**: Developers extending the feeding system or implementing similar timed mechanics

---

## Quick Start (5 minutes)

### 1. Understanding the Flow

```text
User clicks carrot
  ↓
MainGameScene validates (not eating? has carrots?)
  ↓
feed() action starts
  ├─ Deduct carrot (INSTANT)
  ├─ Set isEating = true
  ├─ Start animation (2.5s)
  └─ Wait...
  ↓
Animation completes
  ├─ Apply hunger +20
  ├─ Add timestamp to recentFeedings
  ├─ Check satiety (3 carrots?)
  ├─ Trigger cooldown if full
  └─ Set isEating = false
  ↓
UI updates (progress bar hides, fullness badge appears if full)
```

### 2. Key Constants

Add to `src/config/gameConstants.ts`:

```typescript
export const FEEDING_CONFIG = {
  EATING_DURATION: 2500,        // 2.5 seconds animation
  SATIETY_LIMIT: 3,             // Max carrots before cooldown
  SATIETY_DECAY_MS: 10000,     // Each carrot "expires" after 10s
  SATIETY_COOLDOWN_MS: 30000,  // 30s cooldown after hitting limit
} as const;
```

### 3. State Schema

Add to `src/state/types.ts`:

```typescript
interface FeedingState {
  isEating: boolean;              // Currently eating?
  eatStartTime: number | null;    // When eating started (ms)
  recentFeedings: number[];       // Timestamps of last N feedings
  fullUntil: number | null;       // Cooldown end timestamp
}

interface GameState {
  // ... existing fields
  feeding: FeedingState;  // NEW
}
```

### 4. Run Tests

```bash
npm test -- feedingHelpers.test.ts  # Unit tests for satiety logic
npm test -- careCycle.test.ts       # Integration tests with eating duration
```

---

## Implementation Patterns

### Pattern 1: Async Feed Action

**File**: `src/state/actions.ts`

```typescript
import { canFeed, calculateSatietyCount } from '../utils/feedingHelpers';

export async function feed(): Promise<boolean> {
  const state = useGameStore.getState();
  const now = Date.now();

  // Fast-fail validations
  if (state.inventory.carrots <= 0) return false;
  if (state.feeding.isEating) return false;
  if (!canFeed(state, now)) return false;

  // Deduct carrot + start eating
  updateGameState({
    inventory: { ...state.inventory, carrots: state.inventory.carrots - 1 },
    feeding: { ...state.feeding, isEating: true, eatStartTime: now },
  });

  // Wait for animation
  await new Promise<void>((resolve) => {
    setTimeout(resolve, FEEDING_CONFIG.EATING_DURATION);
  });

  // Apply effects after animation
  const currentState = useGameStore.getState();
  const newFeedings = [...currentState.feeding.recentFeedings, now];
  const satietyCount = calculateSatietyCount(newFeedings, now);
  const fullUntil = satietyCount >= FEEDING_CONFIG.SATIETY_LIMIT
    ? now + FEEDING_CONFIG.SATIETY_COOLDOWN_MS
    : null;

  updateGameState({
    horse: { ...currentState.horse, hunger: Math.min(currentState.horse.hunger + 20, 100) },
    feeding: { isEating: false, eatStartTime: null, recentFeedings: newFeedings, fullUntil },
  });

  saveSystem.save();
  return true;
}
```

**Key Points**:
- Carrot deducted BEFORE animation (prevents double-feeding exploit)
- Hunger applied AFTER animation (matches visual timing)
- Satiety check uses helper functions (testable logic)

---

### Pattern 2: Promisified Animation

**File**: `src/entities/Horse.ts`

```typescript
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this); // Prevent animation stacking

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: FEEDING_CONFIG.EATING_DURATION,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => resolve(), // Signal completion
    });
  });
}
```

**Why Promise?**
- Allows `await horse.playEatingAnimation()` in scene
- Synchronizes visual animation with state changes
- Makes testing easier (can mock with resolved Promise)

---

### Pattern 3: Interaction Blocking

**File**: `src/scenes/MainGameScene.ts`

```typescript
this.horse.on('pointerdown', async () => {
  const state = getGameState();

  // Block ALL interactions during eating
  if (state.feeding.isEating) {
    console.log('Horse is busy eating...');
    return; // Early exit
  }

  // Debouncing still applies
  const now = Date.now();
  if (now - this.lastInteractionTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
    return;
  }
  this.lastInteractionTime = now;

  // Proceed with action
  if (state.ui.selectedTool === 'carrot') {
    const success = await feed();
    if (success) {
      await this.horse.playEatingAnimation();
    }
  }
  // ... other tools
});
```

**Blocking Scope**:
- Feed, pet, groom ALL blocked when `isEating === true`
- Inventory selection still works (can prepare next tool)

---

### Pattern 4: UI Progress Bar

**File**: `src/scenes/UIScene.ts`

```typescript
create(): void {
  // Create progress bar (initially hidden)
  const barBg = this.add.rectangle(400, 50, 200, 20, 0x666666).setOrigin(0, 0);
  this.eatingProgressBar = this.add.rectangle(400, 50, 200, 20, 0x00ff00).setOrigin(0, 0);
  this.eatingProgressBar.setVisible(false);
}

update(time: number, delta: number): void {
  const state = getGameState();

  // Update eating progress (60 Hz for smooth animation)
  if (state.feeding.isEating && state.feeding.eatStartTime) {
    const elapsed = Date.now() - state.feeding.eatStartTime;
    const progress = Math.min(elapsed / FEEDING_CONFIG.EATING_DURATION, 1.0);
    this.eatingProgressBar.setScale(progress, 1); // Width scales 0 → 1
    this.eatingProgressBar.setVisible(true);
  } else {
    this.eatingProgressBar.setVisible(false);
  }
}
```

**Why update() loop?**
- Continuous progress (smooth 0% → 100%)
- No need for interval timers (Phaser update runs at 60 FPS)

---

### Pattern 5: Cooldown Timer

**File**: `src/scenes/UIScene.ts`

```typescript
create(): void {
  this.fullnessText = this.add.text(400, 100, '', { fontSize: '16px', color: '#ff0000' });
  
  // Update timer every 1 second (not every frame)
  this.time.addEvent({
    delay: 1000,
    callback: this.updateFullnessTimer,
    callbackScope: this,
    loop: true,
  });
}

updateFullnessTimer(): void {
  const state = getGameState();
  const now = Date.now();

  if (state.feeding.fullUntil && now < state.feeding.fullUntil) {
    const remaining = Math.ceil((state.feeding.fullUntil - now) / 1000);
    this.fullnessText.setText(`Full! Ready in ${remaining}s`);
    this.fullnessText.setVisible(true);
  } else {
    this.fullnessText.setVisible(false);
  }
}
```

**Why 1 Hz timer?**
- Countdown displays integers (27s → 26s → 25s)
- No visual benefit updating faster (research.md D3)
- Reduces CPU usage (60 text updates/sec → 1/sec)

---

## Testing Strategies

### Unit Tests: Pure Functions

**File**: `tests/unit/feedingHelpers.test.ts`

```typescript
import { calculateSatietyCount, canFeed, pruneExpiredFeedings } from '@/utils/feedingHelpers';

describe('calculateSatietyCount', () => {
  it('counts only feedings within 10s window', () => {
    const feedings = [0, 5000, 8000]; // t=0s, 5s, 8s
    
    expect(calculateSatietyCount(feedings, 9000)).toBe(3);  // All active
    expect(calculateSatietyCount(feedings, 11000)).toBe(2); // First expired
    expect(calculateSatietyCount(feedings, 19000)).toBe(0); // All expired
  });
  
  it('handles empty array', () => {
    expect(calculateSatietyCount([], Date.now())).toBe(0);
  });
});

describe('pruneExpiredFeedings', () => {
  it('removes timestamps older than cutoff', () => {
    // Mock Date.now() to return 25000
    vi.spyOn(Date, 'now').mockReturnValue(25000);
    
    const feedings = [0, 5000, 15000, 20000];
    const pruned = pruneExpiredFeedings(feedings, 10000);
    
    expect(pruned).toEqual([15000, 20000]); // Keep last 2
  });
});

describe('canFeed', () => {
  it('blocks feeding during cooldown', () => {
    const state = createMockState({
      feeding: { fullUntil: Date.now() + 5000, recentFeedings: [] },
    });
    
    expect(canFeed(state, Date.now())).toBe(false);
  });
  
  it('allows feeding after cooldown expires', () => {
    const state = createMockState({
      feeding: { fullUntil: Date.now() - 1000, recentFeedings: [] },
    });
    
    expect(canFeed(state, Date.now())).toBe(true);
  });
});
```

**Test Philosophy**:
- Use real timestamps (no mocking) where possible
- Mock `Date.now()` only for fixed-time assertions
- Test edge cases (empty arrays, boundary timestamps)

---

### Integration Tests: Full Flow

**File**: `tests/integration/careCycle.test.ts`

```typescript
describe('Feeding with eating duration', () => {
  beforeEach(() => {
    // Reset state with carrots
    useGameStore.setState({
      ...getGameState(),
      inventory: { carrots: 5, brushUses: 5 },
      horse: { hunger: 50, happiness: 50, cleanliness: 50 },
    });
  });

  it('should delay hunger increase until animation completes', async () => {
    const before = getGameState();
    expect(before.horse.hunger).toBe(50);
    expect(before.feeding.isEating).toBe(false);

    const feedPromise = feed();
    
    // Check state during eating (hunger not yet increased)
    const during = getGameState();
    expect(during.feeding.isEating).toBe(true);
    expect(during.horse.hunger).toBe(50); // Still unchanged
    expect(during.inventory.carrots).toBe(4); // But carrot deducted

    await feedPromise; // Wait for animation

    const after = getGameState();
    expect(after.feeding.isEating).toBe(false);
    expect(after.horse.hunger).toBe(70); // +20 applied
  });

  it('should trigger cooldown after 3 rapid feedings', async () => {
    await feed(); // 1st carrot
    await feed(); // 2nd carrot
    await feed(); // 3rd carrot (triggers cooldown)

    const state = getGameState();
    expect(state.feeding.recentFeedings).toHaveLength(3);
    expect(state.feeding.fullUntil).not.toBeNull();
    
    // 4th attempt should fail
    const result = await feed();
    expect(result).toBe(false);
    expect(state.inventory.carrots).toBe(2); // No carrot deducted
  });

  it('should persist satiety state across reload', async () => {
    await feed();
    await feed();
    
    const beforeSave = getGameState();
    expect(beforeSave.feeding.recentFeedings).toHaveLength(2);
    
    // Save and reload
    saveSystem.save();
    saveSystem.load();
    
    const afterLoad = getGameState();
    expect(afterLoad.feeding.recentFeedings).toHaveLength(2); // Persisted
    expect(afterLoad.feeding.isEating).toBe(false); // Transient reset
  });
});
```

**Test Coverage Goals**:
- ✅ Eating duration (hunger delayed)
- ✅ Satiety limit (3 carrots → cooldown)
- ✅ State persistence (recentFeedings survives reload)
- ✅ Transient state (isEating resets on reload)

---

## Debugging Tips

### Problem: Eating Animation Stacks

**Symptom**: Horse scales to 1.5x, 2.0x, etc. (multiple tweens running)

**Cause**: Not killing previous tweens before starting new one

**Fix**:
```typescript
playEatingAnimation(): Promise<void> {
  this.scene.tweens.killTweensOf(this); // ADD THIS LINE
  return new Promise((resolve) => { ... });
}
```

---

### Problem: Hunger Increases Immediately

**Symptom**: Hunger bar updates before eating animation finishes

**Cause**: Applying hunger before `await feed()`

**Fix**:
```typescript
// WRONG
const success = feed(); // Not awaited
if (success) {
  this.horse.playEatingAnimation();
}

// CORRECT
const success = await feed(); // Awaited
if (success) {
  await this.horse.playEatingAnimation();
}
```

---

### Problem: Satiety Count Always 0

**Symptom**: Can feed more than 3 carrots without cooldown

**Cause**: Not adding timestamp to `recentFeedings` array

**Debug**:
```typescript
console.log('Recent feedings:', state.feeding.recentFeedings);
console.log('Satiety count:', calculateSatietyCount(state.feeding.recentFeedings, Date.now()));
```

**Fix**: Ensure `updateGameState()` includes:
```typescript
recentFeedings: [...currentState.feeding.recentFeedings, now]
```

---

### Problem: Countdown Timer Shows Negative Values

**Symptom**: UI displays "Ready in -5s"

**Cause**: Not hiding timer after `fullUntil` expires

**Fix**:
```typescript
if (state.feeding.fullUntil && now < state.feeding.fullUntil) {
  const remaining = Math.ceil((state.feeding.fullUntil - now) / 1000);
  this.timerText.setText(`Ready in ${remaining}s`);
  this.timerText.setVisible(true);
} else {
  this.timerText.setVisible(false); // Hide when expired
}
```

---

### Problem: Page Reload Breaks Eating

**Symptom**: After reload, horse stuck in eating state

**Cause**: `isEating` persisted in LocalStorage (should be transient)

**Fix** in `SaveSystem.ts`:
```typescript
save(): void {
  const state = getGameState();
  const stateToSave = {
    ...state,
    feeding: {
      ...state.feeding,
      isEating: false,       // Force transient to false
      eatStartTime: null,    // Clear timestamp
    },
  };
  localStorage.setItem('gameState', JSON.stringify(stateToSave));
}
```

---

## Console Helpers (for manual testing)

Add to browser console during development:

```javascript
// Force trigger cooldown
window.debugForceCooldown = () => {
  const state = useGameStore.getState();
  useGameStore.setState({
    feeding: {
      ...state.feeding,
      fullUntil: Date.now() + 30000, // 30s cooldown
    },
  });
  console.log('Cooldown active for 30 seconds');
};

// Clear satiety state
window.debugClearSatiety = () => {
  const state = useGameStore.getState();
  useGameStore.setState({
    feeding: {
      ...state.feeding,
      recentFeedings: [],
      fullUntil: null,
    },
  });
  console.log('Satiety state cleared');
};

// Print satiety count
window.debugSatietyCount = () => {
  const state = useGameStore.getState();
  const count = calculateSatietyCount(state.feeding.recentFeedings, Date.now());
  console.log(`Satiety count: ${count} / 3`);
  console.log('Recent feedings:', state.feeding.recentFeedings);
};
```

---

## Performance Profiling

### Measure Animation Timing

```typescript
// In MainGameScene.ts
const start = performance.now();
await this.horse.playEatingAnimation();
const duration = performance.now() - start;
console.log(`Animation took ${duration}ms (target: 2500ms)`);
```

**Expected**: 2500ms ± 50ms (within 2% tolerance)

### Measure Satiety Calculation

```typescript
// In feedingHelpers.ts
export function calculateSatietyCount(feedings: number[], now: number): number {
  const start = performance.now();
  const cutoff = now - FEEDING_CONFIG.SATIETY_DECAY_MS;
  const count = feedings.filter(timestamp => timestamp > cutoff).length;
  const duration = performance.now() - start;
  console.log(`Satiety calc took ${duration}ms`);
  return count;
}
```

**Expected**: <0.01ms (array size ≤ 3)

---

## Common Pitfalls

### ❌ Forgetting to Await

```typescript
// WRONG: feed() returns Promise, not boolean
const success = feed();
if (success) { ... } // success is Promise, always truthy!
```

**Fix**: `const success = await feed();`

---

### ❌ Mutating State Directly

```typescript
// WRONG
state.feeding.recentFeedings.push(Date.now());

// CORRECT
updateGameState({
  feeding: {
    ...state.feeding,
    recentFeedings: [...state.feeding.recentFeedings, Date.now()],
  },
});
```

---

### ❌ Using Frame Counters

```typescript
// WRONG: FPS-dependent
let frameCounter = 0;
update(): void {
  frameCounter++;
  if (frameCounter >= 150) { // 2.5s at 60 FPS
    // ... but breaks at 30 FPS!
  }
}

// CORRECT: Timestamp-based
const elapsed = Date.now() - startTime;
if (elapsed >= 2500) { ... }
```

---

## Extending the Pattern

### Adding New Timed Interactions

**Example**: Timed grooming (3-second brush stroke)

1. Add to types.ts:
```typescript
interface GroomingState {
  isGrooming: boolean;
  groomStartTime: number | null;
}
```

2. Refactor action to async:
```typescript
export async function groom(): Promise<boolean> {
  // ... same pattern as feed()
  await new Promise(resolve => setTimeout(resolve, 3000));
  // ... apply cleanliness after delay
}
```

3. Update UI for progress bar (reuse eating progress pattern)

---

## Next Steps

After implementing this feature:

1. **Run full test suite**: `npm test`
2. **Lint code**: `npm run lint`
3. **Manual testing checklist**:
   - Feed 3 carrots → cooldown triggered?
   - Wait 10s → can feed again?
   - Reload during eating → horse resets to idle?
   - Progress bar smooth (no stuttering)?
   - Countdown accurate (30s → 29s → 28s)?

4. **Performance check**:
   - Open DevTools → Performance tab
   - Feed carrots while recording
   - Verify 60 FPS maintained (no frame drops >16ms)

5. **Update documentation**: Add to main README if pattern reused

---

## Resources

- **Research Decisions**: [research.md](research.md) - Why timestamp-based timing
- **Data Model**: [data-model.md](data-model.md) - FeedingState schema
- **API Contract**: [contracts/feeding-api.md](contracts/feeding-api.md) - Function signatures
- **Phaser Time Docs**: https://photonstorm.github.io/phaser3-docs/Phaser.Time.Clock.html
- **Vitest Mocking**: https://vitest.dev/guide/mocking.html

---

**Questions?** Check [spec.md](spec.md) for feature requirements or [plan.md](plan.md) for architecture overview.
