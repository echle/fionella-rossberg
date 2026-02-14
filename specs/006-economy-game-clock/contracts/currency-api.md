# Currency System API Contract

**Purpose**: Define the public API for currency earning, spending, and balance management.

## Action Signatures

### 1. `earnCurrency(amount: number): void`

**Description**: Award Horseshoes (🪙) to the player after completing a care action or claiming a gift.

**Parameters**:
- `amount`: number - Horseshoes to add (should be positive integer)

**Preconditions**:
- amount > 0
- amount is integer

**State Changes**:
- `gameState.currency = Math.min(gameState.currency + amount, 999999)` (capped at max)
- `gameState.timestamp = Date.now()`

**Side Effects**:
- Triggers save to LocalStorage
- Animates currency counter in UI (smooth tween from old to new value)
- If cap reached, shows toast: "Max Hufeisen erreicht! / Max Horseshoes reached!"

**Error Handling**:
- If amount ≤ 0: Log warning, return unchanged state
- If amount not integer: Log warning, floor to integer
- If overflow would occur: Silently cap at 999,999

**Usage Example**:
```typescript
// In actions.ts - after feed action completes
const { earnCurrency } = useGameStore.getState();
earnCurrency(5);  // Feed reward

// After groom action
earnCurrency(3);  // Groom reward

// After pet action
earnCurrency(2);  // Pet reward
```

**Typical Reward Amounts**:
- Feed action: +5 🪙
- Groom stroke: +3 🪙
- Pet interaction: +2 🪙
- Gift box (20% chance): +10 🪙

---

### 2. `spendCurrency(amount: number): boolean`

**Description**: Deduct Horseshoes from player balance. Returns success/failure to indicate if transaction was valid.

**Parameters**:
- `amount`: number - Horseshoes to deduct (should be positive integer)

**Preconditions**:
- amount > 0
- amount is integer
- `gameState.currency >= amount` (sufficient funds)

**State Changes** (if successful):
- `gameState.currency -= amount`
- `gameState.timestamp = Date.now()`

**Returns**:
- `true` if transaction succeeded (sufficient funds, currency deducted)
- `false` if transaction failed (insufficient funds, no change)

**Side Effects** (if successful):
- Triggers save to LocalStorage
- Animates currency counter decrease in UI

**Error Handling**:
- If amount ≤ 0: Return false, log warning
- If amount not integer: Return false, log warning
- If insufficient funds: Return false, no state change, no log (expected behavior)

**Usage Example**:
```typescript
// In ShopScene or purchaseItem action
const { spendCurrency } = useGameStore.getState();
const success = spendCurrency(shopItem.price);

if (success) {
  grantReward(shopItem.reward);  // Add items to inventory
  showSuccessAnimation();
} else {
  showErrorMessage('shop.error.insufficient_funds');
}
```

---

### 3. `canAfford(price: number): boolean`

**Description**: Check if player has enough currency to afford an item without mutating state.

**Parameters**:
- `price`: number - Cost to check against

**Preconditions**:
- None (read-only check)

**State Changes**:
- None (pure function)

**Returns**:
- `true` if `gameState.currency >= price`
- `false` otherwise

**Side Effects**:
- None

**Usage Example**:
```typescript
// In ShopScene to disable/enable buttons
const { currency, canAfford } = useGameStore.getState();

SHOP_ITEMS.forEach(item => {
  const affordable = canAfford(item.price);
  button.setAlpha(affordable ? 1.0 : 0.3);  // Gray out if too expensive
  button.setInteractive(affordable);
});
```

**Real-time Updates**:
```typescript
// Subscribe to currency changes in ShopScene
useGameStore.subscribe(
  state => state.currency,
  (currency) => {
    // Re-evaluate affordability for all items
    updateShopButtonStates();
  }
);
```

---

### 4. `getCurrencyBalance(): number`

**Description**: Get current currency balance (read-only accessor).

**Parameters**:
- None

**Preconditions**:
- None

**State Changes**:
- None (pure function)

**Returns**:
- Current value of `gameState.currency`

**Side Effects**:
- None

**Usage Example**:
```typescript
// In UIScene to display balance
const balance = useGameStore(state => state.currency);
currencyText.setText(`🪙 ${balance}`);
```

---

## Integration with Existing Systems

### Currency Earning Flow (actions.ts)

**Modify existing action to award currency after completion:**

```typescript
// Before (Feature 001)
export const feed = () => {
  const state = get();
  if (state.inventory.carrots <= 0) return;
  
  set({
    horse: { ...state.horse, hunger: Math.min(state.horse.hunger + 20, 100) },
    inventory: { ...state.inventory, carrots: state.inventory.carrots - 1 },
    timestamp: Date.now()
  });
  SaveSystem.save();
};

// After (Feature 006)
export const feed = () => {
  const state = get();
  if (state.inventory.carrots <= 0) return;
  
  set({
    horse: { ...state.horse, hunger: Math.min(state.horse.hunger + 20, 100) },
    inventory: { ...state.inventory, carrots: state.inventory.carrots - 1 },
    timestamp: Date.now()
  });
  
  // NEW: Award currency after successful feed
  earnCurrency(5);
  
  SaveSystem.save();
};
```

**Same pattern for groom (+3 🪙) and pet (+2 🪙).**

---

### Shop Purchase Flow

**New purchaseItem action that orchestrates spend + reward:**

```typescript
export const purchaseItem = (itemId: string) => {
  const state = get();
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  
  if (!item) {
    console.error(`Shop item not found: ${itemId}`);
    return false;
  }
  
  // Check affordability
  if (!canAfford(item.price)) {
    return false;  // Insufficient funds
  }
  
  // Atomic transaction: deduct currency + grant reward
  const spendSuccess = spendCurrency(item.price);
  if (!spendSuccess) return false;  // Should never happen after canAfford check
  
  // Grant reward based on type
  switch (item.reward.type) {
    case 'carrots':
      set({ inventory: { ...state.inventory, carrots: state.inventory.carrots + item.reward.amount } });
      break;
    case 'brushUses':
      set({ inventory: { ...state.inventory, brushUses: state.inventory.brushUses + item.reward.amount } });
      break;
    case 'currency':
      earnCurrency(item.reward.amount);  // Meta: buying currency with currency (bonus rewards)
      break;
  }
  
  SaveSystem.save();
  return true;
};
```

---

## State Schema Extension

```typescript
interface GameState {
  // ... existing properties
  
  // NEW in v1.3.0
  currency: number;  // 0-999,999 Horseshoes
}
```

---

## Constants

```typescript
// config/gameConstants.ts
export const CURRENCY = {
  STARTING_BALANCE: 50,
  MAX_BALANCE: 999999,
  REWARDS: {
    FEED: 5,
    GROOM: 3,
    PET: 2,
    GIFT_BONUS: 10
  }
};
```

---

## Error Messages (i18n)

```typescript
// Add to i18nService translations
{
  "de": {
    "currency": {
      "label": "Hufeisen",
      "max_reached": "Max Hufeisen erreicht!",
      "insufficient": "Nicht genug Hufeisen!"
    }
  },
  "en": {
    "currency": {
      "label": "Horseshoes",
      "max_reached": "Max Horseshoes reached!",
      "insufficient": "Not enough Horseshoes!"
    }
  }
}
```

---

## Testing Requirements

### Unit Tests:

```typescript
describe('Currency System', () => {
  it('should earn currency and cap at max', () => {
    gameStore.setState({ currency: 999995 });
    earnCurrency(10);
    expect(gameStore.getState().currency).toBe(999999);  // Capped
  });
  
  it('should spend currency if affordable', () => {
    gameStore.setState({ currency: 50 });
    const success = spendCurrency(20);
    expect(success).toBe(true);
    expect(gameStore.getState().currency).toBe(30);
  });
  
  it('should reject spend if insufficient funds', () => {
    gameStore.setState({ currency: 10 });
    const success = spendCurrency(20);
    expect(success).toBe(false);
    expect(gameStore.getState().currency).toBe(10);  // Unchanged
  });
  
  it('should check affordability correctly', () => {
    gameStore.setState({ currency: 15 });
    expect(canAfford(10)).toBe(true);
    expect(canAfford(15)).toBe(true);
    expect(canAfford(16)).toBe(false);
  });
});
```

---

## Performance Considerations

- **earnCurrency()**: O(1) - Simple addition
- **spendCurrency()**: O(1) - Simple subtraction + boolean check
- **canAfford()**: O(1) - Comparison only
- **UI animation**: 500ms tween (60 FPS, ~30 frames)

**No performance concerns. All operations constant time.**