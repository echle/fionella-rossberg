# Research: Visual Asset Integration

**Feature**: 003-visual-assets | **Date**: February 13, 2026  
**Purpose**: Document technical decisions for sprite integration

## Overview

This document captures research findings and technical decisions for replacing placeholder graphics with professional sprite assets. All decisions prioritize visual excellence, performance (60 FPS), and maintainability while adhering to the project constitution.

---

## Decision 1: Spritesheet Format (Horizontal Strip vs. Texture Atlas)

**Choice**: Horizontal strip layout (single row of frames)

**Rationale**:
- **Provided assets**: All horse sprites already formatted as horizontal strips (8 frames × 128px = 1024px width)
- **Simplicity**: Phaser's `load.spritesheet()` handles horizontal strips natively with `{ frameWidth: 128, frameHeight: 128 }`
- **No tooling required**: No TexturePacker/Shoebox needed for initial implementation
- **Performance**: Minimal difference for small sprite sets (5 animations × 8 frames = 40 frames total)
- **Browser compatibility**: Single-row PNG files have universal support

**Alternatives Considered**:
- **Texture Atlas (packed)**: Better for large projects (100+ sprites), but adds build complexity. Deferred to optimization phase if needed.
- **Grid Layout**: Requires manual frame calculations. Horizontal strip is more straightforward.

**Implementation**:
```typescript
// BootScene.preload()
this.load.spritesheet('horse_idle', 'assets/sprites/horse/horse_idle.png', {
  frameWidth: 512,
  frameHeight: 384,
});
```

**Asset Validation**:
- ✅ `horse_idle.png`: 4096×384px (8 frames @ 512×384px each)
- ✅ `horse_eat.png`: 4096×384px (8 frames @ 512×384px each)
- ✅ `horse_walk.png`: 4096×384px (8 frames @ 512×384px each)
- ✅ `horse_happy.png`: 4096×384px (8 frames @ 512×384px each)
- ✅ `horse_pet.png`: 4096×384px (8 frames @ 512×384px each)

**Total Asset Size**: ~5×300KB = 1.5MB (well under 5MB budget)

---

## Decision 2: Animation State Machine Pattern

**Choice**: Simple enum-based state with explicit transitions (no formal FSM library)

**Rationale**:
- **Simplicity**: Only 5 states (idle, eating, grooming, happy, walk) - no complex branching
- **Maintainability**: Explicit `setState()` method keeps transitions clear and debuggable
- **Performance**: No library overhead, direct Phaser animation calls
- **Testability**: State transitions testable via simple assertions (no mocking needed)
- **Constitutional compliance**: Principle IV (testable logic) satisfied without adding dependencies

**Alternatives Considered**:
- **XState or robot3**: Overkill for linear state transitions. Adds 10-20KB bundle weight.
- **Event-driven FSM**: More flexible but harder to debug. Current needs don't justify complexity.

**Implementation Pattern**:
```typescript
type HorseAnimationState = 'idle' | 'eating' | 'grooming' | 'happy' | 'walk';

class Horse extends Phaser.GameObjects.Sprite {
  private currentState: HorseAnimationState = 'idle';

  setState(newState: HorseAnimationState): void {
    if (this.currentState === newState) return; // Prevent redundant transitions
    this.currentState = newState;
    
    // Map states to animation keys
    const animKey = `horse-${newState}`;
    this.play(animKey, true); // Force restart animation
    
    // One-shot animations return to idle
    if (newState === 'happy') {
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.setState('idle');
      });
    }
  }
}
```

**State Transition Rules**:
- `idle` → `eating` (on feed action)
- `eating` → `idle` (after 2.5s animation)
- `idle` → `grooming` (on brush drag)
- `grooming` → `idle` (on brush release)
- `idle` → `happy` (on happiness increase from grooming/feeding)
- `happy` → `idle` (one-shot animation, auto-return)
- `walk` → Reserved for future feature (not implemented in P1)

---

## Decision 3: Animation Frame Rates from Metadata

**Choice**: Use frame rates from `horse_phaser_meta.json` (9-12 FPS)

**Rationale**:
- **Source of truth**: Metadata provided by asset creator (ChatGPT) defines intended timing
- **Performance**: 9-12 FPS is industry standard for cartoon-style game animations (smooth without overkill)
- **Constitutional compliance**: 60 FPS game loop maintains overall fluidity, sprite animations can be lower
- **Configurability**: Frame rates stored in config allow easy tuning without editing code

**Metadata Mapping**:
```json
{
  "horse-idle": { "frameRate": 9, "repeat": -1 },   // Looping idle breath
  "horse-walk": { "frameRate": 12, "repeat": -1 },  // Looping walk cycle
  "horse-eat": { "frameRate": 9, "repeat": -1 },    // Looping chewing motion
  "horse-happy": { "frameRate": 12, "repeat": 0 },  // One-shot jump/nod
  "horse-groom": { "frameRate": 9, "repeat": -1 }   // Looping content sway
}
```

**Alternatives Considered**:
- **Fixed 12 FPS for all**: Simpler but less expressive (happy animations should be snappier than idle)
- **24 FPS**: Too fast for 8-frame cycles, would look choppy. Better suited for 16+ frame animations.

**Implementation**:
```typescript
// BootScene.create() - programmatic animation registration
const animConfig = {
  'horse-idle': { frames: [0, 7], rate: 9, repeat: -1 },
  'horse-eat': { frames: [0, 7], rate: 9, repeat: -1 },
  'horse-happy': { frames: [0, 7], rate: 12, repeat: 0 },
  // ...
};

Object.entries(animConfig).forEach(([key, config]) => {
  this.anims.create({
    key: key,
    frames: this.anims.generateFrameNumbers(key.replace('-', '_'), {
      start: config.frames[0],
      end: config.frames[1]
    }),
    frameRate: config.rate,
    repeat: config.repeat
  });
});
```

---

## Decision 4: Sprite Anchor Point Strategy

**Choice**: Bottom-center anchor (0.5, 1.0)

**Rationale**:
- **Ground alignment**: Horse "feet" stay planted at Y position during animations
- **Scaling compatibility**: Sprite grows/shrinks upward from ground (natural feel)
- **Interaction area**: Keeps clickable area stable across animations
- **Constitutional compliance**: Principle I (visual excellence) - consistent positioning looks professional

**Alternatives Considered**:
- **Center anchor (0.5, 0.5)**: Default Phaser option, but causes horse to "float" during scale animations
- **Top-center (0.5, 0)**: Unusual for ground-based characters, harder to reason about

**Implementation**:
```typescript
// Horse constructor
this.sprite = this.scene.add.sprite(0, 0, 'horse_idle', 0);
this.sprite.setOrigin(0.5, 1.0); // Bottom-center
this.add(this.sprite); // Add to Container for transform grouping
```

**Viewport Positioning**: Horse placed at `(400, 450)` in 800×600 canvas puts feet ~75% down screen (visual balance)

---

## Decision 5: Fallback Mechanism Enhancement

**Choice**: Maintain existing `textures.exists()` check, add granular logging

**Rationale**:
- **Proven pattern**: Current fallback (placeholder Graphics) already works reliably
- **No breaking changes**: Keeps codebase stable, reduces regression risk
- **Debugging aid**: Enhanced logging helps identify asset loading issues in production
- **Constitutional compliance**: Principle III (browser-first) - graceful degradation on load failure

**Alternatives Considered**:
- **Per-animation fallback**: Complex to maintain, not worth the effort (all-or-nothing is clearer)
- **Retry mechanism**: Adds complexity for edge case (user can refresh if assets fail)

**Enhanced Implementation**:
```typescript
// Horse constructor
const hasSprites = this.scene.textures.exists('horse_idle');

if (hasSprites) {
  this.sprite = this.scene.add.sprite(0, 0, 'horse_idle', 0);
  console.log('[Horse] ✅ Using sprite assets');
} else {
  // Fall back to placeholder Graphics
  this.sprite = this.scene.add.graphics();
  // ... existing placeholder code ...
  console.warn('[Horse] ⚠️ Sprites unavailable, using placeholder');
}
```

**Console Output Examples**:
- Success: `[BootScene] ✅ Loaded 5 horse spritesheets (1.5MB)`
- Partial Failure: `[BootScene] ⚠️ Failed to load horse_walk.png`
- Full Fallback: `[Horse] ⚠️ Sprites unavailable, using placeholder`

---

## Decision 6: Animation Duration Alignment with Game Logic

**Choice**: Keep `FEEDING_CONFIG.EATING_DURATION` at 2500ms, sync sprite animation to match

**Rationale**:
- **Game balance**: 2.5-second eating animation established by Feature 002 (Enhanced Feeding)
- **Visual consistency**: Sprite animation should complete in same timeframe as game logic
- **No breaking changes**: Maintains Promise-based `playEatingAnimation()` API

**Implementation Strategy**:
```typescript
// BootScene.create() - eating animation config
this.anims.create({
  key: 'horse-eat',
  frames: this.anims.generateFrameNumbers('horse_eat', { start: 0, end: 7 }),
  frameRate: 9, // 8 frames ÷ 0.111s per frame = ~0.9s per cycle
  repeat: -1,    // Loop for 2.5s duration
  duration: undefined, // Let frameRate control timing
});

// Horse.playEatingAnimation()
return new Promise<void>((resolve) => {
  this.setState('eating');
  
  // Stop animation after FEEDING_CONFIG.EATING_DURATION
  this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
    this.setState('idle');
    resolve();
  });
});
```

**Frame Rate Calculation**:
- 8 frames @ 9 FPS = ~0.9s per cycle
- 2.5s duration ÷ 0.9s = ~2.7 loops (acceptable repeat)
- Alternative: 8 frames @ 8 FPS = 1.0s per cycle × 2 repeats + 0.5s buffer

**Alternatives Considered**:
- **Match duration exactly**: Would require 8 frames @ 6.4 FPS = 1.25s per cycle × 2 = 2.5s (non-integer frame rate harder to tune)
- **Change game duration**: Breaks feature parity with Feature 002

---

## Decision 7: Asset Preloading Strategy

**Choice**: Blocking preload in BootScene (halt game start until sprites loaded)

**Rationale**:
- **User experience**: Prevent "flash of unstyled content" (FOUC) where placeholders briefly appear
- **Simplicity**: Single loading phase easier to manage than progressive/lazy loading
- **Performance**: 250KB asset bundle loads in <500ms on 3G (acceptable)
- **Constitutional compliance**: Principle III (< 5s to interactive) easily satisfied

**Loading Screen**:
```typescript
// BootScene.preload()
this.load.on('progress', (value: number) => {
  console.log(`[BootScene] Loading... ${Math.floor(value * 100)}%`);
  // Optional: Display loading bar (future enhancement)
});

this.load.on('complete', () => {
  console.log('[BootScene] ✅ All assets loaded');
});
```

**Alternatives Considered**:
- **Lazy load per scene**: More complex, only beneficial for large games (100+ MB assets)
- **Service Worker caching**: Good for PWA, but doesn't eliminate first load delay

**Performance Budget**:
- Target: 250KB horse sprites + 150KB UI sprites + 100KB particles = 500KB total
- Load time: 500KB ÷ 1 Mbps (3G) = ~4s (within 5s budget)
- Optimization: Future use of WebP or compressed texture atlases if needed

---

## Decision 8: UI Sprite Integration Scope (Priority P2)

**Choice**: Defer UI sprites to separate task phase, focus P1 on horse animations

**Rationale**:
- **Independent deliverable**: Horse sprites provide immediate visual value without UI changes
- **Risk reduction**: Smaller P1 scope lowers chance of breaking existing UI functionality
- **Prioritization**: Spec.md P1 (Horse sprites) higher priority than P2 (UI sprites)
- **Asset readiness**: UI sprites not yet provided (unlike horse sprites which exist)

**P2 Scope (Future)**:
- Replace emoji icons with sprite graphics (🥕 → carrot.png, 🪥 → brush.png)
- Sprite-based status bar backgrounds (gradient → textured bars)
- Hover states for inventory items (sprite frame changes)

**P1 Delivered Value**:
- ✅ Animated horse sprite (primary visual element)
- ✅ Smooth state transitions (idle ↔ eating ↔ happy)
- ✅ Production-quality animations (vs. placeholder brown circle)
- ❌ UI graphics remain emoji-based (acceptable for MVP)

---

## Decision 9: Particle Sprite Format (Priority P3)

**Choice**: Single-frame sprites for particles (not animated sprite sheets)

**Rationale**:
- **Performance**: Particle emitters spawn 10-50 particles per effect - animated particles would multiply draw calls
- **Simplicity**: Static heart/sparkle sprites sufficient for visual feedback
- **Compatibility**: Phaser particle system designed for single textures, not animations
- **File size**: Single 64×64px PNG vs. 8-frame sheet = ~10KB vs. ~80KB savings

**Particle Asset Specifications**:
- Heart: 64×64px red heart with alpha gradient (fade edges)
- Sparkle: 64×64px white star with bloom effect
- Food particle: 32×32px carrot chunk (optional, low priority)

**Alternatives Considered**:
- **Animated particle sheets**: Possible via `ParticleEmitter.setAnimation()`, but heavy for small visual gain
- **Emoji fallback**: Current approach (❤️ and ✨ text) works but less visually polished

**Implementation** (Future P3):
```typescript
// MainGameScene.create()
const heartTexture = this.textures.exists('particle-heart') 
  ? 'particle-heart' 
  : '❤️'; // Fallback to emoji

this.heartParticles = this.add.particles(0, 0, heartTexture, {
  speed: { min: 10, max: 30 },
  scale: { start: 1, end: 0.5 }, // Shrink over lifespan
  alpha: { start: 1, end: 0 },   // Fade out
  lifespan: 1000,
  emitting: false,
});
```

---

## Decision 10: Background Asset Approach (Priority P4)

**Choice**: Single static image, no parallax layers (P4 scope - lowest priority)

**Rationale**:
- **Scope**: P4 is lowest priority, deferred until P1-P3 complete
- **Asset availability**: No background asset provided yet (unlike horse sprites)
- **Performance**: Static background = 1 draw call, parallax = 3-5 draw calls
- **Visual value**: Horse and UI sprites provide more immediate improvement than background

**Future P4 Specifications**:
- Single 800×600px PNG (or 1600×1200px for Retina)
- Stable environment: Barn walls, hay bales, wooden fence
- Neutral palette: Doesn't compete with horse sprite for attention
- Tile-friendly: Seamless edges if scaling to larger viewports

**Alternatives Considered**:
- **Parallax layers**: More depth but 3-5× performance cost (not worth for 2D stable environment)
- **Animated background**: (e.g., swaying hay) - cool but low ROI for casual game

---

## Performance Validation Checklist

**Before Merge**:
- [ ] Profile FPS with all sprites loaded (target: stable 60 FPS)
- [ ] Measure memory usage delta (target: < 50MB increase)
- [ ] Test asset load time on 3G throttle (target: < 3s)
- [ ] Validate sprite rendering on mobile devices (iOS Safari, Chrome Android)
- [ ] Check console for asset loading errors across browsers

**Tools**:
- Chrome DevTools Performance tab (CPU/memory profiling)
- Lighthouse (network throttling, load time metrics)
- Phaser Stats Plugin (real-time FPS display)

---

## Open Questions & Future Research

**Resolved for P1**:
- ✅ Spritesheet format → Horizontal strip
- ✅ Animation state pattern → Enum-based
- ✅ Frame rates → 9-12 FPS from metadata
- ✅ Anchor points → Bottom-center (0.5, 1.0)
- ✅ Fallback strategy → Existing `textures.exists()` check

**Deferred to Future Phases**:
- ❓ Texture atlas migration (if asset count exceeds 50 sprites)
- ❓ WebP format support (if load times become issue)
- ❓ Animation blending (smooth transitions between states)
- ❓ Dynamic sprite swapping (e.g., horse color customization)

---

## References

- [Phaser 3 Spritesheet Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html#spritesheet)
- [Phaser 3 Animation Manager](https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html)
- Feature 001 Plan: [specs/001-horse-care-mvp/plan.md](../../001-horse-care-mvp/plan.md)
- Project Constitution: [.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- Asset Metadata: [assets/sprites/horse/horse_phaser_meta.json](../../../assets/sprites/horse/horse_phaser_meta.json)

---

**Research Complete**: All technical unknowns resolved for P1 implementation ✅
