import { $, show, hide } from '../utils/dom.js';

export function showStatus(type, title, detail = '') {
  const card = $('#status-card');
  if (!card) return;

  const icon = card.querySelector('.status-card__icon');
  const titleEl = card.querySelector('.status-card__title');
  const textEl = card.querySelector('.status-card__text');

  card.className = `status-card visible status-card--${type}`;
  icon.textContent = type === 'success' ? '✅' : '❌';
  titleEl.textContent = title;
  textEl.textContent = detail;

  setTimeout(() => hide(card), 5000);
}

export function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;

  toast.textContent = message;
  show(toast);
  setTimeout(() => hide(toast), 2500);
}
