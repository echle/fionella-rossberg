# 🎨 Asset Integration Guide

## Kostenlose Horse Sprites - Empfohlene Quellen

### Option A: Kenney.nl (Empfohlen) 🌟
**Link**: https://kenney.nl/assets/animal-pack-redux
- **Lizenz**: CC0 (Public Domain)
- **Stil**: Cute, cartoonish
- **Format**: PNG, verschiedene Größen
- **Download**: Direkter Download ohne Account

**Was du brauchst**:
- `horse.png` → kopiere nach `assets/sprites/horse-idle.png`
- `carrot.png` → kopiere nach `assets/icons/carrot.png`

### Option B: OpenGameArt.org
**Links**:
- Horse: https://opengameart.org/content/horse-spritesheet
- Icons: https://opengameart.org/content/farming-icons

### Option C: LPC (Liberated Pixel Cup)
**Link**: https://lpc.opengameart.org/
- **Stil**: Pixel Art, Top-Down RPG
- **Lizenz**: CC-BY-SA / GPL
- **Generator**: Kombiniere verschiedene Assets

---

## 📁 Asset-Struktur

```
assets/
├── sprites/
│   ├── horse-idle.png      # 512x512px+ empfohlen
│   ├── horse-eating.png    # (optional) separate Animation
│   └── horse-happy.png     # (optional) separate Animation
├── icons/
│   ├── carrot.png          # 128x128px
│   └── brush.png           # 128x128px
└── particles/
    ├── sparkle.png         # 64x64px
    └── heart.png           # 64x64px
```

---

## 🚀 Schnellstart (5 Minuten)

### 1. Assets herunterladen

**Kenney Animal Pack Redux**:
```bash
# Öffne: https://kenney.nl/assets/animal-pack-redux
# Klicke "Download" (keine Registrierung nötig)
# Entpacke das ZIP
```

### 2. Dateien kopieren

```bash
# Im heruntergeladenen Ordner finde:
# - horse.png (oder horseWhite.png)
# - carrot.png (falls vorhanden)

# Kopiere nach:
cp horse.png /workspaces/codespaces-blank/assets/sprites/horse-idle.png
cp carrot.png /workspaces/codespaces-blank/assets/icons/carrot.png
```

### 3. Optional: Eigene PNG-Dateien nutzen

Du kannst auch eigene Bilder nutzen:
- Finde ein Horse-Bild online (lizenzfrei)
- Speichere es als PNG mit transparentem Hintergrund
- Benenne es `horse-idle.png` und kopiere es nach `assets/sprites/`

**Bildanforderungen**:
- Format: PNG mit Transparenz
- Mindestgröße: 256x256px
- Empfohlene Größe: 512x512px
- Dateigröße: < 500KB

---

## ⚙️ Code-Integration

Die Code-Integration ist **bereits vorbereitet**! Sobald du Assets in `assets/` ablegst:

1. **BootScene** lädt sie automatisch beim Start
2. **Horse Entity** nutzt das Sprite statt Placeholder
3. **Fallback**: Wenn keine Assets gefunden → zeigt Placeholder

**Keine Code-Änderungen nötig** wenn die Dateien korrekt benannt sind!

---

## 🎨 Alternative: Verbesserte Placeholders

Falls du noch keine Assets herunterladen möchtest, habe ich verbesserte programmatische Grafiken erstellt, die professioneller aussehen als die einfachen Kreise.

---

## 📝 Lizenzen beachten

**CC0 (Public Domain)**: Vollständig frei nutzbar, auch kommerziell
**CC-BY**: Namensnennung erforderlich (z.B. in Credits)
**CC-BY-SA**: Namensnennung + gleiche Lizenz für Derivate

Füge Credits in `README.md` hinzu:
```markdown
## Credits
- Horse Sprite: Kenney.nl (CC0)
- Icons: OpenGameArt.org (CC-BY)
```

---

## 🐛 Troubleshooting

**Asset wird nicht angezeigt?**
```bash
# Prüfe Dateipfad
ls -la assets/sprites/

# Prüfe Dateiname (case-sensitive!)
# ✓ horse-idle.png
# ✗ Horse-Idle.png
# ✗ horse_idle.png

# Prüfe Browser-Console für Ladefehler
npm run dev
# Öffne Browser → F12 → Console
```

**Asset ist zu groß?**
```bash
# Komprimiere mit ImageMagick
convert horse-idle.png -resize 512x512 -quality 85 horse-idle-optimized.png
```

---

**Bereit für Assets?** Lade sie herunter und kopiere sie nach `assets/`, dann starte ich die Code-Integration! 🚀
