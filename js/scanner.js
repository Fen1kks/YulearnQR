import QrScanner from './vendor/qr-scanner.min.js';
import { getSetting } from './ui/settings.js';

let qrScanner = null;
let isScanning = false;
let usingFrontCamera = false;

QrScanner.WORKER_PATH = './js/vendor/qr-scanner-worker.min.js';



export async function startScanning(onSuccess, preferFront = false) {
  if (isScanning) return;

  if (!window.isSecureContext) {
    throw new Error('INSECURE_CONTEXT');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('NO_CAMERA_API');
  }

  usingFrontCamera = preferFront;

  const videoElem = document.getElementById('qr-video');
  if (!videoElem) {
    throw new Error('CAMERA_ERROR: Video element not found');
  }

  let lastScannedCode = '';
  let lastScanTime = 0;

  if (qrScanner) {
    qrScanner.destroy();
    qrScanner = null;
  }

  qrScanner = new QrScanner(
    videoElem,
    (result) => {
      const decodedText = result.data;
      const now = Date.now();
      if (decodedText === lastScannedCode && now - lastScanTime < 5000) return;
      lastScannedCode = decodedText;
      lastScanTime = now;
      if (getSetting('vibration') && navigator.vibrate) {
        navigator.vibrate(200);
      }
      onSuccess(decodedText);
    },
    {
      returnDetailedScanResult: true,
      preferredCamera: preferFront ? 'user' : 'environment',
      maxScansPerSecond: 10,
      highlightScanRegion: false,
      highlightCodeOutline: false,
    }
  );

  try {
    await qrScanner.start();
    isScanning = true;
  } catch (err) {
    console.error('[Scanner] Start failed:', err);

    const msg = (err?.message || err || '').toString().toLowerCase();

    if (msg.includes('permission') || msg.includes('notallowed') || msg.includes('not allowed')) {
      throw new Error('CAMERA_PERMISSION_DENIED');
    } else if (msg.includes('notfound') || msg.includes('not found') || msg.includes('requested device not found')) {
      throw new Error('NO_CAMERA');
    } else if (msg.includes('notreadable') || msg.includes('not readable') || msg.includes('could not start')) {
      throw new Error('CAMERA_IN_USE');
    } else {
      throw new Error('CAMERA_ERROR: ' + (err?.message || err));
    }
  }
}

export async function stopScanning() {
  if (!qrScanner || !isScanning) return;

  try {
    qrScanner.stop();
  } catch {
  }
  isScanning = false;
}

export async function switchCamera() {
  if (!qrScanner) return;

  usingFrontCamera = !usingFrontCamera;
  const camera = usingFrontCamera ? 'user' : 'environment';

  try {
    await qrScanner.setCamera(camera);
  } catch {
  }
}

export function isScannerActive() {
  return isScanning;
}
