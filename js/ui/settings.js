import { $, $$ } from '../utils/dom.js';

const defaultSettings = {
  vibration: false,
  autoRedirect: false
};

const settings = { ...defaultSettings };

export function getSetting(key) {
  return settings[key];
}

export function setSetting(key, val) {
  settings[key] = val;
  try {
    localStorage.setItem('yulearn-qr-settings', JSON.stringify(settings));
  } catch (err) {
    console.warn('[Settings] Save failed', err);
  }
}

function loadSettings() {
  try {
    const stored = localStorage.getItem('yulearn-qr-settings');
    if (stored) {
      Object.assign(settings, JSON.parse(stored));
    }
  } catch (err) {
    console.warn('[Settings] Load failed', err);
  }
}

export function initSettings() {
  loadSettings();
  
  const btnSettings = $('#btn-settings');
  const overlay = $('#settings-overlay');
  const btnClose = $('#btn-settings-close');
  
  if (btnSettings && overlay && btnClose) {
    btnSettings.addEventListener('click', () => {
      overlay.classList.add('visible');
    });
    
    btnClose.addEventListener('click', () => {
      overlay.classList.remove('visible');
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('visible');
    });
  }

  $$('.setting-toggle').forEach(toggle => {
    const key = toggle.getAttribute('data-setting');
    if (key && settings[key] !== undefined) {
      toggle.checked = settings[key];
      toggle.addEventListener('change', (e) => {
        setSetting(key, e.target.checked);
      });
    }
  });
}
