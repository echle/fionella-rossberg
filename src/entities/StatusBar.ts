import Phaser from 'phaser';
import { i18nService } from '../services/i18nService';

export class StatusBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private fill: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private valueText: Phaser.GameObjects.Text;
  private currentValue: number = 100;
  private displayValue: number = 100; // For smooth animation
  private maxValue: number = 100;
  private barWidth: number = 200;
  private barHeight: number = 30;
  private fillColor: number;

  constructor(scene: Phaser.Scene, x: number, y: number, label: string, color: number = 0x4caf50) {
    super(scene, x, y);

    this.fillColor = color;

    // Label text
    this.labelText = scene.add.text(-10, 0, label, {
      fontSize: '16px',
      color: '#333333',
      fontStyle: 'bold',
    });
    this.labelText.setOrigin(1, 0.5);

    // Background bar
    this.background = scene.add.graphics();
    this.background.fillStyle(0xcccccc, 1);
    this.background.fillRoundedRect(0, -this.barHeight / 2, this.barWidth, this.barHeight, 5);
    this.background.lineStyle(2, 0x888888, 1);
    this.background.strokeRoundedRect(0, -this.barHeight / 2, this.barWidth, this.barHeight, 5);

    // Fill bar
    this.fill = scene.add.graphics();
    this.updateFill();

    // Value text
    this.valueText = scene.add.text(this.barWidth / 2, 0, '100/100', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.valueText.setOrigin(0.5);
    this.valueText.setStroke('#000000', 3);

    this.add([this.background, this.fill, this.labelText, this.valueText]);
    scene.add.existing(this);
  }

  setValue(value: number): void {
    const targetValue = Phaser.Math.Clamp(value, 0, this.maxValue);

    // Smooth tween animation for value changes
    this.scene.tweens.add({
      targets: this,
      displayValue: targetValue,
      duration: 300,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.currentValue = this.displayValue;
        this.updateFill();
        this.updateValueText();
        this.updateColor();
      },
    });
  }

  private updateFill(): void {
    this.fill.clear();
    const fillWidth = (this.currentValue / this.maxValue) * this.barWidth;

    if (fillWidth > 0) {
      this.fill.fillStyle(this.fillColor, 1);
      this.fill.fillRoundedRect(0, -this.barHeight / 2, fillWidth, this.barHeight, 5);
    }
  }

  private updateValueText(): void {
    this.valueText.setText(`${Math.floor(this.currentValue)}/${this.maxValue}`);
  }

  private updateColor(): void {
    const percentage = (this.currentValue / this.maxValue) * 100;

    if (percentage >= 80) {
      this.fillColor = 0x4caf50; // Green
    } else if (percentage >= 40) {
      this.fillColor = 0xffc107; // Yellow
    } else {
      this.fillColor = 0xf44336; // Red
    }

    this.updateFill();
  }
}
