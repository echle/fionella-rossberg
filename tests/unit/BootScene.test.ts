/**
 * T074: Unit tests for BootScene asset loading error handling and fallback
 * Feature 003: Visual Asset Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { BootScene } from '../../src/scenes/BootScene';
import { createMockScene } from '../helpers/phaserMocks';

describe('BootScene Asset Loading (T074)', () => {
  let scene: BootScene;
  let consoleWarnSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = new BootScene();
    
    // Setup spies
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock scene properties
    Object.assign(scene, createMockScene({ texturesExist: true, animsExist: true }));
  });

  describe('Error Handling (T005)', () => {
    it('should register loaderror event handler in preload()', () => {
      scene.preload();
      
      expect(scene.load.on).toHaveBeenCalledWith('loaderror', expect.any(Function));
    });

    it('should register progress event handler in preload() (T005a)', () => {
      scene.preload();
      
      expect(scene.load.on).toHaveBeenCalledWith('progress', expect.any(Function));
    });

    it('should log warning when asset fails to load', () => {
      scene.preload();
      
      // Get the loaderror handler
      const loaderrorCall = (scene.load.on as any).mock.calls.find(
        (call: any) => call[0] === 'loaderror'
      );
      expect(loaderrorCall).toBeDefined();
      
      const loaderrorHandler = loaderrorCall[1];
      
      // Trigger loaderror with mock file
      loaderrorHandler({ key: 'horse_idle', url: 'assets/sprites/horse/horse_idle.png' });
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Asset failed to load: horse_idle')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('fallback to placeholder')
      );
    });

    it('should log loading percentage during asset load', () => {
      scene.preload();
      
      // Get the progress handler
      const progressCall = (scene.load.on as any).mock.calls.find(
        (call: any) => call[0] === 'progress'
      );
      expect(progressCall).toBeDefined();
      
      const progressHandler = progressCall[1];
      
      // Trigger progress event with 50%
      progressHandler(0.5);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Loading assets: 50%')
      );
      
      // Trigger progress event with 100%
      progressHandler(1.0);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Loading assets: 100%')
      );
    });
  });

  describe('Sprite Sheet Loading (T006-T010)', () => {
    it('should load all 5 horse sprite sheets with correct parameters', () => {
      scene.preload();
      
      const spritesheetCalls = (scene.load.spritesheet as any).mock.calls;
      
      // Verify 5 horse sprite sheets were loaded
      const horseSprites = spritesheetCalls.filter((call: any) => 
        call[0].startsWith('horse_')
      );
      
      expect(horseSprites.length).toBeGreaterThanOrEqual(5);
      
      // Verify correct frame dimensions and paths
      const expectedSprites = [
        ['horse_idle', 'assets/sprites/horse/horse_idle.png'],
        ['horse_eat', 'assets/sprites/horse/horse_eat.png'],
        ['horse_happy', 'assets/sprites/horse/horse_happy.png'],
        ['horse_pet', 'assets/sprites/horse/horse_pet.png'],
        ['horse_walk', 'assets/sprites/horse/horse_walk.png'],
      ];
      
      expectedSprites.forEach(([key, path]) => {
        const call = spritesheetCalls.find((c: any) => c[0] === key);
        expect(call).toBeDefined();
        expect(call[1]).toBe(path);
        expect(call[2]).toEqual({ frameWidth: 512, frameHeight: 384 });
      });
    });

    it('should use correct frame dimensions (512x384)', () => {
      scene.preload();
      
      const spritesheetCalls = (scene.load.spritesheet as any).mock.calls;
      
      // All sprite sheets should use 512×384 frames
      spritesheetCalls.forEach((call: any) => {
        if (call[0].startsWith('horse_')) {
          expect(call[2]).toEqual({ frameWidth: 512, frameHeight: 384 });
        }
      });
    });
  });

  describe('Animation Registration (T011-T017)', () => {
    it('should call registerHorseAnimations() if textures exist', () => {
      // Mock textures.exists to return true
      scene.textures.exists = vi.fn().mockReturnValue(true);
      
      // Spy on registerHorseAnimations (it's private, so we spy on anims.create instead)
      const animsCreateSpy = vi.spyOn(scene.anims, 'create');
      
      scene.create();
      
      // Should have created 5 animations (idle, eat, happy, pet, walk)
      expect(animsCreateSpy).toHaveBeenCalledTimes(5);
    });

    it('should NOT call registerHorseAnimations() if textures missing', () => {
      // Mock textures.exists to return false
      scene.textures.exists = vi.fn().mockReturnValue(false);
      
      const animsCreateSpy = vi.spyOn(scene.anims, 'create');
      
      scene.create();
      
      // Should NOT have created any animations
      expect(animsCreateSpy).not.toHaveBeenCalled();
    });

    it('should log success message when animations registered', () => {
      scene.textures.exists = vi.fn().mockReturnValue(true);
      
      scene.create();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Horse sprite animations registered')
      );
    });

    it('should log warning when sprites unavailable', () => {
      scene.textures.exists = vi.fn().mockReturnValue(false);
      
      scene.create();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Horse sprites unavailable')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('placeholder')
      );
    });

    it('should register animations with correct keys and frame rates', () => {
      scene.textures.exists = vi.fn().mockReturnValue(true);
      scene.anims.generateFrameNumbers = vi.fn((key, config) => {
        if (!config) return [];
        return Array.from({ length: (config.end ?? 0) - (config.start ?? 0) + 1 }, (_, i) => ({
          key,
          frame: i + (config.start ?? 0),
        }));
      });
      
      scene.create();
      
      const animsCreateCalls = (scene.anims.create as any).mock.calls;
      
      // Verify each animation
      const expectedAnims = [
        { key: 'horse-idle', frameRate: 9, repeat: -1 },
        { key: 'horse-eat', frameRate: 9, repeat: -1 },
        { key: 'horse-happy', frameRate: 12, repeat: 0 },
        { key: 'horse-pet', frameRate: 9, repeat: -1 },
        { key: 'horse-walk', frameRate: 12, repeat: -1 },
      ];
      
      expectedAnims.forEach((expected) => {
        const call = animsCreateCalls.find((c: any) => c[0].key === expected.key);
        expect(call).toBeDefined();
        expect(call[0].frameRate).toBe(expected.frameRate);
        expect(call[0].repeat).toBe(expected.repeat);
      });
    });

    it('should generate correct frame ranges (0-7 for all animations)', () => {
      scene.textures.exists = vi.fn().mockReturnValue(true);
      
      const generateFramesSpy = vi.spyOn(scene.anims, 'generateFrameNumbers');
      
      scene.create();
      
      // All animations should use frames 0-7
      const calls = generateFramesSpy.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(5);
      
      calls.forEach((call) => {
        expect(call[1]).toEqual({ start: 0, end: 7 });
      });
    });
  });

  describe('Scene Management', () => {
    it('should start MainGameScene and launch UIScene after create()', () => {
      scene.textures.exists = vi.fn().mockReturnValue(true);
      
      scene.create();
      
      expect(scene.scene.start).toHaveBeenCalledWith('MainGameScene');
      expect(scene.scene.launch).toHaveBeenCalledWith('UIScene');
    });

    it('should continue game initialization even when sprites fail to load', () => {
      scene.textures.exists = vi.fn().mockReturnValue(false);
      
      // Should not throw error
      expect(() => scene.create()).not.toThrow();
      
      // Game scenes should still be started
      expect(scene.scene.start).toHaveBeenCalledWith('MainGameScene');
      expect(scene.scene.launch).toHaveBeenCalledWith('UIScene');
    });
  });
});
