# Research: Enhanced Feeding Mechanics

**Feature**: 002-feeding-mechanics | **Phase**: 0 (Research) | **Date**: 2026-02-11

## Research Objective

Resolve technical unknowns about timing precision, animation management, UI update frequency, and satiety decay before implementation. All decisions documented here inform Phase 1 design and Phase 2 task breakdown.

---

## Topic 1: Phaser Timer Precision

### Question
Can Phaser's time system maintain accurate 2.5-second intervals during frame drops? Should we use frame-based or timestamp-based progress calculation?

### Investigation

**Existing Pattern** (from MainGameScene.ts, Horse.ts):
```typescript
// Current usage for delayed texture switch (800ms)
this.scene.time.delayedCall(800, () => {
  sprite.setTexture('horse-idle');
});

// Debouncing uses Date.now() timestamps
const now = Date.now();
if (now - this.lastInteractionTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
  return;
}
```

**Analysis**:
- `Phaser.Time.Clock.delayedCall()` is frame-based (updates on each game tick)
- Performance: At 60 FPS, accuracy is ±16ms. At 30 FPS, accuracy degrades to ±33ms
- **Frame drops impact**: If game lags for 500ms, delayed call extends proportionally
- Existing debouncing uses `Date.now()` (real-time timestamps) - immune to FPS drops

### Decision

**D1: Use timestamp-based progress calculation**

**Rationale**:
- Store `eatStartTime` as `Date.now()` timestamp (real-world milliseconds)
- Calculate progress as `(Date.now() - eatStartTime) / EATING_DURATION`
- **Pros**: FPS-independent, accurate even during lag, consistent with existing debouncing
- **Cons**: Requires update loop to poll progress (acceptable - already done in DecaySystem)

**Alternatives Considered**:
- Frame counters: Rejected (FPS-dependent, unreliable)
- `Phaser.Time.now`: Rejected (paused during scene sleep, not persistent across reloads)
- `delayedCall()` alone: Rejected (not queryable for progress bar updates)

**Implementation Pattern**:
```typescript
// Start eating
const eatStartTime = Date.now();
updateGameState({ feeding: { isEating: true, eatStartTime } });

// Check progress in update() loop
const elapsed = Date.now() - state.feeding.eatStartTime;
const progress = Math.min(elapsed / EATING_DURATION, 1.0);

// Complete when progress reaches 1.0
if (progress >= 1.0) {
  // Apply hunger increment, clear eating state
}
```

---

## Topic 2: Animation State Management

### Question
How to cleanly cancel in-progress eating animation on page reload without memory leaks?

### Investigation

**Existing Pattern** (from Horse.ts):
```typescript
playEatingAnimation(): void {
  // Stop any existing tweens on this container to prevent stacking
  this.scene.tweens.killTweensOf(this);
  
  this.scene.tweens.add({
    targets: this,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 400,
    yoyo: true,
  });
}
```

**Scene Lifecycle**:
- `shutdown()` event fires on scene stop
- Phaser automatically cleans up tweens/timers when scene destroyed
- BUT: `delayedCall` references survive if callbacks capture external state

### Decision

**D2: Eating state is transient (not persisted across reloads)**

**Rationale**:
- If user reloads during eating, horse returns to idle state
- `isEating` field NOT saved to LocalStorage (marked transient in SaveSystem)
- **Pros**: No orphaned animations, clean state on load, simple implementation
- **Cons**: User loses eating progress on reload (acceptable tradeoff)

**Cleanup Strategy**:
```typescript
// In Horse.ts
destroy(): void {
  this.scene.tweens.killTweensOf(this); // Kill any active tweens
  super.destroy();
}

// In MainGameScene.ts (scene shutdown)
shutdown(): void {
  this.time.removeAllEvents(); // Clear any delayed calls
}
```

**Alternatives Considered**:
- Persist eating progress: Rejected (complex resume logic, animation sync issues)
- Pause Phaser on blur: Rejected (prevents background decay, breaks SaveSystem)

**Edge Case Handling**:
- **Reload during eating**: Horse resets to idle, carrot already deducted (user loses carrot but avoids exploit)
- **Tab switch**: Phaser continues running (no special handling needed)

---

## Topic 3: UI Update Frequency

### Question
Should countdown timer update every frame (60 Hz) or every second (1 Hz)? What's the performance impact?

### Investigation

**UI Components Requiring Updates**:
1. **Eating progress bar**: 0% → 100% over 2.5 seconds (smooth animation desired)
2. **Countdown timer text**: "Ready in 27s" (discrete 1-second intervals)
3. **Fullness badge**: "Full" visibility (binary state, no animation)

**Performance Considerations**:
- UIScene already updates inventory counts on state change (Zustand listener)
- Text updates trigger DOM reflow (minimal impact in Phaser canvas)
- 60 Hz updates = 60 redraws/sec (imperceptible benefit above 1 Hz for integer countdown)

### Decision

**D3: Hybrid update strategy**

**Components**:
- **Progress bar**: Update in `update()` loop (60 Hz) for smooth animation
- **Countdown timer**: Update every 1 second via `setInterval` or Phaser timer event
- **Fullness badge**: Update only on state change (Zustand listener)

**Rationale**:
- **Smooth progress bar**: Continuous updates provide better visual feedback during eating
- **Efficient countdown**: 1 Hz sufficient for "27s → 26s → 25s" text changes
- **Reactive badge**: No polling needed, toggle visibility on `fullUntil` change

**Implementation Pattern**:
```typescript
// UIScene.ts
update(time: number, delta: number): void {
  const state = getGameState();
  
  // Update eating progress bar (continuous)
  if (state.feeding.isEating) {
    const elapsed = Date.now() - state.feeding.eatStartTime!;
    const progress = Math.min(elapsed / EATING_DURATION, 1.0);
    this.eatingProgressBar.setScale(progress, 1); // Width scales 0 → 1
  }
  
  // Countdown text updated separately (1 Hz) via timer event
}

create(): void {
  // Update countdown every 1000ms
  this.time.addEvent({
    delay: 1000,
    callback: this.updateCountdownText,
    callbackScope: this,
    loop: true,
  });
}
```

**Benchmark Estimates**:
- 60 Hz progress bar: <0.1ms per frame (negligible)
- 1 Hz text update: <1ms (imperceptible)
- **Total overhead**: <1% CPU usage

**Alternatives Considered**:
- All 60 Hz: Rejected (wastes CPU on countdown text, no visual benefit)
- All 1 Hz: Rejected (progress bar appears choppy)

---

## Topic 4: Satiety Array Pruning

### Question
When should `recentFeedings` array be pruned (every frame vs on-demand)? How to avoid memory growth?

### Investigation

**Array Growth Scenario**:
- User feeds 3 carrots → array has 3 timestamps
- After 30 seconds, all expire but array still holds 3 entries
- Worst case: User feeds continuously for 10 minutes → array could have 240 entries (1 per 2.5s)

**Pruning Strategies**:
1. **Eager pruning**: Remove expired entries every frame (60 Hz)
2. **Lazy pruning**: Remove expired entries only when checking `canFeed()`
3. **Periodic pruning**: Remove expired entries every 5 seconds

**Memory Impact**:
- Each timestamp: 8 bytes (JavaScript number)
- 240 entries × 8 bytes = 1.92 KB (negligible)
- But: Unnecessary array iterations waste CPU

### Decision

**D4: Lazy pruning with on-demand cleanup**

**Rationale**:
- Prune `recentFeedings` ONLY when `canFeed()` is called (user clicks carrot)
- **Pros**: Zero overhead when not feeding, accurate count when needed
- **Cons**: Array temporarily holds stale data (acceptable - cleaned before decisions)

**Implementation Pattern**:
```typescript
// feedingHelpers.ts
export function calculateSatietyCount(
  feedings: number[],
  now: number
): number {
  const cutoff = now - SATIETY_DECAY_MS; // 10 seconds ago
  const activeFeedings = feedings.filter(timestamp => timestamp > cutoff);
  return activeFeedings.length;
}

export function pruneExpiredFeedings(
  feedings: number[],
  cutoffMs: number
): number[] {
  const cutoff = Date.now() - cutoffMs;
  return feedings.filter(timestamp => timestamp > cutoff);
}

// In actions.ts feed()
export async function feed(): Promise<boolean> {
  const state = getGameState();
  const now = Date.now();
  
  // Lazy prune before checking satiety
  const prunedFeedings = pruneExpiredFeedings(
    state.feeding.recentFeedings,
    SATIETY_DECAY_MS
  );
  
  const satietyCount = calculateSatietyCount(prunedFeedings, now);
  if (satietyCount >= SATIETY_LIMIT) {
    return false; // Too full
  }
  
  // ... proceed with feeding
}
```

**Persistence Strategy**:
- SaveSystem prunes array before saving (keeps save file small)
- On load, prune again (in case save is old)

**Alternatives Considered**:
- Eager pruning: Rejected (60 Hz overhead for rare benefit)
- No pruning: Rejected (unbounded array growth over hours of play)
- Periodic pruning: Rejected (arbitrary timing, still wastes some CPU)

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **D1: Progress Calculation** | Timestamp-based (`Date.now()`) | FPS-independent, accurate during lag, consistent with debouncing |
| **D2: Animation Cancellation** | Transient state, no persistence | Clean reloads, no orphaned animations, simple cleanup |
| **D3: UI Update Frequency** | Hybrid (60 Hz bar, 1 Hz timer) | Smooth progress, efficient countdown, <1% CPU overhead |
| **D4: Satiety Pruning** | Lazy (on-demand in `canFeed()`) | Zero overhead when idle, accurate when needed |

---

## Implementation Readiness

✅ **All research complete** - ready for Phase 1 design artifacts

**Next Steps**:
1. Define `FeedingState` interface in data-model.md
2. Specify async `feed()` API in contracts/feeding-api.md
3. Create feedingHelpers.ts with pure functions
4. Update Horse.ts `playEatingAnimation()` to return Promise

**No Blockers**: All technical unknowns resolved with concrete patterns and code examples.
