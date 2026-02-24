import { $, el, delegate, replaceChildren } from '../utils/dom.js';
import { showToast } from './status.js';
import { initiateRedirect } from './redirect.js';
import { t, formatRelativeTime } from '../i18n.js';
import { getDisplayUrl } from '../validator.js';

let scanHistory = [];
const MAX_HISTORY = 5;

export function loadHistory() {
  try {
    const stored = localStorage.getItem('yulearn-qr-history');
    scanHistory = stored ? JSON.parse(stored) : [];
  } catch {
    scanHistory = [];
  }
  renderHistory();
}

function saveHistory() {
  try {
    localStorage.setItem('yulearn-qr-history', JSON.stringify(scanHistory));
  } catch {
    console.warn('[History] localStorage save failed (quota exceeded)');
  }
}

export function addToHistory(url) {
  scanHistory = scanHistory.filter((item) => item.url !== url);

  scanHistory.unshift({ url, timestamp: Date.now() });

  if (scanHistory.length > MAX_HISTORY) {
    scanHistory = scanHistory.slice(0, MAX_HISTORY);
  }

  saveHistory();
  renderHistory();
}

export function clearHistory() {
  scanHistory = [];
  saveHistory();
  renderHistory();
  showToast(t('historyClear'));
}

export function renderHistory() {
  const list = $('#history-list');
  if (!list) return;

  if (scanHistory.length === 0) {
    replaceChildren(list, [
      el('div', { className: 'history-empty', text: t('historyEmpty') })
    ]);
    return;
  }

  const items = scanHistory.map((item) =>
    el('div', {
      className: 'history-item',
      data: { url: item.url },
      attrs: { role: 'button', tabindex: '0' }
    }, [
      el('span', { className: 'history-item__icon', text: '🔗' }),
      el('span', { className: 'history-item__url', text: getDisplayUrl(item.url) }),
      el('span', { className: 'history-item__time', text: formatRelativeTime(item.timestamp) })
    ])
  );

  replaceChildren(list, items);

  delegate(list, 'click', '.history-item', (_e, item) => {
    initiateRedirect(item.dataset.url);
  });
}
