import Phaser from 'phaser';
import { phaserConfig } from './config/phaserConfig';
import { BootScene } from './scenes/BootScene';
import { MainGameScene } from './scenes/MainGameScene';
import { UIScene } from './scenes/UIScene';
import { saveSystem } from './systems/SaveSystem';
import { getGameState } from './state/gameStore';
import { i18nService } from './services/i18nService';

// Add scenes to Phaser config
const config: Phaser.Types.Core.GameConfig = {
  ...phaserConfig,
  scene: [BootScene, MainGameScene, UIScene],
};

// Initialize i18n with default language (German)
i18nService.setLanguage('de');
console.log('[i18n] Initialized with language:', i18nService.getCurrentLanguage());

// Initialize Phaser game instance
window.addEventListener('load', () => {
  new Phaser.Game(config);
});

// Save game state before page unload (tab close/refresh)
window.addEventListener('beforeunload', () => {
  saveSystem.save(getGameState());
  console.log('[BeforeUnload] Game state saved');
});
