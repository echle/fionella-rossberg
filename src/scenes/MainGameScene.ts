import Phaser from 'phaser';
import { Horse } from '../entities/Horse';
import { feed, groom, pet, selectTool, claimGiftBox } from '../state/actions';
import { useGameStore, getGameState } from '../state/gameStore';
import { InputSystem } from '../systems/InputSystem';
import { DecaySystem } from '../systems/DecaySystem';
import { GiftSpawnSystem } from '../systems/GiftSpawnSystem';
import { GiftBox } from '../entities/GiftBox';
import { saveSystem } from '../systems/SaveSystem';
import { GAME_CONFIG } from '../config/gameConstants';
import { i18nService } from '../services/i18nService';

export class MainGameScene extends Phaser.Scene {
  private horse?: Horse;
  public decaySystem?: DecaySystem;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private heartParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private horseHitArea?: Phaser.Geom.Circle;
  private autoSaveInterval?: ReturnType<typeof setInterval>;
  private lastInteractionTime: number = 0;
  private isGrooming: boolean = false; // T043: Track grooming state for animation control

  // Feature 006: Gift system
  private giftSpawnSystem?: GiftSpawnSystem;
  private giftEntities: Map<string, GiftBox> = new Map();

  constructor() {
    super({ key: 'MainGameScene' });
  }

  create(): void {
    // Create background gradient (sky blue to grass green)
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x90ee90, 0x90ee90, 1);
    graphics.fillRect(0, 0, this.scale.width, this.scale.height);

    // Create and position horse in center of screen (slightly lower to avoid UI overlap)
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 + 50; // Shift down 50px
    this.horse = new Horse(this, centerX, centerY);

    // Define horse hit area for interactions
    this.horseHitArea = new Phaser.Geom.Circle(centerX, centerY, 110);

    // Make horse clickable with debouncing
    this.horse.on('pointerdown', async () => {
      const state = useGameStore.getState();

      // Block ALL interactions during eating (T009, T010)
      if (state.feeding.isEating) {
        console.log('Horse is eating, wait...');
        return;
      }

      // Debouncing: prevent spam clicks
      const now = Date.now();
      if (now - this.lastInteractionTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
        return; // Too soon, ignore this click
      }
      this.lastInteractionTime = now;

      if (state.ui.selectedTool === 'carrot') {
        // Feed the horse (async with eating animation)
        const success = await feed();
        if (success) {
          console.log('Feeding horse...');
          await this.horse?.playEatingAnimation();
          console.log('Fed horse! Hunger increased by 20');

          // T048: Play happy animation after eating completes
          this.horse?.playHappyAnimation();
          this.spawnHearts(centerX, centerY - 50);

          // Deselect tool after use
          selectTool(null);
        } else {
          console.warn('Cannot feed: no carrots available or horse is full');
        }
      } else if (state.ui.selectedTool === null) {
        // Pet the horse (no tool selected)
        pet();
        console.log('Petted horse! Happiness increased by 10');
        this.horse?.playHappyAnimation();
        this.spawnHearts(centerX, centerY - 50);
      }
    });

    // Setup input system for drag interactions (grooming)
    new InputSystem(this);

    // Setup decay system for time-based status decreases
    this.decaySystem = new DecaySystem();

    // Feature 006 T048: Setup gift spawn system
    this.giftSpawnSystem = new GiftSpawnSystem(this);

    // T057: Handle missed spawns on load
    // this.giftSpawnSystem.handleMissedSpawns(0); // Disabled for MVP - can enable in polish

    // T054: Render existing gifts from state
    this.renderGiftBoxes();

    // Listen for drag strokes
    this.events.on(
      'dragStroke',
      (data: { startX: number; startY: number; endX: number; endY: number }) => {
        const state = useGameStore.getState();

        // Block grooming during eating (T011)
        if (state.feeding.isEating) {
          console.log('Horse is eating, cannot groom now');
          return;
        }

        if (state.ui.selectedTool === 'brush') {
          // Check if stroke is over the horse
          const isOverHorse =
            this.horseHitArea?.contains(data.startX, data.startY) ||
            this.horseHitArea?.contains(data.endX, data.endY);

          if (isOverHorse) {
            // T043: Start grooming animation on first stroke
            if (!this.isGrooming) {
              this.horse?.playGroomingAnimation();
              this.isGrooming = true;
            }

            const success = groom();
            if (success) {
              console.log('Groomed horse! Cleanliness increased by 5');
              // Spawn sparkle particles at stroke location
              this.spawnSparkles((data.startX + data.endX) / 2, (data.startY + data.endY) / 2);
            } else {
              console.warn('Cannot groom: no brush uses available');
            }
          }
        }
      }
    );

    // T044: Stop grooming animation when pointer is released
    this.input.on('pointerup', () => {
      if (this.isGrooming) {
        this.horse?.stopGroomingAnimation();
        this.isGrooming = false;
      }
    });

    // Create particle emitter for sparkles (reusable)
    const sparkleTexture = this.textures.exists('particle-sparkle') ? 'particle-sparkle' : '✨';
    this.particles = this.add.particles(0, 0, sparkleTexture, {
      speed: { min: 20, max: 100 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      gravityY: -50,
      emitting: false,
    });
    console.log(`[Particles] Using ${sparkleTexture === 'particle-sparkle' ? 'sprite' : 'emoji'} for sparkles`);

    // Create particle emitter for hearts (reusable)
    const heartTexture = this.textures.exists('particle-heart') ? 'particle-heart' : '❤️';
    this.heartParticles = this.add.particles(0, 0, heartTexture, {
      speed: { min: 10, max: 30 },
      scale: { start: 1, end: 0.5 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: -80,
      emitting: false,
    });
    console.log(`[Particles] Using ${heartTexture === 'particle-heart' ? 'sprite' : 'emoji'} for hearts`);

    // Setup auto-save interval (every 10 seconds)
    this.autoSaveInterval = setInterval(() => {
      saveSystem.save(getGameState());
      console.log('[AutoSave] Game state saved');
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL);

    // Feature 006 T067: Subscribe to game over state for visual effect
    useGameStore.subscribe(
      () => {
        const state = useGameStore.getState();
        this.horse?.setSickState(state.isGameOver);
      }
    );

    console.log('MainGameScene initialized - Horse created and interactive');
  }

  private spawnSparkles(x: number, y: number): void {
    // Emit sparkle particles
    this.particles?.emitParticleAt(x, y, 3);
  }

  private spawnHearts(x: number, y: number): void {
    // Emit heart particles
    this.heartParticles?.emitParticleAt(x, y, 2);
  }

  update(_time: number, _delta: number): void {
    // Update decay system (status values decrease over time)
    this.decaySystem?.update();

    // Feature 006 T053: Check for gift spawns
    this.giftSpawnSystem?.checkSpawnConditions();

    // T054: Keep gift entities in sync with state
    this.syncGiftEntities();
  }

  shutdown(): void {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  getHorse(): Horse | undefined {
    return this.horse;
  }

  /**
   * Feature 006 T054: Render gift boxes from state
   */
  private renderGiftBoxes(): void {
    const state = getGameState();

    state.giftBoxes.forEach((gift) => {
      if (!this.giftEntities.has(gift.id)) {
        const giftBox = new GiftBox(this, gift.position.x, gift.position.y, gift.id);
        
        // T055: Handle claim event
        giftBox.on('claim', (giftId: string) => {
          this.handleGiftClaim(giftId);
        });

        this.giftEntities.set(gift.id, giftBox);
      }
    });
  }

  /**
   * Feature 006: Sync gift entities with state
   * Adds new gifts, removes claimed gifts
   */
  private syncGiftEntities(): void {
    const state = getGameState();
    const stateGiftIds = new Set(state.giftBoxes.map((g) => g.id));

    // Remove entities that are no longer in state
    this.giftEntities.forEach((entity, id) => {
      if (!stateGiftIds.has(id)) {
        entity.destroy();
        this.giftEntities.delete(id);
      }
    });

    // Add new entities from state
    state.giftBoxes.forEach((gift) => {
      if (!this.giftEntities.has(gift.id)) {
        const giftBox = new GiftBox(this, gift.position.x, gift.position.y, gift.id);
        
        giftBox.on('claim', (giftId: string) => {
          this.handleGiftClaim(giftId);
        });

        this.giftEntities.set(gift.id, giftBox);
      }
    });
  }

  /**
   * Feature 006 T055 & T056: Handle gift claim with reward animation
   */
  private handleGiftClaim(giftId: string): void {
    const reward = claimGiftBox(giftId);

    if (reward) {
      console.log(`[MainGameScene] Claimed gift: +${reward.amount} ${reward.type}`);

      // T056: Show reward text animation
      const giftEntity = this.giftEntities.get(giftId);
      if (giftEntity) {
        const rewardText = this.add.text(
          giftEntity.x,
          giftEntity.y,
          `+${reward.amount} ${this.getRewardIcon(reward.type)}`,
          {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#4CAF50',
            stroke: '#000000',
            strokeThickness: 3,
          }
        );
        rewardText.setOrigin(0.5);

        // Fly up and fade out
        this.tweens.add({
          targets: rewardText,
          y: rewardText.y - 80,
          alpha: 0,
          duration: 1500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            rewardText.destroy();
          },
        });
      }

      // Remove from map
      this.giftEntities.delete(giftId);
    }
  }

  /**
   * Get emoji icon for reward type
   */
  private getRewardIcon(type: 'carrots' | 'brushUses' | 'currency'): string {
    switch (type) {
      case 'carrots':
        return '🥕';
      case 'brushUses':
        return '🪥';
      case 'currency':
        return '💰';
      default:
        return '✨';
    }
  }
}
