export type TattooTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};
export type StencilOptions = {
  mode: 'threshold' | 'edges';
  threshold: number;
  invert: boolean;
};
export const initialTattooTransform: TattooTransform = {
  x: 50,
  y: 50,
  scale: 0.5,
  rotation: 0,
  opacity: 0.85,
};

const clamp = (value: number, low: number, high: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(high, Math.max(low, value)) : fallback;

export function validateTattooFile(file: { type: string; size: number }) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('file-type');
  if (
    !Number.isFinite(file.size) ||
    file.size <= 0 ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error('file-size');
}

export function fitTattooImage(
  width: number,
  height: number,
  maxEdge = 1600,
  maxPixels = 2560000
) {
  if (
    ![width, height, maxEdge, maxPixels].every(
      (v) => Number.isFinite(v) && v >= 1
    )
  )
    throw new Error('image-dimensions');
  const ratio = Math.min(
    1,
    maxEdge / Math.max(width, height),
    Math.sqrt(maxPixels / (width * height))
  );
  return {
    width: Math.max(1, Math.floor(width * ratio)),
    height: Math.max(1, Math.floor(height * ratio)),
  };
}

export function normalizeTattooTransform(
  value: TattooTransform
): TattooTransform {
  return {
    x: clamp(value.x, 0, 100, 50),
    y: clamp(value.y, 0, 100, 50),
    scale: clamp(value.scale, 0.05, 2, 0.5),
    rotation: clamp(value.rotation, -180, 180, 0),
    opacity: clamp(value.opacity, 0, 1, 0.85),
  };
}

const luminance = (data: Uint8ClampedArray, i: number) => {
  const alpha = data[i + 3] / 255;
  return (
    (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) * alpha +
    255 * (1 - alpha)
  );
};

export function stencilPixels(
  width: number,
  height: number,
  data: Uint8ClampedArray,
  options: StencilOptions
) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > 2560000 ||
    data.length !== width * height * 4
  )
    throw new Error('image-dimensions');
  const light = new Float32Array(width * height);
  for (let i = 0; i < light.length; i++) light[i] = luminance(data, i * 4);
  const result = new Uint8ClampedArray(data.length);
  const threshold = clamp(options.threshold, 1, 254, 128);
  const pixel = (x: number, y: number) =>
    light[
      Math.min(height - 1, Math.max(0, y)) * width +
        Math.min(width - 1, Math.max(0, x))
    ];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let ink: boolean;
      if (options.mode === 'edges') {
        const gx =
          -pixel(x - 1, y - 1) +
          pixel(x + 1, y - 1) -
          2 * pixel(x - 1, y) +
          2 * pixel(x + 1, y) -
          pixel(x - 1, y + 1) +
          pixel(x + 1, y + 1);
        const gy =
          -pixel(x - 1, y - 1) -
          2 * pixel(x, y - 1) -
          pixel(x + 1, y - 1) +
          pixel(x - 1, y + 1) +
          2 * pixel(x, y + 1) +
          pixel(x + 1, y + 1);
        ink = Math.hypot(gx, gy) / 4 > threshold;
      } else ink = light[y * width + x] < threshold;
      const color = ink !== options.invert ? 0 : 255;
      const i = (y * width + x) * 4;
      result[i] = result[i + 1] = result[i + 2] = color;
      result[i + 3] = 255;
    }
  return result;
}

export function removeTattooPaper(data: Uint8ClampedArray, threshold: number) {
  if (data.length % 4) throw new Error('image-dimensions');
  const result = data.slice();
  const start = clamp(threshold, 160, 250, 220);
  for (let i = 0; i < result.length; i += 4) {
    const light =
      data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    result[i + 3] = Math.round(
      data[i + 3] * Math.min(1, Math.max(0, (start - light) / 32))
    );
  }
  return result;
}

/** Only called after a user selects a local file or a curated, same-origin asset. */
export async function loadTattooCanvas(
  source: File | string,
  signal?: AbortSignal
): Promise<HTMLCanvasElement> {
  signal?.throwIfAborted();
  if (typeof source !== 'string') validateTattooFile(source);
  else if (
    !/^\/imgs\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)$/.test(source) ||
    source.includes('..')
  )
    throw new Error('file-type');
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const image = new Image();
  let abort = () => {};
  try {
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      abort = () => {
        image.onload = null;
        image.onerror = null;
        image.src = '';
        reject(new DOMException('Image loading cancelled', 'AbortError'));
      };
      signal?.addEventListener('abort', abort, { once: true });
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('image-decode'));
      image.src = url;
    });
    signal?.throwIfAborted();
    if (image.naturalWidth * image.naturalHeight > 40000000)
      throw new Error('image-dimensions');
    const size = fitTattooImage(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    Object.assign(canvas, size);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('canvas-unavailable');
    ctx.drawImage(image, 0, 0, size.width, size.height);
    return canvas;
  } finally {
    signal?.removeEventListener('abort', abort);
    image.onload = null;
    image.onerror = null;
    image.src = '';
    if (typeof source !== 'string') URL.revokeObjectURL(url);
  }
}

export async function downloadTattooCanvas(
  canvas: HTMLCanvasElement,
  filename: string
) {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('canvas-export'))),
      'image/png'
    )
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
