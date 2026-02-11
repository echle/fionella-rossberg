# Implementation Plan: Enhanced Feeding Mechanics

**Branch**: `002-feeding-mechanics` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-feeding-mechanics/spec.md`

## Summary

This feature transforms feeding from an instant interaction into a timed, strategic mechanic. Horses require 2.5 seconds to eat each carrot (with animation), and after consuming 3 carrots within a 30-second sliding window, they become temporarily full and refuse additional food for 30 seconds. The satiety counter intelligently decays (each carrot "expires" after 10 seconds), allowing paced feeding without triggering the cooldown. Visual indicators (eating progress, fullness badge, countdown timer) provide clear feedback throughout.

**Technical Approach**: Extend existing GameState with feeding-specific fields (`isEating`, `eatStartTime`, `recentFeedings`, `fullUntil`), refactor `feed()` action to be promise-based with animation callbacks, add real-time UI updates in UIScene for progress/countdown display, and leverage Phaser's time systems for all timing logic.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode enabled)  
**Primary Dependencies**: Phaser 3.80+, Zustand 4.x for state, Vitest 1.6+ for testing  
**Storage**: LocalStorage via existing SaveSystem  
**Testing**: Vitest with jsdom environment, separate unit tests for timing logic  
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge latest 2 versions)  
**Project Type**: Single-page web game with Phaser scenes  
**Performance Goals**: Maintain 60 FPS during eating animations, <16ms per update cycle  
**Constraints**: All timing must survive page reloads (persist timestamps), eating blocked during page refresh (transient state)  
**Scale/Scope**: Single-player, local state, ~5 new state fields, ~200 LOC additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Visual Excellence First
- **Eating animation**: 2.5-second tween-based animation with progress indicator
- **Fullness indicator**: Badge with countdown timer near horse
- **Disabled states**: Gray-out carrot icon when unavailable
- **Smooth transitions**: Tween-based animations, no jarring state changes
- **Status**: ✅ PASS - Visual feedback is core to all 3 user stories

### ✅ II. Game Engine Foundation  
- **Phaser Time System**: Use `this.scene.time` for delays, intervals, progress tracking
- **Phaser Tweens**: Leverage existing tween system for eating animation
- **Scene Management**: Extend MainGameScene and UIScene (no new scenes)
- **Status**: ✅ PASS - Built entirely on Phaser APIs

### ✅ III. Browser-First Deployment
- **No new dependencies**: Pure TypeScript + existing Phaser/Zustand stack
- **Timestamp-based logic**: Works across reloads, no continuous timers required
- **LocalStorage persistence**: Satiety state survives page refresh
- **Status**: ✅ PASS - Zero impact on load time or bundle size

### ✅ IV. Testable Game Logic
- **Pure function**: `calculateSatietyCount(recentFeedings: number[], now: number): number`
- **Pure function**: `canFeed(state: GameState, now: number): boolean`  
- **Pure function**: `pruneExpiredFeedings(feedings: number[], cutoffMs: number): number[]`
- **Unit testable**: All timing calculations separated from Phaser rendering
- **Status**: ✅ PASS - Core logic is testable without game engine

### ✅ V. 2D→3D Evolution Path
- **State abstraction**: Feeding state is engine-agnostic (timestamps, counters)
- **Animation hooks**: `playEatingAnimation()` can swap 2D tweens for 3D bone animations
- **No tight coupling**: Timer logic doesn't assume Phaser - could work with Three.js
- **Status**: ✅ PASS - Architecture supports future 3D migration

**GATE RESULT**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-feeding-mechanics/
├── spec.md                  # ✅ Complete (user stories, requirements)
├── plan.md                  # ← This file (technical approach)
├── research.md              # Phase 0 output (timing precision, animation patterns)
├── data-model.md            # Phase 1 output (feeding state schema)
├── quickstart.md            # Phase 1 output (developer guide)
├── contracts/               # Phase 1 output (action signatures)
│   └── feeding-api.md       # New feed() async API, helper functions
└── tasks.md                 # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── config/
│   └── gameConstants.ts          # Add: EATING_DURATION, SATIETY_LIMIT, SATIETY_DECAY_MS
├── state/
│   ├── types.ts                  # Extend: GameState + FeedingState interface
│   ├── actions.ts                # Refactor: feed() → async, add feedingHelpers
│   └── gameStore.ts              # (no changes, uses existing updateGameState)
├── entities/
│   └── Horse.ts                  # Enhance: playEatingAnimation() return Promise
├── scenes/
│   ├── MainGameScene.ts          # Add: eating state listener, block interactions
│   └── UIScene.ts                # Add: progress indicator, fullness badge, countdown
├── systems/
│   └── SaveSystem.ts             # (minimal change: persist recentFeedings array)
└── utils/
    └── feedingHelpers.ts         # NEW: Pure functions for satiety logic

tests/
├── unit/
│   ├── actions.test.ts           # Extend: Test async feed(), satiety blocking
│   └── feedingHelpers.test.ts   # NEW: Test satiety decay, canFeed logic
└── integration/
    └── careCycle.test.ts         # Extend: Test eating duration, reload persistence
```

**Structure Decision**: Extending existing single-project structure (src/ + tests/). No new directories needed - feeding logic fits cleanly into existing state/ and utils/ folders. New `feedingHelpers.ts` keeps pure timing functions separate from Zustand actions for testability.

## Complexity Tracking

> **Not applicable** - All Constitution checks passed with no violations to justify.

## Phase 0: Research & Decisions

**Objective**: Resolve technical unknowns before design phase

### Research Topics

1. **Phaser Timer Precision**
   - **Question**: Can Phaser's `this.scene.time` maintain accurate 2.5-second intervals during frame drops?
   - **Acceptance**: Document tested precision on 30 FPS vs 60 FPS scenarios
   - **Deliverable**: Confirm timestamp-based progress (`(now - startTime) / duration`) maintains accuracy regardless of FPS

2. **Animation State Management**
   - **Question**: How to cleanly cancel in-progress eating animation on page reload without memory leaks?
   - **Acceptance**: Pattern for cleaning up Phaser tweens/timers tied to transient state
   - **Deliverable**: Code snippet showing `scene.time.removeAllEvents()` + tween cleanup in `shutdown()`

3. **UI Update Frequency**
   - **Question**: Should countdown timer update every frame (60 Hz) or every second (1 Hz)?
   - **Acceptance**: Balance between smooth UX and CPU efficiency
   - **Deliverable**: Benchmark showing performance impact, recommend 1Hz for timer text, continuous for progress bar

4. **Satiety Array Pruning**
   - **Question**: When to prune `recentFeedings` array (every update vs on-demand)?
   - **Acceptance**: Strategy that avoids memory growth while maintaining accuracy
   - **Deliverable**: Decision on lazy pruning (prune only during `canFeed()` checks)

### Decision Log (to be filled in research.md)

- **D1**: Eating progress calculation method (timestamp-based vs frame-based)
- **D2**: UI update strategy (update cycle placement, throttling approach)
- **D3**: Satiety decay implementation (setInterval vs on-demand calculation)
- **D4**: Animation cancellation policy (page reload, interaction blocking)

## Phase 1: Design Artifacts

### Data Model (data-model.md)

**New Interface**: `FeedingState`
```typescript
interface FeedingState {
  isEating: boolean;
  eatStartTime: number | null;      // timestamp ms or null
  recentFeedings: number[];          // timestamps of last N feedings
  fullUntil: number | null;          // timestamp ms or null
}
```

**Extended**: `GameState`
```typescript
interface GameState {
  // ... existing fields
  feeding: FeedingState;              // NEW
}
```

**Relationships**:
- `feeding` persisted in SaveSystem alongside `horse`, `inventory`
- `isEating` is transient (not saved) - eating resets on reload
- `recentFeedings` pruned to last 30 seconds before save

### API Contracts (contracts/feeding-api.md)

**Modified Action**:
```typescript
// OLD: function feed(): boolean
feed(): Promise<boolean>
```
- Returns `Promise<boolean>` (resolves after 2.5s animation)
- Rejects if already eating or full
- Deducts carrot immediately, applies hunger after animation

**New Helper Functions**:
```typescript
canFeed(state: GameState, now: number): boolean
calculateSatietyCount(feedings: number[], now: number): number  
pruneExpiredFeedings(feedings: number[], cutoffMs: number): number[]
isHorseFull(state: GameState, now: number): boolean
```

### Quickstart (quickstart.md)

Developer guide covering:
- Adding new timed interactions (pattern reuse)
- Testing eating animations (mock Phaser time)
- Debugging satiety logic (console helpers)
- Common pitfalls (forgetting to await feed(), timestamp precision)

## Phase 2: Task Breakdown (tasks.md - created by `/speckit.tasks`)

**High-Level Phases** (detailed tasks generated separately):

1. **Phase 0**: Research (4 research tasks) - ~2 hours
2. **Phase 1**: State & Helpers (5 tasks) - Add FeedingState, helper functions, unit tests
3. **Phase 2**: Feed Action Refactor (4 tasks) - Convert feed() to async, integrate timing
4. **Phase 3**: Animation Integration (3 tasks) - Horse entity updates, promise-based animation
5. **Phase 4**: UI Visual Feedback (6 tasks) - Progress bar, fullness badge, countdown timer
6. **Phase 5**: Interaction Blocking (3 tasks) - Block all interactions during eating
7. **Phase 6**: Save/Load Persistence (3 tasks) - Persist recentFeedings, handle reload
8. **Phase 7**: Testing & Polish (4 tasks) - Integration tests, edge case validation

**Estimated Total**: 32 tasks, 8-12 hours implementation time

## Dependencies & Risks

### Internal Dependencies
- **Blocks**: T136 (optional sprite animation) - eating animation easier with sprite frames
- **Blocked By**: None - builds on stable MVP foundation (001-horse-care-mvp)
- **Integrates With**: SaveSystem, DecaySystem (hunger continues during eating/cooldown)

### External Dependencies
- None - pure Phaser/TypeScript, no new libraries

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phaser timer drift on low-end devices | Medium | Use timestamp-based calculations, not frame counters |
| Race condition: feed() called during save | Low | Zustand handles atomic updates, test with rapid clicks |
| savedState schema migration (old saves missing `feeding`) | Medium | Add migration logic in SaveSystem.load() with defaults |
| UI update lag causing countdown to skip seconds | Low | Throttle updates to 1Hz, use requestAnimationFrame for progress |

### Rollback Plan
- Feature is additive (doesn't break existing feed mechanic)
- Can disable via feature flag: `ENABLE_TIMED_FEEDING = false`
- Fallback: feed() returns immediately (instant hunger) if flag disabled

## Success Metrics

- ✅ Unit tests: 90%+ coverage for feedingHelpers.ts
- ✅ Animation timing: 2.5s ± 50ms measured in browser (not frame-dependent)
- ✅ Satiety accuracy: Counter correctly decays in 10s, 20s, 30s test scenarios
- ✅ Performance: No FPS drop during eating (maintain 60 FPS)
- ✅ Persistence: recentFeedings survives reload, fullness state restored
- ✅ UX: Countdown timer never shows negative values or skips seconds

**Next Step**: Run `/speckit.tasks` to generate detailed task breakdown
