import Phaser from 'phaser';
import { saveGame } from './storage.js';

// ── Constants ────────────────────────────────────────────────────────────────
const CHOICES = ['rock', 'paper', 'scissors'];
const WINS_NEEDED = 3;

// ── Scene ─────────────────────────────────────────────────────────────────────
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  create() {
    this.humanScore = 0;
    this.aiScore = 0;
    this.gameState = 'IDLE';

    this.cameras.main.setBackgroundColor('#ffffff');

    this._buildGameHands();

    // Listen for HTML UI events
    this._chooseHandler = (e) => {
      if (this.gameState === 'IDLE') this._onPlayerChoose(e.detail.choice);
    };
    this._playAgainHandler = () => this._resetGame();

    window.addEventListener('rps:choose', this._chooseHandler);
    window.addEventListener('rps:play-again', this._playAgainHandler);

    this.scale.on('resize', this._onResize, this);
  }

  shutdown() {
    window.removeEventListener('rps:choose', this._chooseHandler);
    window.removeEventListener('rps:play-again', this._playAgainHandler);
  }

  // ── Hand helpers ───────────────────────────────────────────────────────────

  _getHandProps() {
    const w = this.scale.width;
    const h = this.scale.height;
    // Scale hands relative to canvas width, capped at original desktop scale
    const scale = Math.min((w / 1512) * 1.5, 0.82);
    return {
      humanX: Math.round(w * 0.135),
      humanY: Math.round(h * 0.5),
      aiX:    Math.round(w * 0.828),
      aiY:    Math.round(h * 0.5),
      scale,
    };
  }

  _buildGameHands() {
    const { humanX, humanY, aiX, aiY, scale } = this._getHandProps();

    this.humanHand = this.add
      .image(humanX, humanY, 'human-rock')
      .setScale(scale)
      .setDepth(2);

    this.aiHand = this.add
      .image(aiX, aiY, 'ai-rock')
      .setScale(scale)
      .setDepth(2);
  }

  _onResize() {
    if (!this.humanHand) return;
    const { humanX, humanY, aiX, aiY, scale } = this._getHandProps();
    this.humanHand.setPosition(humanX, humanY).setScale(scale);
    this.aiHand.setPosition(aiX, aiY).setScale(scale);
  }

  // ── Game logic ─────────────────────────────────────────────────────────────

  _onPlayerChoose(choice) {
    this.gameState = 'COUNTING';
    this._pendingChoice = choice;

    window.dispatchEvent(new CustomEvent('rps:state-change', { detail: { state: 'COUNTING' } }));

    const { humanX, humanY, aiX, aiY } = this._getHandProps();
    this.humanHand.setTexture('human-rock').setPosition(humanX, humanY);
    this.aiHand.setTexture('ai-rock').setPosition(aiX, aiY);

    this._doShakeCountdown(3, () => this._revealChoices());
  }

  _doShakeCountdown(count, onComplete) {
    const RISE = 55;
    const DURATION = 180;
    let remaining = count;

    const shakeOnce = () => {
      this.tweens.add({
        targets: [this.humanHand, this.aiHand],
        y: `-=${RISE}`,
        duration: DURATION,
        ease: 'Sine.easeInOut',
        yoyo: true,
        onComplete: () => {
          remaining--;
          if (remaining > 0) {
            this.time.delayedCall(60, shakeOnce);
          } else {
            const { humanY, aiY } = this._getHandProps();
            this.humanHand.setY(humanY);
            this.aiHand.setY(aiY);
            this.time.delayedCall(80, onComplete);
          }
        },
      });
    };

    shakeOnce();
  }

  _revealChoices() {
    const aiChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const humanChoice = this._pendingChoice;

    this.gameState = 'REVEALING';

    this.humanHand.setTexture(`human-${humanChoice}`);
    this.aiHand.setTexture(`ai-${aiChoice}`);

    const result = this._evaluate(humanChoice, aiChoice);

    if (result === 'human') {
      this.humanScore++;
      window.dispatchEvent(new CustomEvent('rps:score-update', {
        detail: { humanScore: this.humanScore, aiScore: this.aiScore },
      }));
      window.dispatchEvent(new CustomEvent('rps:round-result', { detail: { message: 'YOU WIN THE ROUND!' } }));
    } else if (result === 'ai') {
      this.aiScore++;
      window.dispatchEvent(new CustomEvent('rps:score-update', {
        detail: { humanScore: this.humanScore, aiScore: this.aiScore },
      }));
      window.dispatchEvent(new CustomEvent('rps:round-result', { detail: { message: 'AI WINS THE ROUND!' } }));
    } else {
      window.dispatchEvent(new CustomEvent('rps:round-result', { detail: { message: 'DRAW!' } }));
    }

    this.time.delayedCall(1800, () => {
      if (this.humanScore >= WINS_NEEDED || this.aiScore >= WINS_NEEDED) {
        this._endGame();
      } else {
        this._nextRound();
      }
    });
  }

  _evaluate(human, ai) {
    if (human === ai) return 'draw';
    if (
      (human === 'rock' && ai === 'scissors') ||
      (human === 'paper' && ai === 'rock') ||
      (human === 'scissors' && ai === 'paper')
    ) return 'human';
    return 'ai';
  }

  _nextRound() {
    window.dispatchEvent(new CustomEvent('rps:round-result', { detail: { clear: true } }));

    const { humanX, humanY, aiX, aiY } = this._getHandProps();
    this.humanHand.setTexture('human-rock').setPosition(humanX, humanY);
    this.aiHand.setTexture('ai-rock').setPosition(aiX, aiY);

    this.gameState = 'IDLE';
    window.dispatchEvent(new CustomEvent('rps:state-change', { detail: { state: 'IDLE' } }));
  }

  _endGame() {
    this.gameState = 'GAME_OVER';
    const winner = this.humanScore >= WINS_NEEDED ? 'HUMAN' : 'AI';

    saveGame({
      date: new Date().toISOString(),
      humanScore: this.humanScore,
      aiScore: this.aiScore,
      winner,
    });

    window.dispatchEvent(new CustomEvent('rps:game-over', {
      detail: { winner, humanScore: this.humanScore, aiScore: this.aiScore },
    }));
  }

  _resetGame() {
    this.humanScore = 0;
    this.aiScore = 0;

    window.dispatchEvent(new CustomEvent('rps:score-update', {
      detail: { humanScore: 0, aiScore: 0 },
    }));
    window.dispatchEvent(new CustomEvent('rps:round-result', { detail: { clear: true } }));

    const { humanX, humanY, aiX, aiY } = this._getHandProps();
    this.humanHand.setTexture('human-rock').setPosition(humanX, humanY);
    this.aiHand.setTexture('ai-rock').setPosition(aiX, aiY);

    this.gameState = 'IDLE';
    window.dispatchEvent(new CustomEvent('rps:state-change', { detail: { state: 'IDLE' } }));
  }
}
