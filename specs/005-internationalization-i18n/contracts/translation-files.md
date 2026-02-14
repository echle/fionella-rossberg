# Contract: Translation Files Structure

## File Structure

```
src/
  locales/
    de.json     # German translations
    en.json     # English translations
```

## Schema Definition

### Translation File Format

```typescript
interface TranslationFile {
  ui: {
    statusBar: {
      [key: string]: string;
    };
    buttons: {
      [key: string]: string;
    };
    inventory: {
      [key: string]: string;
    };
    messages: {
      [key: string]: string;
    };
  };
}
```

## Complete Translation Files

### locales/de.json

```json
{
  "ui": {
    "statusBar": {
      "hunger": "Hunger",
      "happiness": "Glück",
      "energy": "Energie",
      "cleanliness": "Sauberkeit"
    },
    "buttons": {
      "feed": "Füttern",
      "brush": "Bürsten",
      "pet": "Streicheln",
      "save": "Speichern",
      "load": "Laden",
      "reset": "Zurücksetzen"
    },
    "inventory": {
      "apple": "Apfel",
      "carrot": "Karotte",
      "hay": "Heu",
      "brush": "Bürste"
    },
    "messages": {
      "fed": "Pferd wurde gefüttert!",
      "brushed": "Pferd wurde gebürstet!",
      "petted": "Pferd wurde gestreichelt!",
      "saved": "Spiel gespeichert",
      "loaded": "Spiel geladen",
      "hungerDecreased": "Hunger: {value}%",
      "happinessIncreased": "Glück: {value}%",
      "energyDecreased": "Energie: {value}%",
      "cleanlinessDecreased": "Sauberkeit: {value}%",
      "statusUpdate": "{attribute}: {value}%",
      "itemUsed": "{item} wurde verwendet",
      "noEnergy": "Nicht genug Energie!",
      "alreadyFull": "Pferd ist schon satt!",
      "tooClean": "Pferd ist schon sauber!"
    },
    "game": {
      "title": "Fionella Rossberg - Pferdepflege",
      "loading": "Lädt...",
      "ready": "Bereit!",
      "paused": "Pausiert"
    }
  }
}
```

### locales/en.json

```json
{
  "ui": {
    "statusBar": {
      "hunger": "Hunger",
      "happiness": "Happiness",
      "energy": "Energy",
      "cleanliness": "Cleanliness"
    },
    "buttons": {
      "feed": "Feed",
      "brush": "Brush",
      "pet": "Pet",
      "save": "Save",
      "load": "Load",
      "reset": "Reset"
    },
    "inventory": {
      "apple": "Apple",
      "carrot": "Carrot",
      "hay": "Hay",
      "brush": "Brush"
    },
    "messages": {
      "fed": "Horse was fed!",
      "brushed": "Horse was brushed!",
      "petted": "Horse was petted!",
      "saved": "Game saved",
      "loaded": "Game loaded",
      "hungerDecreased": "Hunger: {value}%",
      "happinessIncreased": "Happiness: {value}%",
      "energyDecreased": "Energy: {value}%",
      "cleanlinessDecreased": "Cleanliness: {value}%",
      "statusUpdate": "{attribute}: {value}%",
      "itemUsed": "{item} was used",
      "noEnergy": "Not enough energy!",
      "alreadyFull": "Horse is already full!",
      "tooClean": "Horse is already clean!"
    },
    "game": {
      "title": "Fionella Rossberg - Horse Care",
      "loading": "Loading...",
      "ready": "Ready!",
      "paused": "Paused"
    }
  }
}
```

## Translation Key Naming Convention

### Rules

1. **Lowercase with dots:** `ui.buttons.feed`
2. **Hierarchical structure:** Category → Subcategory → Key
3. **Descriptive names:** Use clear, semantic names
4. **Consistent prefixes:**
   - `ui.*` - User interface elements
   - `game.*` - Game-related messages
   - `error.*` - Error messages (future)
   - `help.*` - Help texts (future)

### Examples

```typescript
// Good ✅
'ui.statusBar.hunger'
'ui.buttons.feed'
'ui.messages.fed'

// Bad ❌
'Hunger'               // No structure
'ui.statusbar.Hunger'  // Inconsistent casing
'button_feed'          // Underscores instead of dots
'ui.feed_button'       // Wrong order
```

## Placeholder Syntax

### Format
```
{parameterName}
```

### Examples

```json
{
  "hungerValue": "Hunger: {value}%",
  "itemUsed": "{item} wurde verwendet",
  "statusChange": "{attribute} um {change} verändert"
}
```

### Usage in Code

```typescript
i18nService.t('ui.messages.hungerValue', { value: 75 });
// Returns: "Hunger: 75%"

i18nService.t('ui.messages.itemUsed', { item: 'Apfel' });
// Returns: "Apfel wurde verwendet"

i18nService.t('ui.messages.statusChange', { 
  attribute: 'Hunger', 
  change: -10 
});
// Returns: "Hunger um -10 verändert"
```

## Validation Rules

### File Validation

```typescript
// Both files must have identical structure
const deKeys = getAllKeys(de.json);
const enKeys = getAllKeys(en.json);

if (!arraysEqual(deKeys, enKeys)) {
  throw new Error('Translation files have different keys!');
}
```

### Key Validation

```typescript
// Keys must follow naming convention
const validKeyPattern = /^[a-z]+(\.[a-z]+)+$/;

for (const key of allKeys) {
  if (!validKeyPattern.test(key)) {
    throw new Error(`Invalid key format: ${key}`);
  }
}
```

### Placeholder Validation

```typescript
// Placeholders must match in both languages
const dePlaceholders = extractPlaceholders(deTranslation);
const enPlaceholders = extractPlaceholders(enTranslation);

if (!arraysEqual(dePlaceholders, enPlaceholders)) {
  console.warn(`Placeholder mismatch for key: ${key}`);
}
```

## Test Cases

### Structure Tests

```typescript
describe('Translation files structure', () => {
  it('should have identical keys in both files', () => {
    const deKeys = Object.keys(flattenObject(de));
    const enKeys = Object.keys(flattenObject(en));
    
    expect(deKeys.sort()).toEqual(enKeys.sort());
  });

  it('should follow naming convention', () => {
    const allKeys = Object.keys(flattenObject(de));
    const pattern = /^[a-z]+(\.[a-z]+)+$/;
    
    for (const key of allKeys) {
      expect(key).toMatch(pattern);
    }
  });

  it('should have no empty values', () => {
    const deValues = Object.values(flattenObject(de));
    const enValues = Object.values(flattenObject(en));
    
    expect(deValues.every(v => v.length > 0)).toBe(true);
    expect(enValues.every(v => v.length > 0)).toBe(true);
  });
});
```

### Placeholder Tests

```typescript
describe('Translation placeholders', () => {
  it('should have matching placeholders in both languages', () => {
    const deMsg = de.ui.messages.hungerValue;
    const enMsg = en.ui.messages.hungerValue;
    
    const dePlaceholders = deMsg.match(/\{(\w+)\}/g);
    const enPlaceholders = enMsg.match(/\{(\w+)\}/g);
    
    expect(dePlaceholders).toEqual(enPlaceholders);
  });

  it('should use valid placeholder names', () => {
    const allMessages = Object.values(flattenObject(de));
    const placeholderPattern = /\{([a-z][a-zA-Z0-9]*)\}/g;
    
    for (const message of allMessages) {
      const placeholders = message.match(/\{(\w+)\}/g) || [];
      for (const placeholder of placeholders) {
        expect(placeholder).toMatch(placeholderPattern);
      }
    }
  });
});
```

### Content Tests

```typescript
describe('Translation content', () => {
  it('should have all required UI keys', () => {
    const required = [
      'ui.statusBar.hunger',
      'ui.statusBar.happiness',
      'ui.statusBar.energy',
      'ui.buttons.feed',
      'ui.buttons.brush',
      'ui.buttons.pet'
    ];
    
    const deKeys = Object.keys(flattenObject(de));
    
    for (const key of required) {
      expect(deKeys).toContain(key);
    }
  });

  it('should not have duplicate values (except common words)', () => {
    const values = Object.values(flattenObject(de));
    const commonWords = ['Hunger', 'Energie', 'Bereit'];
    
    const filtered = values.filter(v => !commonWords.includes(v));
    const unique = new Set(filtered);
    
    // Allow some duplicates, but not too many
    expect(unique.size / filtered.length).toBeGreaterThan(0.8);
  });
});
```

## Maintenance Guidelines

### Adding New Translations

1. **Add to both files simultaneously:**
   ```json
   // de.json
   "ui.newFeature.title": "Neue Funktion"
   
   // en.json
   "ui.newFeature.title": "New Feature"
   ```

2. **Follow the hierarchy:**
   - Place in correct category (`ui`, `game`, etc.)
   - Use existing subcategories when possible
   - Create new subcategories sparingly

3. **Test immediately:**
   ```typescript
   const text = i18nService.t('ui.newFeature.title');
   console.log(text); // Verify in both languages
   ```

### Updating Translations

1. **Never remove keys without checking usage**
2. **Search codebase for key usage before deleting**
3. **Update both languages when changing structure**
4. **Test after changes**

### Best Practices

- ✅ Keep translations short and concise
- ✅ Use gender-neutral language when possible
- ✅ Consider context (where will this be displayed?)
- ✅ Consistent terminology across translations
- ✅ Add comments in JSON (if tooling supports it)

## Acceptance Criteria

### Structure
- ✅ Both files have identical key structure
- ✅ All keys follow naming convention
- ✅ Hierarchy is logical and consistent
- ✅ No orphaned or unused keys

### Content
- ✅ All translations are complete
- ✅ German translations are correct and natural
- ✅ English translations are correct and natural
- ✅ Placeholders are consistent across languages
- ✅ No spelling errors

### Validation
- ✅ Validation tests pass
- ✅ No missing translations
- ✅ No empty strings
- ✅ Files are valid JSON

## File Size Limits

- **Maximum file size:** 50 KB per file
- **Current estimated size:** ~5 KB per file
- **Growth headroom:** 10x current content

## Dependencies

- JSON format (standard)
- UTF-8 encoding
- No schema validation library needed (simple structure)
