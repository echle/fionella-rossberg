# Requirements Checklist: Internationalization (i18n)

## Functional Requirements

### Core i18n System
- [ ] i18nService implementiert mit Übersetzungs-Funktionalität
- [ ] Translation-Keys unterstützen verschachtelte Struktur (z.B. `ui.buttons.feed`)
- [ ] Platzhalter in Übersetzungen funktionieren (z.B. `"Hunger: {value}%"`)
- [ ] Fallback auf Englisch, wenn deutsche Übersetzung fehlt
- [ ] Sprachwechsel ohne Neustart des Spiels möglich

### Übersetzungsdateien
- [ ] `locales/de.json` erstellt mit allen deutschen Übersetzungen
- [ ] `locales/en.json` erstellt mit allen englischen Übersetzungen
- [ ] Beide Dateien haben identische Key-Struktur
- [ ] Alle bestehenden UI-Texte sind übersetzt

### Sprachwahl UI
- [ ] Sprach-Button oder Dropdown in UIScene
- [ ] Visuell erkennbar (Flaggen oder "DE | EN")
- [ ] Klick wechselt sofort die Sprache
- [ ] Aktuelle Sprache visuell hervorgehoben
- [ ] UI-Position stört nicht das Gameplay

### Persistierung
- [ ] Sprachwahl wird in LocalStorage gespeichert
- [ ] Beim Neustart wird gespeicherte Sprache geladen
- [ ] Deutsch ist Standard beim ersten Start
- [ ] LocalStorage-Key ist eindeutig (z.B. `horsecare_language`)

### Code-Refactoring
- [ ] Alle hardcodierten Strings durch i18n ersetzt:
  - [ ] StatusBar Labels (Hunger, Glück, etc.)
  - [ ] Inventory Item Namen
  - [ ] Button-Texte
  - [ ] Feedback-Nachrichten
  - [ ] System-Meldungen
- [ ] Keine Strings direkt in Phaser-Text-Komponenten
- [ ] Alle Texte über `i18nService.t()` abrufbar

### README Übersetzung
- [ ] README.md vollständig auf Deutsch
- [ ] Alle Abschnitte übersetzt (Installation, Usage, Development)
- [ ] Optional: README_EN.md für englische Version
- [ ] Links und Code-Beispiele funktionieren

## Technical Requirements

### Architecture
- [ ] i18nService als Singleton implementiert
- [ ] Service ist typsicher (TypeScript Interfaces)
- [ ] Übersetzungsdateien werden lazy-loaded (optional)
- [ ] Event-System für Sprachwechsel (`languageChanged` Event)

### Performance
- [ ] Keine spürbare Performance-Einbuße
- [ ] Bundle-Size-Erhöhung < 10KB
- [ ] Sprachwechsel erfolgt in < 100ms
- [ ] Keine unnötigen Re-Renders

### Type Safety
- [ ] Translation-Keys als Type-Safe Interface (optional)
- [ ] Compiler-Error bei fehlenden Keys (optional)
- [ ] Autocomplete für Translation-Keys (nice-to-have)

### Error Handling
- [ ] Fehlende Übersetzungen werden geloggt (console.warn)
- [ ] Fallback auf Key-Name, wenn beide Sprachen fehlen
- [ ] Ungültige Sprach-Codes werden abgefangen

## Testing Requirements

### Unit Tests
- [ ] i18nService Tests:
  - [ ] `t()` gibt korrekte Übersetzung zurück
  - [ ] Platzhalter werden ersetzt
  - [ ] Fallback auf EN funktioniert
  - [ ] `setLanguage()` wechselt Sprache
  - [ ] LocalStorage wird korrekt gelesen/geschrieben
- [ ] LanguageSelector Tests:
  - [ ] Button wechselt Sprache
  - [ ] Aktuelle Sprache wird angezeigt
  - [ ] Event wird gefeuert

### Integration Tests
- [ ] Sprachwechsel aktualisiert alle sichtbaren Texte
- [ ] Persistierung über Browser-Reload
- [ ] Beide Sprachen funktionieren komplett

### Manual Testing
- [ ] Spiel startet auf Deutsch
- [ ] Alle Texte sind auf Deutsch lesbar
- [ ] Sprachwechsel zu Englisch funktioniert
- [ ] Alle Texte sind auf Englisch korrekt
- [ ] Nach Reload ist gewählte Sprache aktiv
- [ ] Keine Konsolen-Errors

## User Experience Requirements

### Usability
- [ ] Sprachwechsel ist intuitiv (< 2 Klicks)
- [ ] Kinder können Sprach-Button leicht finden
- [ ] Keine verwirrenden technischen Begriffe
- [ ] Icon/Symbol ist selbsterklärend

### Accessibility
- [ ] Sprach-Button hat erreichbare Größe (min 44x44px)
- [ ] Texte haben ausreichenden Kontrast
- [ ] Tastaturnavigation möglich (optional)

### Design
- [ ] Sprach-Button fügt sich ins Design ein
- [ ] Keine UI-Überlappungen
- [ ] Responsive für verschiedene Bildschirmgrößen

## Documentation Requirements

- [ ] Quickstart Guide beschreibt i18n-Nutzung
- [ ] Code-Kommentare für i18nService
- [ ] Beispiele für neue Übersetzungen
- [ ] README erklärt Sprach-Feature

## Non-Functional Requirements

### Maintainability
- [ ] Neue Übersetzungen einfach hinzufügbar
- [ ] Übersetzungsdateien sind übersichtlich
- [ ] Code ist dokumentiert und verständlich

### Scalability
- [ ] System unterstützt weitere Sprachen (Vorbereitung)
- [ ] Übersetzungsstruktur ist erweiterbar
- [ ] Keine hardcodierten Language-Codes

### Security
- [ ] Keine XSS-Anfälligkeit durch User-Input in Übersetzungen
- [ ] LocalStorage-Zugriff ist sicher

## Out of Scope (nicht erforderlich)

- [ ] ~~Automatische Browser-Spracherkennung~~
- [ ] ~~Plural-Formen (z.B. "1 Apfel" vs "2 Äpfel")~~
- [ ] ~~Weitere Sprachen außer DE/EN~~
- [ ] ~~RTL-Sprachen (Right-to-Left)~~
- [ ] ~~Asset-Namen übersetzen (Dateinamen)~~
- [ ] ~~Audio/Voice-Over Lokalisierung~~

## Definition of Done

Ein Task ist fertig, wenn:
- [ ] Code ist implementiert und funktioniert
- [ ] Tests sind geschrieben und bestehen
- [ ] Beide Sprachen sind vollständig
- [ ] Keine Console-Errors/Warnings
- [ ] Manual Testing erfolgreich
- [ ] Code ist reviewed (falls Team vorhanden)
- [ ] Dokumentation ist aktualisiert
