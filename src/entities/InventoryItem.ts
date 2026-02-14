import Phaser from 'phaser';
import { ToolType } from '../state/types';
import { useGameStore } from '../state/gameStore';
import { i18nService } from '../services/i18nService';

export class InventoryItem extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private icon: Phaser.GameObjects.Text | Phaser.GameObjects.Image;
  private countText: Phaser.GameObjects.Text;
  private itemType: ToolType;
  private isAvailable: boolean = true;
  private useSprite: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemType: ToolType,
    iconText: string,
    initialCount: number
  ) {
    super(scene, x, y);

    this.itemType = itemType;

    // Background slot
    this.background = scene.add.graphics();
    this.drawBackground(false);

    // Icon - try sprite first, fallback to emoji
    const spriteKey = itemType === 'carrot' ? 'icon-carrot' : 'icon-brush';
    this.useSprite = scene.textures.exists(spriteKey);

    if (this.useSprite) {
      this.icon = scene.add.image(0, -10, spriteKey);
      (this.icon as Phaser.GameObjects.Image).setDisplaySize(48, 48);
      console.log(`[InventoryItem] Using sprite for ${itemType}`);
    } else {
      this.icon = scene.add.text(0, -10, iconText, {
        fontSize: '48px',
        align: 'center',
      });
      (this.icon as Phaser.GameObjects.Text).setOrigin(0.5);
      console.log(`[InventoryItem] Using emoji for ${itemType}`);
    }

    this.icon.setOrigin(0.5);

    // Count text
    this.countText = scene.add.text(0, 30, `x${initialCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.countText.setOrigin(0.5);
    this.countText.setStroke('#000000', 3);

    this.add([this.background, this.icon, this.countText]);
    scene.add.existing(this);

    // Make interactive
    this.setSize(80, 80);
    this.setInteractive({ useHandCursor: true });
  }

  private drawBackground(selected: boolean): void {
    this.background.clear();

    const size = 80;
    const half = size / 2;

    // Fill
    this.background.fillStyle(0x444444, 0.8);
    this.background.fillRoundedRect(-half, -half, size, size, 8);

    // Border
    if (selected) {
      this.background.lineStyle(4, 0xffeb3b, 1); // Yellow when selected
    } else {
      this.background.lineStyle(2, 0x888888, 1);
    }
    this.background.strokeRoundedRect(-half, -half, size, size, 8);

    // Unavailable overlay
    if (!this.isAvailable) {
      this.background.fillStyle(0x000000, 0.6);
      this.background.fillRoundedRect(-half, -half, size, size, 8);
    }
  }

  setSelected(selected: boolean): void {
    this.drawBackground(selected);
  }

  setCount(count: number): void {
    this.countText.setText(`x${count}`);
    this.isAvailable = count > 0;

    // Re-draw to show/hide unavailable overlay
    const state = useGameStore.getState();
    const isSelected = state.ui.selectedTool === this.itemType;
    this.drawBackground(isSelected);

    // Gray out icon when unavailable
    this.icon.setAlpha(this.isAvailable ? 1.0 : 0.3);
    this.countText.setAlpha(this.isAvailable ? 1.0 : 0.5);
  }

  getItemType(): ToolType {
    return this.itemType;
  }

  getIsAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Disable/enable the item visually (for feeding mechanics)
   * Different from count-based availability - this is for temporary state (eating, cooldown)
   */
  setDisabled(disabled: boolean): void {
    if (disabled) {
      // Gray out the icon
      if (this.useSprite) {
        (this.icon as Phaser.GameObjects.Image).setTint(0x888888);
      }
      this.icon.setAlpha(0.5);
    } else {
      // Restore normal appearance
      if (this.useSprite) {
        (this.icon as Phaser.GameObjects.Image).clearTint();
      }
      this.icon.setAlpha(this.isAvailable ? 1.0 : 0.3); // Respect count-based availability
    }
  }
}
