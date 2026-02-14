# Game Clock & Gift System API Contract

**Purpose**: Define the public API for game clock timing and time-based mystery gift spawning.

---

## Game Clock API

### 1. `startGameClock(): void`

**Description**: Initialize the game clock by setting the start timestamp to current time.

**Preconditions**:
- None (can be called at any time, even if already started)

**State Changes**:
- `gameState.gameClock.startTimestamp = Date.now()`
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Resets elapsed time to 00:00:00
- Clears any existing gift boxes (fresh session)

**Usage Example**:
```typescript
// On new game or reset
const { startGameClock } = useGameStore.getState();
startGameClock();
```

---

### 2. `getElapsedSeconds(): number`

**Description**: Calculate elapsed play time in seconds since clock started.

**Parameters**:
- None

**Preconditions**:
- `gameState.gameClock.startTimestamp !== null`

**Returns**:
- Elapsed seconds as integer
- Returns 0 if clock not started

**State Changes**:
- None (pure calculation)

**Calculation**:
```typescript
const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
return elapsed;
```

**Usage Example**:
```typescript
// In UIScene to update clock display
const elapsed = getElapsedSeconds();
const formatted = formatGameClock(elapsed);  // "01:23:45"
clockText.setText(`⏱️ ${formatted}`);
```

---

### 3. `formatGameClock(seconds: number): string`

**Description**: Format elapsed seconds into HH:MM:SS display format.

**Parameters**:
- `seconds`: number - Total elapsed seconds

**Returns**:
- Formatted string in HH:MM:SS format
- Handles times beyond 99:59:59 (e.g., "123:45:32")

**Implementation**:
```typescript
// utils/timeUtils.ts
export function formatGameClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
```

**Examples**:
```typescript
formatGameClock(0);      // "00:00:00"
formatGameClock(65);     // "00:01:05"
formatGameClock(3661);   // "01:01:01"
formatGameClock(36000);  // "10:00:00"
formatGameClock(360000); // "100:00:00"
```

---

### 4. `resetGameClock(): void`

**Description**: Reset the game clock to 00:00:00 (restart timing from now).

**Preconditions**:
- None

**State Changes**:
- `gameState.gameClock.startTimestamp = Date.now()`
- `gameState.giftBoxes = []` (clear all gifts)
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Clears all unclaimed gift boxes from screen
- Resets gift spawn timer (next gift at 5 min from now)

**Usage Example**:
```typescript
// In reset() action (actions.ts)
const { resetGameClock, clearGiftBoxes } = useGameStore.getState();
resetGameClock();
```

---

## Gift Box System API

### 5. `spawnGiftBox(): GiftBoxState | null`

**Description**: Spawn a new mystery gift box if conditions are met (5-minute interval, max 3 unclaimed).

**Preconditions**:
- `getElapsedSeconds() % 300 === 0` (every 5 minutes)
- `gameState.giftBoxes.length < 3` (max limit not reached)

**State Changes** (if spawned):
- New `GiftBoxState` added to `gameState.giftBoxes` array
- `gameState.timestamp = Date.now()`

**Returns**:
- `GiftBoxState` object if spawned
- `null` if spawn conditions not met

**Gift Box Structure**:
```typescript
interface GiftBoxState {
  id: string;                    // unique ID (e.g., "gift_1707926700000")
  spawnTime: number;             // game clock seconds when spawned
  position: { x: number; y: number };  // screen coordinates
  claimed: boolean;              // false until clicked
}
```

**Position Calculation** (Safe Zone):
```typescript
function getRandomSafePosition(scene: Phaser.Scene): { x: number; y: number } {
  const margin = 50;
  const uiTopHeight = 100;     // Status bars
  const uiBottomHeight = 120;  // Inventory bar
  
  return {
    x: Phaser.Math.Between(margin, scene.scale.width - margin),
    y: Phaser.Math.Between(
      uiTopHeight + margin, 
      scene.scale.height - uiBottomHeight - margin
    )
  };
}
```

**Usage Example**:
```typescript
// In MainGameScene update() or GiftSpawnSystem
const elapsed = getElapsedSeconds();

if (elapsed > 0 && elapsed % 300 === 0 && !this.lastSpawnTime === elapsed) {
  const gift = spawnGiftBox();
  
  if (gift) {
    this.createGiftSprite(gift);  // Render sprite
    this.lastSpawnTime = elapsed;  // Prevent duplicate spawn
  }
}
```

---

### 6. `claimGiftBox(giftId: string): { type: string; amount: number } | null`

**Description**: Claim a gift box when clicked, granting random reward and removing from state.

**Parameters**:
- `giftId`: string - Unique ID of gift to claim

**Preconditions**:
- Gift exists in `gameState.giftBoxes` array
- Gift not already claimed (`claimed === false`)

**State Changes**:
- Remove gift from `gameState.giftBoxes` array
- Grant reward to inventory/currency
- `gameState.timestamp = Date.now()`

**Returns**:
- Reward object: `{ type: 'carrots' | 'brushUses' | 'currency', amount: number }`
- `null` if gift not found or already claimed

**Reward Probabilities**:
```typescript
function getRandomGiftReward(): { type: string; amount: number } {
  const roll = Phaser.Math.Between(0, 99);
  
  if (roll < 50) {
    return { type: 'carrots', amount: 2 };       // 50% chance
  } else if (roll < 80) {
    return { type: 'brushUses', amount: 20 };    // 30% chance
  } else {
    return { type: 'currency', amount: 10 };     // 20% chance
  }
}
```

**Usage Example**:
```typescript
// In MainGameScene - gift sprite click handler
giftSprite.on('pointerdown', () => {
  const reward = claimGiftBox(gift.id);
  
  if (reward) {
    showRewardAnimation(reward);           // Fly to inventory/currency UI
    destroyGiftSprite(giftSprite);         // Remove visual
    
    // Grant reward
    if (reward.type === 'carrots') {
      gameStore.setState({ inventory: { ...inventory, carrots: inventory.carrots + reward.amount } });
    } else if (reward.type === 'brushUses') {
      gameStore.setState({ inventory: { ...inventory, brushUses: inventory.brushUses + reward.amount } });
    } else if (reward.type === 'currency') {
      earnCurrency(reward.amount);
    }
  }
});
```

---

### 7. `getUnclaimedGiftBoxes(): GiftBoxState[]`

**Description**: Get all unclaimed gift boxes (for rendering or persistence).

**Returns**:
- Array of `GiftBoxState` objects where `claimed === false`
- Empty array if no unclaimed gifts

**Usage Example**:
```typescript
// In MainGameScene.create() - restore gifts after page refresh
const gifts = getUnclaimedGiftBoxes();
gifts.forEach(gift => {
  this.createGiftSprite(gift);  // Re-render sprites
});
```

---

### 8. `clearGiftBoxes(): void`

**Description**: Remove all gift boxes from state and screen (used on reset).

**State Changes**:
- `gameState.giftBoxes = []`
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Destroys all gift sprites in MainGameScene
- Triggers save to LocalStorage

**Usage Example**:
```typescript
// In reset() action
const { clearGiftBoxes } = useGameStore.getState();
clearGiftBoxes();

// MainGameScene listens to state change
useGameStore.subscribe(
  state => state.giftBoxes,
  (gifts) => {
    if (gifts.length === 0) {
      this.destroyAllGiftSprites();
    }
  }
);
```

---

## Gift Spawn Timing Logic

### Spawn Intervals

```
Game Clock    | Action
------------- | ------
00:00:00      | Clock starts
00:04:59      | No gift
00:05:00      | Gift #1 spawns
00:09:59      | No gift
00:10:00      | Gift #2 spawns
00:14:59      | No gift
00:15:00      | Gift #3 spawns
00:20:00      | No spawn (max 3 unclaimed)
[User claims Gift #1]
00:25:00      | Gift #4 spawns (now only 3 unclaimed)
```

### Missed Spawns on Page Load

**Scenario**: User plays for 10 minutes, closes tab, reopens 1 hour later.

**Expected Behavior**:
- Elapsed time = 70 minutes (4200 seconds)
- Missed spawn intervals: 5, 10, 15, 20, 25, 30, ... 70 min = 14 gifts
- Spawn up to 3 gifts immediately on load

**Implementation**:
```typescript
// In BootScene or MainGameScene.create()
function handleMissedGifts() {
  const elapsed = getElapsedSeconds();
  const completedIntervals = Math.floor(elapsed / 300);
  const existingGifts = getUnclaimedGiftBoxes().length;
  const giftsToSpawn = Math.min(3 - existingGifts, Math.max(0, completedIntervals - existingGifts));
  
  for (let i = 0; i < giftsToSpawn; i++) {
    spawnGiftBox();
  }
}
```

---

## UI Display

### Clock Display (UIScene)

```typescript
// Create clock text in UIScene
this.clockText = this.add.text(
  this.scale.width - 150, 
  this.scale.height - 30, 
  '⏱️ 00:00:00', 
  { fontSize: '18px', color: '#ffffff' }
);

// Update every second
this.time.addEvent({
  delay: 1000,
  callback: () => {
    const elapsed = getElapsedSeconds();
    const formatted = formatGameClock(elapsed);
    this.clockText.setText(`⏱️ ${formatted}`);
  },
  loop: true
});
```

### Gift Box Sprite (MainGameScene)

```typescript
function createGiftSprite(gift: GiftBoxState): Phaser.GameObjects.Sprite {
  const sprite = this.add.sprite(gift.position.x, gift.position.y, 'giftBox');
  sprite.setInteractive({ useHandCursor: true });
  
  // Bounce animation on spawn
  sprite.setScale(0);
  this.tweens.add({
    targets: sprite,
    scale: 1,
    duration: 500,
    ease: 'Elastic.easeOut'
  });
  
  // Click handler
  sprite.on('pointerdown', () => {
    const reward = claimGiftBox(gift.id);
    if (reward) {
      showRewardFlyAnimation(sprite, reward);
      sprite.destroy();
    }
  });
  
  return sprite;
}
```

---

## State Schema Extension

```typescript
interface GameState {
  // ... existing properties
  
  // NEW in v1.3.0
  gameClock: {
    startTimestamp: number | null;  // Unix timestamp (ms) when clock started
  };
  giftBoxes: GiftBoxState[];         // Array of unclaimed gifts (max 3)
}

interface GiftBoxState {
  id: string;
  spawnTime: number;                 // Game clock seconds
  position: { x: number; y: number };
  claimed: boolean;
}
```

---

## Constants

```typescript
// config/gameConstants.ts
export const GAME_CLOCK = {
  GIFT_SPAWN_INTERVAL: 300,  // 5 minutes in seconds
  MAX_UNCLAIMED_GIFTS: 3
};

export const GIFT_REWARDS = {
  CARROTS: { probability: 50, amount: 2 },
  BRUSH: { probability: 30, amount: 20 },
  CURRENCY: { probability: 20, amount: 10 }
};
```

---

## Testing Requirements

### Unit Tests:

```typescript
describe('Game Clock', () => {
  it('should format time correctly', () => {
    expect(formatGameClock(0)).toBe('00:00:00');
    expect(formatGameClock(65)).toBe('00:01:05');
    expect(formatGameClock(3661)).toBe('01:01:01');
    expect(formatGameClock(360000)).toBe('100:00:00');
  });
  
  it('should calculate elapsed time accurately', () => {
    const start = Date.now();
    gameStore.setState({ gameClock: { startTimestamp: start } });
    
    // Mock 5 minutes later
    jest.spyOn(Date, 'now').mockReturnValue(start + 300000);
    expect(getElapsedSeconds()).toBe(300);
  });
  
  it('should reset clock correctly', () => {
    gameStore.setState({ 
      gameClock: { startTimestamp: Date.now() - 600000 },  // 10 min ago
      giftBoxes: [{...}]  // Some gifts
    });
    
    resetGameClock();
    
    expect(getElapsedSeconds()).toBe(0);
    expect(gameStore.getState().giftBoxes.length).toBe(0);
  });
});

describe('Gift Box System', () => {
  it('should spawn gift at 5-minute interval', () => {
    gameStore.setState({ 
      gameClock: { startTimestamp: Date.now() - 300000 },  // 5 min ago
      giftBoxes: []
    });
    
    const gift = spawnGiftBox();
    expect(gift).not.toBeNull();
    expect(gift.spawnTime).toBe(300);
  });
  
  it('should not spawn if 3 gifts already exist', () => {
    gameStore.setState({ 
      gameClock: { startTimestamp: Date.now() - 300000 },
      giftBoxes: [{...}, {...}, {...}]  // 3 gifts
    });
    
    const gift = spawnGiftBox();
    expect(gift).toBeNull();
  });
  
  it('should claim gift and grant random reward', () => {
    const mockGift = { 
      id: 'gift_123', 
      spawnTime: 300, 
      position: {x: 200, y: 200}, 
      claimed: false 
    };
    gameStore.setState({ giftBoxes: [mockGift], inventory: { carrots: 0 } });
    
    jest.spyOn(Phaser.Math, 'Between').mockReturnValue(25);  // 50% -> carrots
    const reward = claimGiftBox('gift_123');
    
    expect(reward).toEqual({ type: 'carrots', amount: 2 });
    expect(gameStore.getState().giftBoxes.length).toBe(0);
  });
});
```

---

## Performance Considerations

- **Clock Update**: Once per second (negligible CPU)
- **Spawn Check**: Once per frame (O(1) modulo operation)
- **Gift Sprites**: Max 3 simultaneous (low memory)
- **Position Calculation**: O(1) random generation

**No performance concerns. All operations constant time or low frequency.**