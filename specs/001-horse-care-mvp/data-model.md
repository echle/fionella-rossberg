# Data Model: Horse Care Game MVP

**Purpose**: Define the core entities, their attributes, relationships, and state transitions for the horse care game.

## Entity Definitions

### 1. GameState (Root State Object)

**Description**: The central state container managed by Zustand. Represents the entire game state at any point in time.

**Attributes**:
- `version`: string - Schema version for save compatibility (e.g., "1.0.0")
- `timestamp`: number - Unix timestamp (milliseconds) of last save
- `horse`: HorseStatus - The horse's current status values
- `inventory`: Inventory - Player's available care items
- `ui`: UIState - UI-specific transient state (not persisted)

**Relationships**:
- Contains one HorseStatus
- Contains one Inventory
- Contains one UIState

**State Transitions**:
- Initialize: On first load or new game → default values
- Update: On player interaction → modified by actions
- Save: Periodically or on interaction → serialized to LocalStorage
- Load: On game boot → deserialized from LocalStorage

**Validation Rules**:
- Version must match save file version or trigger migration
- Timestamp must be valid Unix timestamp > 0
- All nested objects must be present (no null/undefined)

---

### 2. HorseStatus

**Description**: Represents the horse's three care status values (needs).

**Attributes**:
- `hunger`: number - 0-100, represents how full the horse is
- `cleanliness`: number - 0-100, represents how clean the horse is
- `happiness`: number - 0-100, represents the horse's mood

**Relationships**:
- Owned by GameState (composition)
- Mapped to StatusBar UI components (1:1 for each attribute)

**State Transitions**:
- **Feed Action**: hunger += 20 (capped at 100)
- **Groom Action**: cleanliness += 5 per stroke (capped at 100)
- **Pet Action**: happiness += 10 (capped at 100)
- **Decay Tick**: All values -= decay rate per time interval
  - hunger: -1 per 6 seconds (~10 minutes to 0)
  - cleanliness: -1 per 12 seconds (~20 minutes to 0)
  - happiness: -1 per 7.5 seconds (~12.5 minutes to 0)

**Validation Rules**:
- All values MUST be integers in range [0, 100]
- Values MUST clamp at boundaries (no negatives, no > 100)
- Decay MUST calculate based on elapsed time, not frame count

**Initial Values** (New Game):
```typescript
{
  hunger: 80,
  cleanliness: 70,
  happiness: 90
}
```

---

### 3. Inventory

**Description**: Player's collection of care items (consumables and tools).

**Attributes**:
- `carrots`: number - Count of carrots available (0-∞)
- `brushUses`: number - Remaining brush strokes available (0-∞)

**Relationships**:
- Owned by GameState (composition)
- Consumed by care actions (Feed, Groom)

**State Transitions**:
- **Feed Action**: carrots -= 1 (if carrots > 0)
- **Groom Stroke**: brushUses -= 1 (if brushUses > 0)
- **Shop/Refill** (future): carrots += N, brushUses += N

**Validation Rules**:
- Values MUST be non-negative integers
- Cannot be consumed below 0 (check before action)
- UI must reflect unavailability when count = 0

**Initial Values** (New Game):
```typescript
{
  carrots: 10,
  brushUses: 100
}
```

---

### 4. UIState (Transient, Not Persisted)

**Description**: Temporary UI state that doesn't need persistence across sessions.

**Attributes**:
- `selectedTool`: ToolType | null - Currently selected inventory item
  - ToolType: "carrot" | "brush" | null
- `activeAnimation`: string | null - Currently playing animation ID
- `lastInteractionTime`: number - Timestamp of last player interaction (for debouncing)

**Relationships**:
- Owned by GameState (composition)
- NOT saved to LocalStorage (resets on reload)

**State Transitions**:
- **Select Tool**: selectedTool = "carrot" | "brush"
- **Deselect Tool**: selectedTool = null
- **Start Animation**: activeAnimation = animationID
- **End Animation**: activeAnimation = null

**Validation Rules**:
- selectedTool must be valid ToolType or null
- Cannot select tool if inventory count is 0

**Initial Values**:
```typescript
{
  selectedTool: null,
  activeAnimation: null,
  lastInteractionTime: 0
}
```

---

### 5. Horse (Entity, Not State - Rendering Layer)

**Description**: Phaser GameObject representing the horse sprite and its visual behavior. This is NOT part of the Zustand state—it's a Phaser Scene entity that READS from state.

**Attributes**:
- `sprite`: Phaser.GameObjects.Sprite - The visual sprite object
- `animations`: Map<string, Phaser.Animations.Animation> - Animation clips
  - "idle": Default loop animation
  - "eating": Eating carrot animation
  - "happy": Being petted animation
- `position`: {x, y} - Screen coordinates

**Relationships**:
- Reads from GameState.horse for status values
- Triggers actions when clicked/tapped
- Renders particles (hearts, sparkles) via Phaser ParticleEmitter

**State Transitions** (Animation):
- **Idle**: Default state, loops continuously
- **Eating**: Plays once when fed, returns to idle
- **Happy**: Plays once when petted, returns to idle
- **Grooming**: Continuous while brush is dragged, shows sparkles

**Behavior Rules**:
- Sprite position adapts to screen size (Phaser Scale Manager)
- Animations triggered by UIScene commands (event-driven)
- Hit box slightly larger than visual sprite for easier tapping

---

### 6. StatusBar (UI Component, Not State)

**Description**: Visual progress bar representing one status value (hunger, cleanliness, or happiness).

**Attributes**:
- `label`: string - "Hunger" | "Sauberkeit" | "Glück"
- `currentValue`: number - 0-100 (synced from GameState)
- `maxValue`: number - Always 100
- `color`: string - Bar fill color (e.g., "#FF5733" for hunger)
- `position`: {x, y} - Screen coordinates

**Relationships**:
- Reads from one attribute of GameState.horse
- Rendered by UIScene

**State Transitions**:
- **Value Change**: Animates from old value to new value (smooth tween)
- **Color Change**: Green (80-100), Yellow (40-79), Red (0-39) based on value

**Rendering Rules**:
- Bar fill width = (currentValue / maxValue) * barWidth
- Updates every frame via Phaser update loop
- Shows percentage text overlay: "75/100"

---

### 7. InventorySlot (UI Component, Not State)

**Description**: Visual representation of one inventory item with icon and count.

**Attributes**:
- `itemType`: "carrot" | "brush"
- `icon`: Phaser.GameObjects.Image - Item icon sprite
- `countText`: Phaser.GameObjects.Text - "x10" or "Uses: 100"
- `isSelected`: boolean - Highlighted if selectedTool matches
- `isAvailable`: boolean - Grayed out if count = 0

**Relationships**:
- Reads from GameState.inventory
- Updates GameState.ui.selectedTool when clicked

**State Transitions**:
- **Click**: Toggle selection (select if not selected, deselect if already selected)
- **Count Update**: Re-render count text when inventory changes
- **Availability**: Grayed out when count reaches 0

**Rendering Rules**:
- Selected: Yellow border glow
- Unavailable: 50% opacity + red "X" overlay
- Count text positioned bottom-right of icon

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         GameState (Zustand)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ horse: {hunger, cleanliness, happiness}                 ││
│  │ inventory: {carrots, brushUses}                         ││
│  │ ui: {selectedTool, activeAnimation}                     ││
│  │ version, timestamp                                      ││
│  └─────────────────────────────────────────────────────────┘│
└────────┬─────────────────────────────────┬──────────────────┘
         │                                 │
         │ READ                            │ WRITE (via actions)
         │                                 │
┌────────▼─────────┐              ┌────────▼──────────┐
│  Phaser Scene    │              │  Player Actions   │
│  (Rendering)     │              │ (Event Handlers)  │
│                  │              │                   │
│  - Horse sprite  │              │  - feed()         │
│  - StatusBars    │◄────────────►│  - groom()        │
│  - Inventory UI  │   triggers   │  - pet()          │
│  - Particles     │              │  - selectTool()   │
└──────────────────┘              └───────────────────┘
         │                                 │
         │ render loop                     │ state updates
         │ (60 FPS)                        │ (on interaction)
         │                                 │
         ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Browser APIs                             │
│  - Canvas (via Phaser WebGL/Canvas renderer)               │
│  - LocalStorage (via SaveSystem)                            │
│  - requestAnimationFrame (via Phaser game loop)             │
└─────────────────────────────────────────────────────────────┘
```

## Data Persistence

### LocalStorage Schema

**Key**: `fionella-horse-game-save`  
**Value**: JSON string of SavedGameState

```typescript
interface SavedGameState {
  version: string;           // "1.0.0"
  timestamp: number;         // Unix ms
  horse: {
    hunger: number;          // 0-100
    cleanliness: number;     // 0-100
    happiness: number;       // 0-100
  };
  inventory: {
    carrots: number;         // 0-10 initially
    brushUses: number;       // 0-100 initially
  };
}
```

### Save Triggers

- **Auto-save**: Every 10 seconds (background interval)
- **Interaction save**: After any care action (feed/groom/pet)
- **Unload save**: On browser tab close/refresh (window.onbeforeunload)

### Load Process

1. Check LocalStorage for key `fionella-horse-game-save`
2. If exists:
   - Parse JSON
   - Validate schema version
   - Calculate elapsed time since timestamp
   - Apply decay to status values based on elapsed time
   - Load into Zustand store
3. If not exists:
   - Initialize with default values (new game)

### Migration Strategy (Future)

For version 2.0.0+ with schema changes:
- Check `version` field
- Apply migration transform function
- Save updated version

---

## State Update Patterns

### Feed Action

```typescript
// actions.ts
export const feed = (state: GameState) => {
  if (state.inventory.carrots <= 0) {
    console.warn("No carrots available");
    return state; // No change
  }
  
  return {
    ...state,
    horse: {
      ...state.horse,
      hunger: Math.min(100, state.horse.hunger + 20) // Clamp at 100
    },
    inventory: {
      ...state.inventory,
      carrots: state.inventory.carrots - 1
    },
    timestamp: Date.now() // Update save timestamp
  };
};
```

### Decay Tick

```typescript
// DecaySystem.ts
export const applyDecay = (state: GameState, elapsedMs: number): GameState => {
  const secondsElapsed = elapsedMs / 1000;
  
  const hungerDecay = Math.floor(secondsElapsed / 6);       // -1 per 6s
  const cleanlinessDecay = Math.floor(secondsElapsed / 12); // -1 per 12s
  const happinessDecay = Math.floor(secondsElapsed / 7.5);  // -1 per 7.5s
  
  return {
    ...state,
    horse: {
      hunger: Math.max(0, state.horse.hunger - hungerDecay),
      cleanliness: Math.max(0, state.horse.cleanliness - cleanlinessDecay),
      happiness: Math.max(0, state.horse.happiness - happinessDecay)
    },
    timestamp: Date.now()
  };
};
```

---

## Summary

**State Management**: Zustand handles pure game state (status, inventory, timestamp)  
**Rendering**: Phaser handles visuals (sprites, animations, particles)  
**Separation**: Game logic doesn't touch Phaser objects directly → testable  
**Persistence**: LocalStorage with elapsed time restoration on reload

This model ensures constitutional compliance (Principle IV: Testable Game Logic) by keeping state pure and separate from rendering.
