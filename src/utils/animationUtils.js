import {
  FRAME_HEIGHT_BY_MOON_INDEX,
  MOON_TEXTS,
  TEXT_FRAME_MATCH_WINDOW,
  TEXT_OVERLAY_DELAY_FRAMES,
} from '../config/animationConfig';

/**
 * Extracts frame number from:
 * - "11.png" / "2.jpg"
 */
export function getVideoFrameNumber(pathOrUrl) {
  const normalizedValue = decodeURIComponent(String(pathOrUrl))
    .replace(/\+/g, ' ')
    .replace(/\\/g, '');

  const numericFileMatch = normalizedValue.match(/(?:^|\/)(\d+)\.(?:png|jpe?g|webp)(?:[?#].*)?$/i);
  return numericFileMatch ? Number(numericFileMatch[1]) : null;

}

/**
 * Builds a frame lookup map: frame number -> asset URL.
 */
export function buildLocalFrameMap(moduleObject) {
  return Object.entries(moduleObject).reduce((map, [path, url]) => {
    const frame = getVideoFrameNumber(path) ?? getVideoFrameNumber(url);
    if (frame && !map.has(frame)) {
      map.set(frame, url);
    }
    return map;
  }, new Map());
}

/**
 * Creates a dense frame URL list using frame numbers from 1..frameCount.
 */
export function buildLocalFrameSequence(localFrameMap, frameCount) {
  return Array.from({ length: frameCount }, (_, index) => {
    const frameNumber = index + 1;
    return localFrameMap.get(frameNumber);
  }).filter(Boolean);
}

/**
 * Creates mapped layout descriptors for header spacer elements.
 */
export function buildHeaderPlayAreas(headerUrls) {
  return headerUrls.map((imageSrc, index) => ({
    imageSrc,
    height: '80px',
    index: index + 1,
  }));
}

/**
 * Creates mapped layout descriptors for moon spacer elements.
 */
export function buildMoonPlayAreas(moonUrls) {
  return moonUrls.map((imageSrc, index) => {
    const frameNumber = index + 1;
    return {
      imageSrc,
      id: `moon_animation_id_${frameNumber}`,
      height: FRAME_HEIGHT_BY_MOON_INDEX.get(frameNumber) || '150px',
    };
  });
}

/**
 * Constrains a numeric value to the [min, max] range.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts scroll position to normalized 0..1 progress.
 */
export function getScrollProgress(currentScroll, start, length) {
  if (length <= 0) return 0;
  return clamp((currentScroll - start) / length, 0, 1);
}

/**
 * Converts normalized progress to a valid integer frame index.
 */
export function getFrameIndex(progress, totalFrames) {
  return Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
}

/**
 * Preloads image URLs and resolves when every URL has loaded or errored.
 */
export function loadImagesFromUrls(urls, onProgress) {
  return new Promise(resolve => {
    if (!urls.length) {
      resolve([]);
      return;
    }

    const images = [];
    let loadedCount = 0;

    urls.forEach(url => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = img.onerror = () => {
        loadedCount += 1;
        onProgress?.();
        if (loadedCount === urls.length) resolve(images);
      };
      images.push(img);
    });
  });
}

/**
 * Draws an image to fully cover the canvas while preserving aspect ratio.
 */
export function drawCover(canvas, img, imageRenderScale = 1) {
  if (!canvas || !img?.naturalWidth) return;
  const ctx = canvas.getContext('2d');
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.min(cw / iw, ch / ih) * imageRenderScale;
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

/**
 * Returns index of the moon text card closest to the current frame.
 */
export function getActiveTextIndex(currentMoonFrame) {
  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < MOON_TEXTS.length; i++) {
    // Allow per-message timing override; fallback keeps existing global behavior.
    const frameDelay = MOON_TEXTS[i].delayFrames ?? TEXT_OVERLAY_DELAY_FRAMES;
    const delayedFrame = MOON_TEXTS[i].frame + frameDelay;
    const distance = Math.abs(currentMoonFrame - delayedFrame);
    if (distance <= TEXT_FRAME_MATCH_WINDOW && distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/**
 * Checks whether a frame falls inside a delayed frame range.
 */
export function isInDelayedRange(currentFrame, range, delayFrames) {
  return (
    currentFrame >= range[0] + delayFrames &&
    currentFrame <= range[1] + delayFrames
  );
}
