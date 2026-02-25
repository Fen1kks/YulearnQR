import { $, show, hide } from '../utils/dom.js';

let statusTimeout = null;
let toastTimeout = null;

export function showStatus(type, title, detail = '') {
  const card = $('#status-card');
  if (!card) return;

  if (statusTimeout) clearTimeout(statusTimeout);

  const icon = card.querySelector('.status-card__icon');
  const titleEl = card.querySelector('.status-card__title');
  const textEl = card.querySelector('.status-card__text');

  card.className = 'status-card';
  card.classList.add('visible', `status-card--${type}`);
  icon.textContent = type === 'success' ? '✅' : '❌';
  titleEl.textContent = title;
  textEl.textContent = detail;

  statusTimeout = setTimeout(() => hide(card), 5000);
}

export function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    hide(toast);
  }

  toast.textContent = message;
  show(toast);
  toastTimeout = setTimeout(() => {
    hide(toast);
    toastTimeout = null;
  }, 2500);
}
