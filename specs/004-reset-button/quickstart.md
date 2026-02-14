# Developer Quickstart: Reset Button

**Feature**: 004-reset-button | **Phase**: 1 (Design) | **Date**: 2026-02-14

---

## Overview

This guide helps developers implement, test, and debug the reset button feature. Covers implementation patterns, testing strategies, and common pitfalls.

**Target Audience**: Developers adding the reset button or implementing similar conditional UI elements

---

## Quick Start (10 minutes)

### 1. Understanding the Flow

```text
Game running, resources depleting
  ↓
Inventory reaches carrots=0 AND brushUses=0
  ↓
UIScene.update() detects condition
  ↓
Reset button fades in (300ms alpha tween)
  ↓
User clicks button
  ↓
Visual feedback (scale pulse)
  ↓
resetGame() action
  ├─ Reset horse status
  ├─ Reset inventory
  ├─ Reset UI state
  ├─ Reset feeding state
  └─ Save to localStorage
  ↓
DecaySystem.reset()
  └─ Reset lastUpdateTime
  ↓
Next frame: Button fades out (inventory restored)
```

### 2. Implementation Checklist

- [ ] Enhance `resetGame()` in `src/state/actions.ts` to include feeding state
- [ ] Add reset button UI element to `src/scenes/UIScene.ts`
- [ ] Add visibility tracking variable `resetButtonVisible: boolean`
- [ ] Implement visibility logic in `UIScene.update()`
- [ ] Add button event handlers (pointerover, pointerout, pointerdown)
- [ ] Change `decaySystem` from private to public in `MainGameScene`
- [ ] Call `decaySystem.reset()` in button click handler
- [ ] Add unit tests for `resetGame()` in `tests/unit/actions.test.ts`
- [ ] Add integration test in `tests/integration/resetFlow.test.ts`

### 3. Key Files to Modify

```text
src/
├── state/
│   └── actions.ts           # Enhance resetGame() function
└── scenes/
    ├── UIScene.ts           # Add reset button + visibility logic
    └── MainGameScene.ts     # Make decaySystem public

tests/
├── unit/
│   └── actions.test.ts      # Add resetGame() tests
└── integration/
    └── resetFlow.test.ts     # New file - end-to-end tests
```

### 4. Run Tests

```bash
npm test -- actions.test.ts      # Unit tests for resetGame()
npm test -- resetFlow.test.ts    # Integration tests for button flow
npm test                         # Full test suite
```

---

## Implementation Patterns

### Pattern 1: Enhanced resetGame() Action

**File**: `src/state/actions.ts`

```typescript
// Add these imports at top
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

**Key Points**:
- Resets ALL state including `feeding` (prevents stale cooldowns)
- Saves immediately after reset (persists fresh state)
- Console log confirms reset (helpful for debugging)

---

### Pattern 2: Reset Button UI Element

**File**: `src/scenes/UIScene.ts`

#### Step 2.1: Add Class Variables

```typescript
export class UIScene extends Phaser.Scene {
  // ... existing variables ...
  
  private resetButton?: Phaser.GameObjects.Text;
  private resetButtonVisible: boolean = false;
  private lastResetClickTime: number = 0;  // For debouncing
  
  // ... rest of class ...
}
```

#### Step 2.2: Create Button in create()

```typescript
create(): void {
  // ... existing UI creation (status bars, inventory) ...

  // Create reset button (top-right corner, initially hidden)
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

  // Hover effect (scale up)
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
      return;
    }
    this.lastResetClickTime = now;

    // Visual feedback (scale pulse)
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
      },
    });
  });

  console.log('UIScene initialized - Reset button created');
}
```

#### Step 2.3: Add Visibility Logic in update()

```typescript
update(_time: number, _delta: number): void {
  const state = useGameStore.getState();
  
  // ... existing update logic (status bars, etc.) ...

  // Reset button visibility
  const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
  
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

**Key Points**:
- Check visibility every frame (lightweight, 2 integer comparisons)
- Track `resetButtonVisible` to prevent redundant tweens
- Use 300ms fade for smooth transition (not jarring)

---

### Pattern 3: Expose DecaySystem in MainGameScene

**File**: `src/scenes/MainGameScene.ts`

```typescript
export class MainGameScene extends Phaser.Scene {
  private horse?: Horse;
  public decaySystem?: DecaySystem;  // Changed: private → public
  // ... rest of class ...
}
```

**Why Public?**  
UIScene needs to call `decaySystem.reset()` after game reset. This is a one-way dependency (UIScene → MainGameScene) which is acceptable for cross-scene communication.

**Alternative Considered**:  
Phaser event system (`this.events.emit('reset')`). Rejected because:
- Adds complexity for single use case
- Direct property access is simpler and type-safe

---

## Testing Strategies

### Unit Tests: resetGame()

**File**: `tests/unit/actions.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetGame, getGameState, updateGameState } from '../../src/state/actions';
import { saveSystem } from '../../src/systems/SaveSystem';
import { INITIAL_STATUS, INITIAL_INVENTORY } from '../../src/config/gameConstants';

describe('resetGame()', () => {
  beforeEach(() => {
    // Setup: Set game state to non-initial values
    updateGameState(() => ({
      horse: { hunger: 10, cleanliness: 20, happiness: 5 },
      inventory: { carrots: 0, brushUses: 0 },
      feeding: {
        isEating: true,
        eatStartTime: Date.now(),
        recentFeedings: [123, 456, 789],
        fullUntil: Date.now() + 10000,
      },
    }));
  });

  it('should reset horse status to initial values', () => {
    resetGame();
    
    const state = getGameState();
    expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS);
    expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS);
  });

  it('should reset inventory to initial values', () => {
    resetGame();
    
    const state = getGameState();
    expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
    expect(state.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
  });

  it('should clear feeding state completely', () => {
    resetGame();
    
    const state = getGameState();
    expect(state.feeding.isEating).toBe(false);
    expect(state.feeding.eatStartTime).toBe(null);
    expect(state.feeding.recentFeedings).toEqual([]);
    expect(state.feeding.fullUntil).toBe(null);
  });

  it('should clear UI state', () => {
    updateGameState(() => ({
      ui: { selectedTool: 'carrot', activeAnimation: 'eating', lastInteractionTime: 12345 },
    }));
    
    resetGame();
    
    const state = getGameState();
    expect(state.ui.selectedTool).toBe(null);
    expect(state.ui.activeAnimation).toBe(null);
    expect(state.ui.lastInteractionTime).toBe(0);
  });

  it('should save reset state to localStorage', () => {
    const saveSpy = vi.spyOn(saveSystem, 'save');
    
    resetGame();
    
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(getGameState());
  });

  it('should log reset confirmation', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    resetGame();
    
    expect(consoleSpy).toHaveBeenCalledWith('Game reset to initial state');
  });
});
```

---

### Integration Tests: Reset Flow

**File**: `tests/integration/resetFlow.test.ts` (new file)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { resetGame, getGameState, updateGameState } from '../../src/state/actions';
import { INITIAL_STATUS, INITIAL_INVENTORY } from '../../src/config/gameConstants';

describe('Reset Button Flow', () => {
  it('should show button when resources exhausted', () => {
    // Setup: Deplete resources
    updateGameState(() => ({
      inventory: { carrots: 0, brushUses: 0 },
    }));
    
    const state = getGameState();
    const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    
    expect(shouldShow).toBe(true);
  });

  it('should hide button when at least one resource available', () => {
    // Test carrots > 0
    updateGameState(() => ({ inventory: { carrots: 1, brushUses: 0 } }));
    let state = getGameState();
    let shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    expect(shouldShow).toBe(false);

    // Test brushUses > 0
    updateGameState(() => ({ inventory: { carrots: 0, brushUses: 1 } }));
    state = getGameState();
    shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    expect(shouldShow).toBe(false);
  });

  it('should restore all state after reset', () => {
    // Setup: Exhaust resources and set poor horse status
    updateGameState(() => ({
      horse: { hunger: 5, cleanliness: 10, happiness: 15 },
      inventory: { carrots: 0, brushUses: 0 },
      feeding: {
        isEating: false,
        eatStartTime: null,
        recentFeedings: [Date.now() - 5000],
        fullUntil: Date.now() + 20000,
      },
    }));

    // Execute: Reset game
    resetGame();

    // Assert: All values restored
    const state = getGameState();
    
    // Horse status
    expect(state.horse.hunger).toBe(INITIAL_STATUS.HUNGER);
    expect(state.horse.cleanliness).toBe(INITIAL_STATUS.CLEANLINESS);
    expect(state.horse.happiness).toBe(INITIAL_STATUS.HAPPINESS);
    
    // Inventory
    expect(state.inventory.carrots).toBe(INITIAL_INVENTORY.CARROTS);
    expect(state.inventory.brushUses).toBe(INITIAL_INVENTORY.BRUSH_USES);
    
    // Feeding state
    expect(state.feeding.recentFeedings).toEqual([]);
    expect(state.feeding.fullUntil).toBe(null);
  });

  it('should hide button after reset (resources restored)', () => {
    // Setup: Show button (no resources)
    updateGameState(() => ({ inventory: { carrots: 0, brushUses: 0 } }));
    
    let state = getGameState();
    let shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    expect(shouldShow).toBe(true);

    // Execute: Reset
    resetGame();

    // Assert: Button should hide (inventory restored)
    state = getGameState();
    shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    expect(shouldShow).toBe(false);
  });
});
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Button Appears at Game Start

**Symptom**: Button visible when game first loads (even with full inventory)

**Cause**: Forgot to set initial `alpha: 0` on button creation

**Solution**:
```typescript
this.resetButton = this.add.text(...)
  .setAlpha(0);  // ← Add this
```

---

### Pitfall 2: Decay Spike After Reset

**Symptom**: Horse status drops immediately after reset

**Cause**: Forgot to call `decaySystem.reset()` in button handler

**Solution**:
```typescript
this.resetButton.on('pointerdown', () => {
  resetGame();
  
  // Must reset decay timer
  const mainScene = this.scene.get('MainGameScene') as MainGameScene;
  mainScene.decaySystem?.reset();  // ← Add this
});
```

---

### Pitfall 3: Button Flickers On/Off

**Symptom**: Button rapidly fades in/out when resources at 0

**Cause**: Starting new tween every frame instead of tracking visibility state

**Solution**:
```typescript
// Track state to prevent redundant tweens
private resetButtonVisible: boolean = false;

update(): void {
  const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
  
  // Only trigger tween if visibility CHANGED
  if (shouldShow && !this.resetButtonVisible) {  // ← Check previous state
    this.resetButtonVisible = true;
    this.tweens.add({ targets: this.resetButton, alpha: 1, duration: 300 });
  }
}
```

---

### Pitfall 4: Reset Button Blocks Horse Clicks

**Symptom**: Cannot click horse in top-right area

**Cause**: Button has large invisible hit area

**Solution**: Button is positioned at top-right (x: width - 20, y: 20), far from horse center. If issue persists, adjust position or reduce padding.

---

## Debugging Tips

### Tip 1: Manually Trigger Reset

```typescript
// In browser console
resetGame();
```

Verify state resets without clicking button.

---

### Tip 2: Force Button Visibility

```typescript
// In UIScene, temporarily hardcode:
const shouldShow = true;  // Always show button for testing
```

Test button appearance/interaction without depleting resources.

---

### Tip 3: Check Button Alpha

```typescript
// In browser console
const uiScene = game.scene.getScene('UIScene');
console.log(uiScene.resetButton?.alpha);  // Should be 0 (hidden) or 1 (visible)
```

---

### Tip 4: Monitor State Changes

```typescript
// In actions.ts, add logging:
export function resetGame(): void {
  console.log('BEFORE RESET:', getGameState());
  
  updateGameState(() => ({ /* ... */ }));
  
  console.log('AFTER RESET:', getGameState());
}
```

---

## Performance Considerations

### Per-Frame Visibility Check

```typescript
// In UIScene.update() - called 60 times per second
const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
```

**Cost**: 2 integer comparisons + 1 boolean AND  
**Impact**: Negligible (<0.01ms per frame)  
**Optimization**: Not needed - this is already optimal

---

### Tween Accumulation

**Risk**: Starting new tween every frame → memory leak

**Mitigation**: Track `resetButtonVisible` state to prevent redundant tweens

**Verification**:
```typescript
// Check active tweens (should be 0-1, not hundreds)
console.log(this.tweens.getTweensOf(this.resetButton).length);
```

---

## Next Steps

1. **Implement**: Follow patterns above to add reset button
2. **Test**: Run unit + integration tests, verify all pass
3. **Manual Test**: Deplete resources, click button, verify reset
4. **Edge Case Test**: 
   - Click button rapidly (debounce works?)
   - Reset during eating animation (gracefully handled?)
   - Reset at exactly 0/0 inventory (button appears?)
5. **Commit**: Create feature branch `004-reset-button`, commit changes

---

## Related Documentation

- [spec.md](spec.md) - User stories and requirements
- [plan.md](plan.md) - Technical approach and architecture
- [research.md](research.md) - Design decisions and alternatives
- [data-model.md](data-model.md) - State structure documentation
- [contracts/reset-api.md](contracts/reset-api.md) - API signatures

**Phase 1 Complete** - Quickstart guide ready. Proceed to Phase 2 (Tasks).
