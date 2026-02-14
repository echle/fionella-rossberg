# Quick Start Guide: Visual Asset Integration

**Feature**: 003-visual-assets | **Date**: February 13, 2026  
**Audience**: Developers implementing sprite-based horse animations  
**Prerequisites**: Feature 001 (MVP) and Feature 002 (Enhanced Feeding) complete

## Overview

This guide walks through integrating professional sprite sheets into the horse care game. By following these steps, you'll replace placeholder graphics with frame-based animations while maintaining full backward compatibility.

**Estimated Time**: 2-3 hours for P1 (Horse sprites only)

---

## Quick Reference

### What's Changing
| Component | Old | New |
|-----------|-----|-----|
| Horse rendering | `Phaser.GameObjects.Image` | `Phaser.GameObjects.Sprite` |
| Animation method | `setTexture()` + Tweens | `play()` animation keys |
| Asset loading | Single images (`horse-idle.png`) | Sprite sheets (`horse_idle.png`, 512×384 frames) |
| Animation registration | None | `this.anims.create()` in BootScene |

### What's **NOT** Changing
- Public API: `playEatingAnimation()`, `playHappyAnimation()`
- Game logic: All state management in `actions.ts` unchanged
- SaveSystem: No sprite state persisted
- Fallback: Placeholder Graphics still supported

---

## Step 1: Verify Asset Files

**Location**: `assets/sprites/horse/`

**Required Files**:
```bash
assets/sprites/horse/
├── horse_idle.png       # 4096×384px, 8 frames @ 512×384px each
├── horse_eat.png        # 4096×384px, 8 frames @ 512×384px each
├── horse_walk.png       # 4096×384px, 8 frames @ 512×384px each (future)
├── horse_happy.png      # 4096×384px, 8 frames @ 512×384px each
├── horse_pet.png        # 4096×384px, 8 frames @ 512×384px each
└── horse.meta.json      # Animation metadata (reference only)
```

**Validation**:
```bash
# Check file sizes (should be ~200-400KB each)
ls -lh assets/sprites/horse/*.png

# Verify dimensions with ImageMagick (optional)
identify assets/sprites/horse/horse_idle.png
# Expected output: horse_idle.png PNG 4096x384 ...
```

**If files missing**: Game will fall back to placeholder Graphics (brown circle + 🐴). No error thrown.

---

## Step 2: Update BootScene - Sprite Sheet Loading

**File**: `src/scenes/BootScene.ts`

### 2.1: Replace Image Loading with Sprite Sheet Loading

**OLD** (Features 001/002):
```typescript
preload(): void {
  this.load.on('loaderror', (file: Phaser.Loader.File) => {
    console.warn(`[BootScene] Asset not found: ${file.key} - using placeholder`);
  });

  // Single images (no animation support)
  this.load.image('horse-idle', 'assets/sprites/horse-idle.png');
  this.load.image('horse-eating', 'assets/sprites/horse-eating.png');
  this.load.image('horse-happy', 'assets/sprites/horse-happy.png');
  
  // ... other assets ...
}
```

**NEW** (Feature 003):
```typescript
preload(): void {
  this.load.on('loaderror', (file: Phaser.Loader.File) => {
    console.warn(`[BootScene] ⚠️ Asset failed to load: ${file.key} - fallback to placeholder`);
  });

  // Sprite sheets (frame-based animations)
  this.load.spritesheet('horse_idle', 'assets/sprites/horse/horse_idle.png', {
    frameWidth: 512,
    frameHeight: 384,
  });
  
  this.load.spritesheet('horse_eat', 'assets/sprites/horse/horse_eat.png', {
    frameWidth: 512,
    frameHeight: 384,
  });
  
  this.load.spritesheet('horse_happy', 'assets/sprites/horse/horse_happy.png', {
    frameWidth: 512,
    frameHeight: 384,
  });
  
  this.load.spritesheet('horse_pet', 'assets/sprites/horse/horse_pet.png', {
    frameWidth: 512,
    frameHeight: 384,
  });
  
  this.load.spritesheet('horse_walk', 'assets/sprites/horse/horse_walk.png', {
    frameWidth: 512,
    frameHeight: 384,
  });
  
  // ... other assets (icons, particles) unchanged for P1 ...
}
```

**Key Changes**:
- `this.load.image()` → `this.load.spritesheet()`
- Added `frameWidth` and `frameHeight` config (128×128px per frame)
- Changed texture keys: `'horse-idle'` → `'horse_idle'` (match filename convention)

### 2.2: Register Animations in create()

**Add new method** after `create()`:

```typescript
create(): void {
  // Register animations before loading save data
  if (this.textures.exists('horse_idle')) {
    this.registerHorseAnimations();
    console.log('[BootScene] ✅ Horse animations registered');
  } else {
    console.warn('[BootScene] ⚠️ Horse sprites unavailable, using placeholders');
  }
  
  // Existing save/load logic (unchanged)
  const loadResult = saveSystem.load();
  if (loadResult) {
    const { savedState, elapsedMs } = loadResult;
    console.log(`[BootScene] Loading saved game (${Math.floor(elapsedMs / 1000)}s elapsed)`);
    loadGameState({
      version: savedState.version,
      timestamp: Date.now(),
      horse: savedState.horse,
      inventory: savedState.inventory,
      feeding: savedState.feeding,
    });
    if (elapsedMs > 0) {
      applyDecay(elapsedMs);
    }
  } else {
    console.log('[BootScene] Starting new game');
  }

  // Start game scenes (unchanged)
  this.scene.start('MainGameScene');
  this.scene.launch('UIScene');
}

private registerHorseAnimations(): void {
  // Idle animation (looping breath cycle)
  this.anims.create({
    key: 'horse-idle',
    frames: this.anims.generateFrameNumbers('horse_idle', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1, // Infinite loop
  });
  
  // Eating animation (looping chew motion)
  this.anims.create({
    key: 'horse-eat',
    frames: this.anims.generateFrameNumbers('horse_eat', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1, // Loop for 2.5s duration (stopped manually)
  });
  
  // Happy animation (one-shot jump/nod)
  this.anims.create({
    key: 'horse-happy',
    frames: this.anims.generateFrameNumbers('horse_happy', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: 0, // One-shot
  });
  
  // Grooming animation (looping content sway)
  this.anims.create({
    key: 'horse-pet',
    frames: this.anims.generateFrameNumbers('horse_pet', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1,
  });
  
  // Walk animation (future feature, looping trot)
  this.anims.create({
    key: 'horse-walk',
    frames: this.anims.generateFrameNumbers('horse_walk', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1,
  });
}
```

**Why in create() not preload()**:
- Animations require textures to be fully loaded first
- `create()` runs after `preload()` completes
- Phaser throws error if animations registered before textures ready

---

## Step 3: Update Horse Entity - Sprite Rendering

**File**: `src/entities/Horse.ts`

### 3.1: Add State Tracking Properties

Add at top of class:

```typescript
export class Horse extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite; // ← Change Image to Sprite
  private readonly startY: number;
  private readonly useSprite: boolean;
  
  // NEW: Animation state tracking
  private currentState: HorseAnimationState = 'idle';
  private isLocked: boolean = false;
  
  // ... rest of class ...
}
```

**Add type definition** in `src/state/types.ts`:
```typescript
export type HorseAnimationState = 'idle' | 'eating' | 'grooming' | 'happy' | 'walking';
```

### 3.2: Update constructor()

**OLD** (Features 001/002):
```typescript
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y);
  this.startY = y;
  
  // Check for single image texture
  this.useSprite = scene.textures.exists('horse-idle');
  
  if (this.useSprite) {
    // Use Image (no animation support)
    this.sprite = scene.add.image(0, 0, 'horse-idle');
    this.sprite.setDisplaySize(200, 200);
    this.add(this.sprite);
    console.log('[Horse] Using sprite asset');
  } else {
    // Placeholder Graphics
    this.sprite = scene.add.graphics();
    (this.sprite as Phaser.GameObjects.Graphics).fillStyle(0x8b4513, 1);
    (this.sprite as Phaser.GameObjects.Graphics).fillCircle(0, 0, 100);
    this.add(this.sprite);
    
    const label = scene.add.text(0, 0, '🐴', { fontSize: '80px', align: 'center' });
    label.setOrigin(0.5);
    this.add(label);
    console.log('[Horse] Using placeholder graphics');
  }
  
  scene.add.existing(this);
  this.setSize(220, 220);
  this.setInteractive();
}
```

**NEW** (Feature 003):
```typescript
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y);
  this.startY = y;
  
  // Check for sprite sheet AND registered animations
  this.useSprite = scene.textures.exists('horse_idle') && scene.anims.exists('horse-idle');
  
  if (this.useSprite) {
    // Use Sprite (animation support)
    this.sprite = scene.add.sprite(0, 0, 'horse_idle', 0);
    (this.sprite as Phaser.GameObjects.Sprite).setOrigin(0.5, 1.0); // Bottom-center
    (this.sprite as Phaser.GameObjects.Sprite).setScale(1.5); // 128px → 192px display size
    (this.sprite as Phaser.GameObjects.Sprite).play('horse-idle'); // Start idle animation
    this.add(this.sprite);
    console.log('[Horse] ✅ Using sprite animations');
  } else {
    // Placeholder Graphics (unchanged)
    this.sprite = scene.add.graphics();
    (this.sprite as Phaser.GameObjects.Graphics).fillStyle(0x8b4513, 1);
    (this.sprite as Phaser.GameObjects.Graphics).fillCircle(0, 0, 100);
    this.add(this.sprite);
    
    const label = scene.add.text(0, 0, '🐴', { fontSize: '80px', align: 'center' });
    label.setOrigin(0.5);
    this.add(label);
    console.warn('[Horse] ⚠️ Sprites unavailable, using placeholder');
  }
  
  scene.add.existing(this);
  this.setSize(220, 220);
  this.setInteractive();
}
```

**Key Changes**:
- `scene.add.image()` → `scene.add.sprite()`
- Added `setOrigin(0.5, 1.0)` for bottom-center anchor (feet stay planted)
- Added `setScale(1.5)` to scale up from 128px to 192px (matches placeholder size)
- Call `play('horse-idle')` to start idle animation immediately
- Check `scene.anims.exists()` in addition to `scene.textures.exists()`

### 3.3: Add setState() Method

**Add new private method**:

```typescript
private setState(newState: HorseAnimationState): void {
  // Prevent redundant transitions
  if (this.currentState === newState) return;
  
  // Prevent interruption during locked animations
  if (this.isLocked) {
    console.warn(`[Horse] State locked, cannot transition to ${newState}`);
    return;
  }
  
  // Only works in sprite mode
  if (!this.useSprite) return;
  
  // Update state and play animation
  this.currentState = newState;
  const animKey = `horse-${newState}`;
  
  if (this.scene.anims.exists(animKey)) {
    (this.sprite as Phaser.GameObjects.Sprite).play(animKey, true); // Force restart
  } else {
    console.error(`[Horse] Animation not found: ${animKey}`);
    return;
  }
  
  // Handle one-shot animations (auto-return to idle)
  if (newState === 'happy') {
    this.isLocked = true;
    (this.sprite as Phaser.GameObjects.Sprite).once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.isLocked = false;
        this.setState('idle');
      }
    );
  }
}
```

### 3.4: Update playEatingAnimation()

**OLD**:
```typescript
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this);
    
    // Texture swap
    if (this.useSprite && this.scene.textures.exists('horse-eating')) {
      const sprite = this.sprite as Phaser.GameObjects.Image;
      sprite.setTexture('horse-eating');
      this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
        sprite.setTexture('horse-idle');
      });
    }
    
    // Tween animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: FEEDING_CONFIG.EATING_DURATION,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => resolve(),
    });
  });
}
```

**NEW**:
```typescript
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this);
    
    if (this.useSprite) {
      // Sprite animation
      this.setState('eating');
      
      // Stop eating animation after FEEDING_CONFIG.EATING_DURATION
      this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
        this.setState('idle');
        resolve();
      });
    } else {
      // Fallback: Tween animation (unchanged)
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: FEEDING_CONFIG.EATING_DURATION,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => resolve(),
      });
    }
  });
}
```

**Key Changes**:
- Sprite mode: Call `setState('eating')` instead of texture swap
- Promise resolves after 2.5s (unchanged timing, maintains Feature 002 contract)
- Fallback mode unchanged (tween still works for placeholders)

### 3.5: Update playHappyAnimation()

**OLD**:
```typescript
playHappyAnimation(): void {
  this.scene.tweens.killTweensOf(this);
  this.y = this.startY;
  
  // Texture swap
  if (this.useSprite && this.scene.textures.exists('horse-happy')) {
    const sprite = this.sprite as Phaser.GameObjects.Image;
    sprite.setTexture('horse-happy');
    this.scene.time.delayedCall(600, () => {
      sprite.setTexture('horse-idle');
    });
  }
  
  // Tween bounce
  this.scene.tweens.add({
    targets: this,
    y: this.startY - 20,
    duration: 300,
    yoyo: true,
    ease: 'Bounce.easeOut',
  });
}
```

**NEW**:
```typescript
playHappyAnimation(): void {
  this.scene.tweens.killTweensOf(this);
  this.y = this.startY;
  
  if (this.useSprite) {
    // Sprite animation (one-shot, auto-returns to idle via setState())
    this.setState('happy');
  } else {
    // Fallback: Tween bounce (unchanged)
    this.scene.tweens.add({
      targets: this,
      y: this.startY - 20,
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut',
    });
  }
}
```

**Key Changes**:
- Sprite mode: Call `setState('happy')` - animation complete handler returns to idle
- Fallback mode unchanged

---

## Step 4: Testing

### 4.1: Run Development Server

```bash
npm run dev
```

**Expected Browser Console Output**:
```
[BootScene] Preloading assets (fallback to placeholders if missing)
[BootScene] ✅ Horse animations registered
[BootScene] Starting new game
[Horse] ✅ Using sprite animations
MainGameScene initialized - Horse created and interactive
```

**If sprites fail to load**:
```
[BootScene] ⚠️ Asset failed to load: horse_idle - fallback to placeholder
[BootScene] ⚠️ Horse sprites unavailable, using placeholders
[Horse] ⚠️ Sprites unavailable, using placeholder
```

### 4.2: Visual Verification Checklist

**Idle Animation**:
- [ ] Horse displays smooth breathing animation (9 FPS loop)
- [ ] Animation loops continuously without visible seams
- [ ] Horse feet stay planted at bottom-center of sprite

**Eating Animation**:
- [ ] Click carrot → Click horse → Eating animation plays
- [ ] Animation lasts 2.5 seconds
- [ ] After eating, horse returns to idle animation
- [ ] Hunger status bar increases during eating

**Happy Animation**:
- [ ] Click horse (no tool selected) → Happy animation plays once
- [ ] Animation auto-returns to idle after completion (~0.6s)
- [ ] Hearts spawn during animation
- [ ] Happiness status bar increases

**Grooming Animation** (Future - not yet implemented):
- [ ] Click brush → Drag on horse → Grooming animation loops
- [ ] Animation stops when drag ends, returns to idle
- [ ] Sparkles spawn at drag position

### 4.3: Performance Check

**Tools**: Chrome DevTools Performance Tab

```bash
# Enable FPS meter
Open DevTools → Rendering → Frame Rendering Stats
```

**Targets**:
- [ ] Stable 60 FPS with idle animation running
- [ ] No frame drops during eating animation (60 FPS maintained)
- [ ] Memory usage < 200MB with all sprites loaded

**If performance issues**:
- Check sprite sheet sizes (should be ~50-80KB each, not MB)
- Verify browser hardware acceleration enabled
- Test on different browser (Chrome vs. Firefox)

### 4.4: Fallback Mode Test

**Simulate missing sprites**:

1. Rename `assets/sprites/horse/` to `assets/sprites/horse-backup/`
2. Refresh browser
3. **Expected**: Brown circle with 🐴 emoji displays
4. **Expected**: Tween animations work (scale for eating, bounce for happy)
5. **Expected**: Console shows fallback warnings (no errors)
6. Restore folder name after test

---

## Step 5: Commit Changes

```bash
# Stage changes
git add src/scenes/BootScene.ts
git add src/entities/Horse.ts
git add src/state/types.ts

# Commit with conventional commit message
git commit -m "feat(sprites): integrate horse sprite sheet animations

- Replace single-image loading with sprite sheets (8 frames @ 128x128px)
- Add animation registration in BootScene (idle, eat, happy, groom, walk)
- Update Horse entity to use Phaser.Sprite with animation state machine
- Maintain backward compatibility (fallback to placeholder Graphics)
- Promise-based playEatingAnimation() timing unchanged (2.5s)

Resolves: Feature 003 User Story 1 (P1 - Horse Sprites)"

# Push to feature branch
git push origin 003-visual-assets
```

---

## Troubleshooting

### Issue: "Cannot find module 'HorseAnimationState'"

**Fix**: Add type to `src/state/types.ts`:
```typescript
export type HorseAnimationState = 'idle' | 'eating' | 'grooming' | 'happy' | 'walking';
```

### Issue: Animation not playing, idle shows static frame

**Cause**: Animations not registered before Horse instantiation

**Fix**: Ensure `registerHorseAnimations()` called in `BootScene.create()` **before** `this.scene.start('MainGameScene')`

### Issue: "Animation with key 'horse-idle' does not exist"

**Cause**: Sprite sheet failed to load or animation registration failed

**Fix**: Check browser console for `loaderror` events. Verify file paths match: `assets/sprites/horse/horse_idle.png`

### Issue: Horse sprite too small/large

**Fix**: Adjust `setScale()` in Horse constructor:
```typescript
(this.sprite as Phaser.GameObjects.Sprite).setScale(0.5); // 512px → 256px
// Try 0.4 (205px), 0.6 (307px), etc.
```

### Issue: Animation feels too fast/slow

**Fix**: Change `frameRate` in `BootScene.registerHorseAnimations()`:
```typescript
frameRate: 9, // Try 6 (slower) or 12 (faster)
```

### Issue: TypeScript error: "Property 'play' does not exist on type 'Graphics | Sprite'"

**Fix**: Cast to Sprite when calling animation methods:
```typescript
(this.sprite as Phaser.GameObjects.Sprite).play('horse-idle');
```

### Issue: Animation stutters or skips frames

**Possible Causes**:
- Browser tab throttled (not active) → Phaser pauses when tab loses focus
- Low-end device → Enable performance profiling (see Step 4.3)
- Too many simultaneous animations → Reduce particle effects

**Fixes**:
- Keep tab focused during testing
- Test on different device
- Disable particle emitters temporarily (`this.particles.emitting = false`)

---

## Next Steps

### P2: UI Sprite Integration (Optional)
After horse sprites working, optionally replace UI elements:
- Carrot/brush emoji icons → sprite graphics
- Status bar backgrounds → textured sprites
- See `research.md` Decision 8 for details

### P3: Particle Sprite Integration (Optional)
Replace emoji particles with sprite graphics:
- Hearts: 64×64px sprite with alpha gradient
- Sparkles: 64×64px sprite with bloom effect
- See `research.md` Decision 9 for details

### P4: Background Integration (Optional)
Add environment background:
- Static image: 800×600px stable environment
- See `research.md` Decision 10 for details

---

## Reference Files

- **Specification**: [spec.md](../spec.md)
- **Implementation Plan**: [plan.md](../plan.md)
- **Technical Decisions**: [research.md](../research.md)
- **Data Model**: [data-model.md](../data-model.md)
- **API Contracts**: [contracts/sprite-loading-api.md](../contracts/sprite-loading-api.md)
- **Asset Metadata**: `assets/sprites/horse/horse_phaser_meta.json`

---

**Guide Complete** ✅ | **Estimated Time**: 2-3 hours (P1 only) | **Difficulty**: Intermediate
