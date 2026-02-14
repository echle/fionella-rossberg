import Phaser from 'phaser';
import { i18nService } from '../services/i18nService';

/**
 * LanguageSelector Component
 * UI element for switching between German and English
 * @feature 005-internationalization-i18n
 */
export class LanguageSelector extends Phaser.GameObjects.Container {
  private deButton?: Phaser.GameObjects.Container;
  private enButton?: Phaser.GameObjects.Container;
  private deBackground?: Phaser.GameObjects.Graphics;
  private enBackground?: Phaser.GameObjects.Graphics;
  private currentLanguage: string;

  private readonly buttonWidth = 50;
  private readonly buttonHeight = 40;
  private readonly buttonSpacing = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.currentLanguage = i18nService.getCurrentLanguage();

    // Create German button (left)
    this.deButton = this.createButton(scene, -(this.buttonWidth + this.buttonSpacing / 2), 0, 'de', '🇩🇪');
    this.deBackground = this.deButton.list[1] as Phaser.GameObjects.Graphics; // Index 1 because list[0] is hitArea

    // Create English button (right)
    this.enButton = this.createButton(scene, this.buttonSpacing / 2, 0, 'en', '🇬🇧');
    this.enBackground = this.enButton.list[1] as Phaser.GameObjects.Graphics; // Index 1 because list[0] is hitArea

    this.add([this.deButton, this.enButton]);
    scene.add.existing(this);

    // Initial highlight
    this.updateButtonStates();

    // Listen for external language changes
    i18nService.on('languageChanged', this.handleLanguageChanged.bind(this));
  }

  private createButton(
    scene: Phaser.Scene,
    offsetX: number,
    offsetY: number,
    langCode: string,
    flag: string
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(offsetX, offsetY);

    // Invisible hit area background (full button size)
    const hitArea = scene.add.rectangle(
      this.buttonWidth / 2,
      this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      0x000000,
      0
    );
    hitArea.setInteractive({ useHandCursor: true });

    // Visual background
    const background = scene.add.graphics();
    this.drawButtonBackground(background, false);

    // Flag text
    const text = scene.add.text(this.buttonWidth / 2, this.buttonHeight / 2, flag, {
      fontSize: '24px',
      align: 'center',
    });
    text.setOrigin(0.5);

    container.add([hitArea, background, text]);

    // Click handler on hit area
    hitArea.on('pointerdown', () => {
      this.handleButtonClick(langCode);
    });

    // Hover effects on hit area
    hitArea.on('pointerover', () => {
      if (this.currentLanguage !== langCode) {
        background.clear();
        this.drawButtonBackground(background, false, true); // Hover state
      }
    });

    hitArea.on('pointerout', () => {
      if (this.currentLanguage !== langCode) {
        background.clear();
        this.drawButtonBackground(background, false, false); // Normal state
      }
    });

    return container;
  }

  private drawButtonBackground(
    graphics: Phaser.GameObjects.Graphics,
    active: boolean,
    hover: boolean = false
  ): void {
    graphics.clear();

    // Fill
    if (active) {
      graphics.fillStyle(0x4caf50, 1); // Green when active
    } else if (hover) {
      graphics.fillStyle(0x666666, 0.9); // Light gray on hover
    } else {
      graphics.fillStyle(0x444444, 0.8); // Dark gray default
    }
    graphics.fillRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 8);

    // Border
    if (active) {
      graphics.lineStyle(3, 0xffeb3b, 1); // Yellow border when active
    } else {
      graphics.lineStyle(2, 0x888888, 1); // Gray border
    }
    graphics.strokeRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 8);
  }

  private handleButtonClick(langCode: string): void {
    if (this.currentLanguage === langCode) {
      // Already selected, do nothing
      return;
    }

    // Switch language
    i18nService.setLanguage(langCode);
    this.currentLanguage = langCode;
    this.updateButtonStates();

    console.log(`[LanguageSelector] Switched to ${langCode.toUpperCase()}`);
  }

  private handleLanguageChanged(newLanguage: string): void {
    this.currentLanguage = newLanguage;
    this.updateButtonStates();
  }

  private updateButtonStates(): void {
    // Update DE button
    if (this.deBackground) {
      this.deBackground.clear();
      this.drawButtonBackground(this.deBackground, this.currentLanguage === 'de');
    }

    // Update EN button
    if (this.enBackground) {
      this.enBackground.clear();
      this.drawButtonBackground(this.enBackground, this.currentLanguage === 'en');
    }
  }

  /**
   * Clean up event listeners when component is destroyed
   */
  destroy(fromScene?: boolean): void {
    i18nService.off('languageChanged', this.handleLanguageChanged.bind(this));
    super.destroy(fromScene);
  }
}
