let videoTrack = null;
let videoElement = null;
let zoomMode = "none";
let currentZoom = 1.0;
let minZoom = 1.0;
let maxZoom = 4.0;
let zoomStep = 0.1;
let initialPinchDistance = 0;
let pinchStartZoom = 1.0;

export function initZoom(video) {
  videoElement = video;
  currentZoom = 1.0;

  const stream = video.srcObject;
  if (!stream) {
    zoomMode = "software";
    return getZoomInfo();
  }

  const tracks = stream.getVideoTracks();
  if (!tracks || tracks.length === 0) {
    zoomMode = "software";
    return getZoomInfo();
  }

  videoTrack = tracks[0];

  try {
    const capabilities = videoTrack.getCapabilities?.();
    if (capabilities?.zoom) {
      zoomMode = "hardware";
      minZoom = capabilities.zoom.min || 1.0;
      maxZoom = capabilities.zoom.max || 10.0;
      zoomStep = capabilities.zoom.step || 0.1;

      if (maxZoom > 8.0) maxZoom = 8.0;

      console.log(
        `[Zoom] Hardware zoom detected: ${minZoom}x - ${maxZoom}x (step: ${zoomStep})`,
      );
    } else {
      zoomMode = "software";
      console.log("[Zoom] No hardware zoom — using software (CSS) zoom");
    }
  } catch {
    zoomMode = "software";
    console.log("[Zoom] getCapabilities() not supported — using software zoom");
  }

  if (zoomMode === "software") {
    minZoom = 1.0;
    maxZoom = 4.0;
    zoomStep = 0.1;
  }

  return getZoomInfo();
}

export function getZoomInfo() {
  return {
    mode: zoomMode,
    min: minZoom,
    max: maxZoom,
    step: zoomStep,
    current: currentZoom,
  };
}

export async function setZoomLevel(level) {
  level = Math.max(minZoom, Math.min(maxZoom, level));
  level = Math.round(level / zoomStep) * zoomStep;
  level = Math.max(minZoom, Math.min(maxZoom, level));

  if (zoomMode === "hardware" && videoTrack) {
    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: level }],
      });
      currentZoom = level;
      console.log(`[Zoom] Hardware zoom applied: ${level.toFixed(1)}x`);
    } catch (err) {
      console.warn(
        "[Zoom] Hardware zoom failed, falling back to software:",
        err,
      );
      zoomMode = "software";
      applySoftwareZoom(level);
    }
  } else if (zoomMode === "software" && videoElement) {
    applySoftwareZoom(level);
  }

  return currentZoom;
}

function applySoftwareZoom(level) {
  if (!videoElement) return;

  currentZoom = level;
  videoElement.style.transformOrigin = "center center";

  if (level > 1.01) {
    videoElement.style.transform = `scale(${level})`;
    videoElement.style.backfaceVisibility = "hidden";
  } else {
    videoElement.style.transform = "";
    videoElement.style.backfaceVisibility = "";
  }

  console.log(`[Zoom] Software zoom applied: ${level.toFixed(1)}x`);
}

export async function zoomIn() {
  return setZoomLevel(currentZoom + zoomStep * 5);
}

export async function zoomOut() {
  return setZoomLevel(currentZoom - zoomStep * 5);
}

export function handlePinchStart(e) {
  if (e.touches.length === 2) {
    initialPinchDistance = getPinchDistance(e.touches);
    pinchStartZoom = currentZoom;
  }
}

export function handlePinchMove(e) {
  if (e.touches.length !== 2 || initialPinchDistance === 0) return;

  e.preventDefault();
  const currentDistance = getPinchDistance(e.touches);
  const scale = currentDistance / initialPinchDistance;
  const newZoom = pinchStartZoom * scale;

  setZoomLevel(newZoom);
}

export function handlePinchEnd() {
  initialPinchDistance = 0;
}

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export async function resetZoom() {
  return setZoomLevel(1.0);
}

export function destroyZoom() {
  if (videoElement && zoomMode === "software") {
    videoElement.style.transform = "";
    videoElement.style.transformOrigin = "";
  }

  videoTrack = null;
  videoElement = null;
  zoomMode = "none";
  currentZoom = 1.0;
  minZoom = 1.0;
  maxZoom = 4.0;
  zoomStep = 0.1;
  initialPinchDistance = 0;
  pinchStartZoom = 1.0;
}
