# Research: Reset Button

**Feature**: 004-reset-button | **Phase**: 0 (Research) | **Date**: 2026-02-14

## Research Objective

Determine optimal UI placement, visual design patterns, interaction patterns, and state reset strategies for the reset button. Ensure the solution aligns with existing game architecture and provides a smooth player experience when resources are exhausted.

---

## Topic 1: Reset Button Placement & Visibility

### Question
Where should the reset button appear on screen? Should it fade in/out or appear instantly?

### Investigation

**Existing UI Layout** (from UIScene.ts):
- Status bars: Top-center, 3 bars stacked vertically starting at y=40
- Inventory items: Bottom-center (centerX ± 50, bottomY - 60)
- Feeding UI: Center screen (progress bar, fullness badge, countdown timer)
- Screen dimensions: this.scale.width × this.scale.height

**Placement Options**:
- **Option A**: Top-right corner (minimal obstruction, common pattern)
- **Option B**: Center of screen overlaying game (maximally visible but intrusive)
- **Option C**: Below inventory items at bottom-center (near resource indicators)

### Decision

**D1: Place reset button at top-right corner**

**Rationale**:
- **Visibility**: Always visible without obstructing gameplay or horse
- **Convention**: Top-right is standard for meta-game controls (settings, restart)
- **Proximity to status**: Near status bars reinforces connection to game state
- **Mobile-friendly**: Top-right thumb-reachable on phones, doesn't conflict with bottom inventory

**Alternatives Considered**:
- Center overlay: Rejected (too intrusive, blocks horse view)
- Bottom-center: Rejected (crowds inventory UI, less discoverable)

**D2: Use fade transition (300ms) for appearance/disappearance**

**Rationale**:
- Smooth transition feels more polished than instant pop-in
- 300ms is perceptible but not slow (existing animations use 400-800ms)
- Use Phaser alpha tween: `this.tweens.add({ targets: button, alpha: 0→1, duration: 300 })`

**Implementation Pattern**:
```typescript
// In UIScene.create()
this.resetButton = this.add.text(
  this.scale.width - 20,  // 20px from right edge
  20,                     // 20px from top
  '🔄 Reset',
  { fontSize: '18px', color: '#ff6b6b', fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 6 } }
).setOrigin(1, 0).setAlpha(0).setInteractive();

// Show/hide with tween
if (shouldShow) {
  this.tweens.add({ targets: this.resetButton, alpha: 1, duration: 300 });
}
```

---

## Topic 2: Reset Button Interaction Patterns

### Question
Should the button have hover states? Should there be a confirmation dialog before resetting?

### Investigation

**Existing Interaction Patterns** (from UIScene.ts, MainGameScene.ts):
- Inventory items: Scale on hover (1.0 → 1.1), change cursor
- Click debouncing: `GAME_CONFIG.INTERACTION_COOLDOWN` (200ms)
- No confirmation dialogs anywhere in game (instant actions)

**User Experience Considerations**:
- **Pro confirmation**: Prevents accidental resets (destructive action)
- **Con confirmation**: Adds friction, breaks flow (player already decided to reset)
- **Context**: Button only appears when game is unplayable (no resources left)

### Decision

**D3: No confirmation dialog, but add visual feedback**

**Rationale**:
- Button only appears when game is stuck (no resources) - reset is expected action
- Current game has no modal dialogs - would require new UI system
- Visual feedback (scale + color flash) provides sufficient "are you sure" moment
- Instant reset aligns with game's casual, frictionless design

**D4: Add hover and click feedback**

**Rationale**:
- Consistency with inventory items (scale on hover)
- Clear affordance that button is interactive
- Click feedback confirms action before reset executes

**Implementation Pattern**:
```typescript
this.resetButton.on('pointerover', () => {
  this.resetButton.setScale(1.1);
  this.game.canvas.style.cursor = 'pointer';
});

this.resetButton.on('pointerout', () => {
  this.resetButton.setScale(1.0);
  this.game.canvas.style.cursor = 'default';
});

this.resetButton.on('pointerdown', () => {
  // Visual feedback: flash white then back to red
  this.tweens.add({
    targets: this.resetButton,
    scaleX: 0.95,
    scaleY: 0.95,
    duration: 100,
    yoyo: true,
    onComplete: () => {
      resetGame(); // Execute reset
      this.scene.get('MainGameScene').decaySystem?.reset();
    },
  });
});
```

---

## Topic 3: State Reset Strategy

### Question
What state should be reset? Should DecaySystem timer be reset? How to handle in-progress animations?

### Investigation

**Existing State Structure** (from gameStore.ts, types.ts):
```typescript
interface GameState {
  horse: HorseStatus;      // hunger, cleanliness, happiness
  inventory: Inventory;    // carrots, brushUses
  ui: UIState;            // selectedTool, activeAnimation, lastInteractionTime
  feeding: FeedingState;  // isEating, eatStartTime, recentFeedings, fullUntil
}
```

**Existing resetGame()** (from actions.ts):
- Resets `horse`, `inventory`, `ui`
- **Missing**: Does not reset `feeding` state
- **Missing**: Does not trigger DecaySystem.reset()
- **Missing**: Does not save reset state to localStorage

**DecaySystem** (from DecaySystem.ts):
- Tracks `lastUpdateTime` internally
- Has `reset()` method that sets `lastUpdateTime = Date.now()`
- Without reset: First update after reset would apply huge decay (treats reset as long pause)

### Decision

**D5: Reset all state including feeding and decay timer**

**Rationale**:
- **Complete fresh start**: Player expects "new game" behavior
- **Prevent edge cases**: Fullness cooldown from previous session would be confusing
- **Decay jump prevention**: DecaySystem must reset timer to avoid instant stat drain

**D6: Cancel in-progress animations gracefully**

**Rationale**:
- If horse is eating when reset clicked, animation should stop immediately
- Phaser handles tween cleanup automatically on state change
- No memory leaks - all tweens reference scene-managed objects

**Enhanced resetGame() Implementation**:
```typescript
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

  // Save reset state
  saveSystem.save(getGameState());
  console.log('Game reset to initial state');
}
```

**Calling DecaySystem.reset()**:
```typescript
// In MainGameScene (expose decaySystem as public)
public decaySystem?: DecaySystem;

// In UIScene reset button handler
this.scene.get('MainGameScene').decaySystem?.reset();
```

---

## Topic 4: Button Visibility Logic

### Question
When exactly should the button appear/disappear? How often should we check?

### Investigation

**Existing Update Patterns** (from UIScene.ts):
- `update()` called every frame (60 FPS)
- Inventory counts updated every frame: `this.carrotItem?.setCount(state.inventory.carrots)`
- No performance issues with per-frame state checks (lightweight)

**Visibility Condition**:
- Show: `carrots === 0 AND brushUses === 0`
- Hide: `carrots > 0 OR brushUses > 0`

### Decision

**D7: Check visibility every frame in UIScene.update()**

**Rationale**:
- Consistent with existing pattern (inventory updates every frame)
- Lightweight check (2 integer comparisons)
- Instant response when last resource is consumed

**D8: Track previous visibility to avoid redundant tweens**

**Rationale**:
- Don't restart fade-in tween if button is already visible
- Prevents animation stutter if inventory changes rapidly (edge case)

**Implementation Pattern**:
```typescript
// In UIScene class
private resetButton?: Phaser.GameObjects.Text;
private resetButtonVisible: boolean = false;

update(): void {
  const state = useGameStore.getState();
  
  // Check if button should be visible
  const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
  
  // Only trigger tween if visibility changed
  if (shouldShow && !this.resetButtonVisible) {
    this.resetButtonVisible = true;
    this.tweens.add({ targets: this.resetButton, alpha: 1, duration: 300 });
  } else if (!shouldShow && this.resetButtonVisible) {
    this.resetButtonVisible = false;
    this.tweens.add({ targets: this.resetButton, alpha: 0, duration: 300 });
  }
}
```

---

## Summary of Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| **D1** | Timestamp-based visibility tracking | Prevents tween stutter, efficient |
| **D2** | Fade transition (300ms) | Polished appearance/disappearance |
| **D3** | No confirmation dialog | Frictionless reset, consistent with game design |
| **D4** | Hover + click feedback | Clear affordance, visual confirmation |
| **D5** | Reset all state + feeding | Complete fresh start, no edge cases |
| **D6** | Cancel animations gracefully | No memory leaks, clean state |
| **D7** | Per-frame visibility check | Instant response, lightweight |
| **D8** | Track visibility state | Prevent redundant animations |

**Phase 0 Complete** - All technical unknowns resolved. Proceed to Phase 1 (Design).
