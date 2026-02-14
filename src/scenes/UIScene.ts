import Phaser from 'phaser';
import { StatusBar } from '../entities/StatusBar';
import { InventoryItem } from '../entities/InventoryItem';
import { useGameStore } from '../state/gameStore';
import { selectTool, resetGame } from '../state/actions';
import { GAME_CONFIG, FEEDING_CONFIG } from '../config/gameConstants';
import { canFeed } from '../utils/feedingHelpers';
import { MainGameScene } from './MainGameScene';

export class UIScene extends Phaser.Scene {
  private hungerBar?: StatusBar;
  private cleanlinessBar?: StatusBar;
  private happinessBar?: StatusBar;
  private carrotItem?: InventoryItem;
  private brushItem?: InventoryItem;
  private lastInventoryClickTime: number = 0;
  
  // Feeding UI elements
  private eatingProgressBg?: Phaser.GameObjects.Rectangle;
  private eatingProgressBar?: Phaser.GameObjects.Rectangle;
  private fullnessBadge?: Phaser.GameObjects.Container;
  private fullnessBadgeCircle?: Phaser.GameObjects.Circle;
  private fullnessBadgeText?: Phaser.GameObjects.Text;
  private cooldownTimerText?: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Reset button elements
  private resetButton?: Phaser.GameObjects.Text;
  private resetButtonVisible: boolean = false;
  private lastResetClickTime: number = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const barSpacing = 50; // Vertical spacing between bars
    const centerX = this.scale.width / 2;
    const startY = 40;

    // Create status bars vertically stacked, horizontally centered
    // Hunger (top)
    this.hungerBar = new StatusBar(this, centerX - 100, startY, 'Hunger', 0xff9800);

    // Cleanliness (middle)
    this.cleanlinessBar = new StatusBar(
      this,
      centerX - 100,
      startY + barSpacing,
      'Cleanliness',
      0x2196f3
    );

    // Happiness (bottom)
    this.happinessBar = new StatusBar(
      this,
      centerX - 100,
      startY + barSpacing * 2,
      'Happiness',
      0xe91e63
    );

    // Create inventory items at bottom center
    const state = useGameStore.getState();
    const bottomY = this.scale.height - 60;

    // Carrot inventory item (bottom left-center)
    this.carrotItem = new InventoryItem(
      this,
      centerX - 50,
      bottomY,
      'carrot',
      '🥕',
      state.inventory.carrots
    );

    this.carrotItem.on('pointerdown', () => {
      // Debouncing: prevent spam clicks
      const now = Date.now();
      if (now - this.lastInventoryClickTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
        return;
      }
      this.lastInventoryClickTime = now;

      if (this.carrotItem?.getIsAvailable()) {
        selectTool('carrot');
      }
    });

    // Brush inventory item (bottom right-center)
    this.brushItem = new InventoryItem(
      this,
      centerX + 50,
      bottomY,
      'brush',
      '🪥',
      state.inventory.brushUses
    );

    this.brushItem.on('pointerdown', () => {
      // Debouncing: prevent spam clicks
      const now = Date.now();
      if (now - this.lastInventoryClickTime < GAME_CONFIG.INTERACTION_COOLDOWN) {
        return;
      }
      this.lastInventoryClickTime = now;

      if (this.brushItem?.getIsAvailable()) {
        selectTool('brush');
      }
    });

    // T018: Create eating progress bar (initially hidden)
    // Position: Center of screen, below status bars, above horse
    const progressBarX = centerX - 75;
    const progressBarY = this.scale.height / 2 + 50; // Below center, away from status bars
    const progressBarWidth = 150;
    const progressBarHeight = 12;

    this.eatingProgressBg = this.add.rectangle(
      progressBarX,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      0x666666,
      0.8
    ).setOrigin(0, 0.5).setVisible(false).setDepth(100);

    this.eatingProgressBar = this.add.rectangle(
      progressBarX,
      progressBarY,
      progressBarWidth, // Full width initially
      progressBarHeight,
      0x4caf50,
      1
    ).setOrigin(0, 0.5).setVisible(false).setDepth(101); // Higher depth = on top

    // T019: Create fullness badge (initially hidden)
    // Position: Above progress bar
    const badgeX = centerX;
    const badgeY = progressBarY - 50; // Above progress bar

    this.fullnessBadge = this.add.container(badgeX, badgeY);
    
    this.fullnessBadgeCircle = this.add.circle(0, 0, 25, 0xff5722, 0.9);
    this.fullnessBadgeText = this.add.text(0, 0, '🍽️', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.fullnessBadge.add([this.fullnessBadgeCircle, this.fullnessBadgeText]);
    this.fullnessBadge.setVisible(false);

    // T020: Create countdown timer text (initially hidden)
    this.cooldownTimerText = this.add.text(
      badgeX,
      badgeY + 40,
      'Ready in 30s',
      {
        fontSize: '14px',
        color: '#ff5722',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setVisible(false);

    // T023: Create 1 Hz timer event for countdown updates
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateCooldownTimer,
      callbackScope: this,
      loop: true,
    });

    // Create reset button (top-right corner, initially hidden)
    this.resetButton = this.add.text(
      this.scale.width - 20,  // 20px from right edge
      20,                     // 20px from top
      '🔄 Reset',
      {
        fontSize: '18px',
        color: '#ff6b6b',
        fontStyle: 'bold',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      }
    )
      .setOrigin(1, 0)  // Right-top anchor
      .setAlpha(0)      // Start invisible
      .setInteractive({ useHandCursor: true });

    // Hover effect (scale up)
    this.resetButton.on('pointerover', () => {
      this.resetButton?.setScale(1.1);
    });

    this.resetButton.on('pointerout', () => {
      this.resetButton?.setScale(1.0);
    });

    // Click handler
    this.resetButton.on('pointerdown', () => {
      // Debounce check (prevent spam clicks)
      const now = Date.now();
      if (now - this.lastResetClickTime < 500) {
        return;
      }
      this.lastResetClickTime = now;

      // Visual feedback (scale pulse)
      this.tweens.add({
        targets: this.resetButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Execute reset
          resetGame();
          
          // Reset decay timer
          const mainScene = this.scene.get('MainGameScene') as MainGameScene;
          mainScene.decaySystem?.reset();
        },
      });
    });

    console.log('UIScene initialized - Status bars and inventory created (centered)');
  }

  update(_time: number, _delta: number): void {
    // Bind status bar values to game store
    const state = useGameStore.getState();
    const now = Date.now();

    this.hungerBar?.setValue(state.horse.hunger);
    this.cleanlinessBar?.setValue(state.horse.cleanliness);
    this.happinessBar?.setValue(state.horse.happiness);

    // Update inventory display
    this.carrotItem?.setCount(state.inventory.carrots);
    this.brushItem?.setCount(state.inventory.brushUses);

    // Update selection highlights
    this.carrotItem?.setSelected(state.ui.selectedTool === 'carrot');
    this.brushItem?.setSelected(state.ui.selectedTool === 'brush');

    // T021: Update eating progress bar
    if (state.feeding.isEating && state.feeding.eatStartTime !== null) {
      const elapsed = now - state.feeding.eatStartTime;
      const progress = Math.min(elapsed / FEEDING_CONFIG.EATING_DURATION, 1);
      
      this.eatingProgressBg?.setVisible(true);
      this.eatingProgressBar?.setVisible(true);
      this.eatingProgressBar?.setScale(progress, 1); // Scale X from 0 to 1
    } else {
      this.eatingProgressBg?.setVisible(false);
      this.eatingProgressBar?.setVisible(false);
    }

    // T022: Update fullness badge visibility
    const isInCooldown = state.feeding.fullUntil !== null && now < state.feeding.fullUntil;
    this.fullnessBadge?.setVisible(isInCooldown);

    // T024: Gray out carrot icon when unavailable
    const canFeedHorse = canFeed(state, now);
    const isCarrotDisabled = !canFeedHorse || state.feeding.isEating;
    
    if (this.carrotItem) {
      this.carrotItem.setDisabled(isCarrotDisabled);
    }

    // T012-T014: Update reset button visibility based on inventory state
    const shouldShow = state.inventory.carrots === 0 && state.inventory.brushUses === 0;
    
    if (shouldShow && !this.resetButtonVisible) {
      // T013: Fade in reset button when resources are depleted
      this.resetButtonVisible = true;
      this.tweens.add({
        targets: this.resetButton,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    } else if (!shouldShow && this.resetButtonVisible) {
      // T014: Fade out reset button when resources are available
      this.resetButtonVisible = false;
      this.tweens.add({
        targets: this.resetButton,
        alpha: 0,
        duration: 300,
        ease: 'Power2'
      });
    }
  }

  /**
   * T023: Update cooldown timer text every second
   */
  private updateCooldownTimer(): void {
    const state = useGameStore.getState();
    const now = Date.now();

    if (state.feeding.fullUntil !== null && now < state.feeding.fullUntil) {
      const remainingMs = state.feeding.fullUntil - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      this.cooldownTimerText?.setText(`Ready in ${remainingSeconds}s`);
      this.cooldownTimerText?.setVisible(true);
    } else {
      this.cooldownTimerText?.setVisible(false);
    }
  }
}
