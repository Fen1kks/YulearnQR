import { $, show, hide } from '../utils/dom.js';
import { showToast } from './status.js';
import { t } from '../i18n.js';
import { getDisplayUrl } from '../validator.js';
import { getSetting } from './settings.js';
import { stopScanning } from '../scanner.js';

let redirectTimeout = null;

function handleEscKey(e) {
  if (e.key === 'Escape') cancelRedirect();
}

function handleOverlayClick(e) {
  if (e.target === $('#redirect-overlay')) cancelRedirect();
}

async function navigateToUrl(url) {
  await stopScanning();
  window.location.href = url;
}

export function initiateRedirect(url) {
  if (getSetting('autoRedirect')) {
    navigateToUrl(url);
    return;
  }

  const overlay = $('#redirect-overlay');
  const urlDisplay = $('#redirect-url');

  if (urlDisplay) urlDisplay.textContent = getDisplayUrl(url);
  show(overlay);

  document.addEventListener('keydown', handleEscKey);
  overlay?.addEventListener('click', handleOverlayClick);

  redirectTimeout = setTimeout(() => {
    navigateToUrl(url);
  }, 800);
}

export function cancelRedirect() {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }

  document.removeEventListener('keydown', handleEscKey);
  $('#redirect-overlay')?.removeEventListener('click', handleOverlayClick);

  hide($('#redirect-overlay'));
  showToast(t('redirectCancel'));
}
