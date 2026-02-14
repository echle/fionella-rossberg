import Phaser from 'phaser';
import { Horse } from '../entities/Horse';
import { feed, groom, pet, selectTool } from '../state/actions';
import { useGameStore, getGameState } from '../state/gameStore';
import { InputSystem } from '../systems/InputSystem';
import { DecaySystem } from '../systems/DecaySystem';
import { saveSystem } from '../systems/SaveSystem';
import { GAME_CONFIG } from '../config/gameConstants';

export class MainGameScene extends Phaser.Scene {
  private horse?: Horse;
  private decaySystem?: DecaySystem;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private heartParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private horseHitArea?: Phaser.Geom.Circle;
  private autoSaveInterval?: ReturnType<typeof setInterval>;
  private lastInteractionTime: number = 0;
  private isGrooming: boolean = false; // T043: Track grooming state for animation control

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
}
