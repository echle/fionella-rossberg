# 🐴 Fionellas Pferdepflege-Spiel

Ein browser-basiertes Pferdepflege-Simulationsspiel, bei dem du dein virtuelles Pferd fütterst, putzt und streichelst, um es glücklich und gesund zu halten.

---

## 👧👦 Für Kinder erklärt

**🎮 Was ist das?**

Das ist ein Spiel, in dem du dein eigenes Pferd bekommst! Du musst dich jeden Tag um dein Pferd kümmern – genau wie ein echter Pferdefreund! 🐴❤️

**🎯 Was kannst du machen?**

- 🥕 **Füttern**: Gib deinem Pferd leckere Karotten (Klick auf Karotte, dann auf Pferd)
- 🪥 **Bürsten**: Mach das Fell schön sauber und glänzend (Zieh die Bürste übers Pferd)
- 💗 **Streicheln**: Zeig deinem Pferd, dass du es lieb hast (Klick einfach aufs Pferd)
- 💰 **Hufeisen sammeln**: Jede gute Tat gibt dir goldene Hufeisen!
- 🛒 **Im Laden einkaufen**: Kauf neue Karotten und Bürsten mit deinen Hufeisen
- 🎁 **Geschenke öffnen**: Alle paar Minuten gibt's eine Überraschungsbox!

**⚠️ Pass gut auf!**

Wenn die drei bunten Balken (Hunger, Sauberkeit, Glück) leer werden, wird dein Pferd traurig! 
Kümmere dich jeden Tag gut um dein Pferd, dann bleibt es gesund und glücklich! 🌟

**🎉 Los geht's!**

Klick einfach auf "Start" und such dir einen schönen Namen für dein Pferd aus! 🐴✨

---

![Horse Care Game](https://img.shields.io/badge/Status-MVP_Complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Phaser](https://img.shields.io/badge/Phaser-3.80-orange)

## ✨ Funktionen

- **🐴 Virtueller Pferdegefährte**: Interagiere mit deinem Pferd in einer lebendigen Stallumgebung mit professionellen Sprite-Animationen
- **🎬 Sprite-basierte Animationen**: Frame-basierte Animationen für Leerlauf, Fressen, Putzen und fröhliche Zustände (Feature 003)
- **🥕 Erweitertes Fütterungssystem**: 
  - Zeitgesteuerte Fressanimation (2,5s) mit visueller Fortschrittsanzeige
  - Sättigungslimit (3 Karotten) mit 30-Sekunden-Abklingzeit
  - Intelligenter Abbau (10s pro Karotte) verhindert permanente Sperrung
  - Sättigungs-Badge mit Countdown-Timer
- **🪥 Putzmechanik**: Ziehe die Bürste über dein Pferd, um die Sauberkeit zu erhöhen (mit animierter Putzreaktion)
- **❤️ Streichel-Interaktion**: Klicke auf dein Pferd, um die Zufriedenheit zu erhöhen und Herz-Animationen mit fröhlicher Animation zu sehen
- **🌍 Mehrsprachigkeit (i18n)**: Wähle zwischen Deutsch (Standard) und Englisch mit persistenter Sprachwahl (Feature 005)
- **💰 Wirtschaftssystem**: Verdiene Hufeisen durch Pflegemaßnahmen, kaufe Items im Shop, sammle Mystery Boxen alle 5 Minuten (Feature 006)
- **🛒 In-Game Shop**: Kaufe Pflegeartikel mit deiner verdienten Währung - Pakete enthalten Karotten und Bürstenbenutzungen
- **⏱️ Spieluhr**: Verfolge deine gesamte Spielzeit mit einer laufenden Uhr, die automatisch beim ersten Laden startet
- **🎁 Mystery Boxen**: Sammle alle 5 Minuten automatisch erscheinende Geschenkboxen mit Zufallsbelohnungen (Karotten/Bürsten/Währung)
- **💔 Game Over**: Das Spiel erkennt, wenn alle Statuswerte 0 erreichen, zeigt einen kranken Pferd-Zustand und bietet Reset-Option
- **⏱️ Zeitbasierter Abbau**: Statuswerte sinken allmählich mit der Zeit und erfordern regelmäßige Pflege
- **🔄 Neustart-Funktion**: Setze das Spiel auf Anfangszustand zurück, während die Sprachwahl erhalten bleibt (Feature 004)
- **💾 Auto-Speicher-System**: Dein Spielstand bleibt über Browser-Sitzungen hinweg mit LocalStorage erhalten
- **📱 Responsives Design**: Spiele auf Desktop- oder Mobilgeräten mit adaptiver Skalierung (320px-2560px)
- **✨ Visuelles Feedback**: Animierte Statusleisten, Partikeleffekte, Emoji-Reaktionen und Echtzeitindikatoren

## 🎮 Aktueller Status

**🎉 MVP + Features 002-006 Abgeschlossen** - Kernfunktionen, erweiterte Fütterungsmechanik, Sprite-Animationen, Reset-Button, Mehrsprachigkeit und Wirtschaftssystem implementiert!

### ✅ Feature 001: Pferdepflege-MVP (136/136 Aufgaben)
- ✅ Phase 1: Setup (15 Aufgaben)
- ✅ Phase 2: Grundlagen (11 Aufgaben)
- ✅ Phase 3: US1 Pferd ansehen (14 Aufgaben)
- ✅ Phase 4: US2 Füttern (20 Aufgaben)
- ✅ Phase 5: US3 Putzen (20 Aufgaben)
- ✅ Phase 6: US4 Streicheln (12 Aufgaben)
- ✅ Phase 7: US5 Abbau (9 Aufgaben)
- ✅ Phase 8: Speicherung (13 Aufgaben)
- ✅ Phase 9: Feinschliff (21 Aufgaben)

### ✅ Feature 002: Erweiterte Fütterungsmechanik (30/30 Aufgaben)
- ✅ User Story 1: Zeitgesteuerte Fressanimation (12 Aufgaben)
- ✅ User Story 2: Sättigungslimit-System (5 Aufgaben)
- ✅ User Story 3: Visuelles Feedback (7 Aufgaben)
- ✅ Feinschliff & Validierung (6 Aufgaben)

### ✅ Feature 003: Visuelle Asset-Integration (52/67 Aufgaben MVP-Umfang)
- ✅ Phase 1: Setup (4 Aufgaben)
- ✅ Phase 2: Grundlagen - Sprite-Laden & Animationsregistrierung (14 Aufgaben)
- ✅ Phase 3: User Story 1 (P1) - Animierte Pferde-Sprites (35 Aufgaben)
- ✅ Phase 7: Feinschliff & Unit Tests (15 Aufgaben)
- ⏸️ Zurückgestellt: UI-Sprites (P2), Partikeleffekte (P3), Hintergrund (P4)

### ✅ Feature 004: Reset-Button (Alle Aufgaben abgeschlossen)
- ✅ Reset-Button mit Doppelklick-Schutz
- ✅ Spielstand-Reset ohne Seitenneuladung
- ✅ Locale-Persistenz bleibt beim Reset erhalten

### ✅ Feature 005: Internationalization (i18n) (Alle Aufgaben abgeschlossen)
- ✅ Sprachauswahl-UI (DE/EN) mit Flaggen-Icons
- ✅ Alle UI-Texte übersetzt (Status-Labels, Buttons, Nachrichten)
- ✅ i18nService mit Event-System für Sprachwechsel
- ✅ LocalStorage-Persistenz der Sprachwahl
- ✅ README auf Deutsch

### ✅ Feature 006: Economy System + Game Clock (90/90 Aufgaben)
- ✅ Phase 2: Grundlagen - State-Schema, Constants, i18n, SaveSystem-Erweiterung (13 Aufgaben)
- ✅ Phase 3: US1 - Währung verdienen durch Aktionen mit animierter Anzeige (9 Aufgaben)
- ✅ Phase 4: US2 - Shop-Modal mit Kaufsystem und Affordability-Checks (14 Aufgaben)
- ✅ Phase 5: US3 - Spieluhr zur Verfolgung der gesamten Spielzeit (7 Aufgaben)
- ✅ Phase 6: US4 - Mystery Boxen spawnen alle 5 Minuten mit Belohnungen (13 Aufgaben)
- ✅ Phase 7: US5 - Game Over wenn alle Stats = 0 (11 Aufgaben)
- ✅ Phase 8: Shop-Polish - Animationen, Hover-Effekte, Particles, Responsive Grid (10 Aufgaben)
- ✅ Phase 9: Final Polish - Save-Migration, Max Currency Toast, Performance, i18n Validation (13 Aufgaben)

## �️ Geplante Features

Sieh dir die [**ROADMAP.md**](ROADMAP.md) an für:
- 🎁 **Feature 007**: Tägliche Geschenke & erweiterte zeitbasierte Drops
- ⭐ **Feature 008**: Quest/Achievement-System
- 🥕 **Feature 009**: Mini-Garten für Karotten-Anbau
- 🎯 **Feature 010**: Geschicklichkeits-Minispiele
- Und weitere Ideen im Backlog!

## �🚀 Erste Schritte

### Voraussetzungen
- Node.js 18+ (LTS empfohlen)
- npm, yarn oder pnpm
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd horse-care-game

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Spiel öffnet sich unter `http://localhost:5173` (oder einem anderen verfügbaren Port).

### Verfügbare Skripte

- `npm run dev` - Vite-Entwicklungsserver mit Hot-Reload starten
- `npm run build` - Für Produktion bauen (Ausgabe: dist/)
- `npm run preview` - Produktions-Build lokal ansehen
- `npm test` - Vitest Unit-Tests ausführen
- `npm run test:ui` - Tests mit interaktiver UI ausführen
- `npm run test:coverage` - Coverage-Bericht erstellen (Ziel: ≥70%)
- `npm run lint` - ESLint auf allen TypeScript-Dateien ausführen
- `npm run format` - Code mit Prettier formatieren

## 🎮 Spielanleitung

### Grundlegende Steuerung

1. **Werkzeug auswählen**:
   - Klicke auf das **🥕 Karotten**-Symbol, um das Fütterungswerkzeug auszuwählen
   - Klicke auf das **🪥 Bürsten**-Symbol, um das Putzwerkzeug auszuwählen

2. **Mit deinem Pferd interagieren**:
   - **Füttern**: Karotte auswählen → Pferd anklicken → Hunger steigt um 20
   - **Putzen**: Bürste auswählen → über Pferd ziehen → Sauberkeit steigt um 5 pro Strich
   - **Streicheln**: Ohne ausgewähltes Werkzeug → Pferd anklicken → Zufriedenheit steigt um 10
   - **Sprache wechseln**: Klicke auf die Flaggen-Icons (🇩🇪/🇬🇧) oben rechts
   - **Neustart**: Doppelklicke auf "[Neustart]" unten links

3. **Statusleisten überwachen** (farbcodiert grün/gelb/rot):
   - **Hunger** (oben links): Sinkt um 1 alle 6 Sekunden
   - **Sauberkeit** (oben mittig): Sinkt um 1 alle 12 Sekunden
   - **Zufriedenheit** (oben rechts): Sinkt um 1 alle 7,5 Sekunden

4. **Ressourcen verwalten**:
   - Starte mit 10 Karotten und 100 Bürstennutzungen
   - Werkzeuge werden nicht verfügbar, wenn sie aufgebraucht sind (ausgegraut mit 30% Deckkraft)

### Spielmechaniken

- **Abbausystem**: Statuswerte sinken automatisch mit der Zeit basierend auf Abbauraten
- **Status-Begrenzung**: Werte liegen zwischen 0-100 (können nicht negativ werden oder das Maximum überschreiten)
- **Auto-Speichern**: Spielstand wird automatisch gespeichert:
  - Alle 10 Sekunden
  - Nach jeder Interaktion (Füttern/Putzen/Streicheln)
  - Beim Schließen/Aktualisieren des Browser-Tabs (beforeunload-Event)
- **Verstrichene Zeit**: Wenn du nach einer Pause zurückkehrst, wird der Abbau rückwirkend basierend auf der verstrichenen Zeit angewendet

## 📁 Projektstruktur

```
horse-care-game/
├── src/
│   ├── config/
│   │   ├── phaserConfig.ts      # Phaser-Spielkonfiguration (800x600, FIT-Skalierung)
│   │   └── gameConstants.ts     # Balance-Tuning-Werte (Abbauraten, Inkremente)
│   ├── entities/
│   │   ├── Horse.ts             # Pferde-Sprite mit playEatingAnimation/playHappyAnimation
│   │   ├── StatusBar.ts         # UI-Statusleisten-Komponente (farbcodiert, sanfte Tweens)
│   │   └── InventoryItem.ts     # Inventarplatz-Komponente (Auswahl-Highlight, Ausgrauen)
│   ├── scenes/
│   │   ├── BootScene.ts         # Asset-Laden und Speicherwiederherstellung
│   │   ├── MainGameScene.ts     # Primäre Gameplay-Szene mit Interaktionshandlern
│   │   └── UIScene.ts           # Overlay-UI für Status, Inventar und Sprachauswahl
│   ├── state/
│   │   ├── types.ts             # TypeScript-Schnittstellen (GameState, HorseStatus, etc.)
│   │   ├── gameStore.ts         # Zustand-Store-Initialisierung
│   │   └── actions.ts           # Zustandsmutationsfunktionen (feed, groom, pet, decay, resetGame)
│   ├── systems/
│   │   ├── InputSystem.ts       # Drag-Gesten-Erkennung für Putzen
│   │   ├── DecaySystem.ts       # Zeitbasierte Statusdegradation
│   │   └── SaveSystem.ts        # LocalStorage-Persistenz mit Schema-Validierung
│   ├── services/
│   │   └── i18nService.ts       # Übersetzungsservice mit Event-System
│   ├── components/
│   │   └── LanguageSelector.ts  # Sprachauswahl-UI-Komponente (DE/EN Flaggen)
│   ├── locales/
│   │   ├── de.json              # Deutsche Übersetzungen
│   │   └── en.json              # Englische Übersetzungen
│   ├── utils/
│   │   ├── mathUtils.ts         # clamp(), lerp()
│   │   ├── timeUtils.ts         # Zeitkonvertierungshelfer
│   │   └── feedingHelpers.ts    # Sättigungsberechnungen (canFeed, getSatietyProgress, etc.)
│   └── main.ts                  # Einstiegspunkt (Phaser-Initialisierung + beforeunload-Speicherung)
├── tests/
│   ├── unit/                    # Unit-Tests (gameStore, actions, DecaySystem, SaveSystem)
│   └── integration/             # Integrationstests
├── public/
│   ├── index.html               # HTML-Einstiegspunkt
│   └── manifest.json            # PWA-Manifest
├── specs/                       # Spezifikationsdokumente
│   ├── 001-horse-care-mvp/
│   │   ├── spec.md              # Feature-Anforderungen
│   │   ├── plan.md              # Implementierungsplan mit technischen Entscheidungen
│   │   ├── tasks.md             # Aufgabenaufschlüsselung (136 Aufgaben)
│   │   ├── data-model.md        # Entitätsdefinitionen
│   │   ├── quickstart.md        # Entwickler-Integrationsleitfaden
│   │   └── contracts/           # API-Verträge und Schemas
│   └── 002-feeding-mechanics/
│       ├── spec.md              # Erweiterte Fütterungs-Feature-Anforderungen
│       ├── plan.md              # Technische Implementierungsdetails
│       ├── tasks.md             # Aufgabenaufschlüsselung (30 Aufgaben)
│       ├── data-model.md        # FeedingState-Schema
│       ├── research.md          # Technische Entscheidungen
│       ├── quickstart.md        # Entwickler-Integrationsleitfaden
│       └── contracts/           # Fütterungs-API-Verträge
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 🎯 MVP-Features

### User Stories (Alle Implementiert)

**Feature 001 - MVP**:
1. ✅ **P1 - Pferd ansehen**: Sieh das Pferde-Sprite mit 3 farbcodierten Statusleisten (Hunger, Sauberkeit, Zufriedenheit)
2. ✅ **P2 - Füttern**: Wähle Karotte aus dem Inventar und füttere das Pferd (Fressanimation)
3. ✅ **P3 - Putzen**: Wähle Bürste und ziehe über das Pferd zum Putzen (Glitzerpartikel)
4. ✅ **P4 - Streicheln**: Klicke/Tippe auf das Pferd, um die Zufriedenheit zu erhöhen (Herz-Animationen)
5. ✅ **P5 - Abbau**: Statuswerte sinken mit der Zeit mit rückwirkendem Aufholen
6. ✅ **P6 - Persistenz**: Auto-Speicherung in LocalStorage mit Wiederherstellung der verstrichenen Zeit

**Feature 002 - Erweiterte Fütterung**:
1. ✅ **US1 - Zeitgesteuertes Fressen**: 2,5s Fressanimation mit Fortschrittsanzeige, Spam-Prävention
2. ✅ **US2 - Sättigungslimit**: 3-Karotten-Limit, 30s Abklingzeit, 10s Abbau pro Karotte
3. ✅ **US3 - Visuelles Feedback**: Fortschrittsanzeige, Sättigungs-Badge (🍽️), Countdown-Timer, ausgegraute Symbole

### Spielmechaniken
- **Start-Inventar**: 10 Karotten, 100 Bürstennutzungen
- **Statusbereich**: 0-100 für alle Statistiken (begrenzt)
- **Abbauraten**:
  - Hunger: -1 pro 6 Sekunden (~10 Min bis 0)
  - Sauberkeit: -1 pro 12 Sekunden (~20 Min bis 0)
  - Zufriedenheit: -1 pro 7,5 Sekunden (~12,5 Min bis 0)
- **Aktionseffekte**:
  - Füttern: +20 Hunger, -1 Karotte, Fressanimation
  - Putzen: +5 Sauberkeit pro Strich, -1 Bürstennutzung, Glitzer
  - Streicheln: +10 Zufriedenheit (unbegrenzt, keine Kosten), Herzen

### Speichersystem
- **Auto-Speicher-Auslöser**:
  - Alle 10 Sekunden (zeitbasiertes Intervall)
  - Nach jeder Interaktion (Füttern/Putzen/Streicheln)
  - Beim Schließen/Aktualisieren des Tabs (beforeunload-Event)
- **Behandlung verstrichener Zeit**: Abbau wird rückwirkend beim Laden des gespeicherten Spiels angewendet

## 🧪 Tests

### Unit-Tests

Das Projekt enthält umfassende Unit-Tests, die Folgendes abdecken:

- **Zustandsverwaltung** (gameStore.test.ts): Anfangszustand, Updates, partielle Änderungen, Zeitstempel-Tracking
- **Spielaktionen** (actions.test.ts): feed(), groom(), pet(), selectTool(), resetGame() mit Randfällen
- **Fütterungshelfer** (feedingHelpers.test.ts): canFeed(), getSatietyProgress(), getRemainingCooldown(), getTimeUntilNextDecay()
- **Abbausystem** (DecaySystem.test.ts): Zeitbasierte Berechnungen, Begrenzung, Ratenunterschiede
- **Speichersystem** (SaveSystem.test.ts): Serialisierung, Validierung, verstrichene Zeit, Fütterungszustands-Persistenz
- **i18n-System** (i18nService.test.ts): Übersetzungen, Platzhalter, Sprachwechsel, Event-System
- **Sprachauswahl** (LanguageSelector.test.ts): UI-Komponente, Klick-Handler, Persistenz
- **Integrationstests**: 
  - careCycle.test.ts: End-to-End-Fütterungsmechanik
  - resetFlow.test.ts: Reset-Button-Workflow mit Locale-Persistenz
  - languageSwitch.test.ts: Kompletter Sprachwechsel-Workflow
  - spriteAnimations.test.ts: Sprite-Animationssystem

```bash
# Alle Tests ausführen
npm test

# Mit Coverage-Bericht ausführen
npm run test:coverage

# Interaktive Test-UI
npm run test:ui

# Watch-Modus für Entwicklung
npm run test -- --watch
```

**Teststatus**: 190 bestandene Tests  
**Coverage-Ziel**: ≥70% für alle Module

### Manuelle Test-Checkliste

1. **Füttern**: Klicke Karotte → Klicke Pferd → Überprüfe 2,5s Fressanimation mit Fortschrittsanzeige
2. **Sättigungslimit**: Füttere 3 Karotten → Überprüfe, dass Sättigungs-Badge (🍽️) mit Countdown erscheint
3. **Abklingzeit**: Nach 3 Karotten → Überprüfe, dass Karotte 30 Sekunden lang ausgegraut ist
4. **Abbau**: Warte 10s → Überprüfe, dass Sättigung um 1 Karotte sinkt, Abklingzeit aktualisiert wird
5. **Putzen**: Klicke Bürste → Ziehe über Pferd → Überprüfe, dass Sauberkeit steigt, Glitzer erscheinen
6. **Streicheln**: Klicke Pferd (kein Werkzeug) → Überprüfe, dass Zufriedenheit steigt, Herzen erscheinen
7. **Abbau**: Warte 60 Sekunden → Überprüfe, dass alle Statuswerte um erwartete Beträge sinken
8. **Persistenz**: Füttere 3 Karotten → Seite aktualisieren → Überprüfe, dass Abklingzeit bestehen bleibt
9. **Ressourcenerschöpfung**: Verwende alle Karotten → Überprüfe, dass Symbol ausgegraut wird, Klicken nichts bewirkt
10. **Statusbegrenzung**: Füttere bei 90 Hunger → Überprüfe, dass bei 100 gedeckelt wird, nicht überschreitet

## 🛠️ Entwicklungs-Workflow

### Aktueller Status: Alle Features Abgeschlossen ✅

Das Spiel ist voll funktionsfähig mit allen MVP-Features und erweiterter Fütterungsmechanik:

```bash
npm run dev
```

Erwartete Ausgabe:
- Vite-Entwicklungsserver startet auf http://localhost:5173
- Browser zeigt Stall mit Pferd, Statusleisten und Inventar
- Fütterung zeigt 2,5s Fressanimation mit Fortschrittsanzeige
- Nach 3 Karotten erscheint Sättigungs-Badge (🍽️) mit Countdown-Timer
- Alle 72 Tests bestehen

### Implementierung Abgeschlossen
- ✅ Feature 001: Pferdepflege-MVP (136 Aufgaben)
- ✅ Feature 002: Erweiterte Fütterungsmechanik (30 Aufgaben)
- ✅ Gesamt: 166 Aufgaben abgeschlossen

## 📚 Technologie-Stack

### Kerntechnologien

- **[Phaser 3.80+](https://phaser.io/)**: WebGL/Canvas-Spiel-Engine mit Scene-System, Input-Manager, Tweens
- **[TypeScript 5+](https://www.typescriptlang.org/)**: Typsichere Entwicklung mit Strict-Modus
- **[Zustand 4.x](https://github.com/pmndrs/zustand)**: Leichtgewichtige Zustandsverwaltung (<1KB)
- **[Vite 5](https://vitejs.dev/)**: Schneller Entwicklungsserver mit HMR und optimierten Produktions-Builds

### Entwicklungswerkzeuge

- **[Vitest 1](https://vitest.dev/)**: Unit-Testing mit jsdom-Umgebung
- **[ESLint](https://eslint.org/)**: Code-Linting mit TypeScript-Unterstützung
- **[Prettier](https://prettier.io/)**: Code-Formatierung
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)**: Progressive-Web-App-Unterstützung

### Architektur

- **Entity-Component-Pattern**: Modulare Spielobjektstruktur
- **Trennung der Anliegen**: Rendering (Phaser) entkoppelt von Zustand (Zustand) für Testbarkeit
- **Pure Functions**: Spiellogik ist vorhersagbar und unit-testbar
- **Responsive Skalierung**: FIT-Skalierungsmodus (320px-2560px unterstützt)
- **Canvas-Auflösung**: 800x600 Basis mit adaptiver Skalierung

## 🎨 Platzhalter-Assets

**MVP-Strategie**: Das Spiel verwendet Platzhalter-Grafiken für schnelles Prototyping:

- **Pferde-Sprite**: Brauner Kreis (#8B4513, 200px Durchmesser) mit 🐴 Emoji-Overlay
- **Symbole**: Unicode-Emojis (🥕 Karotte, 🪥 Bürste, ✨ Glitzer, ❤️ Herzen)
- **Hintergrund**: Phaser.Graphics-Verlauf (Himmelblau #87CEEB → Grasgrün #90EE90)
- **Statusleisten**: Phaser.Graphics-Rechtecke mit abgerundeten Ecken, farbcodiert nach Wert
- **Animationen**: Phaser.Tween-basiert (Skalierungs-/Positionsänderungen, keine Sprite-Sheets)

**Zukünftige Verbesserung**: Platzhalter-Assets können ohne Codeänderungen durch professionelle Sprites ersetzt werden (siehe [plan.md Decision 7](specs/001-horse-care-mvp/plan.md) Phase B).

## 🚧 Bekannte Einschränkungen (MVP-Umfang)

- Keine Musik oder Soundeffekte
- Keine erweiterten Animationen (Sprite-Sheets)
- Begrenzt auf ein einzelnes Pferd (kein Multi-Haustier-System)
- Kein Inventar-Nachfüllmechanismus (Karotten/Bürsten sind endlich)
- Kein Erfolgs- oder Fortschrittssystem
- Desktop-First-Design (Mobile ist funktional, aber nicht für Touch optimiert)

## 📚 Dokumentation

- [Spezifikation](specs/001-horse-care-mvp/spec.md) - Feature-Anforderungen und User Stories
- [Implementierungsplan](specs/001-horse-care-mvp/plan.md) - Technische Entscheidungen und Architektur
- [Aufgabenaufschlüsselung](specs/001-horse-care-mvp/tasks.md) - Entwicklungsaufgaben (136 insgesamt)
- [Datenmodell](specs/001-horse-care-mvp/data-model.md) - Entitätsdefinitionen und Beziehungen
- [Schnellstartanleitung](specs/001-horse-care-mvp/quickstart.md) - Entwickler-Integrationsleitfaden
- [Verträge](specs/001-horse-care-mvp/contracts/) - API-Spezifikationen und Schemas

## 🛠️ Entwicklungs-Workflow

Dieses Projekt folgt der **Spec-Driven Development**-Methodik unter Verwendung der `/speckit`-Methodik:

1. **Spezifikation** (`/speckit.specify`) → [spec.md](specs/001-horse-care-mvp/spec.md)
2. **Planung** (`/speckit.plan`) → [plan.md](specs/001-horse-care-mvp/plan.md)
3. **Aufgabenaufschlüsselung** (`/speckit.tasks`) → [tasks.md](specs/001-horse-care-mvp/tasks.md)
4. **Implementierung** (`/speckit.implement`) ← **MVP Abgeschlossen**

### Implementierungsfortschritt: Alle Features Abgeschlossen (100%)

**Feature 001 - Pferdepflege-MVP**:
- ✅ Phase 1: Setup (15 Aufgaben)
- ✅ Phase 2: Grundlagen (11 Aufgaben)
- ✅ Phase 3: US1 Pferd ansehen (14 Aufgaben)
- ✅ Phase 4: US2 Füttern (20 Aufgaben)
- ✅ Phase 5: US3 Putzen (20 Aufgaben)
- ✅ Phase 6: US4 Streicheln (12 Aufgaben)
- ✅ Phase 7: US5 Abbau (9 Aufgaben)
- ✅ Phase 8: Speicherung (13 Aufgaben)
- ✅ Phase 9: Feinschliff (21 Aufgaben)

**Feature 002 - Erweiterte Fütterungsmechanik**:
- ✅ User Story 1: Zeitgesteuerte Fressanimation (12 Aufgaben)
- ✅ User Story 2: Sättigungslimit-System (5 Aufgaben)
- ✅ User Story 3: Visuelles Feedback (7 Aufgaben)
- ✅ Feinschliff & Validierung (6 Aufgaben)

**Feature 003 - Visuelle Asset-Integration**:
- ✅ Sprite-Laden & Animationsregistrierung
- ✅ Animierte Pferde-Sprites (idle, eating, grooming, happy)
- ✅ Fallback-Modus für fehlende Assets

**Feature 004 - Reset-Button**:
- ✅ Reset-Button-UI mit Doppelklick-Schutz
- ✅ Kompletter Spielstand-Reset
- ✅ Locale-Persistenz beim Reset

**Feature 005 - Internationalization (i18n)**:
- ✅ i18nService mit Event-System
- ✅ Sprachauswahl-UI (DE/EN Flaggen)
- ✅ Alle UI-Texte übersetzt
- ✅ LocalStorage-Persistenz

## 🤝 Mitwirken

Ein Problem gefunden? Hast du einen Feature-Vorschlag?

1. Überprüfe bestehende Issues im Repository
2. Öffne ein neues Issue mit klaren Reproduktionsschritten
3. Für Beiträge befolge bitte den TypeScript-Style-Guide und füge Tests hinzu

## 📝 Lizenz

MIT-Lizenz - siehe LICENSE-Datei für Details

## 🐴 Credits

**Spieldesign**: Fionella Rossberg  
**Entwicklungsmethodik**: Spec-Driven Development mit `/speckit`-Workflow  
**Spiel-Engine**: [Phaser](https://phaser.io/) von Photon Storm  
**Zustandsverwaltung**: [Zustand](https://github.com/pmndrs/zustand) von Piotr Monowski  
**Build-Tool**: [Vite](https://vitejs.dev/) von Evan You  
**Typsicherheit**: [TypeScript](https://www.typescriptlang.org/) von Microsoft

---

**Viel Spaß bei der Pflege deines virtuellen Pferdes! 🐴✨**
