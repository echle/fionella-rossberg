import Phaser from 'phaser';

export class Horse extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
  private readonly startY: number;
  private readonly useSprite: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.startY = y; // Store initial Y position

    // Check if sprite texture is available, otherwise use placeholder
    this.useSprite = scene.textures.exists('horse-idle');

    if (this.useSprite) {
      // Use loaded sprite
      this.sprite = scene.add.image(0, 0, 'horse-idle');
      this.sprite.setDisplaySize(200, 200); // Scale to match placeholder size
      this.add(this.sprite);
      console.log('[Horse] Using sprite asset');
    } else {
      // Fallback to placeholder Graphics
      this.sprite = scene.add.graphics();
      (this.sprite as Phaser.GameObjects.Graphics).fillStyle(0x8b4513, 1);
      (this.sprite as Phaser.GameObjects.Graphics).fillCircle(0, 0, 100);
      this.add(this.sprite);

      // Add emoji label for placeholder (on top of circle)
      const label = scene.add.text(0, 0, '🐴', {
        fontSize: '80px',
        align: 'center',
      });
      label.setOrigin(0.5);
      this.add(label);
      console.log('[Horse] Using placeholder graphics');
    }

    scene.add.existing(this);

    // Slightly larger hit area for easier clicking
    this.setSize(220, 220);
    this.setInteractive();
  }

  playEatingAnimation(): void {
    // Stop any existing tweens on this container to prevent stacking
    this.scene.tweens.killTweensOf(this);

    // If eating sprite exists, switch to it temporarily
    if (this.useSprite && this.scene.textures.exists('horse-eating')) {
      const sprite = this.sprite as Phaser.GameObjects.Image;
      sprite.setTexture('horse-eating');

      // Switch back after animation
      this.scene.time.delayedCall(800, () => {
        sprite.setTexture('horse-idle');
      });
    }

    // Placeholder animation: scale tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 400,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  playHappyAnimation(): void {
    // Stop any existing tweens on this container to prevent stacking
    this.scene.tweens.killTweensOf(this);

    // Reset to original position first
    this.y = this.startY;

    // If happy sprite exists, switch to it temporarily
    if (this.useSprite && this.scene.textures.exists('horse-happy')) {
      const sprite = this.sprite as Phaser.GameObjects.Image;
      sprite.setTexture('horse-happy');

      // Switch back after animation
      this.scene.time.delayedCall(600, () => {
        sprite.setTexture('horse-idle');
      });
    }

    // Placeholder animation: bounce
    this.scene.tweens.add({
      targets: this,
      y: this.startY - 20,
      duration: 300,
      yoyo: true,
      ease: 'Bounce.easeOut',
    });
  }
}
