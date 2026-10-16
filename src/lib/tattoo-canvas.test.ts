import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  fitTattooImage,
  loadTattooCanvas,
  normalizeTattooTransform,
  removeTattooPaper,
  stencilPixels,
  validateTattooFile,
} from './tattoo-canvas';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('cancels decoding and immediately releases a replaced local image', async () => {
  const instances: { src: string; onload: unknown; onerror: unknown }[] = [];
  class TestImage {
    src = '';
    onload = null;
    onerror = null;
    constructor() {
      instances.push(this);
    }
  }
  vi.stubGlobal('Image', TestImage);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-image');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  const controller = new AbortController();
  const pending = loadTattooCanvas(
    new File(['test'], 'test.png', { type: 'image/png' }),
    controller.signal
  );
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(instances[0]).toMatchObject({ src: '', onload: null, onerror: null });
  expect(revoke).toHaveBeenCalledWith('blob:test-image');
});

it('never starts an already cancelled decode', async () => {
  const image = vi.fn();
  vi.stubGlobal('Image', image);
  const controller = new AbortController();
  controller.abort();
  await expect(
    loadTattooCanvas(
      new File(['test'], 'test.png', { type: 'image/png' }),
      controller.signal
    )
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(image).not.toHaveBeenCalled();
});

describe('local tattoo image limits', () => {
  it('limits edge length and total pixels without enlarging small images', () => {
    expect(fitTattooImage(4000, 2000)).toEqual({ width: 1600, height: 800 });
    expect(fitTattooImage(200, 100)).toEqual({ width: 200, height: 100 });
    expect(fitTattooImage(2000, 2000, 1600, 1000000)).toEqual({
      width: 1000,
      height: 1000,
    });
  });
  it('rejects invalid dimensions and files before decoding', () => {
    for (const width of [0, -1, NaN, Infinity])
      expect(() => fitTattooImage(width, 100)).toThrow();
    expect(() =>
      validateTattooFile({ type: 'image/svg+xml', size: 10 })
    ).toThrow('file-type');
    expect(() =>
      validateTattooFile({ type: 'image/png', size: 11 * 1024 * 1024 })
    ).toThrow('file-size');
    expect(() => validateTattooFile({ type: 'image/png', size: 0 })).toThrow(
      'file-size'
    );
    expect(() =>
      validateTattooFile({ type: 'image/webp', size: 100 })
    ).not.toThrow();
  });
});

describe('stencil conversion', () => {
  it('composites transparency over white and emits opaque black or white', () => {
    const input = new Uint8ClampedArray([
      0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255,
    ]);
    expect(
      Array.from(
        stencilPixels(3, 1, input, {
          mode: 'threshold',
          threshold: 128,
          invert: false,
        })
      )
    ).toEqual([255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
  });
  it('uses luminance, supports inversion, and leaves the source untouched', () => {
    const input = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const before = input.slice();
    const output = stencilPixels(2, 1, input, {
      mode: 'threshold',
      threshold: 128,
      invert: true,
    });
    expect(Array.from(output)).toEqual([255, 255, 255, 255, 0, 0, 0, 255]);
    expect(input).toEqual(before);
  });
  it('detects boundaries without inventing an image-border frame', () => {
    const uniform = new Uint8ClampedArray(3 * 3 * 4).fill(255);
    expect(
      stencilPixels(3, 3, uniform, {
        mode: 'edges',
        threshold: 50,
        invert: false,
      }).every((v) => v === 255)
    ).toBe(true);
    const input = uniform.slice();
    for (let y = 0; y < 3; y++)
      for (let c = 0; c < 3; c++) input[(y * 3 + 1) * 4 + c] = 0;
    const result = stencilPixels(3, 3, input, {
      mode: 'edges',
      threshold: 50,
      invert: false,
    });
    expect(result[0]).toBe(0);
    expect(result[4]).toBe(255);
    expect(
      Array.from(
        stencilPixels(1, 1, new Uint8ClampedArray([0, 0, 0, 255]), {
          mode: 'edges',
          threshold: 50,
          invert: false,
        })
      )
    ).toEqual([255, 255, 255, 255]);
    expect(() =>
      stencilPixels(2, 2, input, {
        mode: 'edges',
        threshold: 50,
        invert: false,
      })
    ).toThrow();
  });
});

it('removes light paper while preserving dark ink and existing transparency', () => {
  const source = new Uint8ClampedArray([
    255, 255, 255, 255, 0, 0, 0, 128, 255, 255, 255, 0,
  ]);
  const result = removeTattooPaper(source, 220);
  expect(result[3]).toBe(0);
  expect(result[7]).toBe(128);
  expect(result[11]).toBe(0);
  expect(source[3]).toBe(255);
  const beigePaper = new Uint8ClampedArray([
    236, 232, 220, 255, 200, 200, 200, 128,
  ]);
  const cleaned = removeTattooPaper(beigePaper, 220);
  expect(cleaned[3]).toBe(0);
  expect(cleaned[7]).toBeGreaterThan(0);
  expect(cleaned[7]).toBeLessThan(128);
});

it('normalizes unusable transform values into accessible bounds', () => {
  expect(
    normalizeTattooTransform({
      x: 999,
      y: -50,
      scale: 9,
      rotation: Infinity,
      opacity: -1,
    })
  ).toEqual({ x: 100, y: 0, scale: 2, rotation: 0, opacity: 0 });
  expect(
    normalizeTattooTransform({
      x: NaN,
      y: 50,
      scale: 0,
      rotation: -900,
      opacity: 1,
    })
  ).toEqual({ x: 50, y: 50, scale: 0.05, rotation: -180, opacity: 1 });
});
