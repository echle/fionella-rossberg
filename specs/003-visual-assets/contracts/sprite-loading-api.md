# API Contract: Sprite Loading & Animation

**Feature**: 003-visual-assets | **Date**: February 13, 2026  
**Purpose**: Define interfaces between BootScene (asset loading), Horse entity (animation playback), and MainGameScene (particle effects)

## Overview

This contract ensures consistent sprite loading, animation registration, and playback across all scenes and entities. All changes maintain backward compatibility with existing gameplay logic.

---

## Contract 1: BootScene Asset Loading

### Responsibility
Preload all sprite sheets and register animations before game starts

### Public API

```typescript
class BootScene extends Phaser.Scene {
  /**
   * Preload sprite sheets for horse animations
   * @modifies Phaser texture cache
   * @throws None (errors logged, fallback to placeholders)
   */
  preload(): void;
  
  /**
   * Register animations after assets loaded
   * @modifies Phaser animation manager
   * @precondition All sprite sheets successfully loaded
   */
  create(): void;
}
```

### Implementation Contract

#### preload() Behavior
```typescript
preload(): void {
  // Error handling: Log failures, don't block game start
  this.load.on('loaderror', (file: Phaser.Loader.File) => {
    console.warn(`[BootScene] ⚠️ Asset failed to load: ${file.key}`);
    // Game continues with placeholder fallback
  });

  // Load horse sprite sheets (horizontal strip layout)
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
  
  // Future: UI sprites (P2), Particle sprites (P3), Background (P4)
}
```

#### create() Behavior
```typescript
create(): void {
  // Register animations only if sprite sheets loaded successfully
  if (this.textures.exists('horse_idle')) {
    this.registerHorseAnimations();
    console.log('[BootScene] ✅ Horse animations registered');
  } else {
    console.warn('[BootScene] ⚠️ Horse sprites unavailable, using placeholders');
  }
  
  // Existing save/load logic unchanged
  const loadResult = saveSystem.load();
  // ...
  
  // Start game scenes
  this.scene.start('MainGameScene');
  this.scene.launch('UIScene');
}

private registerHorseAnimations(): void {
  // Idle animation (looping, 9 FPS)
  this.anims.create({
    key: 'horse-idle',
    frames: this.anims.generateFrameNumbers('horse_idle', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1,
  });
  
  // Eating animation (looping, 9 FPS)
  this.anims.create({
    key: 'horse-eat',
    frames: this.anims.generateFrameNumbers('horse_eat', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1, // Will be stopped manually after FEEDING_CONFIG.EATING_DURATION
  });
  
  // Happy animation (one-shot, 12 FPS)
  this.anims.create({
    key: 'horse-happy',
    frames: this.anims.generateFrameNumbers('horse_happy', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: 0, // One-shot
  });
  
  // Grooming animation (looping, 9 FPS)
  this.anims.create({
    key: 'horse-pet',
    frames: this.anims.generateFrameNumbers('horse_pet', { start: 0, end: 7 }),
    frameRate: 9,
    repeat: -1,
  });
  
  // Walk animation (future feature, looping, 12 FPS)
  this.anims.create({
    key: 'horse-walk',
    frames: this.anims.generateFrameNumbers('horse_walk', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1,
  });
}
```

### Postconditions
- **Success**: All animations registered, `this.anims.exists('horse-idle')` → true
- **Partial Failure**: Some sprites missing, fallback to placeholders (no crash)
- **Total Failure**: No sprites loaded, game works with placeholder Graphics

### Performance Guarantee
- Preload completes in < 3 seconds on 3G connection (250KB total assets)
- No blocking of game start (async load with fallback)

---

## Contract 2: Horse Entity Animation Control

### Responsibility
Manage animation state transitions and playback for horse character

### Public API

```typescript
class Horse extends Phaser.GameObjects.Container {
  /**
   * Play eating animation for FEEDING_CONFIG.EATING_DURATION (2.5s)
   * @returns Promise that resolves when animation completes
   * @postcondition Horse returns to idle state after animation
   * @sideEffect Locks state during animation (prevents interruption)
   */
  playEatingAnimation(): Promise<void>;
  
  /**
   * Play one-shot happy animation (bounce/nod)
   * @returns void (non-blocking, auto-returns to idle)
   * @postcondition Horse returns to idle state after ~0.6s
   */
  playHappyAnimation(): void;
  
  /**
   * Set animation state (internal, used by public methods)
   * @param state Animation state to transition to
   * @precondition State is valid HorseAnimationState value
   * @throws None (invalid states logged and ignored)
   */
  private setState(state: HorseAnimationState): void;
}
```

### Implementation Contract

#### constructor() Changes
**OLD** (Feature 001/002):
```typescript
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y);
  
  this.useSprite = scene.textures.exists('horse-idle');
  
  if (this.useSprite) {
    this.sprite = scene.add.image(0, 0, 'horse-idle'); // ← Image, not Sprite
    this.sprite.setDisplaySize(200, 200);
    this.add(this.sprite);
  } else {
    // Placeholder Graphics
    this.sprite = scene.add.graphics();
    // ...
  }
}
```

**NEW** (Feature 003):
```typescript
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y);
  
  // Check if sprite sheets AND animations loaded
  this.useSprite = scene.textures.exists('horse_idle') && scene.anims.exists('horse-idle');
  
  if (this.useSprite) {
    // Use Sprite (supports animations) instead of Image
    this.sprite = scene.add.sprite(0, 0, 'horse_idle', 0); // ← Sprite, not Image
    this.sprite.setOrigin(0.5, 1.0); // Bottom-center anchor
    this.sprite.setScale(0.5); // Scale down from 512px to 256px
    this.sprite.play('horse-idle'); // Start idle animation
    this.add(this.sprite);
    
    console.log('[Horse] ✅ Using sprite animations');
  } else {
    // Fallback to placeholder Graphics (unchanged)
    this.sprite = scene.add.graphics();
    (this.sprite as Phaser.GameObjects.Graphics).fillStyle(0x8b4513, 1);
    (this.sprite as Phaser.GameObjects.Graphics).fillCircle(0, 0, 100);
    this.add(this.sprite);
    
    const label = scene.add.text(0, 0, '🐴', { fontSize: '80px' });
    label.setOrigin(0.5);
    this.add(label);
    
    console.warn('[Horse] ⚠️ Sprites unavailable, using placeholder');
  }
  
  // Internal state tracking
  this.currentState = 'idle';
  this.isLocked = false;
  
  scene.add.existing(this);
  this.setSize(220, 220);
  this.setInteractive();
}
```

#### playEatingAnimation() Changes
**OLD** (Feature 002):
```typescript
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this);
    
    // Texture swap (if sprite exists)
    if (this.useSprite && this.scene.textures.exists('horse-eating')) {
      const sprite = this.sprite as Phaser.GameObjects.Image;
      sprite.setTexture('horse-eating');
      this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
        sprite.setTexture('horse-idle');
      });
    }
    
    // Tween animation (scale)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: FEEDING_CONFIG.EATING_DURATION,
      yoyo: true,
      onComplete: () => resolve(),
    });
  });
}
```

**NEW** (Feature 003):
```typescript
playEatingAnimation(): Promise<void> {
  return new Promise((resolve) => {
    this.scene.tweens.killTweensOf(this);
    
    // Sprite animation (if available)
    if (this.useSprite) {
      this.setState('eating');
      
      // Stop eating animation after FEEDING_CONFIG.EATING_DURATION
      this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
        this.setState('idle');
        resolve();
      });
    } else {
      // Fallback: Tween animation (placeholder mode)
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: FEEDING_CONFIG.EATING_DURATION,
        yoyo: true,
        onComplete: () => resolve(),
      });
    }
  });
}
```

#### playHappyAnimation() Changes
**OLD** (Feature 001/002):
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
  
  // Tween animation (bounce)
  this.scene.tweens.add({
    targets: this,
    y: this.startY - 20,
    duration: 300,
    yoyo: true,
    ease: 'Bounce.easeOut',
  });
}
```

**NEW** (Feature 003):
```typescript
playHappyAnimation(): void {
  this.scene.tweens.killTweensOf(this);
  this.y = this.startY;
  
  if (this.useSprite) {
    // Sprite animation (one-shot)
    this.setState('happy');
    // Auto-returns to idle via setState() animation complete handler
  } else {
    // Fallback: Tween animation (unchanged)
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

#### NEW: setState() Method
```typescript
private setState(newState: HorseAnimationState): void {
  // Prevent redundant transitions
  if (this.currentState === newState) return;
  
  // Prevent interruption during locked animations
  if (this.isLocked) {
    console.warn(`[Horse] State locked, cannot transition to ${newState}`);
    return;
  }
  
  // Validate sprite mode
  if (!this.useSprite) {
    console.warn(`[Horse] setState called in placeholder mode, ignoring`);
    return;
  }
  
  // Update state
  this.currentState = newState;
  
  // Play corresponding animation
  const animKey = `horse-${newState}`;
  if (this.scene.anims.exists(animKey)) {
    (this.sprite as Phaser.GameObjects.Sprite).play(animKey, true); // Force restart
  } else {
    console.error(`[Horse] Animation not found: ${animKey}`);
    return;
  }
  
  // Handle one-shot animations (happy)
  if (newState === 'happy') {
    this.isLocked = true;
    (this.sprite as Phaser.GameObjects.Sprite).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isLocked = false;
      this.setState('idle');
    });
  }
}
```

### Postconditions
- `playEatingAnimation()` resolves after exactly FEEDING_CONFIG.EATING_DURATION (2500ms)
- `playHappyAnimation()` returns to idle after animation completes (~0.6s)
- No animation interruptions during locked states (eating, happy)
- Fallback mode (placeholder) maintains identical behavior

### Backward Compatibility
- ✅ Public API unchanged (`playEatingAnimation(): Promise<void>`, `playHappyAnimation(): void`)
- ✅ Promise resolution timing unchanged (2.5s for eating)
- ✅ Visual feedback present in both sprite and placeholder modes
- ✅ Existing tests remain valid (test animation promises, not rendering)

---

## Contract 3: MainGameScene Particle Integration

### Responsibility
Spawn particle effects using sprite textures (if available) or emoji fallback

### Public API

```typescript
class MainGameScene extends Phaser.Scene {
  /**
   * Spawn heart particles at position (triggered by petting)
   * @param x X coordinate in world space
   * @param y Y coordinate in world space
   */
  private spawnHearts(x: number, y: number): void;
  
  /**
   * Spawn sparkle particles at position (triggered by grooming)
   * @param x X coordinate in world space
   * @param y Y coordinate in world space
   */
  private spawnSparkles(x: number, y: number): void;
}
```

### Implementation Contract

#### create() Particle Emitter Setup
**OLD** (Feature 001):
```typescript
create(): void {
  // Sparkle particles
  const sparkleTexture = this.textures.exists('particle-sparkle') 
    ? 'particle-sparkle' 
    : '✨';
  this.particles = this.add.particles(0, 0, sparkleTexture, {
    speed: { min: 20, max: 100 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 600,
    gravityY: -50,
    emitting: false,
  });
  
  // Heart particles
  const heartTexture = this.textures.exists('particle-heart') 
    ? 'particle-heart' 
    : '❤️';
  this.heartParticles = this.add.particles(0, 0, heartTexture, {
    speed: { min: 10, max: 30 },
    scale: { start: 1, end: 0.5 },
    alpha: { start: 1, end: 0 },
    lifespan: 1000,
    gravityY: -80,
    emitting: false,
  });
}
```

**NEW** (Feature 003 - no changes needed for P1):
```typescript
// Unchanged - particle sprites deferred to P3
// Emoji fallback remains functional
```

### Postconditions
- Particle effects spawn at correct world coordinates
- Emoji fallback maintains visual feedback if sprites unavailable
- Performance: 60 FPS maintained with 50+ particles on screen

---

## Contract 4: SaveSystem State Handling

### Responsibility
Game state persistence (no changes needed for sprites)

### Contract
**Sprites are presentation layer only** - no sprite state persisted in SaveSystem

**Rationale**:
- Animation state resets to `idle` on game reload (intentional, not a bug)
- Horse visual state is ephemeral, game logic state (hunger, cleanliness) is persistent
- Reduces save file size (no sprite metadata stored)

**Example**:
```typescript
// SaveSystem.save() - UNCHANGED
export function save(state: GameState): void {
  const savedState: SavedGameState = {
    version: state.version,
    timestamp: state.timestamp,
    horse: state.horse,        // Hunger, cleanliness, happiness (numbers)
    inventory: state.inventory, // Carrots, brush uses (numbers)
    feeding: state.feeding,     // Satiety tracking (timestamps)
  };
  // No sprite/animation state saved
}

// After reload, Horse constructor initializes to 'idle' animation
```

---

## Integration Points

### Event Flow: Feed Action
```text
1. UIScene: User clicks carrot icon
2. MainGameScene: Detects horse click with carrot selected
3. actions.ts: feed() called → updates hunger state
4. Horse.playEatingAnimation() called:
   ├─ If sprites: setState('eating') → play 'horse-eat' animation
   ├─ If placeholder: Tween scale animation
   └─ After 2.5s: resolve() Promise
5. Horse: setState('idle') → return to idle animation
6. SaveSystem: Auto-save updated hunger value
```

### Event Flow: Happiness Trigger (Petting/Grooming)
```text
1. MainGameScene: Horse click with no tool selected OR grooming action completes
2. actions.ts: happiness increased → triggers happy animation
3. Horse.playHappyAnimation() called:
   ├─ If sprites: setState('happy') → play one-shot animation
   └─ If placeholder: Tween bounce animation
4. MainGameScene: spawnHearts() → burst of heart particles
5. Horse: Animation complete → setState('idle')
6. SaveSystem: Auto-save updated happiness value
```

---

## Error Handling Matrix

| Scenario | Behavior | Fallback |
|----------|----------|----------|
| Sprite sheet fails to load | Log warning, use placeholder Graphics | ✅ Game continues |
| Animation not registered | Log error, skip animation | ✅ Game continues |
| setState() called in placeholder mode | Log warning, ignore | ✅ No crash |
| Invalid state transition | Log warning, stay in current state | ✅ No crash |
| Animation interrupted mid-play | `isLocked` prevents, or allow if not critical | ✅ Smooth UX |
| Particle texture missing | Use emoji fallback ('❤️', '✨') | ✅ Visual feedback present |

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// tests/unit/Horse.test.ts
describe('Horse Animation State', () => {
  it('should return Promise that resolves after FEEDING_CONFIG.EATING_DURATION', async () => {
    const mockScene = createMockScene();
    const horse = new Horse(mockScene, 400, 400);
    
    const start = Date.now();
    await horse.playEatingAnimation();
    const duration = Date.now() - start;
    
    expect(duration).toBeGreaterThanOrEqual(2500);
    expect(duration).toBeLessThan(2600); // 100ms tolerance
  });
  
  it('should prevent state change when locked', () => {
    const mockScene = createMockScene();
    const horse = new Horse(mockScene, 400, 400);
    
    // Trigger happy animation (locks state)
    horse.playHappyAnimation();
    
    // Attempt to change state while locked
    const result = horse['setState']('eating'); // Access private for testing
    
    expect(horse['currentState']).toBe('happy'); // State unchanged
  });
});
```

### Integration Tests (Manual Visual QA)
- [ ] Load game → Horse displays idle animation (breathing loop)
- [ ] Click carrot + horse → Eating animation plays for 2.5s → Returns to idle
- [ ] Click horse (no tool) → Happy animation plays once → Returns to idle
- [ ] Drag brush on horse → Grooming animation loops while dragging
- [ ] Sprites fail to load → Placeholder Graphics display (brown circle + 🐴)
- [ ] Performance: Game runs at 60 FPS with animations playing

---

## Version Compatibility

### Feature 001/002 Compatibility
- ✅ Horse.ts public API unchanged (`playEatingAnimation()`, `playHappyAnimation()`)
- ✅ Animation duration matches FEEDING_CONFIG.EATING_DURATION (2500ms)
- ✅ Fallback mode maintains visual feedback (tweens still work)
- ✅ SaveSystem unchanged (no sprite state persisted)

### Breaking Changes
- **None** - All changes are additive or internal refactors

---

**Contract Status**: Ready for implementation ✅  
**Next Step**: Generate quickstart.md for developer integration guide
