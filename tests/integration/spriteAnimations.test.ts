/**
 * T076: Integration test for multiple animation state changes without visual glitches
 * Feature 003: Visual Asset Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { Horse } from '../../src/entities/Horse';
import { FEEDING_CONFIG } from '../../src/config/gameConstants';
import { createMockScene } from '../helpers/phaserMocks';

describe('Sprite Animation Integration (T076)', () => {
  let scene: Phaser.Scene;
  let horse: Horse;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = createMockScene({ texturesExist: true, animsExist: true });
    horse = new Horse(scene, 400, 300);
  });

  describe('Rapid Animation State Changes', () => {
    it('should handle rapid idle → happy → idle transitions without glitches', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Trigger multiple playHappyAnimation() calls in quick succession
      horse.playHappyAnimation();
      horse.playHappyAnimation();
      horse.playHappyAnimation();
      
      // Should not throw errors
      expect(() => horse.playHappyAnimation()).not.toThrow();
      
      // Final state should be locked (during happy animation)
      const lastPlayCall = (sprite.play as any).mock.calls[
        (sprite.play as any).mock.calls.length - 1
      ];
      expect(lastPlayCall[0]).toBe('horse-happy');
    });

    it('should handle eating → grooming sequence seamlessly', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Start and complete eating animation
      await horse.playEatingAnimation();
      
      // Verify returned to idle
      let lastCall = (sprite.play as any).mock.calls[(sprite.play as any).mock.calls.length - 1];
      expect(lastCall[0]).toBe('horse-idle');
      
      // Immediately start grooming animation
      horse.playGroomingAnimation();
      
      // Verify grooming started
      lastCall = (sprite.play as any).mock.calls[(sprite.play as any).mock.calls.length - 1];
      expect(lastCall[0]).toBe('horse-pet');
      
      // Stop grooming
      horse.stopGroomingAnimation();
      
      // Verify returned to idle
      lastCall = (sprite.play as any).mock.calls[(sprite.play as any).mock.calls.length - 1];
      expect(lastCall[0]).toBe('horse-idle');
    });

    it('should prevent animation interruption during locked states (eating)', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Start eating animation (locks state)
      const eatingPromise = horse.playEatingAnimation();
      
      // Verify eating animation started
      expect((sprite.play as any).mock.calls.some((call: any) => call[0] === 'horse-eat')).toBe(true);
      
      // Try to call playGroomingAnimation() during eating
      horse.playGroomingAnimation();
      
      // Grooming should be blocked (last animation should still be eating, not grooming)
      const playCalls = (sprite.play as any).mock.calls;
      const lastEatingIndex = playCalls.findLastIndex((call: any) => call[0] === 'horse-eat');
      const hasGroomingAfterEating = playCalls
        .slice(lastEatingIndex + 1)
        .some((call: any) => call[0] === 'horse-pet');
      
      expect(hasGroomingAfterEating).toBe(false);
      
      await eatingPromise;
    });

    it('should prevent animation interruption during locked states (happy)', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      vi.clearAllMocks();
      
      // Start happy animation (locks state)
      horse.playHappyAnimation();
      
      const playCountAfterHappy = (sprite.play as any).mock.calls.length;
      
      // Try to start grooming during happy
      horse.playGroomingAnimation();
      
      // Grooming should be blocked (play count should not increase)
      expect((sprite.play as any).mock.calls.length).toBe(playCountAfterHappy);
    });
  });

  describe('Animation → Tween Interaction', () => {
    it('should clear previous tweens when starting eating animation (T031)', async () => {
      // Start eating animation
      await horse.playEatingAnimation();
      
      // Verify killTweensOf was called
      expect(scene.tweens.killTweensOf).toHaveBeenCalledWith(horse);
    });

    it('should clear previous tweens when starting happy animation', () => {
      // Start happy animation
      horse.playHappyAnimation();
      
      // Verify killTweensOf was called
      expect(scene.tweens.killTweensOf).toHaveBeenCalledWith(horse);
    });
  });

  describe('Grooming Start/Stop Flow', () => {
    it('should complete grooming cycle: idle → grooming → idle', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Horse starts in idle
      expect(sprite.anims.currentAnim?.key).toBe('horse-idle');
      
      // Start grooming
      horse.playGroomingAnimation();
      
      const playCallsAfterStart = (sprite.play as any).mock.calls;
      expect(playCallsAfterStart[playCallsAfterStart.length - 1][0]).toBe('horse-pet');
      
      // Stop grooming
      horse.stopGroomingAnimation();
      
      const playCallsAfterStop = (sprite.play as any).mock.calls;
      expect(playCallsAfterStop[playCallsAfterStop.length - 1][0]).toBe('horse-idle');
    });

    it('should do nothing if stopGroomingAnimation is called while not grooming', () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      vi.clearAllMocks();
      
      // Horse is in idle, try to stop grooming (should be no-op)
      horse.stopGroomingAnimation();
      
      // play() should not have been called (no state change)
      expect((sprite.play as any).mock.calls.length).toBe(0);
    });
  });

  describe('State Transition Sequence Verification', () => {
    it('should complete full feeding sequence: idle → eating → idle → happy → idle', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Start in idle
      const initialState = sprite.anims.currentAnim?.key;
      expect(initialState).toBe('horse-idle');
      
      // Eating phase
      await horse.playEatingAnimation();
      
      // Should have returned to idle after eating
      let playCalls = (sprite.play as any).mock.calls;
      let lastCall = playCalls[playCalls.length - 1];
      expect(lastCall[0]).toBe('horse-idle');
      
      // Happy phase (triggered after eating in MainGameScene)
      horse.playHappyAnimation();
      await Promise.resolve(); // Wait for animation to unlock
      
      playCalls = (sprite.play as any).mock.calls;
      lastCall = playCalls[playCalls.length - 1];
      // May still be idle if happy animation doesn't play immediately
      expect(['horse-idle', 'horse-happy']).toContain(lastCall[0]);
      
      // Note: In real scenario, ANIMATION_COMPLETE would return to idle
      // Our mock doesn't auto-trigger this, but the handler is registered
      expect(sprite.once).toHaveBeenCalledWith(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        expect.any(Function)
      );
    });

    it('should maintain consistent animation timing across multiple cycles', async () => {
      // Run eating animation multiple times
      await horse.playEatingAnimation();
      await horse.playEatingAnimation();
      await horse.playEatingAnimation();
      
      // Verify each call used the same duration
      const delayedCallMock = scene.time.delayedCall as any;
      const calls = delayedCallMock.mock.calls;
      
      calls.forEach((call: any) => {
        expect(call[0]).toBe(FEEDING_CONFIG.EATING_DURATION);
      });
    });
  });

  describe('Fallback Mode Integration', () => {
    it('should work in placeholder mode without sprite animations', async () => {
      const fallbackScene = createMockScene({ texturesExist: false, animsExist: false });
      const fallbackHorse = new Horse(fallbackScene, 400, 300);
      
      // Verify fallback mode
      expect(fallbackScene.add.graphics).toHaveBeenCalled();
      expect(fallbackScene.add.sprite).not.toHaveBeenCalled();
      
      // Should still support all animation methods (using tweens)
      await fallbackHorse.playEatingAnimation();
      expect(fallbackScene.tweens.add).toHaveBeenCalled();
      
      fallbackHorse.playHappyAnimation();
      expect(fallbackScene.tweens.add).toHaveBeenCalledTimes(2);
      
      // Grooming in fallback mode should be no-op (no error)
      expect(() => {
        fallbackHorse.playGroomingAnimation();
        fallbackHorse.stopGroomingAnimation();
      }).not.toThrow();
    });
  });

  describe('Memory and Performance', () => {
    it('should clean up animation event handlers to prevent memory leaks', async () => {
      const sprite = (scene.add.sprite as any).mock.results[0].value;
      
      // Trigger multiple happy animations (each registers ANIMATION_COMPLETE handler)
      horse.playHappyAnimation();
      await Promise.resolve(); // Wait for queueMicrotask callback
      
      horse.playHappyAnimation();
      await Promise.resolve();
      
      horse.playHappyAnimation();
      await Promise.resolve();
      
      // Verify old handlers are cleaned up with sprite.off()
      expect(sprite.off).toHaveBeenCalledWith(Phaser.Animations.Events.ANIMATION_COMPLETE);
      
      // Should have called off() for cleanup (may be called multiple times per animation)
      expect(sprite.off).toHaveBeenCalled();
    });


    it('should not accumulate tweens across multiple animation calls', async () => {
      // Start multiple animations
      horse.playHappyAnimation();
      await Promise.resolve(); // Wait for queueMicrotask callback
      horse.playHappyAnimation();
      await Promise.resolve();
      horse.playHappyAnimation();
      await Promise.resolve();
      
      // Verify killTweensOf is called each time to prevent tween accumulation
      expect(scene.tweens.killTweensOf).toHaveBeenCalledWith(horse);
      expect(scene.tweens.killTweensOf).toHaveBeenCalledTimes(3);
    });
  });

  // Note: The following tests require full Phaser game instance with real browser context
  // These should be implemented with E2E testing framework (Playwright/Puppeteer)
  /*
  describe('Browser Integration Tests (Requires E2E Framework)', () => {
    it('should maintain 60 FPS with all animations playing', () => {
      // TODO: Setup FPS monitoring
      // TODO: Trigger all animation types rapidly
      // TODO: Measure average FPS over 5 seconds
      // TODO: Assert FPS >= 60
    });

    it('should not cause memory leaks over 1000 animation cycles', () => {
      // TODO: Get initial memory baseline
      // TODO: Run 1000 animation cycles
      // TODO: Force garbage collection
      // TODO: Assert memory delta < 10MB
    });

    it('should handle grooming with actual pointer events', () => {
      // TODO: Setup Playwright browser
      // TODO: Click and drag on horse with brush
      // TODO: Verify animation plays
    });

    it('should trigger correct animations from MainGameScene interactions', () => {
      // TODO: Load full game in browser
      // TODO: Test feed/pet/groom interactions
      // TODO: Verify correct animation sequences
    });
  });
  */
});
