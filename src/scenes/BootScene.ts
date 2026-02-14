import Phaser from 'phaser';
import { saveSystem } from '../systems/SaveSystem';
import { loadGameState, applyDecay } from '../state/actions';
import { i18nService } from '../services/i18nService';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // T005: Enhanced error handler with better logging
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[BootScene] ⚠️ Asset failed to load: ${file.key} - fallback to placeholder`);
    });

    // T005a: Loading progress indicator
    this.load.on('progress', (value: number) => {
      console.log(`[BootScene] Loading assets: ${Math.round(value * 100)}%`);
    });

    // T006-T010: Load horse sprite sheets (horizontal strip layout, 8 frames each)
    // Updated: High-resolution sprites 512×384 per frame
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

    // Legacy single images (deprecated in Feature 003, kept for backward compat testing)
    // this.load.image('horse-idle', 'assets/sprites/horse-idle.png');
    // this.load.image('horse-eating', 'assets/sprites/horse-eating.png');
    // this.load.image('horse-happy', 'assets/sprites/horse-happy.png');

    // Inventory icons (unchanged - deferred to P2)
    this.load.image('icon-carrot', 'assets/icons/icon-carrot.png');
    this.load.image('icon-brush', 'assets/icons/icon-brush.png');

    // Particles (unchanged - deferred to P3)
    this.load.image('particle-sparkle', 'assets/particles/particle-sparkle.png');
    this.load.image('particle-heart', 'assets/particles/particle-heart.png');

    console.log('[BootScene] Preloading sprite sheets (Feature 003)');
  }

  create(): void {
    // T017: Register horse animations if sprite sheets loaded successfully
    if (this.textures.exists('horse_idle')) {
      this.registerHorseAnimations();
      console.log('[BootScene] ✅ Horse sprite animations registered');
    } else {
      console.warn('[BootScene] ⚠️ Horse sprites unavailable, using placeholder fallback');
    }

    // Load saved game state if it exists
    const loadResult = saveSystem.load();

    if (loadResult) {
      const { savedState, elapsedMs } = loadResult;
      console.log(`[BootScene] Loading saved game (${Math.floor(elapsedMs / 1000)}s elapsed)`);

      // Load the saved state into the store
      loadGameState({
        version: savedState.version,
        timestamp: Date.now(), // Update to current time
        horse: savedState.horse,
        inventory: savedState.inventory,
      });

      // Apply decay for elapsed time
      if (elapsedMs > 0) {
        applyDecay(elapsedMs);
      }
    } else {
      console.log('[BootScene] Starting new game');
    }

    // Start the main game scene
    this.scene.start('MainGameScene');
    this.scene.launch('UIScene');
  }

  /**
   * T011: Register horse animations using loaded sprite sheets
   * @private
   */
  private registerHorseAnimations(): void {
    //  T012: Idle animation (looping, 9 FPS)
    this.anims.create({
      key: 'horse-idle',
      frames: this.anims.generateFrameNumbers('horse_idle', { start: 0, end: 7 }),
      frameRate: 9,
      repeat: -1, // Infinite loop
    });

    // T013: Eat animation (looping, 9 FPS)
    this.anims.create({
      key: 'horse-eat',
      frames: this.anims.generateFrameNumbers('horse_eat', { start: 0, end: 7 }),
      frameRate: 9,
      repeat: -1, // Looping (will be controlled by duration timer)
    });

    // T014: Happy animation (one-shot, 12 FPS)
    this.anims.create({
      key: 'horse-happy',
      frames: this.anims.generateFrameNumbers('horse_happy', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: 0, // One-shot
    });

    // T015: Grooming/petting animation (looping, 9 FPS)
    // Note: Using 'horse_pet' sheet key (should match horse_pet.png asset)
    this.anims.create({
      key: 'horse-pet',
      frames: this.anims.generateFrameNumbers('horse_pet', { start: 0, end: 7 }),
      frameRate: 9,
      repeat: -1, // Looping while grooming
    });

    // T016: Walk animation (reserved for future feature, looping, 12 FPS)
    this.anims.create({
      key: 'horse-walk',
      frames: this.anims.generateFrameNumbers('horse_walk', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1, // Looping
    });
  }
}
