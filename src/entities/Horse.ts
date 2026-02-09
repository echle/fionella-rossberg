import Phaser from 'phaser';

export class Horse extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private readonly startY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    this.startY = y; // Store initial Y position

    // Create placeholder horse sprite using Graphics
    this.sprite = scene.add.graphics();
    this.sprite.fillStyle(0x8b4513, 1); // Brown color
    this.sprite.fillCircle(0, 0, 100); // Circle with radius 100

    // Add horse label
    const label = scene.add.text(0, 0, '🐴', {
      fontSize: '80px',
      align: 'center',
    });
    label.setOrigin(0.5);

    this.add([this.sprite, label]);
    scene.add.existing(this);

    // Slightly larger hit area for easier clicking
    this.setSize(220, 220);
    this.setInteractive();
  }

  playEatingAnimation(): void {
    // Stop any existing tweens on this container to prevent stacking
    this.scene.tweens.killTweensOf(this);
    
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
