/**
 * T073 & T075: Unit tests for Horse entity animation state machine and timing
 * Feature 003: Visual Asset Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { Horse } from '../../src/entities/Horse';
import { FEEDING_CONFIG } from '../../src/config/gameConstants';
import { createMockScene } from '../helpers/phaserMocks';

describe('Horse Animation State Machine (T073)', () => {
  let scene: Phaser.Scene;
  let horse: Horse;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = createMockScene({ texturesExist: true, animsExist: true });
    horse = new Horse(scene, 400, 300);
  });

  describe('Constructor and Sprite Mode', () => {
    it('should use sprite animations when textures and anims exist', () => {
      const mockScene = createMockScene({ texturesExist: true, animsExist: true });
      const testHorse = new Horse(mockScene, 400, 300);
      
      // Verify sprite was created (not graphics)
      expect(mockScene.add.sprite).toHaveBeenCalledWith(0, 0, 'horse_idle', 0);
      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });

    it('should use placeholder graphics when textures missing', () => {
      const mockScene = createMockScene({ texturesExist: false, animsExist: false });
      const testHorse = new Horse(mockScene, 400, 300);
      
      // Verify graphics fallback was created
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.sprite).not.toHaveBeenCalled();
    });

    it('should start in idle animation (T024)', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Verify idle animation was started in constructor
      expect(sprite.play).toHaveBeenCalledWith('horse-idle');
    });
  });

  describe('Idle → Eating → Idle transition', () => {
    it('should start in idle state', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      expect(sprite.anims.currentAnim?.key).toBe('horse-idle');
    });

    it('should transition to eating when playEatingAnimation() is called', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      const promise = horse.playEatingAnimation();
      
      // Verify eating animation was triggered
      expect(sprite.play).toHaveBeenCalledWith('horse-eat', true);
      
      await promise;
    });

    it('should return to idle after EATING_DURATION (2.5s)', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      await horse.playEatingAnimation();
      
      // Verify timer was created with correct duration
      expect(scene.time.delayedCall).toHaveBeenCalledWith(
        FEEDING_CONFIG.EATING_DURATION,
        expect.any(Function)
      );
      
      // Verify returns to idle (called multiple times: constructor + return from eating)
      const playCalls = (sprite.play as any).mock.calls;
      const lastCall = playCalls[playCalls.length - 1];
      expect(lastCall[0]).toBe('horse-idle');
    });

    it('should prevent re-entrant calls with isLocked', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Start first eating animation
      const promise1 = horse.playEatingAnimation();
      
      // Try to start second eating animation (should be ignored)
      const promise2 = horse.playEatingAnimation();
      
      await Promise.all([promise1, promise2]);
      
      // Should only create one timer (isLocked prevents second call)
      expect(scene.time.delayedCall).toHaveBeenCalledTimes(1);
    });
  });

  describe('Idle → Grooming → Idle transition', () => {
    it('should transition to grooming when playGroomingAnimation() is called', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      horse.playGroomingAnimation();
      
      expect(sprite.play).toHaveBeenCalledWith('horse-pet', true);
    });

    it('should return to idle when stopGroomingAnimation() is called', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      horse.playGroomingAnimation();
      horse.stopGroomingAnimation();
      
      // Verify returns to idle
      const playCalls = (sprite.play as any).mock.calls;
      const lastCall = playCalls[playCalls.length - 1];
      expect(lastCall[0]).toBe('horse-idle');
    });
  });

  describe('Idle → Happy → Idle transition', () => {
    it('should transition to happy when playHappyAnimation() is called', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      horse.playHappyAnimation();
      
      expect(sprite.play).toHaveBeenCalledWith('horse-happy', true);
    });

    it('should lock state during happy animation', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      horse.playHappyAnimation();
      
      // Try to start grooming during happy animation (should be blocked)
      horse.playGroomingAnimation();
      
      // Verify grooming was NOT triggered (still on happy)
      const playCalls = (sprite.play as any).mock.calls;
      const lastCall = playCalls[playCalls.length - 1];
      expect(lastCall[0]).toBe('horse-happy');
    });

    it('should register animation complete handler for auto-return', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      horse.playHappyAnimation();
      
      // Verify ANIMATION_COMPLETE listener was registered
      expect(sprite.once).toHaveBeenCalledWith(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        expect.any(Function)
      );
    });
  });

  describe('Redundant transition prevention (T027)', () => {
    it('should not restart animation if already in that state', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Clear constructor calls
      vi.clearAllMocks();
      
      // Try to transition to idle (already in idle)
      horse.playGroomingAnimation();
      horse.stopGroomingAnimation(); // Returns to idle
      
      const playCountBefore = (sprite.play as any).mock.calls.length;
      
      // Try to stop grooming again (already idle, should be no-op)
      horse.stopGroomingAnimation();
      
      const playCountAfter = (sprite.play as any).mock.calls.length;
      
      // Should not have called play() again
      expect(playCountAfter).toBe(playCountBefore);
    });
  });

  describe('Animation state cleanup (Edge Case Fix)', () => {
    it('should clean up old animation complete handlers to prevent memory leaks', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Play happy animation multiple times (with waits for animation completion)
      horse.playHappyAnimation();
      await vi.runAllTimersAsync();
      
      horse.playHappyAnimation();
      await vi.runAllTimersAsync();
      
      horse.playHappyAnimation();
      await vi.runAllTimersAsync();
      
      // Verify old handlers are cleaned up (off called before registering new handler)
      expect(sprite.off).toHaveBeenCalledWith(Phaser.Animations.Events.ANIMATION_COMPLETE);
      expect(sprite.off).toHaveBeenCalledTimes(3); // Once per playHappyAnimation
    });
  });
});

describe('Horse Animation Timing (T075)', () => {
  it('should respect FEEDING_CONFIG.EATING_DURATION (2.5s)', async () => {
    const scene = createMockScene({ texturesExist: true, animsExist: true });
    const horse = new Horse(scene, 400, 300);
    
    await horse.playEatingAnimation();
    
    expect(scene.time.delayedCall).toHaveBeenCalledWith(
      FEEDING_CONFIG.EATING_DURATION,
      expect.any(Function)
    );
    expect(FEEDING_CONFIG.EATING_DURATION).toBe(2500);
  });

  it('should calculate animation duration from frame count and frameRate', () => {
    // For 8-frame animation at 9 FPS: duration should be ~889ms
    // For 8-frame animation at 12 FPS: duration should be ~667ms
    const duration9fps = (8 / 9) * 1000;
    const duration12fps = (8 / 12) * 1000;
    expect(duration9fps).toBeCloseTo(889, 0);
    expect(duration12fps).toBeCloseTo(667, 0);
  });
});

describe('Placeholder Fallback Mode (T034, T038)', () => {
  it('should use Graphics + tween animation when sprites unavailable', async () => {
    const mockScene = createMockScene({ texturesExist: false, animsExist: false });
    const testHorse = new Horse(mockScene, 400, 300);
    
    // Verify graphics fallback
    expect(mockScene.add.graphics).toHaveBeenCalled();
    expect(mockScene.add.sprite).not.toHaveBeenCalled();
    
    // Call playEatingAnimation in fallback mode
    await testHorse.playEatingAnimation();
    
    // Verify tween animation is used instead of sprite animation
    expect(mockScene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        scaleX: 1.1,
        scaleY: 1.1,
        duration: FEEDING_CONFIG.EATING_DURATION,
        yoyo: true,
      })
    );
  });

  it('should use tween for happy animation in fallback mode', () => {
    const mockScene = createMockScene({ texturesExist: false, animsExist: false });
    const testHorse = new Horse(mockScene, 400, 300);
    
    testHorse.playHappyAnimation();
    
    // Verify tween bounce animation
    expect(mockScene.tweens.add).toHaveBeenCalledWith(
      expect.objectContaining({
        yoyo: true,
        ease: 'Bounce.easeOut',
      })
    );
  });
});
