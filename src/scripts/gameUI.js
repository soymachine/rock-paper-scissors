// Wires all HTML UI elements to Phaser game events

const humanScoreEl = document.getElementById('human-score');
const aiScoreEl = document.getElementById('ai-score');
const roundResultEl = document.getElementById('round-result-text');
const choiceBtns = document.querySelectorAll('.choice-btn');
const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverScore = document.getElementById('game-over-score');
const playAgainBtn = document.getElementById('play-again-btn');
const gameOverHistoryBtn = document.getElementById('game-over-history-btn');
const historyBtn = document.getElementById('history-btn');

// Choice buttons → Phaser
choiceBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('rps:choose', { detail: { choice: btn.dataset.choice } }));
  });
});

// Play again
playAgainBtn.addEventListener('click', () => {
  gameOverOverlay.classList.remove('visible');
  window.dispatchEvent(new Event('rps:play-again'));
});

// History buttons
historyBtn.addEventListener('click', () =>
  window.dispatchEvent(new CustomEvent('rps:show-history'))
);
gameOverHistoryBtn.addEventListener('click', () =>
  window.dispatchEvent(new CustomEvent('rps:show-history'))
);

// Score updates
window.addEventListener('rps:score-update', (e) => {
  humanScoreEl.textContent = e.detail.humanScore;
  aiScoreEl.textContent = e.detail.aiScore;
});

// Round result text
window.addEventListener('rps:round-result', (e) => {
  if (e.detail.clear) {
    roundResultEl.classList.remove('visible');
    return;
  }
  roundResultEl.textContent = e.detail.message;
  roundResultEl.classList.add('visible');
});

// State changes — enable/disable choice buttons
window.addEventListener('rps:state-change', (e) => {
  const idle = e.detail.state === 'IDLE';
  choiceBtns.forEach((btn) => btn.classList.toggle('disabled', !idle));
});

// Game over
window.addEventListener('rps:game-over', (e) => {
  const { winner, humanScore, aiScore } = e.detail;
  gameOverTitle.textContent = winner === 'HUMAN' ? 'YOU WIN!' : 'AI WINS!';
  gameOverScore.textContent = `${humanScore} — ${aiScore}`;
  gameOverOverlay.classList.add('visible');
});
