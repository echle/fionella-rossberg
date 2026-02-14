# Data Model: Reset Button

**Feature**: 004-reset-button | **Phase**: 1 (Design) | **Date**: 2026-02-14

---

## Overview

**No new data structures required.** This feature reuses existing game state and introduces only UI-specific transient state (button visibility tracking). All reset logic operates on existing `GameState` interface.

**Design Principles**:
- **Minimal state**: Only track button visibility to prevent redundant animations
- **Transient UI state**: Button visibility is purely UI concern, not persisted
- **Reuse existing constants**: INITIAL_STATUS, INITIAL_INVENTORY for reset values
- **No schema version bump**: No changes to persisted GameState structure

---

## Existing Interfaces (Referenced, Not Modified)

### GameState (from state/types.ts)

Used by `resetGame()` to restore initial values:

```typescript
interface GameState {
  version: number;
  timestamp: number;
  horse: HorseStatus;      // Reset to INITIAL_STATUS
  inventory: Inventory;    // Reset to INITIAL_INVENTORY
  ui: UIState;            // Reset to defaults
  feeding: FeedingState;  // Reset to DEFAULT_FEEDING_STATE
}
```

### Constants (from config/gameConstants.ts)

Reset target values:

```typescript
const INITIAL_STATUS = {
  HUNGER: 50,
  CLEANLINESS: 50,
  HAPPINESS: 50,
};

const INITIAL_INVENTORY = {
  CARROTS: 10,
  BRUSH_USES: 100,
};
```

---

## New Transient State: UIScene.resetButtonVisible

### Purpose

Track whether reset button is currently visible to prevent redundant fade animations.

### Schema

```typescript
// In UIScene class
private resetButtonVisible: boolean = false;
```

**Why not in GameState**:
- Purely UI concern (rendering state, not game logic)
- Should not persist across page reloads
- No need for other scenes/systems to access this value
- Keeps GameState clean for save/load operations

### Usage

```typescript
// In UIScene.update()
const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;

if (shouldShow && !this.resetButtonVisible) {
  // Transition: hidden → visible
  this.resetButtonVisible = true;
  this.tweens.add({ targets: this.resetButton, alpha: 1, duration: 300 });
} else if (!shouldShow && this.resetButtonVisible) {
  // Transition: visible → hidden
  this.resetButtonVisible = false;
  this.tweens.add({ targets: this.resetButton, alpha: 0, duration: 300 });
}
```

---

## Reset Data Flow

### Input: Button Click

```
User Action: Click reset button
    ↓
UIScene.resetButton.on('pointerdown')
    ↓
actions.resetGame()  ← Reset all GameState
    ↓
MainGameScene.decaySystem.reset()  ← Reset decay timer
    ↓
saveSystem.save(newState)  ← Persist reset state
    ↓
Update complete, next frame renders with fresh state
```

### State Transitions

**Before Reset**:
```typescript
{
  horse: { hunger: 5, cleanliness: 10, happiness: 20 },
  inventory: { carrots: 0, brushUses: 0 },
  ui: { selectedTool: 'carrot', ... },
  feeding: { isEating: false, fullUntil: 1234567890, recentFeedings: [...] },
}
```

**After Reset**:
```typescript
{
  horse: { hunger: 50, cleanliness: 50, happiness: 50 },
  inventory: { carrots: 10, brushUses: 100 },
  ui: { selectedTool: null, activeAnimation: null, lastInteractionTime: 0 },
  feeding: { isEating: false, eatStartTime: null, recentFeedings: [], fullUntil: null },
}
```

---

## Entity Relationships

```
UIScene (reset button)
    ↓ (triggers)
actions.resetGame()
    ↓ (reads)
config/gameConstants  (INITIAL_STATUS, INITIAL_INVENTORY)
    ↓ (writes)
gameStore  (via updateGameState)
    ↓ (saves)
SaveSystem → LocalStorage
```

**Cascade Effects**:
- DecaySystem.reset() called separately (not triggered by GameState change)
- All Phaser tweens/animations auto-cleanup on state change (no manual intervention)
- UI elements (status bars, inventory counts) auto-update next frame via UIScene.update()

---

## Validation Rules

### Visibility Condition

```typescript
const shouldShowResetButton = (state: GameState): boolean => {
  return state.inventory.carrots === 0 && state.inventory.brushUses === 0;
};
```

**Edge Cases**:
- Empty inventory before game starts: Should not happen (initial values are 10, 100)
- Negative inventory: Prevented by existing validation in `feed()` and `groom()` actions
- Mid-animation reset: Handled by Phaser's automatic tween cleanup

### Reset Completion

```typescript
const isResetSuccessful = (state: GameState): boolean => {
  return (
    state.horse.hunger === INITIAL_STATUS.HUNGER &&
    state.horse.cleanliness === INITIAL_STATUS.CLEANLINESS &&
    state.horse.happiness === INITIAL_STATUS.HAPPINESS &&
    state.inventory.carrots === INITIAL_INVENTORY.CARROTS &&
    state.inventory.brushUses === INITIAL_INVENTORY.BRUSH_USES &&
    state.feeding.recentFeedings.length === 0 &&
    state.feeding.fullUntil === null
  );
};
```

---

## Summary

| Aspect | Implementation |
|--------|---------------|
| **New Types** | None (uses existing interfaces) |
| **Modified Types** | None |
| **New Constants** | None (uses existing INITIAL_STATUS, INITIAL_INVENTORY) |
| **Transient State** | `UIScene.resetButtonVisible: boolean` (not persisted) |
| **Persisted State** | GameState (no new fields, just reset to initial values) |
| **Version Bump** | No (no schema changes) |

**Phase 1 Complete** - Data model documented. Proceed to contracts.
