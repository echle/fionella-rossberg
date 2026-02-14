# Research: Economy System with Game Clock

**Feature**: 006-economy-game-clock | **Phase**: 0 (Research & Decision Making) | **Date**: 2026-02-14

## Purpose

This document resolves technical uncertainties and makes architecture decisions before implementation. Each research question from [plan.md](plan.md) is answered with rationale, alternatives considered, and final decision.

---

## Research Question 1: Currency Counter Animation

**Question**: Which approach for smooth currency counter animation when earning/spending?

### Options Considered:

**A) Phaser Tween with Custom Update Callback**
```typescript
this.tweens.addCounter({
  from: oldValue,
  to: newValue,
  duration: 500,
  onUpdate: (tween) => currencyText.setText(`🪙 ${Math.floor(tween.getValue())}`)
});
```
- ✅ Native to Phaser, no extra dependencies
- ✅ Integrates with game loop timing
- ✅ Easy to control easing curves
- ❌ Requires manual text formatting in callback

**B) CountUp.js Library**
```typescript
const countUp = new CountUp('currency', newValue, { startVal: oldValue });
countUp.start();
```
- ✅ Purpose-built for number animations
- ✅ Rich options (separators, decimals, easing)
- ❌ External dependency (+10 KB)
- ❌ DOM-based, not Phaser-native

**C) Manual requestAnimationFrame Loop**
```typescript
function animateCounter(start, end, duration) {
  const startTime = Date.now();
  const update = () => {
    const t = (Date.now() - startTime) / duration;
    if (t < 1) {
      currencyText.setText(`🪙 ${Math.floor(start + (end - start) * easeOut(t))}`);
      requestAnimationFrame(update);
    }
  };
  update();
}
```
- ✅ Full control over animation
- ✅ No dependencies
- ❌ Reinventing the wheel
- ❌ Complexity for simple feature

### Decision: **Option A - Phaser Tween with Custom Update Callback**

**Rationale**: 
- Aligns with Constitution Principle II (Game Engine Foundation) - "leverage proven engine APIs"
- Already using Phaser tweens for status bar updates (StatusBar.ts)
- Keeps bundle size minimal
- Easy to maintain consistency with other animations

**Implementation Notes**:
- Create reusable `animateCurrencyCounter(from, to, duration, textObject)` utility in UIScene
- Use `Phaser.Math.Easing.Quadratic.Out` for natural deceleration
- Duration: 500ms (fast enough to feel instant, slow enough to notice)

---

## Research Question 2: Shop Scene Architecture

**Question**: How to implement the shop UI overlay?

### Options Considered:

**A) Separate Phaser Scene (Modal Overlay)**
```typescript
class ShopScene extends Phaser.Scene {
  create() {
    // Semi-transparent background
    // Shop grid
    // Purchase logic
  }
}
// Launch: this.scene.launch('ShopScene')
```
- ✅ Clean separation of concerns
- ✅ Independent lifecycle (create/pause/resume)
- ✅ Easier z-index management (scene layer)
- ✅ Can pause MainGameScene while shopping
- ❌ Requires scene communication for state updates

**B) Modal Container in UIScene**
```typescript
class UIScene {
  openShop() {
    this.shopModal = this.add.container(400, 300, [...shopItems]);
    this.shopModal.setVisible(true);
  }
}
```
- ✅ Direct access to UIScene state
- ✅ Simpler state sharing
- ❌ Clutters UIScene responsibility
- ❌ Z-index conflicts possible
- ❌ Harder to isolate for testing

**C) Scene Overlay (Same Scene as MainGameScene)**
```typescript
class MainGameScene {
  openShop() {
    this.shopOverlay = this.add.container(...);
  }
}
```
- ❌ Wrong responsibility (MainGameScene is for gameplay)
- ❌ Violates single responsibility principle
- ❌ Hard to test in isolation

### Decision: **Option A - Separate Phaser Scene (ShopScene)**

**Rationale**:
- Existing project uses multi-scene architecture (BootScene, MainGameScene, UIScene)
- Clean separation aligns with Constitution Principle IV (Testable Game Logic)
- Scene pausing prevents accidental gameplay interactions while shopping
- Precedent: UIScene already overlays MainGameScene successfully

**Implementation Notes**:
- `ShopScene` launched as overlay: `this.scene.launch('ShopScene', { gameStore })`
- Pass Zustand store reference for state access
- Use `this.scene.pause('MainGameScene')` while shop active (optional, prevents gift spawns)
- Close shop: `this.scene.stop('ShopScene')` + `this.scene.resume('MainGameScene')`
- Semi-transparent background: `this.add.rectangle(0, 0, width, height, 0x000000, 0.7)`

---

## Research Question 3: Gift Box Positioning

**Question**: How to randomly position gift boxes without overlapping critical UI or other gifts?

### Options Considered:

**A) Grid-Based Spawn Zones**
```typescript
const spawnZones = [
  { x: 200, y: 150 }, { x: 400, y: 150 }, { x: 600, y: 150 },
  { x: 200, y: 400 }, { x: 400, y: 400 }, { x: 600, y: 400 }
];
const availableZones = spawnZones.filter(zone => !isOccupied(zone));
const zone = Phaser.Utils.Array.GetRandom(availableZones);
```
- ✅ Guaranteed no overlap
- ✅ Predictable distribution
- ❌ Feels less random/organic
- ❌ Limited to predefined positions

**B) Random Position with Collision Detection**
```typescript
let attempts = 0;
let position;
do {
  position = { x: Phaser.Math.Between(50, 750), y: Phaser.Math.Between(100, 500) };
  attempts++;
} while (isOverlapping(position, existingGifts) && attempts < 10);
```
- ✅ Organic, truly random feel
- ✅ Flexible for any viewport size
- ❌ Potential infinite loop if screen full
- ❌ Requires collision check implementation

**C) Constrained Random (Safe Zones)**
```typescript
const safeZone = {
  xMin: 100, xMax: 700,  // Avoid UI at top (0-80px)
  yMin: 150, yMax: 500   // Avoid inventory bar (bottom 100px)
};
const pos = {
  x: Phaser.Math.Between(safeZone.xMin, safeZone.xMax),
  y: Phaser.Math.Between(safeZone.yMin, safeZone.yMax)
};
```
- ✅ Simple implementation
- ✅ Organic random feel
- ✅ Prevents UI overlap via constraints
- ⚠️ Gifts might overlap each other (acceptable with max 3)

### Decision: **Option C - Constrained Random (Safe Zones)**

**Rationale**:
- Max 3 gifts means overlap unlikely (800x600 canvas, gifts ~64x64 = 1% chance)
- Simpler than collision detection
- Responsive: Safe zones calculate based on viewport size
- Aligns with Constitution Principle I (Visual Excellence) - feels natural

**Implementation Notes**:
- Safe zone calculation in `GiftSpawnSystem.getRandomPosition()`:
  ```typescript
  const margin = 50; // Pixels from edge
  const uiTopHeight = 100; // Status bars area
  const uiBottomHeight = 120; // Inventory area
  return {
    x: Phaser.Math.Between(margin, this.scene.scale.width - margin),
    y: Phaser.Math.Between(uiTopHeight + margin, this.scene.scale.height - uiBottomHeight - margin)
  };
  ```
- Mobile adjustment: Center gifts horizontally if width <500px
- If 3 gifts exist, block spawn (edge case: user plays without claiming)

---

## Research Question 4: Game Clock Persistence

**Question**: Store timestamp or elapsed seconds in LocalStorage?

### Options Considered:

**A) Store Start Timestamp**
```typescript
// Save
localStorage.setItem('gameClockStart', Date.now().toString());

// Load & Calculate Elapsed
const start = parseInt(localStorage.getItem('gameClockStart'));
const elapsed = Math.floor((Date.now() - start) / 1000);
```
- ✅ Accurate across refreshes (no drift)
- ✅ Handles tab backgrounding correctly
- ✅ Single source of truth
- ❌ Requires calculation on every render

**B) Store Elapsed Seconds + Last Update Time**
```typescript
// Save
localStorage.setItem('elapsedSeconds', elapsed.toString());
localStorage.setItem('lastUpdate', Date.now().toString());

// Load
const elapsed = parseInt(localStorage.getItem('elapsedSeconds'));
const lastUpdate = parseInt(localStorage.getItem('lastUpdate'));
const additionalElapsed = (Date.now() - lastUpdate) / 1000;
const total = elapsed + additionalElapsed;
```
- ✅ No recalculation needed (cached)
- ❌ Two values to keep in sync
- ❌ Drift accumulates over time
- ❌ More complex save/load logic

**C) Store Elapsed Seconds Only (Update on Save)**
```typescript
// Save (every 10 seconds)
localStorage.setItem('elapsedSeconds', currentElapsed.toString());

// Load
const elapsed = parseInt(localStorage.getItem('elapsedSeconds') || '0');
```
- ✅ Simple schema
- ❌ Loses time between last save and page close
- ❌ Inaccurate if user doesn't trigger save

### Decision: **Option A - Store Start Timestamp**

**Rationale**:
- Accuracy is critical for gift spawn timing (every 5 min must be precise)
- Aligns with existing SaveSystem pattern (timestamp-based)
- Calculation cost negligible (once per second update)
- Prevents all drift scenarios
- Simplest mental model: "Clock started at X, now is Y, elapsed = Y - X"

**Implementation Notes**:
- State schema: `gameClock: { startTimestamp: number | null }`
- Initialize: `startTimestamp = Date.now()` on new game or reset
- Calculate elapsed: `Math.floor((Date.now() - startTimestamp) / 1000)`
- Display: Use `timeUtils.formatGameClock(elapsed)` → "HH:MM:SS"
- Reset: Set `startTimestamp = Date.now()` (restarts clock)

---

## Research Question 5: Game Over Implementation

**Question**: Separate Scene or Overlay in Main/UIScene?

### Options Considered:

**A) Separate GameOverScene**
```typescript
class GameOverScene extends Phaser.Scene {
  create() {
    this.add.overlay(...);
    this.add.text('Game Over');
    this.add.button('Reset', () => resetGame());
  }
}
```
- ✅ Clean separation
- ✅ Testable in isolation
- ❌ Another scene to manage
- ❌ Overkill for simple overlay

**B) Overlay Container in MainGameScene**
```typescript
class MainGameScene {
  showGameOver() {
    this.gameOverOverlay = this.add.container(...);
    this.gameOverOverlay.setVisible(true);
    this.disableInteractions();
  }
}
```
- ✅ Simple implementation
- ✅ Direct access to game objects (disable horse)
- ❌ Clutters MainGameScene
- ❌ Hard to hide/destroy cleanly

**C) Overlay Container in UIScene**
```typescript
class UIScene {
  showGameOver() {
    this.gameOverOverlay = this.add.container(...);
    this.gameOverOverlay.setDepth(1000); // Above everything
  }
}
```
- ✅ Logical fit (UI-related overlay)
- ✅ Already manages other overlays (inventory, status bars)
- ✅ Can listen to store events for game over trigger
- ❌ UIScene growing in responsibility (acceptable for now)

### Decision: **Option C - Overlay Container in UIScene**

**Rationale**:
- UIScene already handles UI overlays (fits responsibility)
- Game Over is primarily a UI concern (message + button)
- Avoids creating another scene for simple feature
- Zustand store event (`isGameOver` change) → UIScene reacts
- Aligns with existing pattern (UIScene listens to store updates)

**Implementation Notes**:
- Create `createGameOverOverlay()` method in UIScene
- Show/hide via `store.subscribe` listener on `isGameOver` flag
- Overlay components:
  - Semi-transparent black rectangle (0x000000, alpha 0.8)
  - Heart-broken emoji + translated message
  - Reset button (reuses existing reset button style)
- Horse sick state: Trigger in MainGameScene via `horse.setSickState()` when `isGameOver = true`
- Disable interactions: Set `store.isGameOver = true` → MainGameScene checks flag before allowing actions

---

## Research Question 6: LocalStorage Schema Extension

**Question**: Extend existing flat schema or create nested structure?

### Current Schema:
```typescript
localStorage.setItem('horseGameState', JSON.stringify({
  version: '1.2.0',
  timestamp: 1707926400000,
  horse: { hunger: 80, cleanliness: 70, happiness: 90 },
  inventory: { carrots: 10, brushUses: 100 },
  feedingState: { satietyTimestamps: [...] },
  locale: 'de'
}));
```

### Options Considered:

**A) Extend Flat Structure (Add Top-Level Keys)**
```typescript
{
  version: '1.3.0',
  timestamp: ...,
  horse: {...},
  inventory: {...},
  feedingState: {...},
  locale: 'de',
  currency: 123,  // NEW
  gameClock: { startTimestamp: 1707926400000 },  // NEW
  giftBoxes: [{ spawnTime: 300, position: {x, y}, claimed: false }],  // NEW
  isGameOver: false  // NEW
}
```
- ✅ Consistent with existing pattern
- ✅ Easy to migrate (add keys with defaults)
- ✅ Flat access: `state.currency` (no nesting traversal)
- ❌ Root level growing (11 keys now)

**B) Nest New Features Under 'economy' Key**
```typescript
{
  version: '1.3.0',
  horse: {...},
  inventory: {...},
  economy: {  // NEW namespace
    currency: 123,
    gameClock: { startTimestamp: ... },
    giftBoxes: [...],
    isGameOver: false
  }
}
```
- ✅ Grouped by feature
- ✅ Cleaner root level
- ❌ Breaks flat pattern (inconsistent)
- ❌ Access: `state.economy.currency` (extra nesting)

### Decision: **Option A - Extend Flat Structure**

**Rationale**:
- Consistency with existing schema pattern
- Zustand store already uses flat structure: `useGameStore(state => state.currency)`
- Simpler save/load logic (no nested merging)
- Migration straightforward: Add keys with defaults if missing

**Implementation Notes**:
- Update SaveSystem schema version: `1.2.0` → `1.3.0`
- New top-level keys:
  - `currency: number` (default: 50)
  - `gameClock: { startTimestamp: number | null }` (default: null)
  - `giftBoxes: GiftBoxState[]` (default: [])
  - `isGameOver: boolean` (default: false)
- Migration function:
  ```typescript
  function migrate_1_2_to_1_3(oldState) {
    return {
      ...oldState,
      version: '1.3.0',
      currency: oldState.currency ?? 50,
      gameClock: oldState.gameClock ?? { startTimestamp: Date.now() },
      giftBoxes: oldState.giftBoxes ?? [],
      isGameOver: oldState.isGameOver ?? false
    };
  }
  ```

---

## Research Question 7: Reward Probability Implementation

**Question**: How to implement weighted random rewards for gift boxes? (50% carrots, 30% brush, 20% currency)

### Options Considered:

**A) Array-Based (Weighted Pool)**
```typescript
const rewardPool = [
  'carrots', 'carrots', 'carrots', 'carrots', 'carrots',  // 5 = 50%
  'brush', 'brush', 'brush',  // 3 = 30%
  'currency', 'currency'  // 2 = 20%
];
const reward = Phaser.Utils.Array.GetRandom(rewardPool);
```
- ✅ Visual/intuitive representation
- ✅ Easy to adjust probabilities (add/remove items)
- ❌ Array overhead (10 elements)
- ❌ Inflexible for precise percentages (e.g., 33.33%)

**B) Threshold-Based (Random 0-100)**
```typescript
const roll = Phaser.Math.Between(0, 99);
let reward;
if (roll < 50) reward = 'carrots';       // 0-49 = 50%
else if (roll < 80) reward = 'brush';    // 50-79 = 30%
else reward = 'currency';                // 80-99 = 20%
```
- ✅ Precise percentage control
- ✅ No array allocation
- ✅ Standard game dev pattern
- ❌ Less visual (needs comments)

**C) Configuration-Based (Reusable)**
```typescript
const rewards = [
  { type: 'carrots', weight: 50 },
  { type: 'brush', weight: 30 },
  { type: 'currency', weight: 20 }
];
function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Phaser.Math.Between(0, total - 1);
  for (const item of items) {
    if (roll < item.weight) return item.type;
    roll -= item.weight;
  }
}
```
- ✅ Configurable (easy to add new rewards)
- ✅ Extensible for future features
- ❌ Over-engineered for 3 rewards
- ❌ Performance overhead (loop + reduce)

### Decision: **Option B - Threshold-Based (Random 0-100)**

**Rationale**:
- Simple, performant, standard approach
- Probabilities unlikely to change frequently (spec-defined)
- Easy to test (mock random number, assert reward type)
- Aligns with game dev best practices (GDC talks, game design patterns)

**Implementation Notes**:
- Implement in `GiftSpawnSystem.getRandomReward()`:
  ```typescript
  getRandomReward(): { type: string; amount: number } {
    const roll = Phaser.Math.Between(0, 99);
    if (roll < 50) return { type: 'carrots', amount: 2 };       // 50%
    if (roll < 80) return { type: 'brushUses', amount: 20 };    // 30%
    return { type: 'currency', amount: 10 };                    // 20%
  }
  ```
- Configuration constants in `gameConstants.ts`:
  ```typescript
  GIFT_REWARDS: {
    CARROTS: { probability: 50, amount: 2 },
    BRUSH: { probability: 30, amount: 20 },
    CURRENCY: { probability: 20, amount: 10 }
  }
  ```
- Unit test: Mock `Phaser.Math.Between` → Assert correct reward for each range

---

## Research Question 8: Shop Item Configuration

**Question**: Hardcode shop items in ShopScene or define in config file?

### Options Considered:

**A) Hardcoded in ShopScene**
```typescript
class ShopScene {
  create() {
    const items = [
      { id: 'carrot', name: 'Karotte', price: 5, reward: { type: 'carrots', amount: 1 } },
      { id: 'brush', name: 'Bürste', price: 8, reward: { type: 'brushUses', amount: 50 } },
      { id: 'bundle', name: 'Mega-Pack', price: 15, reward: { type: 'carrots', amount: 5 } }
    ];
    this.renderShopItems(items);
  }
}
```
- ✅ Quick implementation
- ✅ All logic in one place
- ❌ Hard to extend (need to edit ShopScene)
- ❌ Can't test items without scene instantiation
- ❌ Not reusable (e.g., for future quests/rewards)

**B) Configuration File (gameConstants.ts)**
```typescript
// gameConstants.ts
export const SHOP_ITEMS = [
  { id: 'carrot', nameKey: 'shop.item.carrot', icon: '🥕', price: 5, reward: { type: 'carrots', amount: 1 } },
  { id: 'brush', nameKey: 'shop.item.brush', icon: '🪥', price: 8, reward: { type: 'brushUses', amount: 50 } },
  { id: 'bundle', nameKey: 'shop.item.bundle', icon: '📦', price: 15, reward: { type: 'carrots', amount: 5 } }
];

// ShopScene.ts
import { SHOP_ITEMS } from '../config/gameConstants';
class ShopScene {
  create() {
    this.renderShopItems(SHOP_ITEMS);
  }
}
```
- ✅ Centralized configuration (single source of truth)
- ✅ Easy to extend (add items without touching ShopScene)
- ✅ Testable (import SHOP_ITEMS in tests)
- ✅ Supports i18n (nameKey references)
- ❌ Extra file navigation (minor)

**C) JSON Configuration File**
```typescript
// assets/data/shop-items.json
[
  { "id": "carrot", "nameKey": "shop.item.carrot", ... }
]

// ShopScene.ts
const items = this.cache.json.get('shopItems');
```
- ✅ Hot-reloadable (edit JSON without rebuild)
- ❌ Requires preload step
- ❌ No TypeScript type safety
- ❌ Overkill for 3-5 items

### Decision: **Option B - Configuration File (gameConstants.ts)**

**Rationale**:
- Aligns with existing project pattern (gameConstants.ts used for decay rates, rewards)
- Testable: `import { SHOP_ITEMS }` in unit tests
- Extensible: Future features (quests, achievements) can reference same config
- Type-safe: TypeScript validates ShopItem structure
- Maintainable: Game designers can adjust prices without touching scene code

**Implementation Notes**:
- Define `ShopItem` interface in `types.ts`:
  ```typescript
  export interface ShopItem {
    id: string;
    nameKey: string;  // i18n key
    icon: string;  // Emoji or sprite key
    price: number;  // Cost in 🪙
    reward: {
      type: 'carrots' | 'brushUses' | 'currency';
      amount: number;
    };
  }
  ```
- Export from `gameConstants.ts`:
  ```typescript
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
- Add i18n keys to `i18nService.ts` translations

---

## Summary of Decisions

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| Currency Animation | Phaser Tween | Native engine API, consistent with existing tweens |
| Shop Architecture | Separate Scene | Clean separation, testable, follows multi-scene pattern |
| Gift Positioning | Constrained Random | Simple, organic feel, safe zones prevent UI overlap |
| Clock Persistence | Timestamp | Accurate across refreshes, no drift |
| Game Over UI | Overlay in UIScene | UI concern, fits existing pattern, avoids extra scene |
| Storage Schema | Flat Extension | Consistent with existing structure, simple migration |
| Reward Probability | Threshold-Based | Standard game dev pattern, simple, testable |
| Shop Config | gameConstants.ts | Type-safe, testable, extensible, follows project pattern |

**All research questions resolved. Proceed to Phase 1: Design Artifacts.**