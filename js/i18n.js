const translations = {
  tr: {
    appTitle: 'Yulearn QR',
    scannerPlaceholder: 'Taramayı başlatmak için\naşağıdaki butona dokunun',
    startScan: 'Taramayı Başlat',
    stopScan: 'Taramayı Durdur',
    scanning: 'Taranıyor...',
    switchCamera: 'Kamera Değiştir',
    validUrl: 'Geçerli Yulearn bağlantısı bulundu',
    invalidUrl: 'Geçersiz bağlantı! Sadece Yulearn URL\'leri kabul edilir.',
    redirecting: 'Yönlendiriliyor...',
    redirectCancel: 'İptal',
    historyTitle: 'Son Taramalar',
    historyClear: 'Temizle',
    historyEmpty: 'Henüz tarama yapılmadı',
    cameraError: 'Kamera erişilemedi',
    cameraPermissionDenied: 'Kamera izni reddedildi. Tarama yapabilmek için kamera erişimine izin vermeniz gerekiyor.',
    cameraNotFound: 'Kamera bulunamadı. Lütfen kamerası olan bir cihaz kullanın.',
    cameraInUse: 'Kamera başka bir uygulama tarafından kullanılıyor.',
    insecureContext: 'Kamera erişimi için HTTPS gereklidir. Lütfen uygulamayı HTTPS üzerinden açın.',
    noCameraApi: 'Bu tarayıcı kamera erişimini desteklemiyor.',
    networkError: 'Ağ bağlantısı yok',
    goToUrl: 'Git',
    footer: 'Yeditepe Üniversitesi öğrencileri için geliştirildi',
    createdBy: 'Yapımcı:',
    donateBtn: 'Bağış Yap',
    justNow: 'Az önce',
    minutesAgo: '{n} dk önce',
    hoursAgo: '{n} sa önce',
    daysAgo: '{n} gün önce',
  },
  en: {
    appTitle: 'Yulearn QR',
    scannerPlaceholder: 'Tap the button below\nto start scanning',
    startScan: 'Start Scanning',
    stopScan: 'Stop Scanning',
    scanning: 'Scanning...',
    switchCamera: 'Switch Camera',
    validUrl: 'Valid Yulearn link found',
    invalidUrl: 'Invalid link! Only Yulearn URLs are accepted.',
    redirecting: 'Redirecting...',
    redirectCancel: 'Cancel',
    historyTitle: 'Recent Scans',
    historyClear: 'Clear',
    historyEmpty: 'No scans yet',
    cameraError: 'Camera not accessible',
    cameraPermissionDenied: 'Camera permission denied. Please allow camera access to scan QR codes.',
    cameraNotFound: 'No camera found. Please use a device with a camera.',
    cameraInUse: 'Camera is in use by another application.',
    insecureContext: 'HTTPS is required for camera access. Please open the app over HTTPS.',
    noCameraApi: 'This browser does not support camera access.',
    networkError: 'No network connection',
    goToUrl: 'Go',
    footer: 'Developed for Yeditepe University students',
    createdBy: 'Created by',
    donateBtn: 'Donate',
    justNow: 'Just now',
    minutesAgo: '{n}m ago',
    hoursAgo: '{n}h ago',
    daysAgo: '{n}d ago',
  }
};

export function getCurrentLang() {
  const stored = localStorage.getItem('yulearn-qr-lang');
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language?.substring(0, 2);
  return browserLang === 'tr' ? 'tr' : 'en';
}

export function setLang(lang) {
  if (translations[lang]) {
    localStorage.setItem('yulearn-qr-lang', lang);
  }
}

export function t(key, params = {}) {
  const lang = getCurrentLang();
  let text = translations[lang]?.[key] || translations['tr']?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }

  return text;
}

export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { n: minutes });
  if (hours < 24) return t('hoursAgo', { n: hours });
  return t('daysAgo', { n: days });
}
