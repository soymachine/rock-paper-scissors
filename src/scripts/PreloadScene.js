import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Loading bar — relative to canvas size (RESIZE mode)
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.add.rectangle(cx, cy, 400, 8, 0xe0e0e0);
    const barFill = this.add.rectangle(cx - 200, cy, 0, 8, 0x000000).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      barFill.width = 400 * value;
    });

    // Use BASE_URL so paths work both locally and on GitHub Pages
    const base = import.meta.env.BASE_URL;
    this.load.image('human-rock',     `${base}images/human-rock.png`);
    this.load.image('human-paper',    `${base}images/human-paper.png`);
    this.load.image('human-scissors', `${base}images/human-scissors.png`);
    this.load.image('ai-rock',        `${base}images/ai-rock.png`);
    this.load.image('ai-paper',       `${base}images/ai-paper.png`);
    this.load.image('ai-scissors',    `${base}images/ai-scissors.png`);
  }

  create() {
    this.scene.start('GameScene');
  }
}
