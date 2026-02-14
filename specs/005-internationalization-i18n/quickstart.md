# Quick Start: Internationalization (i18n)

## Für Entwickler

### 1. Übersetzungen verwenden

```typescript
import { i18nService } from './services/i18nService';

// Text übersetzen
const hungerLabel = i18nService.t('ui.statusBar.hunger'); // "Hunger" (DE) oder "Hunger" (EN)

// Mit Platzhaltern
const message = i18nService.t('ui.messages.hungerValue', { value: 75 }); // "Hunger: 75%"
```

### 2. Neue Übersetzungen hinzufügen

**locales/de.json:**
```json
{
  "ui": {
    "newFeature": {
      "title": "Neue Funktion",
      "description": "Eine tolle neue Funktion"
    }
  }
}
```

**locales/en.json:**
```json
{
  "ui": {
    "newFeature": {
      "title": "New Feature",
      "description": "An awesome new feature"
    }
  }
}
```

**Im Code:**
```typescript
const title = i18nService.t('ui.newFeature.title');
```

### 3. Sprache wechseln (programmatisch)

```typescript
import { i18nService } from './services/i18nService';

// Sprache setzen
i18nService.setLanguage('de');

// Aktuelle Sprache abrufen
const currentLang = i18nService.getCurrentLanguage(); // "de"
```

## Für Benutzer

### Sprache im Spiel wechseln

1. Starte das Spiel
2. Klicke auf das Sprach-Icon (🇩🇪/🇬🇧) in der oberen Ecke
3. Wähle die gewünschte Sprache
4. Die Sprache wechselt sofort - kein Neustart nötig
5. Deine Wahl wird gespeichert

### Standard-Sprache

- **Deutsch** ist die Standard-Sprache
- Beim ersten Start erscheint das Spiel auf Deutsch
- Die Sprachwahl wird im Browser gespeichert

## Testing

### Manueller Test

```bash
# Spiel starten
npm run dev

# Im Browser:
# 1. Prüfe, dass Texte auf Deutsch sind
# 2. Klicke Sprach-Button
# 3. Prüfe, dass Texte auf Englisch sind
# 4. Lade neu → Sprache bleibt Englisch
```

### Unit Tests

```bash
# i18n Service testen
npm run test tests/unit/i18nService.test.ts

# Alle Tests
npm run test
```

## Integration Szenarien

### Szenario 1: Neues UI-Element mit Text
```typescript
// ❌ Falsch: Hardcoded
const button = this.add.text(x, y, 'Feed Horse', style);

// ✅ Richtig: Übersetzt
import { i18nService } from '../services/i18nService';
const button = this.add.text(x, y, i18nService.t('ui.buttons.feed'), style);
```

### Szenario 2: Dynamische Nachricht
```typescript
// ❌ Falsch: String-Interpolation
const message = `Hunger decreased to ${value}%`;

// ✅ Richtig: Translation mit Platzhalter
const message = i18nService.t('ui.messages.hungerDecreased', { value });
```

### Szenario 3: Sprachwechsel-Event
```typescript
// Bei Sprachwechsel UI aktualisieren
i18nService.on('languageChanged', (newLang: string) => {
  this.updateUITexts();
});
```

## Häufige Probleme

### Problem: Übersetzung fehlt
**Symptom:** Text wird als Key angezeigt (z.B. "ui.buttons.feed")  
**Lösung:** Prüfe, ob der Key in beiden Dateien (`de.json` + `en.json`) existiert

### Problem: Platzhalter funktionieren nicht
**Symptom:** Text zeigt `{value}` statt Wert  
**Lösung:** Stelle sicher, dass der zweite Parameter ein Objekt ist:
```typescript
i18nService.t('key', { value: 123 })
```

### Problem: Sprachwechsel aktualisiert Texte nicht
**Symptom:** Nach Klick auf Sprach-Button bleiben Texte gleich  
**Lösung:** Texte müssen nach Sprachwechsel neu geladen werden:
```typescript
i18nService.on('languageChanged', () => {
  this.scene.restart();  // oder updateTexts()
});
```

## Dateistruktur

```
src/
  services/
    i18nService.ts          # i18n Service
  locales/
    de.json                 # Deutsche Übersetzungen
    en.json                 # Englische Übersetzungen
  components/
    LanguageSelector.ts     # Sprach-Button UI

tests/
  unit/
    i18nService.test.ts     # Tests für i18n

README.md                   # Auf Deutsch!
README_EN.md               # Optional: Englische Version
```

## Best Practices

1. **Keine Hardcoded Strings:** Alle UI-Texte über i18nService
2. **Konsistente Keys:** Nutze eindeutige, hierarchische Keys
3. **Beide Sprachen pflegen:** Jeder neue Key in DE + EN
4. **Kurze Texte:** UI-Texte sollten kurz und prägnant sein
5. **Fallback:** Englisch ist Fallback, falls DE fehlt

## Nächste Schritte

Nach der Implementation:
1. README.md übersetzen
2. Alle bestehenden Texte durch i18n-Calls ersetzen
3. Sprach-Button zur UIScene hinzufügen
4. Tests schreiben
5. Beide Sprachen testen
