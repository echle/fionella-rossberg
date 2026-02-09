import Phaser from 'phaser';

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT, // Scale to fit available space while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center horizontally and vertically
    min: {
      width: 320, // Minimum mobile width
      height: 240,
    },
    max: {
      width: 2560, // Maximum desktop width
      height: 1440,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [],
};
