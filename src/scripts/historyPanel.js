import { getHistory } from './storage.js';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderHistory() {
  const listEl = document.getElementById('history-list');
  if (!listEl) return;

  const history = getHistory();

  if (history.length === 0) {
    listEl.innerHTML = '<p class="history-empty">No games played yet.</p>';
    return;
  }

  listEl.innerHTML = history
    .map((g) => {
      const winnerClass = g.winner === 'HUMAN' ? 'human-wins' : 'ai-wins';
      const winnerLabel = g.winner === 'HUMAN' ? 'YOU WIN' : 'AI WINS';
      return `
        <div class="history-entry">
          <span class="history-date">${formatDate(g.date)}</span>
          <span class="history-score">${g.humanScore}&thinsp;—&thinsp;${g.aiScore}</span>
          <span class="history-winner ${winnerClass}">${winnerLabel}</span>
        </div>
      `;
    })
    .join('');
}

export function initHistoryPanel() {
  const overlay = document.getElementById('history-overlay');
  const closeBtn = document.getElementById('history-close');
  if (!overlay || !closeBtn) return;

  const show = () => {
    renderHistory();
    overlay.classList.add('visible');
  };

  const hide = () => overlay.classList.remove('visible');

  window.addEventListener('rps:show-history', show);
  closeBtn.addEventListener('click', hide);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hide();
  });

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) hide();
  });
}
