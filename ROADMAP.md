# 🗺️ Roadmap & Geplante Features

Dieses Dokument sammelt Ideen und geplante Erweiterungen für das Pferdepflege-Spiel.

## 🎯 Abgeschlossene Features

- ✅ **Feature 001**: Horse Care MVP - Grundlegende Pflege-Mechaniken
- ✅ **Feature 002**: Erweiterte Fütterungsmechanik - Zeitgesteuerte Animationen & Sättigungslimit
- ✅ **Feature 003**: Visuelle Asset-Integration - Sprite-basierte Animationen
- ✅ **Feature 004**: Reset-Button - Spielstand zurücksetzen
- ✅ **Feature 005**: Internationalization (i18n) - Mehrsprachigkeit (DE/EN)

---

## 🚀 Geplante Features: Item-Regeneration & Gameplay-Erweiterungen

### Problem
Aktuell sind Karotten und Bürsten limitierte Ressourcen. Wenn sie aufgebraucht sind, ist das Spiel faktisch beendet. Es fehlt eine Mechanik, um neue Items zu erhalten und das Gameplay langfristig interessant zu halten.

### Lösungsansätze

#### 1. 🪙 Währungssystem + Shop (Empfohlen als erste Implementierung)

**Konzept:**
- Jede Pflegeaktion (Füttern, Bürsten, Streicheln) gibt **Hufeisen/Münzen** als Belohnung
- Shop-Interface mit einfachem Modal: Items gegen Währung kaufen
- Beispiel-Preise: Karotte = 5🪙, Bürste = 8🪙, Premium-Items = 15🪙

**Vorteile:**
- ✅ Schnell umzusetzen, baut auf bestehendem Inventory-System auf
- ✅ Belohnt aktives Spielen sofort ohne Wartezeit
- ✅ Schafft gameplay-Loop: Pflege → Verdienen → Kaufen → Pflege
- ✅ Fundament für spätere Erweiterungen (Premium-Items, Upgrades)

**Technische Anforderungen:**
- Currency-State im gameStore
- Shop-UI (Modal mit Item-Liste)
- Reward-System in actions.ts
- Kauflogik mit Preisvalidierung

**Priorität:** 🔥 **Hoch** - Löst das Kern-Problem elegant

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
1. **Währungssystem + Shop** → Feature 006
   - Sofortige Lösung für Item-Regeneration
   - Belohnt aktives Spielen

**Phase 2 (Retention):**
2. **Tägliche Geschenke** → Feature 007
   - Passives Sammeln
   - Spieler kommen regelmäßig zurück

**Phase 3 (Depth & Variety):**
3. **Quest/Achievement-System** → Feature 008
   - Langfristige Motivation
   - Strukturiertes Gameplay

**Phase 4 (Optional - Advanced):**
4. **Mini-Garten ODER Minispiel** → Feature 009/010
   - Zusätzliche Gameplay-Varianz
   - Höherer Aufwand, aber hoher Mehrwert

---

## 💡 Weitere Ideen (Backlog)

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
| Währung + Shop | 🔜 Geplant | Hoch | Mittel (2-3 Tage) | Spec erstellen (Feature 006) |
| Tägliche Geschenke | 💭 Idee | Mittel | Niedrig (1-2 Tage) | Nach Shop implementieren |
| Mini-Garten | 💭 Idee | Mittel | Mittel (2-3 Tage) | TBD |
| Minispiel | 💭 Idee | Niedrig | Hoch (4-5 Tage) | TBD |
| Quest-System | 💭 Idee | Mittel | Mittel-Hoch (3-4 Tage) | TBD |

---

## 🔄 Update-Log

- **2026-02-14**: Roadmap erstellt - Item-Regeneration & Gameplay-Erweiterungen dokumentiert
