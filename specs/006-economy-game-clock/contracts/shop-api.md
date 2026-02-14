# Shop System API Contract

**Purpose**: Define the public API for shop UI, item purchasing, and inventory management through the shop.

## Shop Scene Interface

### ShopScene.create()

**Description**: Initialize the shop modal scene with item grid and purchase handlers.

**Scene Launch**:
```typescript
// From UIScene when shop button clicked
this.scene.launch('ShopScene', { 
  gameStore: useGameStore 
});
```

**Scene Components**:
- Semi-transparent background overlay (blocks MainGameScene interaction)
- Shop title text (translated)
- Item grid (2-3 columns, responsive)
- Close button (X icon, top-right)
- Currency display (live-updated balance)

---

## Action Signatures

### 1. `purchaseItem(itemId: string): boolean`

**Description**: Purchase a shop item using currency, granting the reward to inventory.

**Parameters**:
- `itemId`: string - Unique item identifier (e.g., "carrot_single", "brush_refill")

**Preconditions**:
- Item exists in SHOP_ITEMS configuration
- `gameState.currency >= item.price` (affordable)

**State Changes** (if successful):
- `gameState.currency -= item.price`
- `gameState.inventory[item.reward.type] += item.reward.amount`
- `gameState.timestamp = Date.now()`

**Returns**:
- `true` if purchase succeeded
- `false` if purchase failed (item not found or insufficient funds)

**Side Effects**:
- Triggers save to LocalStorage
- Plays success animation (checkmark, particle effects)
- Updates shop button states (re-check affordability)
- Animates inventory counter increase

**Error Handling**:
- If itemId not found: Return false, log error
- If insufficient funds: Return false, show toast "Nicht genug Hufeisen!"
- If reward type invalid: Return false, log error

**Usage Example**:
```typescript
// In ShopScene buy button handler
buyButton.on('pointerdown', () => {
  const success = purchaseItem(item.id);
  
  if (success) {
    showPurchaseSuccessAnimation();
    updateAllButtonStates();  // Re-check affordability
  } else {
    showInsufficientFundsMessage();
  }
});
```

---

### 2. `getShopItems(): ShopItem[]`

**Description**: Retrieve the list of all available shop items from configuration.

**Parameters**:
- None

**Returns**:
- Array of `ShopItem` objects from `SHOP_ITEMS` constant

**Side Effects**:
- None (read-only)

**Usage Example**:
```typescript
// In ShopScene.create()
const items = getShopItems();

items.forEach((item, index) => {
  const itemCard = createItemCard(item, index);
  this.add.existing(itemCard);
});
```

---

### 3. `isItemAffordable(itemId: string): boolean`

**Description**: Check if player can afford a specific shop item.

**Parameters**:
- `itemId`: string - Item to check

**Returns**:
- `true` if `gameState.currency >= item.price`
- `false` otherwise

**Side Effects**:
- None (pure function)

**Usage Example**:
```typescript
// Update button states when currency changes
useGameStore.subscribe(
  state => state.currency,
  () => {
    SHOP_ITEMS.forEach(item => {
      const affordable = isItemAffordable(item.id);
      updateButtonState(item.id, affordable);
    });
  }
);
```

---

## Shop Item Configuration

### ShopItem Interface

```typescript
export interface ShopItem {
  id: string;              // Unique identifier
  nameKey: string;         // i18n translation key
  icon: string;            // Emoji or sprite key
  price: number;           // Cost in Horseshoes
  reward: {
    type: 'carrots' | 'brushUses' | 'currency';
    amount: number;
  };
}
```

### Default Shop Items (gameConstants.ts)

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

---

## Shop Scene Lifecycle

### Open Shop

```typescript
// UIScene - Shop button handler
shopButton.on('pointerdown', () => {
  this.scene.launch('ShopScene');
  this.scene.pause('MainGameScene');  // Optional: prevent gameplay during shopping
});
```

### Close Shop

```typescript
// ShopScene - Close button or outside click
closeButton.on('pointerdown', () => {
  this.scene.stop('ShopScene');
  this.scene.resume('MainGameScene');
});

// Close on click outside modal
background.on('pointerdown', (pointer) => {
  if (!shopModal.getBounds().contains(pointer.x, pointer.y)) {
    this.scene.stop('ShopScene');
  }
});
```

---

## UI Components

### Item Card

**Visual Structure:**
```
┌────────────────────┐
│   Icon (🥕)        │  Large emoji/sprite
│   Name (Karotte)   │  Translated text
│   Price (5 🪙)     │  Currency icon + amount
│   [  Kaufen  ]     │  Buy button
└────────────────────┘
```

**States:**
- **Affordable**: Full opacity, active button, white price text
- **Too Expensive**: 0.3 opacity, grayed button, red price text
- **Hover** (desktop): Scale 1.05x, subtle shadow
- **Purchase Success**: Green flash animation, checkmark overlay

**Phaser Implementation:**
```typescript
class ItemCard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, item) {
    super(scene, x, y);
    
    // Icon
    const icon = scene.add.text(0, -40, item.icon, { fontSize: '48px' });
    
    // Name
    const name = scene.add.text(0, 0, i18n.t(item.nameKey), { fontSize: '16px' });
    
    // Price
    const price = scene.add.text(0, 20, `${item.price} 🪙`, { fontSize: '14px' });
    
    // Buy button
    const button = createButton(scene, 0, 50, i18n.t('shop.button.buy'));
    button.on('pointerdown', () => purchaseItem(item.id));
    
    this.add([icon, name, price, button]);
    this.updateAffordability();
  }
  
  updateAffordability() {
    const affordable = isItemAffordable(this.item.id);
    this.setAlpha(affordable ? 1.0 : 0.3);
    this.buyButton.setInteractive(affordable);
    this.priceText.setColor(affordable ? '#ffffff' : '#ff0000');
  }
}
```

---

## Animation Specifications

### Shop Open Animation

```typescript
// ShopScene.create()
this.shopModal.setScale(0);  // Start invisible
this.tweens.add({
  targets: this.shopModal,
  scale: 1,
  duration: 300,
  ease: 'Back.easeOut'  // Slight overshoot for juice
});
```

### Shop Close Animation

```typescript
this.tweens.add({
  targets: this.shopModal,
  scale: 0,
  duration: 200,
  ease: 'Back.easeIn',
  onComplete: () => this.scene.stop('ShopScene')
});
```

### Purchase Success

```typescript
// Green flash
this.cameras.main.flash(200, 0, 255, 0, false, (camera, progress) => {
  if (progress === 1) {
    // Show checkmark
    const checkmark = this.add.text(x, y, '✓', { fontSize: '64px', color: '#00ff00' });
    this.tweens.add({
      targets: checkmark,
      alpha: 0,
      y: y - 50,
      duration: 1000,
      onComplete: () => checkmark.destroy()
    });
  }
});

// Animate inventory count increase
const oldCount = inventory.carrots;
const newCount = oldCount + item.reward.amount;
this.tweens.addCounter({
  from: oldCount,
  to: newCount,
  duration: 500,
  onUpdate: (tween) => {
    inventoryText.setText(Math.floor(tween.getValue()));
  }
});
```

---

## Error Messages (i18n)

```typescript
{
  "de": {
    "shop": {
      "title": "🛒 Shop",
      "button": {
        "buy": "Kaufen",
        "close": "Schließen"
      },
      "item": {
        "carrot": "Karotte",
        "brush_refill": "Bürsten-Nachfüllung",
        "carrot_bundle": "Karotten-Paket"
      },
      "error": {
        "insufficient_funds": "Nicht genug Hufeisen!",
        "item_not_found": "Artikel nicht gefunden"
      }
    }
  },
  "en": {
    "shop": {
      "title": "🛒 Shop",
      "button": {
        "buy": "Buy",
        "close": "Close"
      },
      "item": {
        "carrot": "Carrot",
        "brush_refill": "Brush Refill",
        "carrot_bundle": "Carrot Bundle"
      },
      "error": {
        "insufficient_funds": "Not enough Horseshoes!",
        "item_not_found": "Item not found"
      }
    }
  }
}
```

---

## Testing Requirements

### Unit Tests:

```typescript
describe('Shop System', () => {
  it('should purchase item when affordable', () => {
    gameStore.setState({ currency: 50, inventory: { carrots: 0 } });
    const success = purchaseItem('carrot_single');  // 5 🪙
    
    expect(success).toBe(true);
    expect(gameStore.getState().currency).toBe(45);
    expect(gameStore.getState().inventory.carrots).toBe(1);
  });
  
  it('should reject purchase when insufficient funds', () => {
    gameStore.setState({ currency: 3, inventory: { carrots: 0 } });
    const success = purchaseItem('carrot_single');  // 5 🪙
    
    expect(success).toBe(false);
    expect(gameStore.getState().currency).toBe(3);  // Unchanged
    expect(gameStore.getState().inventory.carrots).toBe(0);  // Unchanged
  });
  
  it('should handle bundle purchase correctly', () => {
    gameStore.setState({ currency: 50, inventory: { carrots: 0 } });
    const success = purchaseItem('carrot_bundle');  // 15 🪙 → 5 carrots
    
    expect(success).toBe(true);
    expect(gameStore.getState().currency).toBe(35);
    expect(gameStore.getState().inventory.carrots).toBe(5);
  });
});
```

### Integration Tests:

```typescript
describe('Shop Scene', () => {
  it('should update button states when currency changes', () => {
    // Open shop with 50 currency
    gameStore.setState({ currency: 50 });
    const scene = new ShopScene();
    scene.create();
    
    // All items should be affordable
    expect(scene.getButton('carrot_single').alpha).toBe(1.0);
    expect(scene.getButton('brush_refill').alpha).toBe(1.0);
    expect(scene.getButton('carrot_bundle').alpha).toBe(1.0);
    
    // Spend currency (e.g., buy bundle)
    gameStore.setState({ currency: 10 });
    
    // Bundle should now be grayed out
    expect(scene.getButton('carrot_single').alpha).toBe(1.0);  // 5 🪙 - affordable
    expect(scene.getButton('brush_refill').alpha).toBe(1.0);   // 8 🪙 - affordable
    expect(scene.getButton('carrot_bundle').alpha).toBe(0.3);  // 15 🪙 - too expensive
  });
});
```

---

## Performance Considerations

- **Item List**: Max ~10 items (negligible rendering cost)
- **Affordability Checks**: O(1) per item, triggered only on currency change
- **Animation**: 300ms modal open, 200ms close (60 FPS)
- **Grid Layout**: Static positioning (no real-time recalculation)

**No performance concerns for expected shop sizes (<20 items).**