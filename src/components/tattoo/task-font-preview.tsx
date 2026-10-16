import { useEffect, useId, useState } from 'react';

import { downloadTattooCanvas, fitTattooImage } from '@/lib/tattoo-canvas';
import {
  drawTattooFontLines,
  fontPreviewLines,
  measureTattooFontLines,
  type TattooTaskInput,
} from '@/lib/tattoo-task';

export type TaskFontCopy = {
  title: string;
  family: string;
  serif: string;
  sans: string;
  script: string;
  mono: string;
  deviceNote: string;
  size: string;
  spacing: string;
  layout: string;
  lines: string;
  stacked: string;
  download: string;
  empty: string;
  exportError: string;
  previewLabel: string;
};
export type TaskFontSettings = NonNullable<TattooTaskInput['font']>;
const fonts = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'Arial, Helvetica, sans-serif',
  script: 'cursive',
  mono: '"Courier New", Consolas, monospace',
};
const controlClass =
  'border-paper-line bg-paper-panel mt-2 min-h-11 w-full rounded-lg border px-3 py-2 text-sm';

export function TaskFontPreview({
  text,
  copy,
  onChange,
}: {
  text: string;
  copy: TaskFontCopy;
  onChange: (value: TaskFontSettings) => void;
}) {
  const id = useId();
  const [family, setFamily] = useState<keyof typeof fonts>('serif');
  const [size, setSize] = useState(56);
  const [spacing, setSpacing] = useState(0);
  const [spacingSupported, setSpacingSupported] = useState(false);
  const [layout, setLayout] = useState<'lines' | 'stacked'>('lines');
  const [error, setError] = useState('');
  const effectiveSpacing = spacingSupported ? spacing : 0;
  useEffect(() => {
    const context = document.createElement('canvas').getContext('2d');
    setSpacingSupported(typeof context?.letterSpacing === 'string');
  }, []);
  useEffect(
    () =>
      onChange({
        family: fonts[family],
        size,
        spacing: effectiveSpacing,
        layout,
      }),
    [family, size, effectiveSpacing, layout, onChange]
  );
  const lines = fontPreviewLines(text, layout);

  async function download() {
    if (!text.trim()) return;
    setError('');
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('canvas-unavailable');
      context.font = `${size}px ${fonts[family]}`;
      const metrics = measureTattooFontLines(context, lines, effectiveSpacing);
      const padding = size;
      const width = Math.ceil(Math.max(size, metrics.width) + padding * 2);
      const height = Math.ceil(
        Math.max(1, lines.length) * size * 1.5 + padding * 2
      );
      const fitted = fitTattooImage(width, height, 4096, 8000000);
      canvas.width = fitted.width;
      canvas.height = fitted.height;
      context.scale(fitted.width / width, fitted.height / height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#111111';
      context.font = `${size}px ${fonts[family]}`;
      context.textBaseline = 'top';
      drawTattooFontLines(context, lines, {
        spacing: metrics.spacing,
        padding,
        size,
      });
      await downloadTattooCanvas(canvas, 'tattoo-lettering-preview.png');
    } catch {
      setError(copy.exportError);
    }
  }

  return (
    <section
      className="border-paper-line min-w-0 rounded-2xl border p-4 sm:p-6"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className="font-display text-2xl font-bold">
        {copy.title}
      </h2>
      <p className="text-paper-muted mt-3 text-sm leading-6">
        {copy.deviceNote}
      </p>
      <div
        className="mt-5 overflow-auto rounded-xl bg-white p-6 text-black"
        style={{ maxHeight: 360 }}
      >
        <div
          aria-label={copy.previewLabel}
          className="min-h-24 min-w-full"
          style={{
            fontFamily: fonts[family],
            fontSize: size,
            letterSpacing: effectiveSpacing,
            whiteSpace: 'pre',
            lineHeight: 1.5,
            width: 'max-content',
          }}
        >
          {text.trim() ? (
            lines.join('\n')
          ) : (
            <span className="text-base whitespace-normal">{copy.empty}</span>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold" htmlFor={`${id}-family`}>
          {copy.family}
          <select
            id={`${id}-family`}
            value={family}
            onChange={(event) =>
              setFamily(event.target.value as keyof typeof fonts)
            }
            className={controlClass}
          >
            {(Object.keys(fonts) as (keyof typeof fonts)[]).map((key) => (
              <option key={key} value={key}>
                {copy[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold" htmlFor={`${id}-layout`}>
          {copy.layout}
          <select
            id={`${id}-layout`}
            value={layout}
            onChange={(event) =>
              setLayout(event.target.value as 'lines' | 'stacked')
            }
            className={controlClass}
          >
            <option value="lines">{copy.lines}</option>
            <option value="stacked">{copy.stacked}</option>
          </select>
        </label>
        <label className="text-sm font-semibold" htmlFor={`${id}-size`}>
          {copy.size}: {size}
          <input
            id={`${id}-size`}
            className="mt-3 block min-h-8 w-full accent-current"
            type="range"
            min={24}
            max={112}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
        </label>
        <label className="text-sm font-semibold" htmlFor={`${id}-spacing`}>
          {copy.spacing}: {effectiveSpacing}
          <input
            id={`${id}-spacing`}
            className="mt-3 block min-h-8 w-full accent-current"
            type="range"
            min={-2}
            max={16}
            value={effectiveSpacing}
            disabled={!spacingSupported}
            onChange={(event) => setSpacing(Number(event.target.value))}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => void download()}
        disabled={!text.trim()}
        className="border-paper-line mt-6 min-h-11 rounded-full border px-5 py-2 text-sm font-semibold disabled:opacity-40"
      >
        {copy.download}
      </button>
      {error && (
        <p role="alert" className="text-vermilion mt-3 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
