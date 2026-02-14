# Feature Specification: Internationalization (i18n)

## Overview
Implementiere Mehrsprachigkeit für das Pferdepflege-Spiel mit Deutsch als Standard und Englisch als Alternative. Die Zielgruppe sind Kinder, die noch kein Englisch beherrschen.

## Problems to Solve
1. README.md ist derzeit auf Englisch - unzugänglich für deutschsprachige Kinder
2. Alle UI-Texte im Spiel sind auf Englisch
3. Keine Möglichkeit für Kinder, die Sprache zu wechseln
4. Fehlende Barrierefreiheit für die primäre Zielgruppe

## Goals
- Deutsch als Standardsprache für README und Spiel
- Sprachauswahl-UI im Spiel (Deutsch/Englisch)
- Alle UI-Texte, Buttons, Status-Anzeigen übersetzbar
- Sprachwahl wird gespeichert (LocalStorage)
- Einfacher Wechsel zwischen Sprachen während des Spielens

## Target Audience
- **Primär**: Deutschsprachige Kinder (6-12 Jahre) ohne Englischkenntnisse
- **Sekundär**: Englischsprachige Spieler (als Alternative)

## Core Requirements

### 1. README Übersetzung
- README.md komplett auf Deutsch
- Optional: README_EN.md für englischsprachige Nutzer
- Deutsche Git-Commit-Messages optional (kann diskutiert werden)

### 2. In-Game Sprachauswahl
- **UI-Element**: Sprachauswahl-Button oder Dropdown
  - Position: UIScene (z.B. neben anderen UI-Elementen)
  - Anzeige: Flaggen-Icons oder "DE | EN" Text
  - Erreichbar: Jederzeit während des Spielens

### 3. Übersetzbare Texte
Alle UI-Texte müssen übersetzbar sein:
- Status-Bar Labels ("Hunger", "Glück", "Energie", "Sauberkeit")
- Button-Beschriftungen ("Füttern", "Bürsten", "Streicheln")
- Inventory-Item-Namen ("Apfel", "Karotte", "Heu")
- Feedback-Nachrichten ("Pferd wurde gefüttert!", "Hunger gesunken")
- System-Meldungen ("Spiel gespeichert", "Spiel geladen")

### 4. Technische Anforderungen
- **i18n-Bibliothek**: Leichtgewichtige Lösung (z.B. i18next, eigene Implementierung)
- **Übersetzungsdateien**: JSON-basiert (`locales/de.json`, `locales/en.json`)
- **Sprachwahl-Persistenz**: LocalStorage
- **Fallback**: Englisch, falls Übersetzung fehlt
- **Hot-Reload**: Sprachwechsel ohne Neustart des Spiels

## User Stories

### Story 1: Kind startet Spiel
**Als** deutschsprachiges Kind  
**möchte ich** das Spiel in meiner Muttersprache sehen  
**damit** ich alle Texte verstehen kann

**Akzeptanzkriterien:**
- README ist auf Deutsch
- Spiel startet standardmäßig auf Deutsch
- Alle UI-Texte sind auf Deutsch

### Story 2: Sprachwechsel während des Spiels
**Als** Spieler  
**möchte ich** die Sprache jederzeit wechseln können  
**damit** ich zwischen Deutsch und Englisch wählen kann

**Akzeptanzkriterien:**
- Sprachauswahl-Button ist sichtbar und erreichbar
- Nach Klick wechselt die Sprache sofort
- Sprachwahl wird gespeichert
- Beim nächsten Start ist die gewählte Sprache aktiv

### Story 3: Alle Texte übersetzt
**Als** Entwickler  
**möchte ich** ein zentrales Übersetzungssystem  
**damit** neue Texte leicht hinzugefügt werden können

**Akzeptanzkriterien:**
- Alle hardcodierten Strings sind durch Übersetzungskeys ersetzt
- Neue Texte können in `locales/*.json` hinzugefügt werden
- System unterstützt Platzhalter (z.B. "Hunger: {value}%")

## Non-Goals
- Weitere Sprachen außer Deutsch/Englisch (vorerst)
- Automatische Browser-Spracherkennung (kann später hinzugefügt werden)
- RTL-Sprachen (Right-to-Left)
- Plural-Formen / Complex i18n-Features

## Technical Constraints
- Muss mit TypeScript + Phaser 3 kompatibel sein
- Minimale Bundle-Size-Erhöhung
- Keine zusätzlichen Build-Steps (wenn möglich)
- LocalStorage-basierte Persistenz

## Dependencies
- Eventuell: `i18next` oder `i18next-lite` (falls lightweight)
- Alternative: Custom i18n-Service (sehr einfache Implementierung)

## Success Criteria
- [ ] README.md ist vollständig auf Deutsch
- [ ] Sprachauswahl-UI funktioniert
- [ ] Alle bestehenden UI-Texte sind übersetzt (DE + EN)
- [ ] Sprachwahl wird persistiert
- [ ] Sprachwechsel funktioniert ohne Neustart
- [ ] Keine hardcodierten Strings mehr im Code
- [ ] Tests für i18n-Service vorhanden

## Out of Scope
- Übersetzung von Asset-Namen in Dateinamen
- Voice-Over / Audio-Lokalisierung
- Datum/Uhrzeit-Formatierung (noch nicht relevant)
- Währungen / Zahlenformate (noch nicht relevant)

## Open Questions
1. Sollen Git-Commit-Messages auch auf Deutsch sein?
2. Automatische Spracherkennung via Browser-Settings?
3. Weitere Sprachen in der Zukunft geplant?
4. Sollen Asset-Beschreibungen (z.B. Sprite-Namen) übersetzt werden?

## Notes
- Primäre Zielgruppe: Deutschsprachige Kinder
- Englisch bleibt als Alternative bestehen
- Einfachheit vor Komplexität: Kein Over-Engineering
