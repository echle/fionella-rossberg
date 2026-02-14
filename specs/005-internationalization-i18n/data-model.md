# Data Model: Internationalization (i18n)

## Core Entities

### Translation
Struktur für Übersetzungsdaten

```typescript
interface Translation {
  [key: string]: string | Translation;
}
```

**Beispiel:**
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
      "pet": "Streicheln"
    }
  }
}
```

### LanguageConfig
Konfiguration für verfügbare Sprachen

```typescript
interface LanguageConfig {
  code: string;           // z.B. "de", "en"
  name: string;          // z.B. "Deutsch", "English"
  flag?: string;         // Icon/Emoji
  isDefault: boolean;
}
```

**Verfügbare Sprachen:**
```typescript
const LANGUAGES: LanguageConfig[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', isDefault: true },
  { code: 'en', name: 'English', flag: '🇬🇧', isDefault: false }
];
```

### LocaleState
State für aktuelle Spracheinstellung

```typescript
interface LocaleState {
  currentLanguage: string;  // z.B. "de"
  availableLanguages: string[];
  translations: Record<string, Translation>;
}
```

## Storage Schema

### LocalStorage
Persistierte Sprachwahl

```typescript
// Key: 'horsecare_language'
// Value: string (z.B. "de" oder "en")
{
  "horsecare_language": "de"
}
```

## Integration mit bestehendem State

### GameState Erweiterung
```typescript
interface GameState {
  // ... existing fields
  locale: {
    language: string;  // aktuelle Sprache
  };
}
```

## Translation Keys Structure

### Hierarchie
```
ui.
  statusBar.
    hunger
    happiness
    energy
    cleanliness
  buttons.
    feed
    brush
    pet
    save
    load
  inventory.
    apple
    carrot
    hay
    brush
  messages.
    fed
    brushed
    petted
    saved
    loaded
    hungerDecreased
    happinessIncreased
```

## Relationships

```
LocaleState
  ├── currentLanguage (string)
  ├── translations (Record<string, Translation>)
  └── availableLanguages (string[])

Translation Files
  └── locales/
      ├── de.json
      └── en.json

LocalStorage
  └── horsecare_language → currentLanguage
```

## Example Translation Files

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
      "pet": "Streicheln"
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
      "pet": "Pet"
    }
  }
}
```

## No Database Changes
Dieses Feature benötigt keine Datenbank-Änderungen, da nur LocalStorage verwendet wird.
