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
  private horseHitArea?: Phaser.Geom.Circle;
  private autoSaveInterval?: ReturnType<typeof setInterval>;
  private lastInteractionTime: number = 0;

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
    this.horse.on('pointerdown', () => {
      // Debouncing: prevent spam clicks
      const now = Date.now();
      if (now - this.lastInteractionTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
        return; // Too soon, ignore this click
      }
      this.lastInteractionTime = now;

      const state = useGameStore.getState();

      if (state.ui.selectedTool === 'carrot') {
        // Feed the horse
        const success = feed();
        if (success) {
          console.log('Fed horse! Hunger increased by 20');
          this.horse?.playEatingAnimation();
          // Deselect tool after use
          selectTool(null);
        } else {
          console.warn('Cannot feed: no carrots available');
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

        if (state.ui.selectedTool === 'brush') {
          // Check if stroke is over the horse
          const isOverHorse =
            this.horseHitArea?.contains(data.startX, data.startY) ||
            this.horseHitArea?.contains(data.endX, data.endY);

          if (isOverHorse) {
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

    // Create particle emitter for sparkles (reusable)
    this.particles = this.add.particles(0, 0, '✨', {
      speed: { min: 20, max: 100 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      gravityY: -50,
      emitting: false,
    });

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
    // Create temporary heart particles
    const heart = this.add.text(x, y, '❤️', {
      fontSize: '32px',
    });
    heart.setOrigin(0.5);

    this.tweens.add({
      targets: heart,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        heart.destroy();
      },
    });
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
