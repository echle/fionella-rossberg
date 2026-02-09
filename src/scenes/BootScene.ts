import Phaser from 'phaser';
import { saveSystem } from '../systems/SaveSystem';
import { loadGameState, applyDecay } from '../state/actions';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Asset loading will be added here
    // For now, scene loads immediately
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
