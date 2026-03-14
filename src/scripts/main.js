import Phaser from 'phaser';
import { PreloadScene } from './PreloadScene.js';
import { GameScene } from './GameScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  parent: 'game-container',
  scene: [PreloadScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Wait for fonts to be ready so canvas text renders correctly
document.fonts.ready.then(() => {
  window.__rpsGame = new Phaser.Game(config);
});
