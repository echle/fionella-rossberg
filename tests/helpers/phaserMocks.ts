/**
 * Test utilities for Phaser scene mocking
 * Feature 003: Visual Asset Integration
 */

import { vi } from 'vitest';
import Phaser from 'phaser';

/**
 * Creates a minimal mock Phaser.Scene for unit testing
 */
export function createMockScene(options?: {
  texturesExist?: boolean;
  animsExist?: boolean;
}): Phaser.Scene {
  const texturesExist = options?.texturesExist ?? true;
  const animsExist = options?.animsExist ?? true;

  const mockScene = {
    // Texture Manager
    textures: {
      exists: vi.fn().mockReturnValue(texturesExist),
      get: vi.fn().mockReturnValue({
        key: 'horse_idle',
        source: [{ width: 1024, height: 128 }],
      }),
    },

    // Animation Manager
    anims: {
      exists: vi.fn().mockReturnValue(animsExist),
      create: vi.fn(),
      generateFrameNumbers: vi.fn((key, config) => {
        const frames = [];
        for (let i = config.start; i <= config.end; i++) {
          frames.push({ key, frame: i });
        }
        return frames;
      }),
    },

    // Time Manager
    time: {
      delayedCall: vi.fn((delay, callback) => {
        // Immediately execute callback for synchronous testing
        setTimeout(callback, 0);
        return { remove: vi.fn() };
      }),
    },

    // Tween Manager
    tweens: {
      add: vi.fn((config) => {
        // Immediately execute onComplete for synchronous testing
        if (config.onComplete) {
          setTimeout(config.onComplete, 0);
        }
        return { remove: vi.fn() };
      }),
      killTweensOf: vi.fn(),
    },

    // Game Object Factory
    add: {
      sprite: vi.fn((x, y, texture, frame) => {
        return createMockSprite(texture, frame);
      }),
      graphics: vi.fn(() => {
        return createMockGraphics();
      }),
      text: vi.fn((x, y, text, style) => {
        return {
          setOrigin: vi.fn().mockReturnThis(),
          once: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null as any,
          x,
          y,
          text,
          style,
        };
      }),
      existing: vi.fn((gameObject) => gameObject),
      particles: vi.fn(() => {
        return {
          emitParticleAt: vi.fn(),
          once: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null as any,
        };
      }),
    },

    // Loader
    load: {
      on: vi.fn(),
      spritesheet: vi.fn(),
      image: vi.fn(),
    },

    // Scene Manager
    scene: {
      start: vi.fn(),
      launch: vi.fn(),
      stop: vi.fn(),
    },

    // System Manager (sys)
    sys: {
      queueDepthSort: vi.fn(),
      input: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
      displayList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      updateList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    },

    // Input Manager
    input: {
      on: vi.fn(),
    },

    // Events
    events: {
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
    },

    // Scale Manager
    scale: {
      width: 800,
      height: 600,
    },

    // Game reference
    game: {
      config: {},
    },
  } as unknown as Phaser.Scene;

  return mockScene;
}

/**
 * Creates a mock Phaser.GameObjects.Sprite
 */
export function createMockSprite(texture: string, frame?: number) {
  const mockSprite = {
    texture: { key: texture },
    frame: { name: frame ?? 0 },
    anims: {
      currentAnim: null as any,
      play: vi.fn(function (this: any, key: string, ignoreIfPlaying?: boolean) {
        this.currentAnim = { key, repeat: -1 };
        return this;
      }),
      stop: vi.fn(),
    },
    setOrigin: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setDisplaySize: vi.fn().mockReturnThis(),
    play: vi.fn(function (this: any, key: string, ignoreIfPlaying?: boolean) {
      this.anims.currentAnim = { key, repeat: key.includes('happy') ? 0 : -1 };
      return this;
    }),
    once: vi.fn(function (this: any, event: string, callback: Function) {
      // Execute callback asynchronously for ANIMATION_COMPLETE events to unblock animations in tests
      // Use queueMicrotask for immediate async execution that can be awaited with Promise.resolve()
      if (event === 'animationcomplete' || event === Phaser.Animations.Events?.ANIMATION_COMPLETE) {
        queueMicrotask(() => callback());
      }
      return this;
    }),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    removeFromDisplayList: vi.fn(),
    addedToScene: vi.fn(),
    parentContainer: null as any,
    x: 0,
    y: 0,
  };

  return mockSprite as unknown as Phaser.GameObjects.Sprite;
}

/**
 * Creates a mock Phaser.GameObjects.Graphics
 */
export function createMockGraphics() {
  return {
    fillStyle: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    removeFromDisplayList: vi.fn(),
    addedToScene: vi.fn(),
    parentContainer: null as any,
  } as unknown as Phaser.GameObjects.Graphics;
}

/**
 * Advances timers and resolves promises (for async tests)
 */
export async function advanceTimersAsync(ms: number): Promise<void> {
  vi.advanceTimersByTime(ms);
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Waits for animation complete event
 */
export async function waitForAnimationComplete(
  sprite: Phaser.GameObjects.Sprite,
  animKey: string
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate animation complete
      const handler = (sprite.once as any).mock.calls.find(
        (call: any) => call[0] === Phaser.Animations.Events.ANIMATION_COMPLETE
      );
      if (handler) {
        handler[1](); // Execute callback
      }
      resolve();
    }, 100);
  });
}
