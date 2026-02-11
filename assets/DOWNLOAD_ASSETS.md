# 🎨 Asset Download - 5 Minuten Setup

## Professionelle Sprites verwenden (empfohlen)

### ⚡ Schnellstart mit Kenney.nl

**1. Download öffnen:**
```
https://kenney.nl/assets/animal-pack-redux
```

**2. Download-Button klicken** (ZIP, 9.4 MB, keine Registrierung)

**3. Entpacken und kopieren:**

Nach dem Entpacken findest du einen Ordner `PNG/Default/` mit vielen Tier-Sprites.

**Benötigte Dateien:**

```bash
# Aus dem heruntergeladenen Ordner kopiere:

# Pferd (wähle eine Variante)
horseBrown.png → assets/sprites/horse-idle.png
# ODER
horse.png → assets/sprites/horse-idle.png  
# ODER  
horseWhite.png → assets/sprites/horse-idle.png

# Icons (falls vorhanden im Pack)
carrot.png → assets/icons/icon-carrot.png
```

**4. Optional: Animationen**

Falls du separate Animationen möchtest, kopiere das gleiche Pferd-Sprite mehrfach:

```bash
cp assets/sprites/horse-idle.png assets/sprites/horse-eating.png
cp assets/sprites/horse-idle.png assets/sprites/horse-happy.png
```

Das System nutzt automatisch die gleiche Grafik für alle Zustände.

**5. Im Codespace kopieren:**

```bash
# Drag & Drop die PNG-Dateien direkt in VSCode:
# - Öffne den assets/sprites/ Ordner in VSCode
# - Ziehe horseBrown.png hinein
# - Benenne um zu horse-idle.png
```

---

## 🎯 Alternative: Andere Quellen

### OpenGameArt.org
- https://opengameart.org/content/horse-spritesheet
- Verschiedene Stile verfügbar
- Achte auf die Lizenz (meist CC-BY-SA)

### Itch.io Assets
- https://itch.io/game-assets/free/tag-horse
- Viele kostenlose Pixel Art Horses
- Direkt als PNG downloadbar

### Eigene Bilder
- Google Bildsuche: "horse sprite PNG transparent"
- Filter: "Creative Commons licenses"
- Mindestgröße: 256x256px empfohlen

---

## ✅ Testen

Nach dem Kopieren der Dateien:

```bash
npm run dev
```

In der Browser-Konsole sollte stehen:
```
[Horse] Using sprite asset
```

Statt:
```
[Horse] Using placeholder graphics
```

---

## 🎨 Aktueller Status

**Sprites (PNG erwartet):**
- ❌ `assets/sprites/horse-idle.png` - Fehlt noch
- ⚠️ `assets/sprites/horse-eating.png` - Optional
- ⚠️ `assets/sprites/horse-happy.png` - Optional

**Icons (PNG erwartet):**
- ❌ `assets/icons/icon-carrot.png` - Fehlt noch
- ⚠️ `assets/icons/icon-brush.png` - Optional

**SVG-Placeholder vorhanden:**
- ✅ `assets/sprites/horse-idle.svg` - Aktuell als Fallback genutzt (sieht aus wie Schwein 😅)

**Sobald die PNG-Dateien vorhanden sind, werden sie automatisch anstelle der Placeholder verwendet.**

---

## 💡 Tipp

Du kannst auch nur **ein einziges Pferd-Sprite** herunterladen und es für alle 3 Animationen verwenden:

```bash
# Einmal kopieren, dreimal verwenden:
cp horseBrown.png assets/sprites/horse-idle.png
cp horseBrown.png assets/sprites/horse-eating.png  
cp horseBrown.png assets/sprites/horse-happy.png
```

Die Animationen funktionieren dann über Tweens (Bewegung/Rotation) statt über Sprite-Wechsel.
