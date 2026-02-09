import Phaser from 'phaser';
import { StatusBar } from '../entities/StatusBar';
import { InventoryItem } from '../entities/InventoryItem';
import { useGameStore } from '../state/gameStore';
import { selectTool } from '../state/actions';
import { GAME_CONFIG } from '../config/gameConstants';

export class UIScene extends Phaser.Scene {
  private hungerBar?: StatusBar;
  private cleanlinessBar?: StatusBar;
  private happinessBar?: StatusBar;
  private carrotItem?: InventoryItem;
  private brushItem?: InventoryItem;
  private lastInventoryClickTime: number = 0;

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

    console.log('UIScene initialized - Status bars and inventory created (centered)');
  }

  update(_time: number, _delta: number): void {
    // Bind status bar values to game store
    const state = useGameStore.getState();

    this.hungerBar?.setValue(state.horse.hunger);
    this.cleanlinessBar?.setValue(state.horse.cleanliness);
    this.happinessBar?.setValue(state.horse.happiness);

    // Update inventory display
    this.carrotItem?.setCount(state.inventory.carrots);
    this.brushItem?.setCount(state.inventory.brushUses);

    // Update selection highlights
    this.carrotItem?.setSelected(state.ui.selectedTool === 'carrot');
    this.brushItem?.setSelected(state.ui.selectedTool === 'brush');
  }
}
