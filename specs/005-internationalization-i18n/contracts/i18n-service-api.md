# Contract: i18n Service API

## Interface Definition

### i18nService

```typescript
interface I18nService {
  /**
   * Get translated text for a given key
   * @param key - Translation key (e.g., 'ui.buttons.feed')
   * @param params - Optional parameters for placeholders
   * @returns Translated string
   */
  t(key: string, params?: Record<string, any>): string;

  /**
   * Set the current language
   * @param languageCode - Language code ('de' or 'en')
   */
  setLanguage(languageCode: string): void;

  /**
   * Get the current language code
   * @returns Current language code
   */
  getCurrentLanguage(): string;

  /**
   * Get all available language codes
   * @returns Array of language codes
   */
  getAvailableLanguages(): string[];

  /**
   * Subscribe to language change events
   * @param event - Event name ('languageChanged')
   * @param callback - Callback function
   */
  on(event: 'languageChanged', callback: (language: string) => void): void;

  /**
   * Unsubscribe from language change events
   * @param event - Event name ('languageChanged')
   * @param callback - Callback function
   */
  off(event: 'languageChanged', callback: (language: string) => void): void;
}
```

## Usage Examples

### Basic Translation

```typescript
import { i18nService } from './services/i18nService';

// Simple translation
const hungerLabel = i18nService.t('ui.statusBar.hunger');
// Returns: "Hunger" (DE) or "Hunger" (EN)

const feedButton = i18nService.t('ui.buttons.feed');
// Returns: "Füttern" (DE) or "Feed" (EN)
```

### Translation with Parameters

```typescript
// Translation with placeholder
const message = i18nService.t('ui.messages.hungerValue', { value: 75 });
// Returns: "Hunger: 75%" (DE) or "Hunger: 75%" (EN)

// Multiple parameters
const complexMessage = i18nService.t('ui.messages.statusUpdate', {
  attribute: 'Hunger',
  value: 50,
  change: -10
});
// Returns: "Hunger: 50% (-10)" (DE) or "Hunger: 50% (-10)" (EN)
```

### Language Management

```typescript
// Get current language
const currentLang = i18nService.getCurrentLanguage();
console.log(currentLang); // "de" or "en"

// Set language
i18nService.setLanguage('en');
// All subsequent t() calls will return English translations

// Get available languages
const languages = i18nService.getAvailableLanguages();
console.log(languages); // ["de", "en"]
```

### Event Handling

```typescript
// Subscribe to language changes
const handleLanguageChange = (newLang: string) => {
  console.log(`Language changed to: ${newLang}`);
  // Update UI texts
  this.updateAllTexts();
};

i18nService.on('languageChanged', handleLanguageChange);

// Unsubscribe
i18nService.off('languageChanged', handleLanguageChange);
```

## Test Cases

### Test: Basic Translation

```typescript
describe('i18nService.t()', () => {
  it('should return German translation by default', () => {
    i18nService.setLanguage('de');
    expect(i18nService.t('ui.buttons.feed')).toBe('Füttern');
  });

  it('should return English translation when language is EN', () => {
    i18nService.setLanguage('en');
    expect(i18nService.t('ui.buttons.feed')).toBe('Feed');
  });

  it('should return key if translation is missing', () => {
    expect(i18nService.t('non.existent.key')).toBe('non.existent.key');
  });
});
```

### Test: Translation with Parameters

```typescript
describe('i18nService.t() with parameters', () => {
  it('should replace placeholders', () => {
    i18nService.setLanguage('de');
    const result = i18nService.t('ui.messages.hungerValue', { value: 75 });
    expect(result).toBe('Hunger: 75%');
  });

  it('should handle multiple placeholders', () => {
    const result = i18nService.t('ui.messages.statusUpdate', {
      attribute: 'Hunger',
      value: 50
    });
    expect(result).toContain('Hunger');
    expect(result).toContain('50');
  });
});
```

### Test: Language Management

```typescript
describe('i18nService language management', () => {
  it('should set language correctly', () => {
    i18nService.setLanguage('en');
    expect(i18nService.getCurrentLanguage()).toBe('en');
  });

  it('should persist language to localStorage', () => {
    i18nService.setLanguage('de');
    const stored = localStorage.getItem('horsecare_language');
    expect(stored).toBe('de');
  });

  it('should load language from localStorage on init', () => {
    localStorage.setItem('horsecare_language', 'en');
    // Reinitialize service (or create new instance)
    expect(i18nService.getCurrentLanguage()).toBe('en');
  });
});
```

### Test: Event System

```typescript
describe('i18nService events', () => {
  it('should emit languageChanged event', (done) => {
    i18nService.on('languageChanged', (lang) => {
      expect(lang).toBe('en');
      done();
    });
    i18nService.setLanguage('en');
  });

  it('should handle multiple subscribers', () => {
    let called1 = false;
    let called2 = false;

    const handler1 = () => { called1 = true; };
    const handler2 = () => { called2 = true; };

    i18nService.on('languageChanged', handler1);
    i18nService.on('languageChanged', handler2);
    i18nService.setLanguage('de');

    expect(called1).toBe(true);
    expect(called2).toBe(true);
  });

  it('should unsubscribe correctly', () => {
    let called = false;
    const handler = () => { called = true; };

    i18nService.on('languageChanged', handler);
    i18nService.off('languageChanged', handler);
    i18nService.setLanguage('en');

    expect(called).toBe(false);
  });
});
```

## Edge Cases

### Missing Translation
```typescript
// Should fallback to key
i18nService.t('missing.key') // Returns: "missing.key"
```

### Invalid Language Code
```typescript
// Should fallback to default language
i18nService.setLanguage('xyz');
// getCurrentLanguage() should return 'de' (default)
```

### Nested Keys
```typescript
// Should support deep nesting
i18nService.t('ui.statusBar.labels.hunger') // Works
```

### Empty Parameters
```typescript
// Should handle missing params gracefully
i18nService.t('ui.messages.hungerValue'); 
// Returns: "Hunger: {value}%" (placeholder not replaced)
```

## Acceptance Criteria

### For i18nService.t()
- ✅ Returns correct translation for valid key
- ✅ Returns key itself if translation not found
- ✅ Replaces placeholders with provided parameters
- ✅ Handles nested keys correctly
- ✅ Logs warning for missing translations (console.warn)

### For i18nService.setLanguage()
- ✅ Changes current language immediately
- ✅ Persists to localStorage
- ✅ Emits 'languageChanged' event
- ✅ Validates language code (only 'de' or 'en')
- ✅ Falls back to 'de' for invalid codes

### For i18nService.getCurrentLanguage()
- ✅ Returns current language code
- ✅ Returns 'de' by default on first run
- ✅ Returns persisted language from localStorage

### For i18nService.getAvailableLanguages()
- ✅ Returns ['de', 'en']
- ✅ Array is read-only (or returns copy)

### For Event System
- ✅ on() subscribes to events
- ✅ off() unsubscribes from events
- ✅ Multiple subscribers are supported
- ✅ Events fire synchronously after action

## Performance Requirements

- `t()` must execute in < 1ms (for cached translations)
- `setLanguage()` must complete in < 50ms
- Memory usage: < 100KB for all translations
- No memory leaks from event subscriptions

## Error Handling

```typescript
// Invalid language code
i18nService.setLanguage('xyz');
// → Logs warning, falls back to 'de'

// Missing translation
i18nService.t('invalid.key');
// → Logs warning, returns 'invalid.key'

// Invalid parameters
i18nService.t('ui.message', null);
// → Treats as no parameters, works normally
```

## Dependencies

- No external libraries required (custom implementation)
- OR: `i18next-lite` if we choose external library
- Uses browser's `localStorage` API
- Compatible with Phaser 3 scenes
