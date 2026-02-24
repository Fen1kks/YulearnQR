import { $, show, hide } from '../utils/dom.js';
import { showToast } from './status.js';
import { t } from '../i18n.js';
import { getDisplayUrl } from '../validator.js';

let redirectTimeout = null;

export function initiateRedirect(url) {
  const overlay = $('#redirect-overlay');
  const urlDisplay = $('#redirect-url');

  if (urlDisplay) urlDisplay.textContent = getDisplayUrl(url);
  show(overlay);

  redirectTimeout = setTimeout(() => {
    window.location.href = url;
  }, 800);
}

export function cancelRedirect() {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }
  hide($('#redirect-overlay'));
  showToast(t('redirectCancel'));
}
