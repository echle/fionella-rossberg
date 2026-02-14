# Data Model: Economy System with Game Clock

**Feature**: 006-economy-game-clock | **Purpose**: Define entities, attributes, relationships, and state transitions for the economy system

---

## Entity Definitions

### 1. CurrencyState (Part of GameState)

**Description**: Tracks player's Horseshoe (🪙) currency balance earned through care actions and spent in the shop.

**Attributes**:
- `currency`: number - Current balance of Horseshoes (0-999,999)

**Relationships**:
- Part of root GameState (flat structure)
- Modified by care actions (+5/+3/+2) and shop purchases (-N)
- Persisted to LocalStorage on every transaction

**State Transitions**:
- **Earn Currency**: currency += amount (capped at 999,999)
  - Feed action → +5 🪙
  - Groom action → +3 🪙
  - Pet action → +2 🪙
  - Gift claim (20% chance) → +10 🪙
- **Spend Currency**: currency -= price (only if currency >= price)
  - Shop purchase → currency -= item.price
- **Reset**: currency = 50 (starting capital)

**Validation Rules**:
- MUST be non-negative integer (0 ≤ currency ≤ 999,999)
- Cannot spend more than current balance (checked before transaction)
- Earning beyond cap is silently ignored (with optional toast notification)
- Persisted after every change

**Initial Value** (New Game):
```typescript
currency: 50  // Starting capital
```

**Storage**:
```typescript
// LocalStorage key: horseGameState
{
  version: '1.3.0',
  currency: 50,  // NEW in v1.3.0
  // ... other state
}
```

---

### 2. GameClockState (Part of GameState)

**Description**: Tracks elapsed play session time using a timestamp-based approach for accuracy across page refreshes.

**Attributes**:
- `gameClock`: object - Clock state container
  - `startTimestamp`: number | null - Unix timestamp (ms) when clock started

**Relationships**:
- Part of root GameState (flat structure)
- Used by GiftSpawnSystem to calculate spawn times (every 5 minutes)
- Displayed in UIScene as formatted time (HH:MM:SS)
- Persisted to LocalStorage

**State Transitions**:
- **Start Clock**: startTimestamp = Date.now() (on new game or reset)
- **Calculate Elapsed**: elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000)
- **Reset Clock**: startTimestamp = Date.now() (restarts from 00:00:00)

**Validation Rules**:
- startTimestamp MUST be valid Unix timestamp (milliseconds) or null
- Elapsed time calculated on-demand (not stored) to prevent drift
- Clock continues during tab backgrounding (Date.now() handles it)
- No maximum time limit (can run for days)

**Initial Value** (New Game):
```typescript
gameClock: {
  startTimestamp: null  // Set to Date.now() on first play
}
```

**Derived Values** (NOT persisted):
```typescript
// Calculated in utils/timeUtils.ts
elapsedSeconds: number = Math.floor((Date.now() - startTimestamp) / 1000)
formattedTime: string = formatGameClock(elapsedSeconds)  // "01:23:45"
```

**Example Timeline**:
```
00:00:00 - Game starts (startTimestamp = 1707926400000)
00:05:00 - First gift spawns (elapsedSeconds = 300)
00:10:00 - Second gift spawns (elapsedSeconds = 600)
01:00:00 - One hour played (elapsedSeconds = 3600)
[Page refresh]
01:00:05 - Clock resumes accurately (Date.now() - startTimestamp)
```

---

### 3. GiftBoxState (Array in GameState)

**Description**: Represents one Mystery Gift Box that spawns every 5 minutes of game time. Multiple gift boxes can exist simultaneously (max 3 unclaimed).

**Attributes**:
- `id`: string - Unique identifier (UUID or `gift_${timestamp}`)
- `spawnTime`: number - Game clock seconds when gift spawned (e.g., 300 for 5 min)
- `position`: {x: number, y: number} - Screen coordinates (pixels)
- `claimed`: boolean - Whether gift has been clicked and reward granted

**Relationships**:
- Stored as array in GameState: `giftBoxes: GiftBoxState[]`
- Rendered as interactive sprites in MainGameScene
- Spawned by GiftSpawnSystem every 5 minutes
- Cleared on game reset

**State Transitions**:
- **Spawn**: New gift added to array when elapsedSeconds % 300 === 0 (every 5 min)
- **Claim**: Gift clicked → reward granted → `claimed = true` → removed from array
- **Reset**: `giftBoxes = []` when game resets

**Validation Rules**:
- Max 3 unclaimed gifts in array at once (spawn blocked if length >= 3)
- Position MUST be within safe zone (not overlapping UI)
  - xMin: 50px, xMax: width - 50px
  - yMin: 150px (below status bars), yMax: height - 120px (above inventory)
- spawnTime MUST be multiple of 300 seconds (5 min intervals)
- Persisted to LocalStorage (handle missed spawns on load)

**Initial Value** (New Game):
```typescript
giftBoxes: []  // Empty array, gifts spawn during play
```

**Example State**:
```typescript
giftBoxes: [
  {
    id: 'gift_1707926700000',
    spawnTime: 300,  // 5 minutes
    position: { x: 250, y: 300 },
    claimed: false
  },
  {
    id: 'gift_1707927000000',
    spawnTime: 600,  // 10 minutes
    position: { x: 500, y: 250 },
    claimed: false
  }
]
```

**Lifecycle Diagram**:
```
[Clock: 04:59] → [Clock: 05:00] → Spawn Gift
                                   ↓
                           [Gift visible on screen]
                                   ↓
                     [Player clicks gift] → Claim
                                   ↓
                        [Random reward granted]
                        - 50%: +2 carrots
                        - 30%: +20 brush uses
                        - 20%: +10 currency
                                   ↓
                        [Gift removed from array]
```

---

### 4. ShopItem (Configuration, Not State)

**Description**: Static configuration defining purchasable items in the shop. NOT persisted in state—loaded from gameConstants.ts.

**Attributes**:
- `id`: string - Unique identifier (e.g., "carrot_single", "brush_refill")
- `nameKey`: string - i18n translation key (e.g., "shop.item.carrot")
- `icon`: string - Emoji or sprite key (e.g., "🥕", "brush_icon")
- `price`: number - Cost in Horseshoes (e.g., 5 🪙)
- `reward`: object - What player receives on purchase
  - `type`: "carrots" | "brushUses" | "currency"
  - `amount`: number

**Relationships**:
- Exported from `config/gameConstants.ts`
- Imported by ShopScene for rendering
- Used by purchase validation logic (canAfford check)

**State Transitions**:
- **Static Configuration** (no state transitions)
- Purchase logic: `if (canAfford(item.price)) { grantReward(item.reward); deductCurrency(item.price); }`

**Validation Rules**:
- price MUST be positive integer > 0
- reward.amount MUST be positive integer > 0
- reward.type MUST match inventory field names

**Example Configuration**:
```typescript
// config/gameConstants.ts
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'carrot_single',
    nameKey: 'shop.item.carrot',
    icon: '🥕',
    price: 5,
    reward: { type: 'carrots', amount: 1 }
  },
  {
    id: 'brush_refill',
    nameKey: 'shop.item.brush_refill',
    icon: '🪥',
    price: 8,
    reward: { type: 'brushUses', amount: 50 }
  },
  {
    id: 'carrot_bundle',
    nameKey: 'shop.item.carrot_bundle',
    icon: '📦',
    price: 15,
    reward: { type: 'carrots', amount: 5 }
  }
];
```

---

### 5. GameOverState (Flag in GameState)

**Description**: Boolean flag indicating whether the game is in Game Over state (all three stats = 0 simultaneously).

**Attributes**:
- `isGameOver`: boolean - True when game over condition met

**Relationships**:
- Part of root GameState (flat structure)
- Checked by DecaySystem after each decay tick
- Triggers UI overlay in UIScene
- Disables care interactions in MainGameScene
- Persisted to LocalStorage (though rarely loaded in Game Over state)

**State Transitions**:
- **Check Condition**: After decay tick → `isGameOver = (hunger === 0 && cleanliness === 0 && happiness === 0)`
- **Trigger Game Over**: `isGameOver = true` → Show overlay, disable interactions, set horse sick state
- **Reset**: `isGameOver = false` → Clear overlay, enable interactions, restore horse state

**Validation Rules**:
- MUST check all three stats simultaneously (not triggered if only one/two are zero)
- Decay continues while game over (stats can stay at 0)
- Only reset can clear game over state

**Initial Value** (New Game):
```typescript
isGameOver: false
```

**State Diagram**:
```
[Normal Play]
     ↓
[Decay Tick: hunger/cleanliness/happiness -= 1]
     ↓
[Check: all 3 stats === 0?]
     ├─ No → Continue play
     └─ Yes → isGameOver = true
         ↓
     [Game Over State]
     - Overlay shown (💔 message)
     - Interactions disabled
     - Horse sprite: sick state
     - Only Reset button active
         ↓
     [Player clicks Reset]
         ↓
     [isGameOver = false, stats reset, clock reset]
         ↓
     [Normal Play resumes]
```

---

## Updated GameState Schema (v1.3.0)

```typescript
interface GameState {
  // Existing (v1.0.0 - v1.2.0)
  version: string;                    // "1.3.0"
  timestamp: number;                  // Last save time (ms)
  horse: HorseStatus;                 // { hunger, cleanliness, happiness }
  inventory: Inventory;               // { carrots, brushUses }
  ui: UIState;                        // { selectedTool, activeAnimation, lastInteractionTime } [transient]
  feedingState: FeedingState;         // { isEating, eatStartTime, satietyTimestamps } [partially transient]
  locale: string;                     // "de" | "en"

  // NEW in v1.3.0 (Feature 006)
  currency: number;                   // 0-999,999 Horseshoes
  gameClock: {
    startTimestamp: number | null;    // Unix timestamp (ms) when clock started
  };
  giftBoxes: GiftBoxState[];          // Array of unclaimed gift boxes (max 3)
  isGameOver: boolean;                // Game over state flag
}
```

**Migration Function**:
```typescript
function migrateToV1_3_0(oldState: any): GameState {
  // Handle v1.2.0 → v1.3.0
  if (oldState.version === '1.2.0') {
    return {
      ...oldState,
      version: '1.3.0',
      currency: 50,  // Starting capital
      gameClock: {
        startTimestamp: Date.now()  // Initialize clock
      },
      giftBoxes: [],  // No gifts yet
      isGameOver: false
    };
  }
  return oldState;
}
```

---

## State Transition Diagrams

### Economy Loop (Currency Lifecycle)

```
[Player performs care action]
     ↓
[Action completes]
     ├─ Feed (+5 🪙)
     ├─ Groom (+3 🪙)
     └─ Pet (+2 🪙)
     ↓
[currency += reward]
[Animate counter: old → new]
     ↓
[Save to LocalStorage]
     ↓
[Player opens Shop]
     ↓
[Browse items, check affordability]
     ├─ currency < item.price → Button grayed out
     └─ currency >= item.price → Button active
         ↓
     [Player clicks Buy]
         ↓
     [Validate: canAfford(item.price)?]
         ├─ No → Show error message
         └─ Yes → Continue
             ↓
         [Atomic transaction]
         - currency -= item.price
         - inventory[item.reward.type] += item.reward.amount
             ↓
         [Success animation]
         [Save to LocalStorage]
             ↓
         [Shop updates affordability indicators]
             ↓
         [Player can buy more or close shop]
```

### Gift Spawn & Claim Flow

```
[Game Clock ticking]
     ↓
[elapsedSeconds % 300 === 0] (every 5 min)
     ↓
[Check: giftBoxes.length < 3?]
     ├─ No → Skip spawn (max limit)
     └─ Yes → Continue
         ↓
     [Generate new gift]
     - spawnTime = elapsedSeconds
     - position = getRandomSafePosition()
     - claimed = false
         ↓
     [Add to giftBoxes array]
     [Create sprite in MainGameScene]
     [Bounce animation]
         ↓
     [Gift visible on screen]
         ↓
     [Player clicks gift sprite]
         ↓
     [Get random reward]
     - Roll 0-99
     - 0-49: +2 carrots (50%)
     - 50-79: +20 brush uses (30%)
     - 80-99: +10 currency (20%)
         ↓
     [Grant reward to inventory/currency]
     [Reward animation (fly to UI)]
     [Mark gift claimed]
     [Remove from giftBoxes array]
     [Destroy sprite]
         ↓
     [Save to LocalStorage]
```

### Game Over & Recovery Flow

```
[DecaySystem tick]
     ↓
[Apply decay to stats]
- hunger -= 1
- cleanliness -= 1
- happiness -= 1
     ↓
[Check Game Over condition]
isGameOver = (hunger === 0 && cleanliness === 0 && happiness === 0)
     ├─ False → Continue normal play
     └─ True → Trigger Game Over
         ↓
     [isGameOver = true]
     [Save to LocalStorage]
         ↓
     [UIScene reacts to state change]
     - Show Game Over overlay
     - Display message: "💔 Dein Pferd braucht dringend Pflege!"
     - Show Reset button
         ↓
     [MainGameScene reacts]
     - Disable care interactions
     - Set horse.setSickState()
     - Stop decay timers (optional)
         ↓
     [Player clicks Reset button]
         ↓
     [Reset action triggered]
     - horse: { hunger: 80, cleanliness: 70, happiness: 90 }
     - inventory: { carrots: 10, brushUses: 100 }
     - currency: 50
     - gameClock: { startTimestamp: Date.now() }
     - giftBoxes: []
     - isGameOver: false
     - feedingState: reset
         ↓
     [Save to LocalStorage]
     [UIScene hides overlay]
     [MainGameScene enables interactions]
     [Horse sprite returns to idle]
         ↓
     [Normal play resumes]
```

---

## Persistence Strategy

### LocalStorage Keys:
- **Main State**: `horseGameState` (JSON string)

### Save Triggers:
1. **Auto-save** (every 10 seconds via timer)
2. **On currency change** (earn/spend)
3. **On shop purchase**
4. **On gift claim**
5. **On game clock start/reset**
6. **On game over trigger**
7. **On page unload** (beforeunload event)

### Save Priority:
- Critical: currency, inventory (must persist to prevent exploits)
- Important: gameClock.startTimestamp (for accurate elapsed time)
- Normal: giftBoxes (re-spawnon load acceptable)
- Low: isGameOver (rarely loaded in this state)

### Load Behavior:
```typescript
// On game boot (BootScene)
const savedState = localStorage.getItem('horseGameState');
if (savedState) {
  const state = JSON.parse(savedState);
  
  // Apply migrations if needed
  const migratedState = migrate(state);
  
  // Restore state to Zustand store
  gameStore.setState(migratedState);
  
  // Handle missed gift spawns (if page closed for hours)
  const elapsed = Math.floor((Date.now() - migratedState.gameClock.startTimestamp) / 1000);
  const missedIntervals = Math.floor(elapsed / 300) - migratedState.giftBoxes.length;
  if (missedIntervals > 0) {
    spawnMissedGifts(Math.min(missedIntervals, 3));  // Max 3 gifts
  }
  
  // Check if game over state persisted (edge case)
  if (migratedState.isGameOver) {
    showGameOverOverlay();
  }
} else {
  // New game: Initialize defaults
  gameStore.setState(getDefaultState());
}
```

---

## Relationships Between Entities

```
GameState (Root)
├── currency: number
├── gameClock: GameClockState
│   └── startTimestamp: number | null
├── giftBoxes: GiftBoxState[]
│   ├── [0]: { id, spawnTime, position, claimed }
│   ├── [1]: { id, spawnTime, position, claimed }
│   └── [2]: { id, spawnTime, position, claimed }
└── isGameOver: boolean

SHOP_ITEMS (Static Config in gameConstants.ts)
├── [0]: { id, nameKey, icon, price, reward }
├── [1]: { id, nameKey, icon, price, reward }
└── [2]: { id, nameKey, icon, price, reward }

// Interactions:
- Care Actions → currency += reward
- Shop Purchase → currency -= price, inventory += reward
- Gift Claim → inventory/currency += reward
- Clock → elapsedSeconds → Gift Spawn Logic
- Decay Tick → Game Over Check → isGameOver flag
```

---

## Testing Considerations

### Unit Test Scenarios:

1. **Currency Validation**:
   - Earn currency: 45 + 5 → 50
   - Cap enforcement: 999,995 + 10 → 999,999 (capped)
   - Spend validation: 10 - 15 → Fail (insufficient funds)

2. **Game Clock Accuracy**:
   - Start: timestamp = 1707926400000
   - After 5 min: elapsed = 300 seconds
   - After refresh: elapsed = Math.floor((Date.now() - timestamp) / 1000)

3. **Gift Spawn Logic**:
   - Elapsed 299s → No spawn
   - Elapsed 300s → Spawn gift
   - Elapsed 600s → Spawn gift
   - 3 gifts exist → Elapsed 900s → No spawn (max limit)

4. **Game Over Condition**:
   - hunger = 0, cleanliness = 5, happiness = 0 → isGameOver = false
   - hunger = 0, cleanliness = 0, happiness = 0 → isGameOver = true
   - Reset → isGameOver = false

### Integration Test Scenarios:

1. **Economy Loop**:
   - Feed horse → Earn 5 🪙 → Open shop → Buy carrot (5 🪙) → Inventory +1, Currency 0

2. **Gift Lifecycle**:
   - Play for 5 min → Gift spawns → Click gift → Receive reward → Gift removed

3. **Persistence**:
   - Earn 20 🪙 → Refresh page → Currency = 20 (persisted)
   - Play for 10 min → Refresh → Clock continues from ~10 min

4. **Game Over & Recovery**:
   - Drain all stats → Game Over triggers → Click Reset → Game resumes normally

---

## Summary

This data model extends the existing GameState with four new top-level entities:
1. **currency** (number) - Player wealth
2. **gameClock** (object) - Timestamp-based play timer
3. **giftBoxes** (array) - Spawned mystery gifts
4. **isGameOver** (boolean) - Failure state flag

All entities integrate cleanly with existing systems:
- Currency earned via actions.ts (feed/groom/pet)
- Shop purchases update inventory via same actions
- Clock enables time-based features (gifts, future quests)
- Game Over adds stakes without disrupting core loop

**State transitions are deterministic, testable, and persist across sessions via LocalStorage.**