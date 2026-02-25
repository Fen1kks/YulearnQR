import { initScanner, startScanning, stopScanning, switchCamera, isScannerActive } from './scanner.js';
import { validateUrl } from './validator.js';
import { t, getCurrentLang, setLang } from './i18n.js';
import { $, $$ } from './utils/dom.js';
import { showStatus, showToast } from './ui/status.js';
import { loadHistory, addToHistory, clearHistory, renderHistory } from './ui/history.js';
import { initiateRedirect, cancelRedirect } from './ui/redirect.js';

// === Initialization === //
document.addEventListener('DOMContentLoaded', () => {
  detectPwaStandalone();
  loadHistory();
  applyTranslations();
  setupEventListeners();
  registerServiceWorker();
  checkAutoScan();
});

// === Auto Scan Check === //
function checkAutoScan() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'scan') {
    setTimeout(() => {
      const btn = $('#btn-scan');
      if (btn && !isScannerActive()) {
        toggleScanner();
      }
    }, 500);
  }
}

// === PWA Standalone Detection === //
function detectPwaStandalone() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) {
    document.body.classList.add('pwa-standalone');
  }
}

// === Service Worker Registration === //
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('[SW] Service Worker registered');
    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  }
}

// === Event Listeners === //
function setupEventListeners() {
  $('#btn-scan').addEventListener('click', toggleScanner);
  $('#btn-camera-switch')?.addEventListener('click', handleCameraSwitch);
  $('#btn-lang').addEventListener('click', toggleLanguage);
  $('#btn-clear-history')?.addEventListener('click', clearHistory);
  $('#btn-redirect-cancel')?.addEventListener('click', cancelRedirect);
}

// === Scanner Toggle === //
async function toggleScanner() {
  const btn = $('#btn-scan');
  const scanLine = $('.scan-line');
  const placeholder = $('.scanner-placeholder');

  if (isScannerActive()) {
    await stopScanning();
    btn.innerHTML = `<span class="btn__icon">📷</span> ${t('startScan')}`;
    btn.classList.remove('btn--danger');
    btn.classList.add('btn--primary');
    scanLine?.classList.remove('active');
    placeholder?.classList.remove('hidden');
    $('#btn-camera-switch')?.classList.add('hidden');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>`;

  try {
    initScanner({ elementId: 'qr-reader' });
    await startScanning(handleScanResult);

    btn.innerHTML = `<span class="btn__icon">⏹️</span> ${t('stopScan')}`;
    btn.classList.remove('btn--primary');
    btn.classList.add('btn--danger');
    scanLine?.classList.add('active');
    placeholder?.classList.add('hidden');
    $('#btn-camera-switch')?.classList.remove('hidden');
  } catch (err) {
    console.error('[App] Scanner error:', err);
    const errorMap = {
      CAMERA_PERMISSION_DENIED: 'cameraPermissionDenied',
      NO_CAMERA: 'cameraNotFound',
      INSECURE_CONTEXT: 'insecureContext',
      NO_CAMERA_API: 'noCameraApi',
      CAMERA_IN_USE: 'cameraInUse',
    };

    let msg = t(errorMap[err.message] || 'cameraError');
    if (err.message?.startsWith('CAMERA_ERROR:')) {
      msg = t('cameraError') + ' — ' + err.message.replace('CAMERA_ERROR: ', '');
    }
    showStatus('error', msg);
    btn.innerHTML = `<span class="btn__icon">📷</span> ${t('startScan')}`;
  }

  btn.disabled = false;
}

// === Handle Scan Result === //
function handleScanResult(decodedText) {
  const result = validateUrl(decodedText);

  if ('vibrate' in navigator) {
    navigator.vibrate(result.valid ? [100, 50, 100] : [300]);
  }

  if (result.valid) {
    showStatus('success', t('validUrl'), result.url);
    addToHistory(result.url);
    initiateRedirect(result.url);
  } else {
    showStatus('error', t('invalidUrl'), decodedText);
  }
}

// === Camera Switch === //
async function handleCameraSwitch() {
  try {
    await switchCamera(handleScanResult);
    showToast(t('switchCamera'));
  } catch {
  }
}

// === Language Toggle === //
function toggleLanguage() {
  const current = getCurrentLang();
  const next = current === 'tr' ? 'en' : 'tr';
  setLang(next);
  applyTranslations();
  renderHistory();
}

// === Apply Translations === //
function applyTranslations() {
  const lang = getCurrentLang();

  const langBtn = $('#btn-lang');
  if (langBtn) langBtn.textContent = lang === 'tr' ? 'EN' : 'TR';

  $$('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  $$('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  if (!isScannerActive()) {
    const btn = $('#btn-scan');
    if (btn) btn.innerHTML = `<span class="btn__icon">📷</span> ${t('startScan')}`;
  }

  document.documentElement.lang = lang;
}
