import Phaser from 'phaser';


// Dynamische, responsive Grundauflösung
const getResponsiveDimensions = () => {
  const minWidth = 800;
  const minHeight = 600;
  const maxWidth = 2560;
  const maxHeight = 1440;
  const w = Math.max(minWidth, Math.min(window.innerWidth, maxWidth));
  const h = Math.max(minHeight, Math.min(window.innerHeight, maxHeight));
  return { width: w, height: h };
};

const { width, height } = getResponsiveDimensions();

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width,
  height,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 800, height: 600 },
    max: { width: 2560, height: 1440 },
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
