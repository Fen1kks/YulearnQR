import { startScanning, stopScanning, switchCamera, isScannerActive } from './scanner.js';
import { validateUrl } from './validator.js';
import { t, getCurrentLang, setLang } from './i18n.js';
import { $, $$ } from './utils/dom.js';
import { showStatus, showToast } from './ui/status.js';
import { loadHistory, addToHistory, clearHistory, renderHistory } from './ui/history.js';
import { initiateRedirect, cancelRedirect } from './ui/redirect.js';
import { initSettings } from './ui/settings.js';
import { setZoomLevel, zoomIn, zoomOut, getZoomInfo, handlePinchStart, handlePinchMove, handlePinchEnd } from './zoom-controller.js';

const ICONS = {
  camera: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>`
};

// === Initialization === //
document.addEventListener('DOMContentLoaded', () => {
  detectPwaStandalone();
  loadHistory();
  applyTranslations();
  setupEventListeners();
  registerServiceWorker();
  initSettings();
  checkAutoScan();

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden && isScannerActive()) {
      await stopScanning();
      resetScannerUI();
    }
  });

  window.addEventListener('zoom-ready', (e) => {
    configureZoomUI(e.detail);
  });
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
  $('#btn-zoom-in')?.addEventListener('click', handleZoomIn);
  $('#btn-zoom-out')?.addEventListener('click', handleZoomOut);
  $('#zoom-slider')?.addEventListener('input', handleZoomSlider);

  const scannerContainer = $('.scanner-container');
  if (scannerContainer) {
    scannerContainer.addEventListener('touchstart', handlePinchStart, { passive: true });
    scannerContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        handlePinchMove(e);
        const info = getZoomInfo();
        const slider = $('#zoom-slider');
        if (slider) slider.value = info.current;
        updateZoomDisplay(info.current);
      }
    }, { passive: false });
    scannerContainer.addEventListener('touchend', handlePinchEnd, { passive: true });
  }
}

// === Zoom UI Helpers === //
function configureZoomUI(zoomInfo) {
  const slider = $('#zoom-slider');
  const zoomControls = $('#zoom-controls');
  if (!slider || !zoomControls) return;

  slider.min = zoomInfo.min;
  slider.max = zoomInfo.max;
  slider.step = zoomInfo.step;
  slider.value = zoomInfo.current;

  updateZoomDisplay(zoomInfo.current);

  zoomControls.classList.remove('hidden');
}

async function handleZoomIn() {
  const level = await zoomIn();
  updateZoomDisplay(level);
  const slider = $('#zoom-slider');
  if (slider) slider.value = level;
}

async function handleZoomOut() {
  const level = await zoomOut();
  updateZoomDisplay(level);
  const slider = $('#zoom-slider');
  if (slider) slider.value = level;
}

async function handleZoomSlider(e) {
  const level = parseFloat(e.target.value);
  await setZoomLevel(level);
  updateZoomDisplay(level);
}

function updateZoomDisplay(level) {
  const display = $('#zoom-level');
  if (!display) return;

  if (level !== undefined) {
    display.textContent = `${level.toFixed(1)}x`;
  } else {
    const slider = $('#zoom-slider');
    if (slider) display.textContent = `${parseFloat(slider.value).toFixed(1)}x`;
  }
}

function hideZoomControls() {
  const zoomControls = $('#zoom-controls');
  const slider = $('#zoom-slider');
  if (zoomControls) zoomControls.classList.add('hidden');
  if (slider) slider.value = 1;
  updateZoomDisplay(1.0);
}

// === Scanner Toggle === //
async function toggleScanner() {
  const btn = $('#btn-scan');
  const scanLine = $('.scan-line');
  const placeholder = $('.scanner-placeholder');

  if (isScannerActive()) {
    await stopScanning();
    btn.innerHTML = `<span class="btn__icon">${ICONS.camera}</span> ${t('startScan')}`;
    btn.classList.remove('btn--danger');
    btn.classList.add('btn--primary');
    scanLine?.classList.remove('active');
    placeholder?.classList.remove('hidden');
    $('#btn-camera-switch')?.classList.add('hidden');
    hideZoomControls();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>`;

  try {
    await startScanning(handleScanResult);

    btn.innerHTML = `<span class="btn__icon">${ICONS.stop}</span> ${t('stopScan')}`;
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
    btn.innerHTML = `<span class="btn__icon">${ICONS.camera}</span> ${t('startScan')}`;
  }

  btn.disabled = false;
}

// === Handle Scan Result === //
async function handleScanResult(decodedText) {
  const result = validateUrl(decodedText);

  if (result.valid) {
    await stopScanning();
    resetScannerUI();

    showStatus('success', t('validUrl'), result.url);
    addToHistory(result.url);
    initiateRedirect(result.url);
  } else {
    showStatus('error', t('invalidUrl'), decodedText);
  }
}

// === Reset Scanner UI to idle state === //
function resetScannerUI() {
  const btn = $('#btn-scan');
  const scanLine = $('.scan-line');
  const placeholder = $('.scanner-placeholder');

  if (btn) {
    btn.innerHTML = `<span class="btn__icon">${ICONS.camera}</span> ${t('startScan')}`;
    btn.classList.remove('btn--danger');
    btn.classList.add('btn--primary');
  }
  scanLine?.classList.remove('active');
  placeholder?.classList.remove('hidden');
  $('#btn-camera-switch')?.classList.add('hidden');
  hideZoomControls();
}

// === Camera Switch === //
async function handleCameraSwitch() {
  try {
    hideZoomControls();
    await switchCamera();
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
    if (btn) btn.innerHTML = `<span class="btn__icon">${ICONS.camera}</span> ${t('startScan')}`;
  }

  document.documentElement.lang = lang;
}
