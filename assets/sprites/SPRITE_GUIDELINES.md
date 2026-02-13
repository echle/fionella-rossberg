# Sprite Asset Guidelines

**Feature 003: Visual Asset Integration**  
**Version**: 1.0.0  
**Last Updated**: February 13, 2026

## Overview

This document defines the technical requirements and best practices for creating sprite sheet assets for the Horse Care MVP game. Following these guidelines ensures consistency, optimal performance, and seamless integration with the Phaser 3 game engine.

---

## 📐 Technical Specifications

### Sprite Sheet Format

| Property | Value | Rationale |
|----------|-------|-----------|
| **Layout** | Horizontal strip | Standard Phaser format, easy to edit |
| **Frame Size** | 512×384 pixels | High-resolution sprites for crisp display |
| **Frame Count** | 8 frames | Smooth animation at 9-12 FPS |
| **Total Sheet Size** | 4096×384 pixels | 8 frames × 512px width |
| **File Format** | PNG with transparency | Alpha channel for clean edges |
| **Color Depth** | 24-bit RGB + 8-bit Alpha | Full color with transparency |
| **File Size Target** | 200-400 KB per sheet | Optimized for high-resolution |

### Animation Frame Rates

| Animation State | FPS | Repeat | Duration | Use Case |
|----------------|-----|--------|----------|----------|
| **Idle** | 9 FPS | Loop (-1) | Infinite | Default breathing cycle |
| **Eating** | 9 FPS | Loop (-1) | 2.5s (timed) | Chewing motion during feeding |
| **Grooming** | 9 FPS | Loop (-1) | Manual stop | Content sway while brushing |
| **Happy** | 12 FPS | One-shot (0) | ~0.67s | Celebration jump/nod |
| **Walking** | 12 FPS | Loop (-1) | Reserved | Future locomotion feature |

---

## 📁 File Naming Convention

### Pattern
```
{entity}_{action}.png
```

### Examples
```
horse_idle.png       ✅ Correct
horse_eat.png        ✅ Correct
horse_pet.png        ✅ Correct (grooming action)
horse_happy.png      ✅ Correct
horse_walk.png       ✅ Correct

Horse_Idle.PNG       ❌ Wrong (case-sensitive, uppercase)
horse-idle.png       ❌ Wrong (use underscores, not hyphens)
idle_horse.png       ❌ Wrong (action before entity)
```

### Texture Keys in Code
```typescript
// Load sprite sheet
this.load.spritesheet('horse_idle', 'assets/sprites/horse/horse_idle.png', {
  frameWidth: 512,
  frameHeight: 384,
});

// Animation key (hyphenated)
this.anims.create({
  key: 'horse-idle',  // Note: Animation keys use hyphens
  frames: this.anims.generateFrameNumbers('horse_idle', { start: 0, end: 7 }),
  frameRate: 9,
  repeat: -1,
});
```

---

## 🎨 Art Direction Requirements

### Anchor Point (Origin)

**Bottom-Center Registration** (x: 0.5, y: 1.0)

```
     Frame Visual Boundary
┌────────────────────────────┐
│                            │
│          🐴 Horse          │
│                            │
│                            │
│         🦵  🦵            │  ← Feet should be here
└──────────┬─────────────────┘
           └─ (256px, 384px) = Anchor Point (center-bottom)
```

**Why Bottom-Center?**
- Feet remain "planted" on ground during animations
- Consistent vertical alignment across all states
- Natural for jumping/landing animations (happy state)
- Easier to position multiple entities on same ground plane

**Artist Instructions**:
1. Draw horse with **feet touching the bottom edge** of the 512×384px frame
2. Center the horse **horizontally** within the frame
3. Leave ~40-60px padding at top for vertical motion (ears, head bob)
4. Ensure feet position is **consistent across all frames** (no sliding)

### Visual Consistency Checklist

- [ ] **Silhouette**: Recognizable as a horse at 512px resolution
- [ ] **Color Palette**: Limited to 16-32 colors (dithering for gradients)
- [ ] **Line Weight**: 2-3px outlines for clarity at game scale
- [ ] **Contrast**: Sufficient contrast with background (sky blue → grass green gradient)
- [ ] **Frame Coherence**: No sudden jumps between frames (smooth motion)
- [ ] **Transparency**: Clean alpha edges (no white halos or fringing)

---

## 🛠️ Export Settings

### Photoshop / Procreate
```
File > Export > Export As...
Format: PNG-24
Transparency: Checked
Interlaced: Unchecked
Embed Color Profile: sRGB
Resolution: 72 PPI (web standard)
```

### Aseprite (Recommended for Pixel Art)
```
File > Export Sprite Sheet
Sheet Type: Horizontal Strip
Columns: 8
Rows: 1
Frame Size: 512×384
Trim: Unchecked (keep full frame size)
Output File: PNG
Color Mode: RGBA
```

### GIMP
```
File > Export As...
Format: PNG
Compression Level: 9 (maximum)
Save background color: No
Save gamma: No
Interlacing: Off
```

### Optimization (Post-Export)

**Recommended Tool**: [PNGQuant](https://pngquant.org/) or [TinyPNG](https://tinypng.com/)

```bash
# Command-line optimization
pngquant --quality=80-95 --ext .png --force assets/sprites/horse/*.png

# Expected output (high-resolution sprites)
horse_idle.png: 420 KB → 285 KB (32% reduction)
```

**Quality Targets**:
- Original: ~350-500 KB (acceptable)
- Optimized: 200-400 KB (ideal)
- Aggressive: 150-250 KB (only if quality acceptable)

---

## 🎬 Animation Guidelines

### Frame Timing Examples

**Idle (9 FPS, 8 frames)**:
```
Frame: [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [loop]
Time:  0ms  111  222  333  444  555  666  777  888ms
       ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
      Stand Inhale Peak Exhale Stand Blink Blink Stand
```

**Eating (9 FPS, looped for 2.5s = ~22.5 frames = ~3 cycles)**:
```
Cycle 1: [0][1][2][3][4][5][6][7]
Cycle 2: [0][1][2][3][4][5][6][7]
Cycle 3: [0][1][2][3][4][5][6]... (stopped at 2500ms)
```

**Happy (12 FPS, one-shot = ~667ms total)**:
```
Frame: [0]    [1]   [2]   [3]   [4]   [5]   [6]   [7]
Time:  0ms    83    166   250   333   416   500   583   → idle
       ↓      ↓     ↓     ↓     ↓     ↓     ↓     ↓
      Crouch Wind-up Jump  Peak  Fall  Land  Settle Done
```

### Motion Principles

1. **Ease In/Out**: Slow at start/end, fast in middle (frames 0,7 similar; 3,4 most different)
2. **Anticipation**: Wind-up before main action (frame 0-1 for jump)
3. **Follow-Through**: Settle after action (frame 6-7 after landing)
4. **Squash & Stretch**: Vertical compression on impact, stretch during jump
5. **Arcs**: Head/tail follow curved paths, not straight lines
6. **Secondary Motion**: Tail/mane lag behind body (frame n+1 catches up)

---

## 📦 Directory Structure

```
assets/sprites/
├── SPRITE_GUIDELINES.md (this file)
├── horse/
│   ├── README.md (character-specific notes)
│   ├── horse_idle.png
│   ├── horse_eat.png
│   ├── horse_happy.png
│   ├── horse_pet.png (grooming/petting)
│   ├── horse_walk.png
│   ├── horse.meta.json (animation metadata reference)
│   └── source/
│       ├── horse_idle.aseprite (editable source files)
│       ├── horse_eat.aseprite
│       └── ... (keep source files for future edits)
└── girl/
    ├── README.md
    ├── girl_idle.png (future character)
    └── source/
```

### Metadata Reference (horse.meta.json)
```json
{
  "frameWidth": 512,
  "frameHeight": 384,
  "name": "Horse Sprite Animations",
  "version": "1.0.0",
  "animations": {
    "idle": {
      "key": "horse-idle",
      "frames": 8,
      "frameRate": 9,
      "repeat": -1,
      "notes": "Breathing cycle with occasional blink"
    },
    "eat": {
      "key": "horse-eat",
      "frames": 8,
      "frameRate": 9,
      "repeat": -1,
      "durationMs": 2500,
      "notes": "Chewing motion, stopped after 2.5s via timer"
    }
  }
}
```

---

## ✅ Quality Assurance Checklist

### Pre-Export Checklist
- [ ] All 8 frames drawn with consistent style
- [ ] Horse feet touch bottom edge in all frames
- [ ] Transparent background (no white/black backdrop)
- [ ] Checked at 1:1 zoom (actual game size)
- [ ] No stray pixels outside main sprite
- [ ] Symmetry verified (left/right balance)

### Post-Export Checklist
- [ ] File size: 200-400 KB (optimized)
- [ ] Dimensions: 4096×384 pixels (verified)
- [ ] No color banding or compression artifacts
- [ ] Transparency intact (alpha channel present)
- [ ] No white halos around edges
- [ ] Opens correctly in image viewer

### In-Game Testing Checklist
- [ ] Animation plays smoothly (no stuttering)
- [ ] Feet stay planted (no ice-skating effect)
- [ ] No visual glitches or frame skipping
- [ ] Readable at gameplay scale (1.5× = 192px)
- [ ] Contrast sufficient against background
- [ ] Performance: Stable 60 FPS maintained

---

## 🔄 Adding New Sprites

### Step-by-Step Process

1. **Create Source File** (Aseprite/Photoshop)
   - New document: 4096×384px, transparent background
   - Draw 8 frames, each 512×384px cell
   - Follow art direction (anchor point, consistency)

2. **Export PNG**
   - Use settings defined above
   - Save to `assets/sprites/horse/`
   - Name: `horse_{action}.png`

3. **Optimize File**
   ```bash
   pngquant --quality=80-95 horse_newaction.png
   ```

4. **Update BootScene.ts**
   ```typescript
   // Add to preload()
   this.load.spritesheet('horse_newaction', 'assets/sprites/horse/horse_newaction.png', {
     frameWidth: 512,
     frameHeight: 384,
   });

   // Add to registerHorseAnimations()
   this.anims.create({
     key: 'horse-newaction',
     frames: this.anims.generateFrameNumbers('horse_newaction', { start: 0, end: 7 }),
     frameRate: 12, // Adjust as needed
     repeat: -1, // Or 0 for one-shot
   });
   ```

5. **Update Horse.ts**
   ```typescript
   // Add to HorseAnimationState type (src/state/types.ts)
   export type HorseAnimationState = 
     | 'idle' 
     | 'eating' 
     | 'grooming' 
     | 'happy' 
     | 'walking'
     | 'newaction'; // ← Add here

   // Add to animationKeys mapping (src/entities/Horse.ts)
   const animationKeys: Record<HorseAnimationState, string> = {
     // ... existing mappings ...
     newaction: 'horse-newaction',
   };

   // Add public method
   playNewActionAnimation(): void {
     if (this.useSprite) {
       this.setState('newaction');
     }
   }
   ```

6. **Test in Browser**
   ```bash
   npm run dev
   ```

---

## 🚨 Common Issues & Solutions

### Issue: Animation is choppy or stuttering
**Cause**: Frame rate too high or inconsistent frame timings  
**Solution**: Use 9-12 FPS, ensure each frame has equal visual weight

### Issue: Horse "skating" across ground
**Cause**: Feet position inconsistent across frames  
**Solution**: Use onion skinning, trace foot position on graph paper

### Issue: White halo around sprite edges
**Cause**: Premultiplied alpha in Photoshop export  
**Solution**: Use "Save for Web" instead of "Export As", uncheck "Convert to sRGB"

### Issue: File size too large (>100 KB)
**Cause**: Too many colors or no optimization  
**Solution**: Reduce color palette to 32 colors, run through pngquant

### Issue: Animation starts from wrong frame
**Cause**: Frames not in chronological order in sprite sheet  
**Solution**: Verify frame order left-to-right (0-7), check export settings

---

## 📚 References

### Tools
- **Aseprite**: https://www.aseprite.org/ (pixel art, animation)
- **PNGQuant**: https://pngquant.org/ (optimization)
- **GIMP**: https://www.gimp.org/ (free alternative to Photoshop)

### Documentation
- **Phaser 3 Sprite Sheets**: https://photonstorm.github.io/phaser3-docs/Phaser.Textures.TextureManager.html#addSpriteSheet
- **Phaser 3 Animations**: https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html

### Inspiration
- **Stardew Valley**: Animals with subtle idle animations
- **Harvest Moon**: Character sprite consistency across states
- **Celeste**: Fluid animation with limited frames

---

**Questions?** Contact the project maintainer or open an issue in the repository.
