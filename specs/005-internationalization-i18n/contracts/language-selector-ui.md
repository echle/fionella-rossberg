# Contract: Language Selector UI Component

## Component Specification

### LanguageSelector

UI-Komponente zur Sprachwahl im Spiel.

```typescript
class LanguageSelector {
  constructor(scene: Phaser.Scene, x: number, y: number);
  
  /**
   * Initialize the language selector UI
   */
  create(): void;
  
  /**
   * Update the visual state (highlight current language)
   */
  update(): void;
  
  /**
   * Clean up resources
   */
  destroy(): void;
}
```

## Visual Design

### Layout Options

**Option 1: Flags Side-by-Side**
```
🇩🇪  🇬🇧
```
- Aktuell gewählte Sprache hat Border oder Scale-Effekt
- Klick auf Flag wechselt Sprache

**Option 2: Dropdown-Style**
```
[🇩🇪 Deutsch ▼]
  → 🇬🇧 English
```
- Zeigt aktuell gewählte Sprache
- Klick öffnet Dropdown mit anderen Sprachen

**Option 3: Toggle Button**
```
[ DE | EN ]
```
- Aktive Sprache ist hervorgehoben
- Klick auf andere Sprache wechselt

**Empfehlung:** Option 1 oder 3 (einfachste Implementation)

### Position
- **Standard:** Oben rechts in der UIScene
- **Koordinaten:** `(gameWidth - 100, 20)` (relative Position)
- **Z-Index:** Über anderen UI-Elementen

### Styling
```typescript
const style = {
  fontSize: '24px',
  color: '#ffffff',
  backgroundColor: '#00000080',
  padding: '10px',
  borderRadius: '8px'
};

const activeStyle = {
  ...style,
  backgroundColor: '#4CAF50',
  fontWeight: 'bold'
};
```

## Behavior Specification

### Interaction Flow

```
User clicks language button
  ↓
LanguageSelector detects click
  ↓
Call i18nService.setLanguage(newLang)
  ↓
i18nService emits 'languageChanged' event
  ↓
UIScene updates all text elements
  ↓
LanguageSelector updates visual state
```

### States

**Idle State:**
- Shows both language options
- Current language is highlighted
- Hover effect on inactive language

**Clicking State:**
- Slight scale animation (1.0 → 1.1 → 1.0)
- Language switches immediately
- UI texts update

**After Switch:**
- New language is highlighted
- Old language returns to normal style
- LocalStorage is updated

## Implementation Example

```typescript
// File: src/components/LanguageSelector.ts

import Phaser from 'phaser';
import { i18nService } from '../services/i18nService';

export class LanguageSelector {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private deButton!: Phaser.GameObjects.Text;
  private enButton!: Phaser.GameObjects.Text;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
  }

  create(): void {
    // Create DE button
    this.deButton = this.scene.add.text(0, 0, '🇩🇪 DE', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    // Create EN button
    this.enButton = this.scene.add.text(60, 0, '🇬🇧 EN', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    // Add click handlers
    this.deButton.on('pointerdown', () => this.switchLanguage('de'));
    this.enButton.on('pointerdown', () => this.switchLanguage('en'));

    // Hover effects
    this.deButton.on('pointerover', () => this.deButton.setScale(1.1));
    this.deButton.on('pointerout', () => this.deButton.setScale(1.0));
    this.enButton.on('pointerover', () => this.enButton.setScale(1.1));
    this.enButton.on('pointerout', () => this.enButton.setScale(1.0));

    // Container for positioning
    this.container = this.scene.add.container(this.x, this.y, [
      this.deButton,
      this.enButton
    ]);

    // Initial state
    this.update();
  }

  update(): void {
    const currentLang = i18nService.getCurrentLanguage();
    
    // Highlight active language
    if (currentLang === 'de') {
      this.deButton.setBackgroundColor('#4CAF50');
      this.enButton.setBackgroundColor('#00000080');
    } else {
      this.deButton.setBackgroundColor('#00000080');
      this.enButton.setBackgroundColor('#4CAF50');
    }
  }

  private switchLanguage(lang: string): void {
    i18nService.setLanguage(lang);
    this.update();
    
    // Trigger scene to update texts
    this.scene.events.emit('languageChanged');
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
```

## Integration with UIScene

```typescript
// File: src/scenes/UIScene.ts

import { LanguageSelector } from '../components/LanguageSelector';
import { i18nService } from '../services/i18nService';

export class UIScene extends Phaser.Scene {
  private languageSelector!: LanguageSelector;
  private hungerText!: Phaser.GameObjects.Text;
  // ... other UI elements

  create(): void {
    // Create language selector
    const x = this.scale.width - 100;
    const y = 20;
    this.languageSelector = new LanguageSelector(this, x, y);
    this.languageSelector.create();

    // Create other UI elements
    this.createStatusBars();

    // Listen to language changes
    this.events.on('languageChanged', this.updateTexts, this);
    i18nService.on('languageChanged', this.updateTexts.bind(this));
  }

  private updateTexts(): void {
    // Update all text elements with new translations
    this.hungerText?.setText(i18nService.t('ui.statusBar.hunger'));
    // ... update other texts
  }

  shutdown(): void {
    this.languageSelector.destroy();
    i18nService.off('languageChanged', this.updateTexts);
  }
}
```

## Test Cases

### Visual Tests (Manual)

```typescript
describe('LanguageSelector UI', () => {
  it('should display both language options', () => {
    // Manual check: Both DE and EN buttons are visible
  });

  it('should highlight current language', () => {
    // Manual check: Active language has green background
  });

  it('should show hover effect', () => {
    // Manual check: Hovering scales button to 1.1
  });
});
```

### Functional Tests (Automated)

```typescript
describe('LanguageSelector functionality', () => {
  let scene: Phaser.Scene;
  let languageSelector: LanguageSelector;

  beforeEach(() => {
    scene = createMockScene();
    languageSelector = new LanguageSelector(scene, 100, 100);
    languageSelector.create();
  });

  it('should create two buttons', () => {
    expect(languageSelector['deButton']).toBeDefined();
    expect(languageSelector['enButton']).toBeDefined();
  });

  it('should switch language on click', () => {
    const spy = jest.spyOn(i18nService, 'setLanguage');
    
    // Simulate click
    languageSelector['deButton'].emit('pointerdown');
    
    expect(spy).toHaveBeenCalledWith('de');
  });

  it('should update visual state after language change', () => {
    i18nService.setLanguage('en');
    languageSelector.update();
    
    expect(languageSelector['enButton'].style.backgroundColor)
      .toBe('#4CAF50');
  });
});
```

### Integration Tests

```typescript
describe('LanguageSelector integration', () => {
  it('should update UIScene texts when language changes', () => {
    const uiScene = new UIScene();
    uiScene.create();

    const initialText = uiScene['hungerText'].text;
    
    // Click language button
    uiScene['languageSelector']['enButton'].emit('pointerdown');
    
    const newText = uiScene['hungerText'].text;
    expect(newText).not.toBe(initialText);
    expect(newText).toBe('Hunger'); // English version
  });
});
```

## Acceptance Criteria

### Visual Requirements
- ✅ Both language options (DE/EN) are visible
- ✅ Current language is visually highlighted
- ✅ Position doesn't overlap with game elements
- ✅ Readable on all backgrounds
- ✅ Responsive (scales with screen size)

### Functional Requirements
- ✅ Clicking language switches immediately
- ✅ All UI texts update after switch
- ✅ Hover effect provides visual feedback
- ✅ Language persists after reload
- ✅ No console errors

### UX Requirements
- ✅ Intuitive for children (visual flags/icons)
- ✅ Quick to access (< 2 clicks)
- ✅ Clear which language is active
- ✅ Smooth animations (no jarring jumps)

## Accessibility

- **Minimum size:** 44x44px (touch-friendly)
- **Color contrast:** Text readable on background
- **Keyboard navigation:** Tab to select, Enter to activate (optional)
- **Screen reader:** Alternative text for flags (optional)

## Performance

- Rendering: < 5ms
- Click response: < 50ms
- No memory leaks from event listeners
- Efficient updates (only when language changes)

## Dependencies

- Phaser 3 (Scene, GameObjects, Input)
- i18nService
- No external UI libraries
