let html5QrScanner = null;
let isScanning = false;
let usingFrontCamera = false;

export function initScanner(config) {
  const { elementId } = config;

  if (html5QrScanner) return;

  html5QrScanner = new Html5Qrcode(elementId, {
    verbose: false,
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
  });
}

export async function startScanning(onSuccess, preferFront = false) {
  if (!html5QrScanner) throw new Error('Scanner not initialized');
  if (isScanning) return;

  if (!window.isSecureContext) {
    throw new Error('INSECURE_CONTEXT');
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('NO_CAMERA_API');
  }

  usingFrontCamera = preferFront;

  const scanConfig = {
    fps: 25,
    aspectRatio: 1.0,
    disableFlip: true,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  };

  let lastScannedCode = '';
  let lastScanTime = 0;

  const facingMode = preferFront ? 'user' : 'environment';

  try {
    await html5QrScanner.start(
      { facingMode },
      scanConfig,
      (decodedText) => {
        const now = Date.now();
        if (decodedText === lastScannedCode && now - lastScanTime < 5000) return;
        lastScannedCode = decodedText;
        lastScanTime = now;
        onSuccess(decodedText);
      },
      () => {
      }
    );
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
  if (!html5QrScanner || !isScanning) return;

  try {
    await html5QrScanner.stop();
  } catch {
  }
  isScanning = false;
}

export async function switchCamera(onSuccess) {
  const wasScanning = isScanning;
  if (wasScanning) await stopScanning();

  usingFrontCamera = !usingFrontCamera;

  if (wasScanning) await startScanning(onSuccess, usingFrontCamera);
}

export function isScannerActive() {
  return isScanning;
}
