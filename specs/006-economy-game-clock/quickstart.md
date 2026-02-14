# Quick Start Guide: Economy System with Game Clock

**Feature**: 006-economy-game-clock | **Purpose**: Developer guide for implementing and extending the economy system

---

## Overview

This feature adds:
- **Currency System**: Earn Horseshoes (🪙) from care actions, spend in shop
- **Shop**: Purchase carrots, brush refills, and bundles
- **Game Clock**: Track play session time (HH:MM:SS)
- **Mystery Gifts**: Time-based rewards every 5 minutes
- **Game Over State**: Triggered when all stats reach 0

---

## Quick Implementation Checklist

### Phase 1: Currency System (P1)
- [ ] Extend `GameState` with `currency: number` field
- [ ] Add `earnCurrency(amount)` and `spendCurrency(amount)` actions
- [ ] Modify `feed()`, `groom()`, `pet()` to call `earnCurrency()`
- [ ] Add currency display to UIScene (top-right: "🪙 50")
- [ ] Animate counter updates with Phaser tweens
- [ ] Update SaveSystem to persist currency

### Phase 2: Shop System (P2)
- [ ] Create `/src/scenes/ShopScene.ts`
- [ ] Define `SHOP_ITEMS` in `gameConstants.ts`
- [ ] Implement `purchaseItem(itemId)` action
- [ ] Add shop button to UIScene
- [ ] Build shop item grid UI
- [ ] Add i18n translations for shop

### Phase 3: Game Clock (P3)
- [ ] Add `gameClock: { startTimestamp }` to GameState
- [ ] Implement `startGameClock()`, `getElapsedSeconds()` actions
- [ ] Create `formatGameClock()` utility in `timeUtils.ts`
- [ ] Add clock display to UIScene (bottom-right: "⏱️ 01:23:45")
- [ ] Update every second via Phaser timer

### Phase 4: Mystery Gifts (P4)
- [ ] Add `giftBoxes: GiftBoxState[]` to GameState
- [ ] Implement `spawnGiftBox()` and `claimGiftBox()` actions
- [ ] Create gift box sprite in MainGameScene
- [ ] Add spawn logic (every 5 min, max 3 gifts)
- [ ] Implement reward distribution (50/30/20%)

### Phase 5: Game Over (P5)
- [ ] Add `isGameOver: boolean` to GameState
- [ ] Implement `checkGameOver()` in DecaySystem
- [ ] Create game over overlay in UIScene
- [ ] Disable interactions when game over
- [ ] Add sick horse visual state

---

## Configuration Guide

### 1. Adjust Currency Rewards

**File**: `src/config/gameConstants.ts`

```typescript
export const CURRENCY = {
  STARTING_BALANCE: 50,    // Initial currency on new game
  MAX_BALANCE: 999999,     // Cap to prevent overflow
  REWARDS: {
    FEED: 5,               // 🪙 earned per feed
    GROOM: 3,              // 🪙 earned per groom stroke
    PET: 2,                // 🪙 earned per pet
    GIFT_BONUS: 10         // 🪙 from gift box (20% chance)
  }
};
```

**To change rewards**: Modify the values and restart dev server.

---

### 2. Add or Modify Shop Items

**File**: `src/config/gameConstants.ts`

```typescript
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'carrot_single',
    nameKey: 'shop.item.carrot',     // Translation key
    icon: '🥕',                       // Emoji or sprite key
    price: 5,                         // Cost in 🪙
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
  },
  
  // NEW ITEM EXAMPLE: Premium Bundle
  {
    id: 'premium_bundle',
    nameKey: 'shop.item.premium_bundle',
    icon: '💎',
    price: 25,
    reward: { type: 'carrots', amount: 10 }
  }
];
```

**Steps to add new item**:
1. Add item to `SHOP_ITEMS` array
2. Add translation in `i18nService.ts`:
   ```typescript
   de: { shop: { item: { premium_bundle: "Premium-Paket" } } }
   en: { shop: { item: { premium_bundle: "Premium Bundle" } } }
   ```
3. Restart dev server (hot reload for config)

---

### 3. Change Gift Spawn Interval

**File**: `src/config/gameConstants.ts`

```typescript
export const GAME_CLOCK = {
  GIFT_SPAWN_INTERVAL: 300,  // 5 minutes in seconds
  MAX_UNCLAIMED_GIFTS: 3     // Max gifts on screen at once
};
```

**To spawn gifts more frequently**: Change `300` (5 min) to `180` (3 min) or `60` (1 min for testing).

---

### 4. Adjust Gift Reward Probabilities

**File**: `src/systems/GiftSpawnSystem.ts`

```typescript
getRandomReward(): { type: string; amount: number } {
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

**To make currency more common**: Change thresholds (e.g., `roll < 40` for carrots, rest for currency).

---

## Development Workflows

### Workflow 1: Test Currency Earning

```typescript
// Add debug keybindings in MainGameScene
this.input.keyboard.on('keydown-C', () => {
  const { earnCurrency } = useGameStore.getState();
  earnCurrency(100);  // Give 100 🪙 for testing
  console.log('Currency +100:', useGameStore.getState().currency);
});
```

**Usage**: Press `C` key → Earn 100 🪙 → Test shop purchases without grinding.

---

### Workflow 2: Fast-Forward Game Clock

```typescript
// Debug command to advance clock
this.input.keyboard.on('keydown-T', () => {
  const state = useGameStore.getState();
  const fakeTime = state.gameClock.startTimestamp - (5 * 60 * 1000);  // -5 minutes
  useGameStore.setState({ 
    gameClock: { startTimestamp: fakeTime } 
  });
  console.log('Clock advanced 5 minutes');
});
```

**Usage**: Press `T` key → Clock jumps forward → Instant gift spawn for testing.

---

### Workflow 3: Trigger Game Over

```typescript
// Debug command to drain all stats
this.input.keyboard.on('keydown-G', () => {
  useGameStore.setState({ 
    horse: { hunger: 0, cleanliness: 0, happiness: 0 } 
  });
  console.log('Game Over triggered');
});
```

**Usage**: Press `G` key → All stats = 0 → Game Over overlay appears.

---

### Workflow 4: Reset Everything

```typescript
// Debug command for full reset
this.input.keyboard.on('keydown-R', () => {
  const { reset } = useGameStore.getState();
  reset();  // Calls extended reset with currency, clock, gifts
  console.log('Full reset complete');
});
```

**Usage**: Press `R` key → Game resets (including currency, clock, gifts).

---

## Testing Scenarios

### Scenario 1: Economy Loop

1. Start game (50 🪙 starting balance)
2. Feed horse 3 times → Earn 15 🪙 (total: 65 🪙)
3. Open shop → Buy carrot for 5 🪙
4. Verify: Currency = 60 🪙, Carrots = 11
5. Feed horse with purchased carrot → Verify hunger increases

**Expected Result**: Self-sustaining loop (earn → spend → earn).

---

### Scenario 2: Gift Spawn Timing

1. Start game → Note clock: 00:00:00
2. Wait/fast-forward to 00:05:00
3. Verify: Gift box appears with bounce animation
4. Click gift → Receive random reward
5. Wait to 00:10:00 → Second gift spawns
6. Repeat until 3 gifts on screen
7. Wait to 00:20:00 → No 4th gift spawns (max limit)

**Expected Result**: Gifts spawn reliably every 5 min, max 3 unclaimed.

---

### Scenario 3: Shop Affordability

1. Set currency to 10 🪙 (debug command)
2. Open shop
3. Verify:
   - Carrot (5 🪙): Button active, full opacity
   - Brush Refill (8 🪙): Button active, full opacity
   - Carrot Bundle (15 🪙): Button grayed out, price red
4. Buy 2 carrots (currency → 0 🪙)
5. Verify: All buttons grayed out

**Expected Result**: Real-time affordability checks work.

---

### Scenario 4: Game Over & Recovery

1. Debug-drain all stats to 0
2. Verify:
   - Game Over overlay appears
   - "💔 Dein Pferd braucht dringend Pflege!" message
   - Feed/groom/pet buttons disabled
   - Horse sprite shows sick state
3. Click Reset button
4. Verify:
   - Stats reset to defaults
   - Currency reset to 50 🪙
   - Clock reset to 00:00:00
   - Gifts cleared
   - Overlay hidden

**Expected Result**: Full recovery to initial state.

---

### Scenario 5: Persistence Across Refresh

1. Earn 20 🪙, clock at 00:03:15
2. Refresh page (F5)
3. Verify:
   - Currency = 20 🪙 (persisted)
   - Clock continues from ~00:03:15
4. Play for 2 more minutes → Clock shows ~00:05:15
5. Gift spawns at 00:05:00

**Expected Result**: State persists, clock accurate.

---

## Common Tasks

### Task: Add Debug Panel

**File**: `src/scenes/UIScene.ts`

```typescript
// Create debug panel (top-left corner)
if (import.meta.env.DEV) {
  const debugPanel = this.add.container(10, 10);
  
  const bgRect = this.add.rectangle(0, 0, 200, 150, 0x000000, 0.7);
  bgRect.setOrigin(0);
  
  const debugText = this.add.text(10, 10, '', { 
    fontSize: '12px', 
    color: '#00ff00' 
  });
  
  debugPanel.add([bgRect, debugText]);
  
  // Update every frame
  this.events.on('update', () => {
    const state = useGameStore.getState();
    debugText.setText([
      `Currency: ${state.currency} 🪙`,
      `Clock: ${formatGameClock(getElapsedSeconds())}`,
      `Gifts: ${state.giftBoxes.length}/3`,
      `Game Over: ${state.isGameOver}`,
      `Hunger: ${state.horse.hunger}`,
      `Cleanliness: ${state.horse.cleanliness}`,
      `Happiness: ${state.horse.happiness}`
    ]);
  });
}
```

**Usage**: Always visible in dev mode, shows live state.

---

### Task: Export Save File

```typescript
// Add button to export state as JSON
exportButton.on('pointerdown', () => {
  const state = useGameStore.getState();
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'horse-game-save.json';
  a.click();
});
```

**Usage**: Download save file for debugging or backup.

---

### Task: Import Save File

```typescript
// Add file input to load save
inputElement.on('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const state = JSON.parse(e.target.result as string);
    useGameStore.setState(state);
    console.log('Save loaded:', state);
  };
  reader.readAsText(file);
});
```

**Usage**: Load save file for testing specific states.

---

## Troubleshooting

### Issue: Currency not persisting after refresh

**Cause**: SaveSystem not calling `save()` after currency change.

**Solution**: Ensure `earnCurrency()` and `spendCurrency()` call `SaveSystem.save()`:
```typescript
export const earnCurrency = (amount: number) => {
  // ... state update
  SaveSystem.save();  // ADD THIS
};
```

---

### Issue: Clock drifting over time

**Cause**: Using cumulative timers instead of timestamp-based calculation.

**Solution**: Always calculate from start timestamp:
```typescript
// WRONG (accumulates drift)
let elapsed = 0;
setInterval(() => elapsed++, 1000);

// CORRECT (no drift)
const getElapsedSeconds = () => Math.floor((Date.now() - startTimestamp) / 1000);
```

---

### Issue: Gifts spawning in UI area

**Cause**: Random position not constrained to safe zone.

**Solution**: Update `getRandomSafePosition()` in `GiftSpawnSystem.ts`:
```typescript
const margin = 50;
const uiTopHeight = 100;     // Avoid status bars
const uiBottomHeight = 120;  // Avoid inventory
return {
  x: Phaser.Math.Between(margin, width - margin),
  y: Phaser.Math.Between(uiTopHeight + margin, height - uiBottomHeight - margin)
};
```

---

### Issue: Shop modal behind MainGameScene sprites

**Cause**: Z-index / scene depth ordering issue.

**Solution**: Launch ShopScene as overlay (always on top):
```typescript
this.scene.launch('ShopScene');  // Overlay, not start()
this.shopModal.setDepth(1000);   // Or high depth value
```

---

### Issue: Game Over not triggering

**Cause**: Condition check missing or incorrect.

**Solution**: Verify all 3 stats checked simultaneously:
```typescript
// In DecaySystem after decay tick
const { horse, isGameOver } = useGameStore.getState();
if (horse.hunger === 0 && horse.cleanliness === 0 && horse.happiness === 0 && !isGameOver) {
  useGameStore.setState({ isGameOver: true });
}
```

---

## Performance Optimization Tips

1. **Currency Animation**: Use single tween, don't create new tween per frame
2. **Clock Update**: Update text max once per second (not every frame)
3. **Shop Affordability**: Subscribe to currency changes, not polling every frame
4. **Gift Spawning**: Check interval once per second, not every frame

---

## Next Steps

After implementing this feature:
1. Run full test suite: `npm test`
2. Check test coverage: `npm run test:coverage` (target: ≥70%)
3. Manual test all scenarios above
4. Test on mobile viewport (320px width)
5. Test long session (1+ hour) for drift/performance

**Ready to start? Begin with Phase 1 (Currency System) and work through phases sequentially.**