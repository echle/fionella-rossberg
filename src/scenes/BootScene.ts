import Phaser from 'phaser';
import { saveSystem } from '../systems/SaveSystem';
import { loadGameState, applyDecay } from '../state/actions';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Optional asset loading - fallback to placeholders if not found
    // Assets are loaded but errors are ignored (placeholder fallback)
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[BootScene] Asset not found: ${file.key} - using placeholder`);
    });

    // Horse sprites (PNG from Kenney.nl or similar)
    this.load.image('horse-idle', 'assets/sprites/horse-idle.png');
    this.load.image('horse-eating', 'assets/sprites/horse-eating.png');
    this.load.image('horse-happy', 'assets/sprites/horse-happy.png');

    // Inventory icons (PNG from Kenney.nl or similar)
    this.load.image('icon-carrot', 'assets/icons/icon-carrot.png');
    this.load.image('icon-brush', 'assets/icons/icon-brush.png');

    // Particles (PNG or keep using text emojis as fallback)
    this.load.image('particle-sparkle', 'assets/particles/particle-sparkle.png');
    this.load.image('particle-heart', 'assets/particles/particle-heart.png');

    console.log('[BootScene] Preloading assets (fallback to placeholders if missing)');
  }

  create(): void {
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
}
