const STORAGE_KEY = 'rps_history';

export function saveGame({ date, humanScore, aiScore, winner }) {
  const history = getHistory();
  history.unshift({ date, humanScore, aiScore, winner });
  if (history.length > 10) history.pop();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
