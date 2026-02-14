# API Contract: Reset Button

**Feature**: 004-reset-button | **Phase**: 1 (Design) | **Date**: 2026-02-14

---

## Overview

This document specifies the API changes for the reset button feature. The primary change is enhancing the existing `resetGame()` action to include feeding state reset and documenting the new reset button UI interface in UIScene.

**Breaking Changes**: None (enhancement only, existing signature preserved)

**Modified Exports**:
- `resetGame()` - Now resets feeding state and persists to LocalStorage

**New UI Elements**:
- Reset button in UIScene (conditional visibility)

---

## Modified Action: `resetGame()`

### Before (Current Implementation)

```typescript
// src/state/actions.ts
export function resetGame(): void {
  updateGameState(() => ({
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
    },
  }));
}
```

**Current Issues**:
- Does not reset `feeding` state (leaves stale cooldown timers)
- Does not reset DecaySystem timer (causes immediate stat drain after reset)
- Does not save reset state to LocalStorage (reset not persisted)

### After (Enhanced Implementation)

```typescript
// src/state/actions.ts
import { saveSystem } from '../systems/SaveSystem';
import { DEFAULT_FEEDING_STATE } from './gameStore';

export function resetGame(): void {
  updateGameState(() => ({
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
    },
    feeding: {
      isEating: false,
      eatStartTime: null,
      recentFeedings: [],
      fullUntil: null,
    },
  }));

  // Persist reset state
  saveSystem.save(getGameState());
  console.log('Game reset to initial state');
}
```

### API Signature

```typescript
/**
 * Reset game to initial state (horse status, inventory, UI, feeding)
 * 
 * @returns void
 * 
 * @sideEffects
 *   - Resets horse status to INITIAL_STATUS (hunger: 50, cleanliness: 50, happiness: 50)
 *   - Resets inventory to INITIAL_INVENTORY (carrots: 10, brushUses: 100)
 *   - Clears UI state (selectedTool: null, activeAnimation: null, lastInteractionTime: 0)
 *   - Clears feeding state (isEating: false, recentFeedings: [], fullUntil: null)
 *   - Saves reset state to LocalStorage via SaveSystem
 *   - Logs reset confirmation to console
 * 
 * @callers
 *   - UIScene.resetButton.on('pointerdown') - User clicks reset button
 *   - Manual developer call (e.g., console debug)
 * 
 * @postconditions
 *   - Game state matches initial game load (as if page just opened)
 *   - DecaySystem timer must be reset separately (not handled by this action)
 *   - All Phaser animations/tweens auto-cleanup on next frame
 * 
 * @example
 * // UIScene.ts - Reset button handler
 * this.resetButton.on('pointerdown', () => {
 *   resetGame();
 *   
 *   // Must also reset DecaySystem timer
 *   const mainScene = this.scene.get('MainGameScene') as MainGameScene;
 *   mainScene.decaySystem?.reset();
 * });
 */
export function resetGame(): void;
```

---

## New UI Element: Reset Button (UIScene)

### Interface

```typescript
// In UIScene class
private resetButton?: Phaser.GameObjects.Text;
private resetButtonVisible: boolean = false;
```

### Creation (in UIScene.create())

```typescript
// Create reset button (initially hidden)
this.resetButton = this.add.text(
  this.scale.width - 20,  // 20px from right edge
  20,                     // 20px from top
  '🔄 Reset',
  {
    fontSize: '18px',
    color: '#ff6b6b',
    fontStyle: 'bold',
    backgroundColor: '#000000aa',
    padding: { x: 10, y: 6 },
  }
)
  .setOrigin(1, 0)  // Right-top anchor
  .setAlpha(0)      // Start invisible
  .setInteractive({ useHandCursor: true });

// Hover effect
this.resetButton.on('pointerover', () => {
  this.resetButton?.setScale(1.1);
});

this.resetButton.on('pointerout', () => {
  this.resetButton?.setScale(1.0);
});

// Click handler
this.resetButton.on('pointerdown', () => {
  // Debounce check (prevent spam clicks)
  const now = Date.now();
  if (now - this.lastResetClickTime < 500) {
    return; // Too soon, ignore
  }
  this.lastResetClickTime = now;

  // Visual feedback
  this.tweens.add({
    targets: this.resetButton,
    scaleX: 0.95,
    scaleY: 0.95,
    duration: 100,
    yoyo: true,
    onComplete: () => {
      // Execute reset
      resetGame();
      
      // Reset decay timer
      const mainScene = this.scene.get('MainGameScene') as MainGameScene;
      mainScene.decaySystem?.reset();
      
      // Button will auto-hide next frame (inventory now has resources)
    },
  });
});
```

### Visibility Logic (in UIScene.update())

```typescript
update(): void {
  const state = useGameStore.getState();
  
  // ... existing update logic ...
  
  // Check if button should be visible
  const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
  
  // Only trigger tween if visibility changed
  if (shouldShow && !this.resetButtonVisible) {
    // Transition: hidden → visible
    this.resetButtonVisible = true;
    this.tweens.add({
      targets: this.resetButton,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  } else if (!shouldShow && this.resetButtonVisible) {
    // Transition: visible → hidden
    this.resetButtonVisible = false;
    this.tweens.add({
      targets: this.resetButton,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
    });
  }
}
```

### Button Properties

| Property | Value | Rationale |
|----------|-------|-----------|
| **Position** | `(width - 20, 20)` | Top-right corner, standard location for meta-controls |
| **Anchor** | `(1, 0)` | Right-top origin for consistent positioning |
| **Text** | `'🔄 Reset'` | Emoji + text for clarity, universally understood |
| **Font Size** | `18px` | Readable but not oversized |
| **Color** | `#ff6b6b` (red) | Indicates destructive action |
| **Background** | `#000000aa` (semi-transparent black) | Ensures readability on any background |
| **Padding** | `{ x: 10, y: 6 }` | Touch-friendly hit area |
| **Initial Alpha** | `0` | Start hidden (appears when needed) |
| **Hover Scale** | `1.1` | Visual affordance (interactive) |
| **Click Scale** | `0.95` | Click feedback (button "press") |
| **Transition Duration** | `300ms` | Smooth fade (not jarring) |

---

## DecaySystem Integration

### Current Interface

```typescript
// src/systems/DecaySystem.ts
export class DecaySystem {
  private lastUpdateTime: number;
  
  reset(): void {
    this.lastUpdateTime = Date.now();
  }
}
```

**Requirement**: MainGameScene must expose `decaySystem` as public for UIScene to call `reset()`.

### Modified MainGameScene

```typescript
// src/scenes/MainGameScene.ts
export class MainGameScene extends Phaser.Scene {
  private horse?: Horse;
  public decaySystem?: DecaySystem;  // Changed: private → public
  
  // ... rest of class ...
}
```

**Justification**: UIScene needs to access DecaySystem to reset timer after game reset. This is a one-way dependency (UIScene → MainGameScene) which is acceptable.

---

## Call Sequence Diagram

```
User clicks reset button
    ↓
UIScene.resetButton.on('pointerdown')
    |
    ├─→ Visual feedback tween (scale pulse)
    |
    ├─→ resetGame()  [in actions.ts]
    |       ├─→ updateGameState(initial values)
    |       └─→ saveSystem.save()
    |
    └─→ mainScene.decaySystem.reset()
        └─→ DecaySystem.lastUpdateTime = Date.now()

Next frame:
    ↓
UIScene.update()
    ├─→ Check visibility: carrots > 0 OR brushUses > 0
    ├─→ shouldShow = false
    └─→ Fade button out (alpha: 1 → 0)
```

---

## Testing Contract

### Unit Tests (actions.test.ts)

```typescript
describe('resetGame()', () => {
  it('should reset horse status to initial values', () => {
    // Setup: Modify state
    updateGameState({ horse: { hunger: 10, cleanliness: 20, happiness: 30 } });
    
    // Execute
    resetGame();
    
    // Assert
    const state = getGameState();
    expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS);
    expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS);
  });
  
  it('should reset inventory to initial values', () => {
    updateGameState({ inventory: { carrots: 0, brushUses: 0 } });
    
    resetGame();
    
    const state = getGameState();
    expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
    expect(state.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
  });
  
  it('should clear feeding state', () => {
    updateGameState({
      feeding: {
        isEating: true,
        eatStartTime: Date.now(),
        recentFeedings: [123, 456, 789],
        fullUntil: Date.now() + 10000,
      },
    });
    
    resetGame();
    
    const state = getGameState();
    expect(state.feeding.isEating).toBe(false);
    expect(state.feeding.eatStartTime).toBe(null);
    expect(state.feeding.recentFeedings).toEqual([]);
    expect(state.feeding.fullUntil).toBe(null);
  });
  
  it('should save reset state to localStorage', () => {
    const saveSpy = vi.spyOn(saveSystem, 'save');
    
    resetGame();
    
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests (resetFlow.test.ts)

```typescript
describe('Reset Button Integration', () => {
  it('should show reset button when resources exhausted', () => {
    // Setup: Deplete resources
    updateGameState({ inventory: { carrots: 0, brushUses: 0 } });
    
    // Create scene and wait for update
    const uiScene = new UIScene();
    uiScene.update(0, 0);
    
    // Assert: Button becomes visible
    expect(uiScene['resetButtonVisible']).toBe(true);
  });
  
  it('should hide reset button after reset', async () => {
    // Setup: Show button
    updateGameState({ inventory: { carrots: 0, brushUses: 0 } });
    const uiScene = new UIScene();
    uiScene.update(0, 0);
    
    // Execute: Click reset
    resetGame();
    
    // Assert: Button hides (inventory restored)
    uiScene.update(0, 0);
    expect(uiScene['resetButtonVisible']).toBe(false);
  });
});
```

---

## Summary

| Component | Change Type | Impact |
|-----------|------------|--------|
| **resetGame()** | Enhanced | Now resets feeding state + saves to localStorage |
| **UIScene** | New UI element | Reset button with conditional visibility |
| **MainGameScene** | Access modifier | `decaySystem` now public |
| **DecaySystem** | No change | Existing `reset()` method used |

**Phase 1 Complete** - API contracts defined. Proceed to quickstart.md.
