import Phaser from 'phaser';

class Boot extends Phaser.Scene {
  constructor() { super('boot'); }
  preload() {
    // Beispiel-Asset: weißer Kreis als Data-Texture
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillCircle(16, 16, 16);
    g.generateTexture('dot', 32, 32);
    g.destroy();
  }
  create() { this.scene.start('play'); }
}

class Play extends Phaser.Scene {
  private score = 0!;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() { super('play'); }

  create() {
    const w = this.scale.width, h = this.scale.height;

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: 'sans-serif', fontSize: '24px' });

    const sprite = this.physics.add.image(w * 0.5, h * 0.5, 'dot').setScale(2);
    sprite.setCollideWorldBounds(true).setBounce(1, 1).setVelocity(180, 220);

    this.input.on('pointerdown', () => {
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
      this.cameras.main.flash(100);
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',                  // Vite-Template hat <div id="app"></div>
  backgroundColor: '#88d66c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: [Boot, Play]
});
