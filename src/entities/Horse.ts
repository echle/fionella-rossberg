import Phaser from 'phaser';
import { FEEDING_CONFIG, SPRITE_CONFIG } from '../config/gameConstants';
import type { HorseAnimationState } from '../state/types';
import { i18nService } from '../services/i18nService';

/**
 * Horse entity with sprite-based animations
 * Feature 003: Visual Asset Integration
 */
export class Horse extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Sprite;
  private readonly startY: number;
  private readonly useSprite: boolean;

  // T018-T019: Animation state management
  private currentState: HorseAnimationState = 'idle';
  private isLocked: boolean = false; // Prevents animation interruption

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.startY = y; // Store initial Y position

    // T020: Check if sprite animations are available
    this.useSprite = scene.textures.exists('horse_idle') && scene.anims.exists('horse-idle');

    if (this.useSprite) {
      // T021: Use Sprite instead of Image for animation support
      this.sprite = scene.add.sprite(0, 0, 'horse_idle');

      // T022: Set sprite origin to bottom-center (feet on ground)
      this.sprite.setOrigin(SPRITE_CONFIG.ANCHOR.X, SPRITE_CONFIG.ANCHOR.Y);

      // T023: Set sprite scale
      this.sprite.setScale(SPRITE_CONFIG.SCALE);

      this.add(this.sprite);

      // T024: Start idle animation
      (this.sprite as Phaser.GameObjects.Sprite).play('horse-idle');

      // T025: Log sprite mode
      console.log('[Horse] ✅ Using sprite animations (Feature 003)');
    } else {
      // T046: Fallback to placeholder Graphics
      this.sprite = scene.add.graphics();
      (this.sprite as Phaser.GameObjects.Graphics).fillStyle(0x8b4513, 1);
      (this.sprite as Phaser.GameObjects.Graphics).fillCircle(0, 0, 100);
      this.add(this.sprite);

      // Add emoji label for placeholder (on top of circle)
      const label = scene.add.text(0, 0, '🐴', {
        fontSize: '80px',
        align: 'center',
      });
      label.setOrigin(0.5);
      this.add(label);

      // T045: Warn about missing sprites
      console.warn('[Horse] ⚠️ Sprite animations unavailable, using placeholder graphics');
    }

    scene.add.existing(this);

    // Slightly larger hit area for easier clicking
    this.setSize(220, 220);
    this.setInteractive();
  }

  /**
   * T026-T030: Animation state machine
   * @private
   */
  private setState(newState: HorseAnimationState): void {
    // T027: Prevent redundant transitions
    if (this.currentState === newState) {
      return;
    }

    // Edge Case Fix: Respect lock state (prevents interruption during critical animations)
    if (this.isLocked && newState !== 'idle') {
      console.warn(`[Horse] State locked, cannot transition from ${this.currentState} to ${newState}`);
      return;
    }

    // Edge Case Fix: Only operate in sprite mode
    if (!this.useSprite) {
      return;
    }

    // T028: Map states to animation keys
    const animationKeys: Record<HorseAnimationState, string> = {
      idle: 'horse-idle',
      eating: 'horse-eat',
      grooming: 'horse-pet', // Using actual asset name
      happy: 'horse-happy',
      walking: 'horse-walk',
    };

    const animKey = animationKeys[newState];

    if (this.scene.anims.exists(animKey)) {
      const sprite = this.sprite as Phaser.GameObjects.Sprite;

      // Edge Case Fix: Clean up any existing animation complete handlers to prevent memory leaks
      sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);

      // T029: Force restart animation
      sprite.play(animKey, true);

      // T030: One-shot animation auto-return logic
      if (newState === 'happy') {
        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.isLocked = false;
          this.setState('idle');
        });
      }

      this.currentState = newState;
      console.log(`[Horse] Animation state: ${this.currentState} → ${newState}`);
    } else {
      console.error(`[Horse] Animation '${animKey}' not registered`);
    }
  }

  /**
   * T031-T034: Enhanced eating animation with sprite support
   */
  playEatingAnimation(): Promise<void> {
    return new Promise((resolve) => {
      // Edge Case Fix: Prevent re-entrant calls (race condition)
      if (this.isLocked) {
        console.warn('[Horse] Animation already in progress, ignoring playEatingAnimation');
        resolve();
        return;
      }

      // Stop any existing tweens on this container to prevent stacking
      this.scene.tweens.killTweensOf(this);

      if (this.useSprite) {
        // T031: Use sprite animation
        this.setState('eating');
        
        // Edge Case Fix: Lock state during eating
        this.isLocked = true;

        // T032: Duration timer (2.5s)
        this.scene.time.delayedCall(FEEDING_CONFIG.EATING_DURATION, () => {
          // T033: Return to idle
          this.isLocked = false;
          this.setState('idle');
          resolve();
        });
      } else {
        // T034: Fallback tween animation for placeholder mode
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

  /**
   * T035-T038: Happy animation implementation
   */
  playHappyAnimation(): void {
    // Edge Case Fix: Prevent interruption during locked animations
    if (this.isLocked) {
      console.warn('[Horse] Animation locked, cannot play happy animation');
      return;
    }

    // Stop any existing tweens on this container to prevent stacking
    this.scene.tweens.killTweensOf(this);

    // Reset to original position first
    this.y = this.startY;

    if (this.useSprite) {
      // T036: Use sprite mode with setState
      this.setState('happy');
      
      // Edge Case Fix: Lock state during happy animation
      this.isLocked = true;

      // T037: Auto-return handled in setState via ANIMATION_COMPLETE event
      // (isLocked released in setState when animation completes)
    } else {
      // T038: Fallback tween animation for placeholder mode
      this.scene.tweens.add({
        targets: this,
        y: this.startY - 20,
        duration: 300,
        yoyo: true,
        ease: 'Bounce.easeOut',
      });
    }
  }

  /**
   * T039-T040: Grooming animation start
   */
  playGroomingAnimation(): void {
    if (this.useSprite) {
      // T040: Set grooming state (loops until stopped)
      this.setState('grooming');
    }
    // T047: No-op for placeholder mode (no visual grooming animation for placeholder)
  }

  /**
   * T041-T042: Grooming animation stop
   */
  stopGroomingAnimation(): void {
    if (this.useSprite) {
      // T042: Return to idle state
      this.setState('idle');
    }
    // T047: No-op for placeholder mode
  }

  /**
   * Feature 006 T066: Set sick/desaturated appearance for game over
   */
  public setSickState(isSick: boolean): void {
    if (!this.sprite) return;

    if (isSick) {
      // Desaturate and darken sprite
      if (this.sprite instanceof Phaser.GameObjects.Sprite) {
        this.sprite.setTint(0x888888); // Gray tint
        this.sprite.setAlpha(0.6); // Slightly transparent
      }
    } else {
      // Restore normal appearance
      if (this.sprite instanceof Phaser.GameObjects.Sprite) {
        this.sprite.clearTint();
        this.sprite.setAlpha(1);
      }
    }
  }
}
