import { afterEach, describe, expect, it, vi } from 'vitest';

import * as canvasHelpers from './tattoo-canvas';
import {
  prepareTattooUploadImage,
  taskUploadMaxBytes,
} from './tattoo-task-images';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const original = () =>
  new File([new Uint8Array(4 * 1024 * 1024)], 'original.photo.png', {
    type: 'image/png',
  });
const decoded = () => ({ width: 3000, height: 2000 }) as HTMLCanvasElement;

function encoder(
  size: (width: number, height: number, quality: number) => number,
  actualType = 'image/webp'
) {
  const attempts: {
    width: number;
    height: number;
    requested: string;
    quality: number;
  }[] = [];
  const drawImage = vi.fn();
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toBlob(callback: BlobCallback, requested: string, quality = 1) {
      attempts.push({
        width: canvas.width,
        height: canvas.height,
        requested,
        quality,
      });
      callback(
        new Blob([new Uint8Array(size(canvas.width, canvas.height, quality))], {
          type: actualType,
        })
      );
    },
  };
  vi.stubGlobal('document', { createElement: () => canvas });
  return { attempts, drawImage };
}

describe('bounded private tattoo upload preparation', () => {
  it('keeps a small original file unchanged without encoding or uploading', async () => {
    const file = new File(['small'], 'original.png', { type: 'image/png' });
    const createElement = vi.fn();
    vi.stubGlobal('document', { createElement });
    expect(await prepareTattooUploadImage(file, decoded())).toBe(file);
    expect(createElement).not.toHaveBeenCalled();
    expect(taskUploadMaxBytes).toBeLessThan(2048 * 1024);
  });

  it('optimizes a large source to the upload cap without mutating the original', async () => {
    const file = original();
    const { attempts } = encoder((_width, _height, quality) =>
      Math.floor(2500000 * quality)
    );
    const output = await prepareTattooUploadImage(file, decoded());
    expect(output.size).toBeLessThanOrEqual(taskUploadMaxBytes);
    expect(output.type).toBe('image/webp');
    expect(output.name).toMatch(/\.webp$/);
    expect(file.name).toBe('original.photo.png');
    expect(file.size).toBe(4 * 1024 * 1024);
    expect(attempts.length).toBeGreaterThan(1);
    expect(
      attempts.every(
        (attempt) => attempt.width <= 1600 && attempt.height <= 1600
      )
    ).toBe(true);
  });

  it('uses the actual PNG MIME and extension when WebP is unsupported, resizing to fit', async () => {
    const { attempts } = encoder(
      (width, height) => width * height * 3,
      'image/png'
    );
    const output = await prepareTattooUploadImage(original(), decoded());
    expect(output.size).toBeLessThanOrEqual(taskUploadMaxBytes);
    expect(output.type).toBe('image/png');
    expect(output.name).toMatch(/\.png$/);
    expect(attempts.length).toBeGreaterThan(1);
    expect(
      attempts.every(
        (attempt) => attempt.width <= 1600 && attempt.height <= 1600
      )
    ).toBe(true);
    expect(attempts.some((attempt) => attempt.width < 1600)).toBe(true);
  });

  it('decodes and bounds a large drawn guide when no decoded canvas is supplied', async () => {
    const file = original();
    const load = vi
      .spyOn(canvasHelpers, 'loadTattooCanvas')
      .mockResolvedValue(decoded());
    encoder(() => 100000);
    const output = await prepareTattooUploadImage(file);
    expect(load).toHaveBeenCalledWith(file);
    expect(output.size).toBeLessThanOrEqual(taskUploadMaxBytes);
  });

  it('fails after a finite number of encoding attempts instead of returning an oversized file', async () => {
    const { attempts } = encoder(() => taskUploadMaxBytes + 1);
    await expect(
      prepareTattooUploadImage(original(), decoded())
    ).rejects.toThrow('canvas-export');
    expect(attempts.length).toBeLessThanOrEqual(18);
  });

  it('rejects invalid decoded dimensions before allocating a canvas', async () => {
    const { attempts } = encoder(() => 100);
    await expect(
      prepareTattooUploadImage(original(), {
        width: 0,
        height: 100,
      } as HTMLCanvasElement)
    ).rejects.toThrow('image-dimensions');
    expect(attempts).toHaveLength(0);
  });
});
