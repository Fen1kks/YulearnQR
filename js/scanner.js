import QrScanner from './vendor/qr-scanner.min.js';
import { getSetting } from './ui/settings.js';
import { initZoom, destroyZoom, resetZoom, getZoomInfo } from './zoom-controller.js';

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
      if (decodedText === lastScannedCode && now - lastScanTime < 2000) return;
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
      maxScansPerSecond: 35,
      highlightScanRegion: false,
      highlightCodeOutline: false,
      calculateScanRegion: (video) => {
        const zoom = getZoomInfo().current;
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const ratio = zoom > 1.5 ? 0.4 : zoom > 1.0 ? 0.6 : 0.8;
        const scanSize = Math.round(minDim * ratio);
        return {
          x: Math.round((video.videoWidth - scanSize) / 2),
          y: Math.round((video.videoHeight - scanSize) / 2),
          width: scanSize,
          height: scanSize,
        };
      },
    }
  );

  qrScanner.setInversionMode('original');

  try {
    await qrScanner.start();
    isScanning = true;

    setTimeout(() => {
      try {
        const stream = videoElem.srcObject;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          if (track) {
            const caps = track.getCapabilities?.() || {};
            const advancedConstraints = [];
            if (caps.focusMode?.includes('continuous')) {
              advancedConstraints.push({ focusMode: 'continuous' });
            }
            if (advancedConstraints.length > 0) {
              track.applyConstraints({ advanced: advancedConstraints })
                .catch(() => {});
            }
          }
        }
      } catch {
      }

      const zoomInfo = initZoom(videoElem);
      window.dispatchEvent(new CustomEvent('zoom-ready', { detail: zoomInfo }));
    }, 300);
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

  destroyZoom();

  try {
    qrScanner.stop();
  } catch {
  }
  isScanning = false;
}

export async function switchCamera() {
  if (!qrScanner) return;

  await resetZoom();
  destroyZoom();

  usingFrontCamera = !usingFrontCamera;
  const camera = usingFrontCamera ? 'user' : 'environment';

  try {
    await qrScanner.setCamera(camera);

    const videoElem = document.getElementById('qr-video');
    if (videoElem) {
      setTimeout(() => {
        const zoomInfo = initZoom(videoElem);
        window.dispatchEvent(new CustomEvent('zoom-ready', { detail: zoomInfo }));
      }, 500);
    }
  } catch {
  }
}

export function isScannerActive() {
  return isScanning;
}
