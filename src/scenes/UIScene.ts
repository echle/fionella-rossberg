import Phaser from 'phaser';
import { StatusBar } from '../entities/StatusBar';
import { InventoryItem } from '../entities/InventoryItem';
import { useGameStore } from '../state/gameStore';
import { selectTool, resetGame, getElapsedSeconds } from '../state/actions';
import { GAME_CONFIG, FEEDING_CONFIG, COOLDOWNS } from '../config/gameConstants';
import { canFeed } from '../utils/feedingHelpers';
import { i18nService } from '../services/i18nService';
import { LanguageSelector } from '../components/LanguageSelector';
import { MainGameScene } from './MainGameScene';
import { formatGameClock } from '../utils/timeUtils';

export class UIScene extends Phaser.Scene {
  private hungerBar?: StatusBar;
  private cleanlinessBar?: StatusBar;
  private happinessBar?: StatusBar;
  private carrotItem?: InventoryItem;
  private brushItem?: InventoryItem;
  private languageSelector?: LanguageSelector;
  private lastInventoryClickTime: number = 0;
  
  // Feeding UI elements
  private eatingProgressBg?: Phaser.GameObjects.Rectangle;
  private eatingProgressBar?: Phaser.GameObjects.Rectangle;
  private fullnessBadge?: Phaser.GameObjects.Container;
  private fullnessBadgeCircle?: Phaser.GameObjects.Arc;
  private fullnessBadgeText?: Phaser.GameObjects.Text;
  private cooldownTimerText?: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Feature 006: Pet cooldown indicator
  private petCooldownText?: Phaser.GameObjects.Text;

  // Reset button elements
  private resetButton?: Phaser.GameObjects.Text;
  private resetButtonVisible: boolean = false;
  private lastResetClickTime: number = 0;

  // Feature 006: Currency display
  private currencyText?: Phaser.GameObjects.Text;
  private currencyIcon?: Phaser.GameObjects.Text;
  private lastCurrencyValue: number = 0;

  // Feature 006: Game clock display
  private gameClockText?: Phaser.GameObjects.Text;
  private gameClockTimer?: Phaser.Time.TimerEvent;

  // Feature 006: Game over overlay
  private gameOverOverlay?: Phaser.GameObjects.Container;
  private gameOverBackground?: Phaser.GameObjects.Rectangle;
  private gameOverTitleText?: Phaser.GameObjects.Text;
  private gameOverMessageText?: Phaser.GameObjects.Text;
  private gameOverResetButton?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const barSpacing = 50; // Vertical spacing between bars
    const centerX = this.scale.width / 2;
    const startY = 40;

    // Create status bars vertically stacked, horizontally centered
    // Hunger (top)
    this.hungerBar = new StatusBar(this, centerX - 100, startY, i18nService.t('ui.statusBar.hunger'), 0xff9800);

    // Cleanliness (middle)
    this.cleanlinessBar = new StatusBar(
      this,
      centerX - 100,
      startY + barSpacing,
      i18nService.t('ui.statusBar.cleanliness'),
      0x2196f3
    );

    // Happiness (bottom)
    this.happinessBar = new StatusBar(
      this,
      centerX - 100,
      startY + barSpacing * 2,
      i18nService.t('ui.statusBar.happiness'),
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

    // Feature 006 T022-T023: Create currency display (bottom, right of inventory items)
    const currencyX = centerX + 150; // Right of brush item
    const currencyY = bottomY;

    this.currencyIcon = this.add.text(currencyX - 20, currencyY, '💰', {
      fontSize: '28px',
    }).setOrigin(0.5);

    const initialCurrency = state.currency || 50;
    this.currencyText = this.add.text(currencyX + 15, currencyY, String(initialCurrency), {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);

    this.lastCurrencyValue = initialCurrency;

    // T035: Create LanguageSelector at top right
    this.languageSelector = new LanguageSelector(this, this.scale.width - 80, 30);

    // T036: Listen for language changes and update all text
    i18nService.on('languageChanged', this.handleLanguageChanged.bind(this));

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
      i18nService.t('ui.game.readyIn', { seconds: '30' }),
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

    // Feature 006: Create pet cooldown indicator (center-bottom, above horse)
    this.petCooldownText = this.add.text(
      centerX,
      this.scale.height - 180, // Above horse position
      '💗 Bereit in: 30s',
      {
        fontSize: '18px',
        color: '#ff6b9d',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
        padding: { x: 8, y: 4 },
      }
    ).setOrigin(0.5).setVisible(false).setDepth(100);

    // Create reset button (top-right corner, initially hidden)
    this.resetButton = this.add.text(
      this.scale.width - 20,  // 20px from right edge
      20,                     // 20px from top
      `🔄 ${i18nService.t('ui.buttons.reset')}`,
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

    // Feature 006 T038: Create shop button (top-left corner, always visible)
    const shopButton = this.add.text(
      20,  // 20px from left edge
      20,  // 20px from top
      `🛒 ${i18nService.t('ui.shop.button')}`,
      {
        fontSize: '18px',
        color: '#FFD700',
        fontStyle: 'bold',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      }
    )
      .setOrigin(0, 0)  // Left-top anchor
      .setInteractive({ useHandCursor: true });

    // Hover effect (scale up)
    shopButton.on('pointerover', () => {
      shopButton.setScale(1.1);
    });

    shopButton.on('pointerout', () => {
      shopButton.setScale(1.0);
    });

    // T038: Click handler - launch ShopScene
    shopButton.on('pointerdown', () => {
      // Visual feedback (scale pulse)
      this.tweens.add({
        targets: shopButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Launch shop scene as overlay
          this.scene.launch('ShopScene');
        },
      });
    });

    // Feature 006 T044: Create game clock display (top-left, below shop button)
    const clockX = 20;  // Align with shop button left edge
    const clockY = 60;  // Below shop button (shop at y=20)

    this.gameClockText = this.add.text(clockX, clockY, `⏱️ 00:00:00`, {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.gameClockText.setOrigin(0, 0); // Left-aligned

    // Feature 006 T045: Timer event to update clock every 1 second
    this.gameClockTimer = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateGameClock,
      callbackScope: this,
      loop: true,
    });

    // Initial clock update
    this.updateGameClock();

    // Feature 006 T062-T064: Create game over overlay (initially hidden)
    this.createGameOverOverlay();

    // T063: Subscribe to game over state changes
    useGameStore.subscribe(
      () => {
        const state = useGameStore.getState();
        if (state.isGameOver) {
          this.showGameOverOverlay();
        } else {
          this.hideGameOverOverlay();
        }
      }
    );

    // Feature 006 T082: Listen for toast notifications
    this.events.on('show-toast', this.showToast, this);

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
      
      this.cooldownTimerText?.setText(i18nService.t('ui.game.readyIn', { seconds: remainingSeconds.toString() }));
      this.cooldownTimerText?.setVisible(true);
    } else {
      this.cooldownTimerText?.setVisible(false);
    }

    // Feature 006: Update pet cooldown indicator
    const timeSinceLastPet = now - state.ui.lastPetTime;
    const petCooldownRemaining = COOLDOWNS.PET - timeSinceLastPet;

    if (petCooldownRemaining > 0 && timeSinceLastPet > 0) {
      const remainingSeconds = Math.ceil(petCooldownRemaining / 1000);
      this.petCooldownText?.setText(`💗 ${i18nService.t('ui.game.readyIn', { seconds: remainingSeconds.toString() })}`);
      this.petCooldownText?.setVisible(true);
    } else {
      this.petCooldownText?.setVisible(false);
    }

    // Feature 006 T023: Update currency display when it changes
    const currentCurrency = state.currency;
    if (currentCurrency !== this.lastCurrencyValue) {
      if (this.currencyText) {
        this.animateCurrencyCounter(this.lastCurrencyValue, currentCurrency, this.currencyText);
      }
      this.lastCurrencyValue = currentCurrency;
    }
  }

  /**
   * Feature 006: Update game clock display
   */
  private updateGameClock(): void {
    const elapsedSeconds = getElapsedSeconds();
    const clockString = formatGameClock(elapsedSeconds);
    this.gameClockText?.setText(`⏱️ ${clockString}`);
  }

  /**
   * Feature 006 T062: Create game over overlay
   */
  private createGameOverOverlay(): void {
    const { width, height } = this.scale;

    // Container for all game over elements
    this.gameOverOverlay = this.add.container(0, 0);
    this.gameOverOverlay.setDepth(1000); // Above everything else

    // Semi-transparent dark background
    this.gameOverBackground = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    this.gameOverBackground.setOrigin(0, 0);
    this.gameOverOverlay.add(this.gameOverBackground);

    // Title text
    this.gameOverTitleText = this.add.text(width / 2, height / 2 - 60, `💔 ${i18nService.t('ui.gameOver.title')}`, {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ff6b6b',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.gameOverTitleText.setOrigin(0.5);
    this.gameOverOverlay.add(this.gameOverTitleText);

    // Message text
    this.gameOverMessageText = this.add.text(width / 2, height / 2, i18nService.t('ui.gameOver.message'), {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 100 },
    });
    this.gameOverMessageText.setOrigin(0.5);
    this.gameOverOverlay.add(this.gameOverMessageText);

    // T064: Reset button
    this.gameOverResetButton = this.add.text(width / 2, height / 2 + 80, `🔄 ${i18nService.t('ui.gameOver.reset')}`, {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 },
    });
    this.gameOverResetButton.setOrigin(0.5);
    this.gameOverResetButton.setInteractive({ useHandCursor: true });

    // Hover effect
    this.gameOverResetButton.on('pointerover', () => {
      this.gameOverResetButton?.setScale(1.1);
    });

    this.gameOverResetButton.on('pointerout', () => {
      this.gameOverResetButton?.setScale(1);
    });

    // Click handler - reset game
    this.gameOverResetButton.on('pointerdown', () => {
      resetGame();
      
      // Reset decay timer
      const mainScene = this.scene.get('MainGameScene') as MainGameScene;
      mainScene.decaySystem?.reset();
    });

    this.gameOverOverlay.add(this.gameOverResetButton);

    // Initially hidden
    this.gameOverOverlay.setVisible(false);
  }

  /**
   * Feature 006 T063: Show game over overlay
   */
  private showGameOverOverlay(): void {
    this.gameOverOverlay?.setVisible(true);

    // T068, T069: Disable buttons
    // (Already disabled by checking isGameOver in click handlers)
  }

  /**
   * Feature 006 T063: Hide game over overlay
   */
  private hideGameOverOverlay(): void {
    this.gameOverOverlay?.setVisible(false);
  }

  /**
   * Feature 006 T024: Animate currency counter from old to new value
   */
  private animateCurrencyCounter(from: number, to: number, textObject: Phaser.GameObjects.Text): void {
    // Use Phaser's addCounter for smooth number interpolation
    this.tweens.addCounter({
      from: from,
      to: to,
      duration: 500,
      ease: 'Quad.easeOut', // NFR-001: Quadratic easing for smooth animation
      onUpdate: (tween) => {
        const value = tween.getValue();
        if (value !== null) {
          textObject.setText(Math.floor(value).toString());
        }
      }
    });
  }

  /**
   * T037: Handle language change event - update all UI text
   */
  private handleLanguageChanged(newLanguage: string): void {
    console.log(`[UIScene] Language changed to ${newLanguage}, updating UI text`);

    // Update status bar labels
    if (this.hungerBar) {
      (this.hungerBar as any).labelText?.setText(i18nService.t('ui.statusBar.hunger'));
    }
    if (this.cleanlinessBar) {
      (this.cleanlinessBar as any).labelText?.setText(i18nService.t('ui.statusBar.cleanliness'));
    }
    if (this.happinessBar) {
      (this.happinessBar as any).labelText?.setText(i18nService.t('ui.statusBar.happiness'));
    }

    // Update cooldown timer text if visible
    if (this.cooldownTimerText && this.cooldownTimerText.visible) {
      const state = useGameStore.getState();
      const now = Date.now();
      if (state.feeding.fullUntil !== null && now < state.feeding.fullUntil) {
        const remainingMs = state.feeding.fullUntil - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        this.cooldownTimerText.setText(
          i18nService.t('ui.messages.cooldownTimer', { seconds: remainingSeconds.toString() })
        );
      }
    }

    // Update pet cooldown text if visible
    if (this.petCooldownText && this.petCooldownText.visible) {
      const state = useGameStore.getState();
      const now = Date.now();
      const timeSinceLastPet = now - state.ui.lastPetTime;
      const petCooldownRemaining = COOLDOWNS.PET - timeSinceLastPet;
      if (petCooldownRemaining > 0) {
        const remainingSeconds = Math.ceil(petCooldownRemaining / 1000);
        this.petCooldownText.setText(
          `💗 ${i18nService.t('ui.game.readyIn', { seconds: remainingSeconds.toString() })}`
        );
      }
    }

    // Update reset button text
    if (this.resetButton) {
      this.resetButton.setText(`🔄 ${i18nService.t('ui.buttons.reset')}`);
    }
  }

  /**
   * Feature 006 T082: Show toast notification (3s duration, top-center)
   * @param message - i18n key for the toast message
   */
  private showToast(message: string): void {
    const width = this.scale.width;
    const translatedMessage = i18nService.t(message);

    // Create toast container
    const toastBg = this.add.rectangle(width / 2, 80, 400, 60, 0x333333, 0.9);
    toastBg.setOrigin(0.5);

    const toastText = this.add.text(width / 2, 80, translatedMessage, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFD700',
      align: 'center',
      wordWrap: { width: 360 },
    });
    toastText.setOrigin(0.5);

    // Fade in
    toastBg.setAlpha(0);
    toastText.setAlpha(0);

    this.tweens.add({
      targets: [toastBg, toastText],
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [toastBg, toastText],
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          toastBg.destroy();
          toastText.destroy();
        },
      });
    });
  }

  /**
   * Clean up event listeners when scene is destroyed
   */
  shutdown(): void {
    i18nService.off('languageChanged', this.handleLanguageChanged.bind(this));
    this.timerEvent?.destroy();
  }
}
