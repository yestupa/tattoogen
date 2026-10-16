import {
  fitTattooImage,
  loadTattooCanvas,
  validateTattooFile,
} from '@/lib/tattoo-canvas';

// Leave headroom below the storage endpoint's default 2 MiB per-image limit.
export const taskUploadMaxBytes = Math.floor(1.8 * 1024 * 1024);

/** Called only by an explicit AI action. Keeps the selected original unchanged. */
export async function prepareTattooUploadImage(
  file: File,
  decoded?: HTMLCanvasElement
): Promise<File> {
  validateTattooFile(file);
  if (file.size <= taskUploadMaxBytes) return file;
  const source = decoded ?? (await loadTattooCanvas(file));
  const initialSize = fitTattooImage(
    source.width,
    source.height,
    1600,
    2560000
  );
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('canvas-export');
  let attempts = 0;
  const encode = (type: string, quality?: number) => {
    if (++attempts > 18) throw new Error('canvas-export');
    return new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality)
    );
  };
  for (let resize = 0; resize < 6; resize++) {
    canvas.width = Math.max(1, Math.floor(initialSize.width * 0.72 ** resize));
    canvas.height = Math.max(
      1,
      Math.floor(initialSize.height * 0.72 ** resize)
    );
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.7, 0.5]) {
      let blob = await encode('image/webp', quality);
      if (
        !blob ||
        blob.size === 0 ||
        !['image/webp', 'image/png'].includes(blob.type)
      )
        blob = await encode('image/png');
      if (
        blob &&
        blob.size > 0 &&
        blob.size <= taskUploadMaxBytes &&
        ['image/webp', 'image/png'].includes(blob.type)
      ) {
        const extension = blob.type === 'image/webp' ? 'webp' : 'png';
        const stem =
          file.name.replace(/\.[^/.]+$/, '').slice(0, 200) ||
          'tattoo-reference';
        return new File([blob], `${stem}-upload.${extension}`, {
          type: blob.type,
          lastModified: file.lastModified,
        });
      }
      // A browser without WebP encoding falls back to lossless PNG. Quality
      // cannot reduce PNG size, so continue with a smaller transparent canvas.
      if (blob?.type !== 'image/webp') break;
    }
  }
  throw new Error('canvas-export');
}
