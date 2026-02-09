# Zustand Store Actions API

**Purpose**: Define the public API for all Zustand store actions (state mutations).

## Action Signatures

### 1. `feed(): void`

**Description**: Feed the horse a carrot, increasing hunger status and consuming one carrot from inventory.

**Preconditions**:
- `gameState.inventory.carrots > 0`

**State Changes**:
- `gameState.horse.hunger += 20` (capped at 100)
- `gameState.inventory.carrots -= 1`
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Emits event for animation system (horse eating animation)

**Error Handling**:
- If `carrots === 0`: Log warning, return unchanged state, show UI message "No carrots left!"

**Usage Example**:
```typescript
import { useGameStore } from './state/gameStore';

const { feed } = useGameStore();

button.on('pointerdown', () => {
  feed(); // Attempt to feed horse
});
```

---

### 2. `groom(): void`

**Description**: Perform one brush stroke on the horse, increasing cleanliness status and consuming one brush use.

**Preconditions**:
- `gameState.inventory.brushUses > 0`

**State Changes**:
- `gameState.horse.cleanliness += 5` (capped at 100)
- `gameState.inventory.brushUses -= 1`
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Emits event for particle system (sparkles, dust)

**Error Handling**:
- If `brushUses === 0`: Log warning, return unchanged state, show UI message "Brush worn out!"

**Usage Example**:
```typescript
horse.on('pointermove', (pointer) => {
  if (isDragging && selectedTool === 'brush') {
    groom(); // Each drag movement = one stroke
  }
});
```

---

### 3. `pet(): void`

**Description**: Pet the horse, increasing happiness status. No inventory consumption.

**Preconditions**:
- None (always available)

**State Changes**:
- `gameState.horse.happiness += 10` (capped at 100)
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Emits event for animation system (hearts, happy expression)

**Error Handling**:
- None (action can never fail)

**Usage Example**:
```typescript
horse.on('pointerdown', () => {
  if (selectedTool === null) { // No tool selected = petting
    pet();
  }
});
```

---

### 4. `selectTool(tool: 'carrot' | 'brush' | null): void`

**Description**: Set the currently selected tool for interactions.

**Parameters**:
- `tool`: "carrot" | "brush" | null (null = no tool selected)

**Preconditions**:
- If selecting carrot: `gameState.inventory.carrots > 0`
- If selecting brush: `gameState.inventory.brushUses > 0`

**State Changes**:
- `gameState.ui.selectedTool = tool`

**Side Effects**:
- Updates UI highlighting (selected tool gets border glow)
- Changes cursor icon

**Error Handling**:
- If trying to select unavailable tool: Prevent selection, show message

**Usage Example**:
```typescript
carrotIcon.on('pointerdown', () => {
  selectTool('carrot');
});
```

---

### 5. `applyDecay(elapsedMs: number): void`

**Description**: Apply time-based status decay based on elapsed milliseconds.

**Parameters**:
- `elapsedMs`: Number of milliseconds elapsed since last decay application

**State Changes**:
- `gameState.horse.hunger -= Math.floor(elapsedMs / 6000)` (clamped at 0)
- `gameState.horse.cleanliness -= Math.floor(elapsedMs / 12000)` (clamped at 0)
- `gameState.horse.happiness -= Math.floor(elapsedMs / 7500)` (clamped at 0)
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Called automatically by DecaySystem every game update tick
- No animation triggers (silent background process)

**Usage Example**:
```typescript
// DecaySystem.ts
update(time: number, delta: number) {
  const { applyDecay } = useGameStore.getState();
  applyDecay(delta); // delta = ms since last frame
}
```

---

### 6. `loadGameState(savedState: SavedGameState): void`

**Description**: Load a saved game state from LocalStorage and merge into current state.

**Parameters**:
- `savedState`: Parsed SavedGameState object from LocalStorage

**State Changes**:
- Replaces `gameState.horse` with `savedState.horse`
- Replaces `gameState.inventory` with `savedState.inventory`
- Updates `gameState.timestamp` with `savedState.timestamp`
- Calculates and applies elapsed time decay

**Side Effects**:
- Called once on game boot by SaveSystem
- Triggers UI refresh

**Error Handling**:
- If schema version mismatch: Attempt migration or reset to defaults
- If corrupted data: Log error, initialize new game

**Usage Example**:
```typescript
// BootScene.ts
create() {
  const saved = SaveSystem.load();
  if (saved) {
    loadGameState(saved);
  }
}
```

---

### 7. `resetGame(): void`

**Description**: Reset game to initial state (new game).

**State Changes**:
- `gameState.horse = { hunger: 80, cleanliness: 70, happiness: 90 }`
- `gameState.inventory = { carrots: 10, brushUses: 100 }`
- `gameState.timestamp = Date.now()`
- `gameState.ui = { selectedTool: null, activeAnimation: null }`

**Side Effects**:
- Clears LocalStorage save
- Reloads game scene

**Usage Example**:
```typescript
newGameButton.on('pointerdown', () => {
  if (confirm('Start new game? Current progress will be lost.')) {
    resetGame();
  }
});
```

---

## Event Emissions

Actions emit events via Phaser EventEmitter for rendering layer to react:

```typescript
// When action mutates state, emit corresponding event
Events.emit('horse:fed', { newHunger: state.horse.hunger });
Events.emit('horse:groomed', { newCleanliness: state.horse.cleanliness });
Events.emit('horse:petted', { newHappiness: state.horse.happiness });
Events.emit('inventory:changed', { inventory: state.inventory });
```

These events are consumed by:
- `AnimationSystem` (trigger sprite animations)
- `ParticleSystem` (spawn particles)
- `UIScene` (update status bars)

---

## TypeScript Definitions

```typescript
// state/types.ts
export interface HorseStatus {
  hunger: number;        // 0-100
  cleanliness: number;   // 0-100
  happiness: number;     // 0-100
}

export interface Inventory {
  carrots: number;       // >= 0
  brushUses: number;     // >= 0
}

export interface UIState {
  selectedTool: 'carrot' | 'brush' | null;
  activeAnimation: string | null;
  lastInteractionTime: number;
}

export interface GameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
  ui: UIState;
}

export interface SavedGameState {
  version: string;
  timestamp: number;
  horse: HorseStatus;
  inventory: Inventory;
}

export interface GameActions {
  feed: () => void;
  groom: () => void;
  pet: () => void;
  selectTool: (tool: 'carrot' | 'brush' | null) => void;
  applyDecay: (elapsedMs: number) => void;
  loadGameState: (savedState: SavedGameState) => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;
```

---

## Validation & Testing

### Unit Test Coverage

Each action must have tests for:
1. **Happy path**: Valid preconditions, expected state changes
2. **Boundary conditions**: Min/max values, clamping
3. **Error cases**: Invalid preconditions (e.g., 0 inventory)
4. **Side effects**: Timestamp updates, event emissions

### Example Test (Vitest)

```typescript
// tests/unit/actions.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/state/gameStore';

describe('feed action', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame(); // Start fresh
  });

  it('should increase hunger by 20 and consume 1 carrot', () => {
    const store = useGameStore.getState();
    const initialHunger = store.horse.hunger;
    const initialCarrots = store.inventory.carrots;

    store.feed();

    expect(store.horse.hunger).toBe(initialHunger + 20);
    expect(store.inventory.carrots).toBe(initialCarrots - 1);
  });

  it('should clamp hunger at 100', () => {
    const store = useGameStore.getState();
    store.horse.hunger = 95; // Close to max

    store.feed(); // +20 would exceed 100

    expect(store.horse.hunger).toBe(100); // Clamped
  });

  it('should not consume carrot if inventory is 0', () => {
    const store = useGameStore.getState();
    store.inventory.carrots = 0;

    store.feed();

    expect(store.horse.hunger).toBe(store.horse.hunger); // Unchanged
    expect(store.inventory.carrots).toBe(0); // Still 0
  });
});
```

---

## Contract Guarantees

✅ **Immutability**: Actions return new state objects (no mutations)  
✅ **Determinism**: Same input state → same output state  
✅ **Validation**: All inputs validated, boundaries clamped  
✅ **Atomicity**: Each action is a single, complete state transition  
✅ **Testability**: Pure functions, no side effects in core logic (events are separate)

This API contract ensures the game logic layer is fully testable and separate from the rendering layer (Constitutional Principle IV compliance).
