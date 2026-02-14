import Phaser from 'phaser';

/**
 * GiftBox Entity - Interactive gift that grants random rewards
 * @feature 006-economy-game-clock
 */
export class GiftBox extends Phaser.GameObjects.Text {
  private giftId: string;
  private isHovered: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, giftId: string) {
    // T047: Use 🎁 emoji as sprite (MVP - custom sprite optional for polish)
    super(scene, x, y, '🎁', {
      fontSize: '48px',
    });

    this.giftId = giftId;
    this.setOrigin(0.5);
    this.setInteractive({ useHandCursor: true });

    // T054: Bounce animation on spawn
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.setScale(1);
        // Continuous gentle bounce
        this.startIdleBounce();
      },
    });

    // T055: Click handler setup
    this.on('pointerdown', () => {
      this.handleClick();
    });

    // Hover effects
    this.on('pointerover', () => {
      this.isHovered = true;
      this.setScale(1.15);
    });

    this.on('pointerout', () => {
      this.isHovered = false;
      this.setScale(1);
    });

    scene.add.existing(this);
  }

  /**
   * Continuous idle bounce animation
   */
  private startIdleBounce(): void {
    if (!this.scene) return;

    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1, // Infinite loop
    });
  }

  /**
   * T055: Handle click event - triggers reward claim
   */
  private handleClick(): void {
    // Will be connected to claimGiftBox action
    this.emit('claim', this.giftId);
    
    // Visual feedback before destruction
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Get the gift ID
   */
  public getGiftId(): string {
    return this.giftId;
  }
}
