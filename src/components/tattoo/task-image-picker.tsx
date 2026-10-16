import { useEffect, useId, useRef, useState } from 'react';

import { loadTattooCanvas } from '@/lib/tattoo-canvas';

export type TaskLocalImage = {
  file: File;
  canvas: HTMLCanvasElement;
  preview: string;
};
export type TaskImageCopy = {
  fileHint: string;
  loading: string;
  removeImage: string;
  errors: Record<string, string>;
};

/** Decodes locally. Uploading is deliberately owned by the explicit AI action. */
export function TaskImagePicker({
  value,
  onChange,
  label,
  previewLabel,
  copy,
}: {
  value: TaskLocalImage | null;
  onChange: (image: TaskLocalImage | null) => void;
  label: string;
  previewLabel: string;
  copy: TaskImageCopy;
}) {
  const id = useId();
  const version = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      version.current++;
      pending.current?.abort();
    },
    []
  );

  async function select(file: File) {
    const token = ++version.current;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError('');
    onChange(null);
    try {
      const canvas = await loadTattooCanvas(file, controller.signal);
      if (token !== version.current) return;
      onChange({ file, canvas, preview: canvas.toDataURL('image/png') });
    } catch (cause) {
      if (token !== version.current) return;
      setError(
        copy.errors[cause instanceof Error ? cause.message : ''] ||
          copy.errors.image
      );
    } finally {
      if (token === version.current) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-describedby={`${id}-hint`}
        aria-busy={busy}
        className="border-paper-line bg-paper-panel file:bg-paper-fg file:text-paper-bg mt-2 block min-h-11 w-full min-w-0 rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:px-2 file:py-1"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void select(file);
        }}
      />
      <p id={`${id}-hint`} className="text-paper-muted mt-2 text-xs leading-5">
        {copy.fileHint}
      </p>
      {busy && (
        <p role="status" className="text-paper-muted mt-2 text-sm">
          {copy.loading}
        </p>
      )}
      {error && (
        <p role="alert" className="text-vermilion mt-2 text-sm">
          {error}
        </p>
      )}
      {value && (
        <div className="mt-3">
          <img
            src={value.preview}
            alt={previewLabel}
            width={value.canvas.width}
            height={value.canvas.height}
            className="border-paper-line max-h-72 w-full rounded-lg border object-contain"
          />
          <p className="text-paper-muted mt-2 truncate text-xs">
            {value.file.name}
          </p>
          <button
            type="button"
            className="mt-1 min-h-11 text-sm underline underline-offset-4"
            onClick={() => {
              version.current++;
              pending.current?.abort();
              pending.current = null;
              setError('');
              setBusy(false);
              onChange(null);
            }}
          >
            {copy.removeImage}
          </button>
        </div>
      )}
    </div>
  );
}
