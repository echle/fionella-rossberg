# 🗺️ Roadmap & Geplante Features

Dieses Dokument sammelt Ideen und geplante Erweiterungen für das Pferdepflege-Spiel.

## 🎯 Abgeschlossene Features

- ✅ **Feature 001**: Horse Care MVP - Grundlegende Pflege-Mechaniken
- ✅ **Feature 002**: Erweiterte Fütterungsmechanik - Zeitgesteuerte Animationen & Sättigungslimit
- ✅ **Feature 003**: Visuelle Asset-Integration - Sprite-basierte Animationen
- ✅ **Feature 004**: Reset-Button - Spielstand zurücksetzen
- ✅ **Feature 005**: Internationalization (i18n) - Mehrsprachigkeit (DE/EN)
- ✅ **Feature 006**: Economy System & Game Clock
  - Währungssystem (Horseshoes 💰)
  - Shop mit Items (Karotten, Bürsten, Bundles)
  - Game Clock für Spielzeit-Tracking
  - Mystery Gift Boxes (alle 5 Minuten)
  - Game Over Condition (alle Stats = 0)
- ✅ **Hotfix 006.1**: Pet Balance & Visual Feedback
  - 30-Sekunden-Cooldown für Pet-Aktion
  - Visueller Cooldown-Indikator (💗 Bereit in: Xs)
  - Verbesserte Herz-Partikel (15-24 Herzen in 3 Wellen)
  - Programmtische Textur-Generierung (Fallback für fehlende Assets)

---

## 🚀 Geplante Features: Item-Regeneration & Gameplay-Erweiterungen

### Problem
Aktuell sind Karotten und Bürsten limitierte Ressourcen. Wenn sie aufgebraucht sind, ist das Spiel faktisch beendet. Es fehlt eine Mechanik, um neue Items zu erhalten und das Gameplay langfristig interessant zu halten.

### Lösungsansätze

#### 1. 🪙 Währungssystem + Shop ✅ **IMPLEMENTIERT (Feature 006)**

**Konzept:**
- Jede Pflegeaktion (Füttern, Bürsten, Streicheln) gibt **Hufeisen/Münzen** als Belohnung
- Shop-Interface mit einfachem Modal: Items gegen Währung kaufen
- Preise: Karotte = 5💰, Bürsten-Refill (50 Nutzungen) = 8💰, Bundle (2🥕+20🪥) = 15💰

**Status:** ✅ Abgeschlossen (Feature 006)
- ✅ Currency-State im gameStore implementiert
- ✅ Shop-UI (Modal mit Item-Liste, Icons, Purchase-Buttons)
- ✅ Reward-System für alle Aktionen (Feed +5💰, Groom +3💰, Pet +2💰)
- ✅ Kauflogik mit Preisvalidierung und Insufficient-Funds-Check
- ✅ Max Currency Cap (999,999💰) mit Toast-Notification
- ✅ Auto-Save nach jeder Transaktion

**Ergebnis:** Löst das Item-Regenerations-Problem vollständig!

---

#### 2. 🎁 Tägliche Geschenke / Zeitbasierte Drops

**Konzept:**
- Alle 4-6 Stunden erscheint eine **Mystery-Box** auf dem Bildschirm
- Klicken/Antippen öffnet die Box → zufälliges Item (Karotte, Bürste, Bonus-Münzen)
- Optional: Täglicher Login-Bonus (progressiv steigend: Tag 1 = 1 Item, Tag 7 = 5 Items)

**Vorteile:**
- ✅ Fördert Player-Retention (regelmäßiges Zurückkommen)
- ✅ Überraschungseffekt durch Zufälligkeit
- ✅ Keine aktive Spielzeit nötig (passives Sammeln)

**Technische Anforderungen:**
- Timer-System mit LocalStorage-Persistenz (letzte Öffnungszeit)
- Animation für Mystery-Box-Spawn
- Random-Reward-Generator
- Notification-System (optional: "Box verfügbar!")

**Priorität:** 🟡 **Mittel** - Ergänzt Währungssystem gut

---

#### 3. 🥕 Mini-Garten für Karotten-Anbau

**Konzept:**
- 3-5 Pflanztöpfe als UI-Element (z.B. unten am Bildschirm)
- Klick auf leeren Topf → Karotte pflanzen (kostet vielleicht 1 Münze oder ist gratis)
- Wachstumsphasen: Samen → Sprössling → Reif (z.B. 30 Min Echtzeit)
- Klick auf reifen Topf → Ernten (1-3 Karotten)

**Vorteile:**
- ✅ Planung & Vorausschauen macht Spaß
- ✅ Visuelles Feedback durch Wachstums-Animation
- ✅ Kombinierbar mit Währungssystem (Samen kaufen, schnelleres Wachstum)

**Technische Anforderungen:**
- Garden-State (Topf-Status, Pflanzzeit)
- Timer-System für Wachstum
- Sprite-Animationen für Wachstumsphasen
- Harvest-Logik mit Reward

**Priorität:** 🟡 **Mittel** - Fun-Faktor, aber höherer Aufwand

---

#### 4. 🎯 Geschicklichkeits-Minispiel

**Konzept:**
- Button "Karotten sammeln" öffnet kleines Minispiel
- Beispiel: Karotten fallen vom Himmel, Korb mit Maus/Touch bewegen zum Auffangen
- 30 Sekunden Spielzeit → Gefangene Karotten = Belohnung
- Cooldown: Alle 2 Stunden spielbar

**Vorteile:**
- ✅ Hoher Fun-Faktor, skill-basiert
- ✅ Break aus regulärem Gameplay
- ✅ Wiederholbarer Content mit Highscore-Potential

**Technische Anforderungen:**
- Separate Minigame-Scene
- Physics-System (fallende Objekte, Collision-Detection)
- Input-Handling (Drag/Touch für Korb)
- Timer & Score-System

**Priorität:** 🟢 **Niedrig** - Aufwändig, optional für später

---

#### 5. ⭐ Quest/Achievement-System

**Konzept:**
- Tägliche/wöchentliche Quests mit Belohnungen:
  - "Füttere dein Pferd 10× heute" → 5 Karotten
  - "Erreiche 100% Gesundheit" → 2 Bürsten
  - "Spiele 7 Tage in Folge" → 20 Münzen
- Achievement-Tracker (z.B. "100 Karotten gefüttert" → Badge + Belohnung)

**Vorteile:**
- ✅ Langfristige Ziele geben Struktur
- ✅ Belohnt Engagement & Fortschritt
- ✅ Kombinierbar mit allen anderen Systemen

**Technische Anforderungen:**
- Quest-State (aktive Quests, Fortschritt)
- Achievement-Tracking (Counter für Aktionen)
- UI für Quest-Liste & Notifications
- Reward-Distribution-System

**Priorität:** 🟡 **Mittel** - Gute Ergänzung für Retention

---

#### 6. 🎲 Kombination: Empfohlene Implementierungs-Reihenfolge

Für optimalen Gameplay-Flow empfehle ich diese Reihenfolge:

**Phase 1 (Fundament):**
1. ~~**Währungssystem + Shop**~~ → ✅ Feature 006 (abgeschlossen)
   - Sofortige Lösung für Item-Regeneration
   - Belohnt aktives Spielen

**Phase 2 (Player Experience):**
2. **Intro-Screen & Personalisierung** → Feature 007 (in Planung)
   - Willkommens-Screen mit Pferdepflege-Erklärung
   - Pferd einen Namen geben (editierbar)
   - Schwierigkeitsgrad wählen (Easy/Normal/Hard)
   - Neustart-Möglichkeit ohne Game Over

3. **Tägliche Geschenke & Login-Belohnungen** → Feature 008 (geplant)
   - Passives Sammeln durch zeitbasierte Geschenke
   - Login-Streak-System
   - Spieler kommen regelmäßig zurück

**Phase 3 (Retention & Depth):**
4. **Quest/Achievement-System** → Feature 009 (geplant)
   - Langfristige Motivation
   - Strukturiertes Gameplay
   - Tägliche/wöchentliche Quests mit Belohnungen

**Phase 4 (Optional - Advanced):**
5. **Mini-Garten ODER Minispiel** → Feature 010/011 (Backlog)
   - Zusätzliche Gameplay-Varianz
   - Höherer Aufwand, aber hoher Mehrwert

---

## 📋 Feature 007: Intro-Screen & Personalisierung (In Planung)

### Problem
- Neue Spieler haben keine Einführung/Tutorial
- Schwierigkeitsgrad ist fest ("zu leicht" für erfahrene Spieler)
- Pferd ist anonym, keine emotionale Bindung
- Neustart nur bei Game Over möglich (frustrierend)

### Lösung

#### 1. 🎬 Willkommens-Screen
**Beim ersten Start:**
- Overlay mit Willkommenstext: "Willkommen bei Fionella Rossberg!"
- Kindgerechte Spielerklärung (siehe unten)
- "Los geht's!"-Button

**Kindgerechte Beschreibung (für Intro-Screen):**

```
🐴 Willkommen auf dem Pferdehof!

Du bist jetzt Pferdefreund von [Pferdename]! 
Dein Pferd braucht deine Hilfe jeden Tag. 

So kümmerst du dich um dein Pferd:

🥕 Füttern
   Dein Pferd hat Hunger! Gib ihm leckere Karotten.
   Klicke auf die Karotte und dann auf dein Pferd.
   Aber Achtung: Zu viele Karotten auf einmal machen 
   das Pferd satt! Warte ein bisschen, bevor du 
   nochmal fütterst.

🪥 Bürsten
   Pferde lieben es sauber zu sein! 
   Nimm die Bürste und ziehe sie über dein Pferd.
   Das macht das Fell schön glänzend!

💗 Streicheln
   Gib deinem Pferd viel Liebe!
   Klicke direkt auf das Pferd (ohne Werkzeug).
   Dann bekommst du ganz viele Herzen! ❤️
   Du kannst alle 30 Sekunden wieder streicheln.

💰 Hufeisen sammeln
   Jedes Mal wenn du dein Pferd pflegst, bekommst du 
   goldene Hufeisen! Damit kannst du im Laden neue 
   Karotten und Bürsten kaufen.

🎁 Geschenke finden
   Alle paar Minuten erscheint eine Überraschungsbox!
   Klicke drauf und hol dir tolle Geschenke!

⚠️ Wichtig: 
   Wenn alle drei Balken (Hunger, Sauberkeit, Glück) 
   auf Null sind, wird dein Pferd krank! 
   Pass gut auf dein Pferd auf! 🐴❤️

Viel Spaß! 🎉
```

#### 2. 🐴 Pferd benennen
**Nach Willkommens-Screen:**
- Input-Dialog: "Wie soll dein Pferd heißen?"
- Vorschläge: "Blitz", "Luna", "Max", "Stella" (oder eigener Name)
- Name wird persistent gespeichert
- Optional: Name über Pferd anzeigen oder im UI-Header
- Jederzeit editierbar über Settings-Button

#### 3. 🎯 Schwierigkeitsgrad-Auswahl
**Dropdown oder 3 Buttons:**

| Schwierigkeit | Start-Ressourcen | Decay-Rate | Preise | Pet-Cooldown |
|--------------|------------------|------------|--------|--------------|
| **Easy** | 20🥕, 150🪥, 100💰 | 0.5x | Normal | 20s |
| **Normal** | 10🥕, 100🪥, 50💰 | 1.0x | Normal | 30s |
| **Hard** | 3🥕, 20🪥, 20💰 | 2.0x | +50% teurer | 45s |

**Auswahl:**
- Anzeige mit Icons + Beschreibung
- "Kann später geändert werden" (über Settings)
- Speichern in gameStore.difficulty

#### 4. 🔄 Neustart ohne Game Over
**Problem:** Aktuell kann man nur neu starten wenn Game Over ist (Reset-Button nur sichtbar bei Ressourcen = 0)

**Lösung:**
- **Settings-Button** (⚙️) in UI-Ecke (immer sichtbar)
- Öffnet Modal mit:
  - Pferdename ändern
  - Schwierigkeitsgrad ändern
  - **"Spiel neu starten"** Button (mit Bestätigung)
  - Sprache wechseln (bereits vorhanden)
- Neustart löscht Spielstand, behält aber Settings (Name, Schwierigkeit, Sprache)

### Technische Umsetzung

**1. Neue State-Felder:**
```typescript
interface GameSettings {
  horseName: string; // Default: "Dein Pferd"
  difficulty: 'easy' | 'normal' | hard';
  hasSeenIntro: boolean; // Intro nur 1x zeigen
}
```

**2. Neue Szenen:**
- `IntroScene.ts` - Willkommens-Screen
- `SettingsModal.ts` - Settings-Dialog (Component in UIScene)

**3. Konfiguration:**
```typescript
// gameConstants.ts
export const DIFFICULTY_PRESETS = {
  EASY: {
    startCarrots: 20,
    startBrushes: 150,
    startCurrency: 100,
    decayMultiplier: 0.5,
    priceMultiplier: 1.0,
    petCooldown: 20000,
  },
  // ... NORMAL, HARD
};
```

**4. UI-Anpassungen:**
- Settings-Icon (⚙️) in UIScene (top-right, neben Reset-Button)
- Pferdename-Anzeige (optional: über Pferd oder im Header)
- Difficulty-Badge (kleines Icon: 🟢 Easy / 🟡 Normal / 🔴 Hard)

### Priorität
🔥 **Hoch** - Verbessert User Experience erheblich, relativ einfach umzusetzen

---

## 🚀 Geplante Features: Item-Regeneration & Gameplay-Erweiterungen

### Problem
~~Aktuell sind Karotten und Bürsten limitierte Ressourcen. Wenn sie aufgebraucht sind, ist das Spiel faktisch beendet.~~
✅ **GELÖST durch Feature 006** - Währungssystem + Shop ermöglicht Item-Kauf

### Verbleibende Erweiterungen

- 🐴 **Mehrere Pferde**: Stall mit 3-5 Pferden, jedes mit eigenen Stats
- 🎨 **Pferd-Customization**: Farbe, Mähne, Accessoires ändern
- 🏆 **Wettbewerbe**: Schönheitswettbewerbe, Geschwindigkeitsrennen (wenn Pferd gut gepflegt)
- 👥 **Soziale Features**: Freunde besuchen, Gifts senden
- 🌦️ **Wetter-System**: Einfluss auf Pferde-Mood (Regen macht schmutzig)
- 🎵 **Sound-Effekte**: Wiehern, Kau-Geräusche, Hintergrundmusik
- 📊 **Statistiken**: Lebenszeit-Stats (Gesamte Karotten gefüttert, etc.)

---

## 📌 Entscheidungs-Tracking

| Feature-Idee | Status | Priorität | Geschätzte Komplexität | Nächste Schritte |
|--------------|--------|-----------|------------------------|------------------|
| ~~Währung + Shop~~ | ✅ Fertig | ~~Hoch~~ | ~~Mittel~~ | Feature 006 abgeschlossen |
| ~~Pet-Balance~~ | ✅ Fertig | ~~Hoch~~ | ~~Niedrig~~ | Hotfix 006.1 abgeschlossen |
| Intro-Screen + Personalisierung | 🔜 Geplant | Hoch | Mittel (2-3 Tage) | Spec erstellen (Feature 007) |
| Tägliche Geschenke | 💭 Idee | Mittel | Niedrig (1-2 Tage) | Feature 008 |
| Quest-System | 💭 Idee | Mittel | Mittel-Hoch (3-4 Tage) | Feature 009 |
| Mini-Garten | 💭 Idee | Mittel | Mittel (2-3 Tage) | Feature 010 (optional) |
| Minispiel | 💭 Idee | Niedrig | Hoch (4-5 Tage) | Feature 011 (optional) |

---

## 🔄 Update-Log

- **2026-02-14**: Roadmap erstellt - Item-Regeneration & Gameplay-Erweiterungen dokumentiert
- **2026-02-15**: Feature 006 (Economy System) abgeschlossen
- **2026-02-15**: Hotfix 006.1 (Pet Balance) implementiert - 30s Cooldown + visuelle Verbesserungen
- **2026-02-15**: Feature 007 geplant - Intro-Screen, Pferdename, Schwierigkeitsgrade, Settings-Modal
