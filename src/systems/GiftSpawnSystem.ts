import Phaser from 'phaser';
import { getElapsedSeconds, spawnGiftBox } from '../state/actions';
import { GIFT_CONFIG } from '../config/gameConstants';

/**
 * GiftSpawnSystem - Manages time-based gift spawning
 * @feature 006-economy-game-clock
 */
export class GiftSpawnSystem {
  private scene: Phaser.Scene;
  private lastSpawnCheck: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Initialize with current elapsed time to prevent immediate spawn on load
    this.lastSpawnCheck = getElapsedSeconds();
  }

  /**
   * T048 & T053: Check spawn conditions every frame
   * Spawns gifts at 5-minute intervals (300s, 600s, 900s, etc.)
   */
  public checkSpawnConditions(): void {
    const elapsedSeconds = getElapsedSeconds();

    // Check if we've crossed a spawn interval
    const currentInterval = Math.floor(elapsedSeconds / GIFT_CONFIG.SPAWN_INTERVAL);
    const lastInterval = Math.floor(this.lastSpawnCheck / GIFT_CONFIG.SPAWN_INTERVAL);

    if (currentInterval > lastInterval && elapsedSeconds > 0) {
      // Time to spawn a gift!
      const position = this.getRandomSafePosition();
      const gift = spawnGiftBox();

      if (gift) {
        // Update position in the spawned gift
        gift.position = position;
        console.log(`[GiftSpawnSystem] Gift spawned at (${position.x}, ${position.y})`);
      }
    }

    this.lastSpawnCheck = elapsedSeconds;
  }

  /**
   * T052: Calculate random safe position avoiding UI zones
   * @returns {x, y} coordinates within safe bounds
   */
  private getRandomSafePosition(): { x: number; y: number } {
    const { width, height } = this.scene.scale;
    const margin = GIFT_CONFIG.SAFE_MARGIN;

    // Safe zone: avoid top 150px (UI bars), bottom 100px (inventory), and edges
    const minX = margin;
    const maxX = width - margin;
    const minY = 150 + margin; // Below status bars
    const maxY = height - 100 - margin; // Above inventory

    const x = Phaser.Math.Between(minX, maxX);
    const y = Phaser.Math.Between(minY, maxY);

    return { x, y };
  }

  /**
   * T057: Handle missed spawns on game load
   * Spawns up to 3 gifts for missed 5-minute intervals
   */
  public handleMissedSpawns(lastCheckTime: number): void {
    const elapsedSeconds = getElapsedSeconds();
    const lastInterval = Math.floor(lastCheckTime / GIFT_CONFIG.SPAWN_INTERVAL);
    const currentInterval = Math.floor(elapsedSeconds / GIFT_CONFIG.SPAWN_INTERVAL);

    const missedIntervals = currentInterval - lastInterval;

    if (missedIntervals > 0) {
      const giftsToSpawn = Math.min(missedIntervals, GIFT_CONFIG.MAX_UNCLAIMED);
      
      for (let i = 0; i < giftsToSpawn; i++) {
        const position = this.getRandomSafePosition();
        const gift = spawnGiftBox();
        
        if (gift) {
          gift.position = position;
          console.log(`[GiftSpawnSystem] Missed gift spawned at (${position.x}, ${position.y})`);
        }
      }
    }
  }

  /**
   * Reset spawn tracking
   */
  public reset(): void {
    this.lastSpawnCheck = 0;
    console.log('[GiftSpawnSystem] Reset');
  }
}
