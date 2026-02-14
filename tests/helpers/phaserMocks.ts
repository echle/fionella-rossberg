/**
 * Test utilities for Phaser scene mocking
 * Feature 003: Visual Asset Integration
 * 
 * CRITICAL PHASER MOCK REQUIREMENTS:
 * ===================================
 * All Phaser GameObjects (Container, Graphics, Text, Sprite, etc.) MUST implement:
 * 
 * 1. Event Methods (required by Container.add()):
 *    - once(event, callback, context?): EventEmitter
 *    - on(event, callback, context?): EventEmitter  
 *    - off(event, callback?, context?): EventEmitter
 *    - emit(event, ...args): boolean
 * 
 * 2. Display List Methods (required by Container.add()):
 *    - removeFromDisplayList(): void
 *    - addedToScene(): void
 * 
 * 3. Parent Property (required by Container.add()):
 *    - parentContainer: Container | null
 * 
 * WHY: When you call container.add([child1, child2]), Phaser's Container internally:
 * - Calls child.once(Events.DESTROY, ...) to track lifecycle
 * - Calls child.removeFromDisplayList() to remove from scene display list
 * - Calls child.addedToScene() after adding to container
 * - Sets child.parentContainer = this
 * 
 * If any of these methods/properties are missing, tests will fail with:
 * - "gameObject.once is not a function"
 * - "gameObject.removeFromDisplayList is not a function"
 * - "Cannot read properties of undefined"
 * 
 * USE THE HELPER FUNCTIONS:
 * - createMockContainer() for containers
 * - createMockGraphics() for graphics
 * - createMockText() for text objects
 * - createMockSprite() for sprites
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
        return createMockText(x, y, text, style);
      }),
      container: vi.fn((x, y) => {
        const container = createMockContainer();
        (container as any).x = x;
        (container as any).y = y;
        return container;
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
    fillRoundedRect: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    strokeRoundedRect: vi.fn().mockReturnThis(),
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
 * Creates a mock Phaser.GameObjects.Container
 * 
 * IMPORTANT: All Phaser GameObjects must implement:
 * - Event methods: once(), on(), off(), emit()
 * - Display methods: removeFromDisplayList(), addedToScene()
 * - Property: parentContainer
 * 
 * These are required by Phaser's Container when adding children via container.add()
 */
export function createMockContainer() {
  const list: any[] = [];
  return {
    list,
    add: vi.fn((items: any[]) => {
      list.push(...items);
    }),
    setSize: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    removeFromDisplayList: vi.fn(),
    addedToScene: vi.fn(),
    parentContainer: null as any,
  } as unknown as Phaser.GameObjects.Container;
}

/**
 * Creates a mock Phaser.GameObjects.Text
 */
export function createMockText(x: number, y: number, text: string, style?: any) {
  return {
    x,
    y,
    text,
    style,
    setOrigin: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    removeFromDisplayList: vi.fn(),
    addedToScene: vi.fn(),
    parentContainer: null as any,
  } as unknown as Phaser.GameObjects.Text;
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
