import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  downloadTattooCanvas,
  initialTattooTransform,
  loadTattooCanvas,
  normalizeTattooTransform,
  removeTattooPaper,
  stencilPixels,
  type StencilOptions,
  type TattooTransform,
} from '@/lib/tattoo-canvas';

export type CanvasToolCopy = {
  body: string;
  design: string;
  source: string;
  fileHint: string;
  localNote: string;
  chooseExample: string;
  examplePlaceholder: string;
  loading: string;
  emptyTryOn: string;
  emptyStencil: string;
  preview: string;
  moveHint: string;
  x: string;
  y: string;
  scale: string;
  rotation: string;
  opacity: string;
  removePaper: string;
  paperThreshold: string;
  compare: string;
  reset: string;
  download: string;
  mode: string;
  thresholdMode: string;
  edgeMode: string;
  threshold: string;
  invert: string;
  resultNote: string;
  error: string;
  fileTypeError: string;
  fileSizeError: string;
  dimensionError: string;
};

const fieldClass =
  'mt-2 block min-h-11 w-full min-w-0 rounded-lg border border-paper-line bg-paper-panel px-3 py-2 text-sm text-paper-fg file:mr-3 file:rounded file:border-0 file:bg-paper-fg file:px-2 file:py-1 file:text-paper-bg';
const buttonClass =
  'touch-target rounded-full border border-paper-line px-5 py-2 text-sm font-semibold disabled:opacity-40';

function useLocalImage(copy: CanvasToolCopy) {
  const [image, setImage] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const version = useRef(0);
  const activeLoad = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      version.current++;
      activeLoad.current?.abort();
    },
    []
  );
  const load = useCallback(
    async (source: File | string) => {
      const token = ++version.current;
      activeLoad.current?.abort();
      const controller = new AbortController();
      activeLoad.current = controller;
      setError('');
      setBusy(true);
      try {
        const loaded = await loadTattooCanvas(source, controller.signal);
        if (token === version.current) setImage(loaded);
      } catch (cause) {
        if (token !== version.current) return;
        const code = cause instanceof Error ? cause.message : '';
        setError(
          code === 'file-type'
            ? copy.fileTypeError
            : code === 'file-size'
              ? copy.fileSizeError
              : code === 'image-dimensions'
                ? copy.dimensionError
                : copy.error
        );
      } finally {
        if (token === version.current) {
          activeLoad.current = null;
          setBusy(false);
        }
      }
    },
    [copy]
  );
  return { image, error, busy, load };
}

function Upload({
  label,
  hint,
  busy,
  onFile,
}: {
  label: string;
  hint: string;
  busy: boolean;
  onFile: (file: File) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className={fieldClass}
        aria-describedby={`${id}-hint`}
        aria-busy={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
      <p id={`${id}-hint`} className="text-paper-muted mt-2 text-xs leading-5">
        {hint}
      </p>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="flex items-center justify-between gap-4">
        <span>{label}</span>
        <output htmlFor={id} className="text-paper-muted tabular-nums">
          {Math.round(value * 100) / 100}
          {unit}
        </output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-vermilion mt-1 h-9 w-full"
      />
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-vermilion size-4"
      />
      {label}
    </label>
  );
}

function usePaperImage(
  source: HTMLCanvasElement | null,
  enabled: boolean,
  threshold: number
) {
  return useMemo(() => {
    if (!source || !enabled) return source;
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    const input = source
      .getContext('2d')
      ?.getImageData(0, 0, source.width, source.height);
    if (!ctx || !input) return source;
    ctx.putImageData(
      new ImageData(
        removeTattooPaper(input.data, threshold),
        source.width,
        source.height
      ),
      0,
      0
    );
    return canvas;
  }, [source, enabled, threshold]);
}

export function TattooTryOn({
  copy,
  examples,
}: {
  copy: CanvasToolCopy;
  examples: { image: string; label: string }[];
}) {
  const body = useLocalImage(copy);
  const design = useLocalImage(copy);
  const [transform, setTransform] = useState({ ...initialTattooTransform });
  const [removePaper, setRemovePaper] = useState(true);
  const [paper, setPaper] = useState(220);
  const [compare, setCompare] = useState(false);
  const [exportError, setExportError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    transform: TattooTransform;
  } | null>(null);
  const preparedDesign = usePaperImage(design.image, removePaper, paper);
  const update = (values: Partial<TattooTransform>) =>
    setTransform((current) =>
      normalizeTattooTransform({ ...current, ...values })
    );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !body.image) return;
    const frame = requestAnimationFrame(() => {
      canvas.width = body.image!.width;
      canvas.height = body.image!.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(body.image!, 0, 0);
      if (!preparedDesign || compare) return;
      const width = canvas.width * transform.scale;
      const height = (width * preparedDesign.height) / preparedDesign.width;
      ctx.save();
      ctx.translate(
        (canvas.width * transform.x) / 100,
        (canvas.height * transform.y) / 100
      );
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.globalAlpha = transform.opacity;
      ctx.drawImage(preparedDesign, -width / 2, -height / 2, width, height);
      ctx.restore();
    });
    return () => cancelAnimationFrame(frame);
  }, [body.image, preparedDesign, transform, compare]);
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="min-w-0 space-y-5">
        <Upload
          label={copy.body}
          hint={copy.fileHint}
          busy={body.busy}
          onFile={body.load}
        />
        <Upload
          label={copy.design}
          hint={copy.fileHint}
          busy={design.busy}
          onFile={design.load}
        />
        <label className="block text-sm font-semibold">
          {copy.chooseExample}
          <select
            value=""
            className={fieldClass}
            onChange={(event) => {
              const image = event.target.value;
              if (image) void design.load(image);
            }}
          >
            <option value="">{copy.examplePlaceholder}</option>
            {examples.map((item) => (
              <option key={item.image} value={item.image}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-paper-muted text-sm leading-6">{copy.localNote}</p>
        {(body.busy || design.busy) && <p role="status">{copy.loading}</p>}
        {(body.error || design.error || exportError) && (
          <p role="alert" className="text-vermilion text-sm">
            {body.error || design.error || exportError}
          </p>
        )}
        <fieldset
          disabled={!body.image || !design.image}
          className="border-paper-line space-y-2 rounded-xl border p-4 disabled:opacity-50"
        >
          <legend className="px-2 text-sm font-semibold">{copy.preview}</legend>
          <Range
            label={copy.x}
            min={0}
            max={100}
            value={transform.x}
            unit="%"
            onChange={(x) => update({ x })}
          />
          <Range
            label={copy.y}
            min={0}
            max={100}
            value={transform.y}
            unit="%"
            onChange={(y) => update({ y })}
          />
          <Range
            label={copy.scale}
            min={5}
            max={200}
            value={transform.scale * 100}
            unit="%"
            onChange={(v) => update({ scale: v / 100 })}
          />
          <Range
            label={copy.rotation}
            min={-180}
            max={180}
            value={transform.rotation}
            unit="°"
            onChange={(rotation) => update({ rotation })}
          />
          <Range
            label={copy.opacity}
            min={0}
            max={100}
            value={transform.opacity * 100}
            unit="%"
            onChange={(v) => update({ opacity: v / 100 })}
          />
          <Check
            label={copy.removePaper}
            checked={removePaper}
            onChange={setRemovePaper}
          />
          {removePaper && (
            <Range
              label={copy.paperThreshold}
              min={160}
              max={250}
              value={paper}
              onChange={setPaper}
            />
          )}
          <Check label={copy.compare} checked={compare} onChange={setCompare} />
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              setTransform({ ...initialTattooTransform });
              setPaper(220);
              setRemovePaper(true);
              setCompare(false);
            }}
          >
            {copy.reset}
          </button>
          <button
            type="button"
            disabled={
              !body.image ||
              !design.image ||
              compare ||
              body.busy ||
              design.busy
            }
            className={`${buttonClass} bg-paper-fg text-paper-bg`}
            onClick={async () => {
              if (!canvasRef.current) return;
              try {
                setExportError('');
                await downloadTattooCanvas(
                  canvasRef.current,
                  'tattoo-try-on.png'
                );
              } catch {
                setExportError(copy.error);
              }
            }}
          >
            {copy.download}
          </button>
        </div>
      </div>
      <div className="min-w-0">
        <div className="border-paper-line bg-paper-panel focus-within:border-vermilion focus-within:ring-vermilion flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border focus-within:ring-2">
          {body.image ? (
            <canvas
              ref={canvasRef}
              aria-label={copy.preview}
              tabIndex={0}
              role="img"
              className="focus-visible:outline-vermilion block h-auto max-h-[75vh] w-auto max-w-full touch-none focus-visible:outline-2"
              onKeyDown={(event) => {
                const delta = event.shiftKey ? 5 : 1;
                const keys: Record<string, Partial<TattooTransform>> = {
                  ArrowLeft: { x: transform.x - delta },
                  ArrowRight: { x: transform.x + delta },
                  ArrowUp: { y: transform.y - delta },
                  ArrowDown: { y: transform.y + delta },
                };
                if (keys[event.key]) {
                  event.preventDefault();
                  update(keys[event.key]);
                }
              }}
              onPointerDown={(event) => {
                if (!design.image) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                  id: event.pointerId,
                  x: event.clientX,
                  y: event.clientY,
                  transform,
                };
              }}
              onPointerMove={(event) => {
                const current = drag.current;
                if (!current || current.id !== event.pointerId) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                if (!bounds.width || !bounds.height) return;
                update({
                  x:
                    current.transform.x +
                    ((event.clientX - current.x) / bounds.width) * 100,
                  y:
                    current.transform.y +
                    ((event.clientY - current.y) / bounds.height) * 100,
                });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onLostPointerCapture={() => {
                drag.current = null;
              }}
            />
          ) : (
            <p className="text-paper-muted max-w-sm px-6 py-16 text-center text-sm leading-7">
              {copy.emptyTryOn}
            </p>
          )}
        </div>
        <p className="text-paper-muted mt-4 text-sm leading-6">
          {copy.moveHint}
        </p>
        <p className="text-paper-muted mt-3 text-sm leading-6">
          {copy.resultNote}
        </p>
      </div>
    </div>
  );
}

export function TattooStencil({ copy }: { copy: CanvasToolCopy }) {
  const source = useLocalImage(copy);
  const [options, setOptions] = useState<StencilOptions>({
    mode: 'threshold',
    threshold: 128,
    invert: false,
  });
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!source.image || !canvasRef.current) return;
    const image = source.image;
    const canvas = canvasRef.current;
    const frame = requestAnimationFrame(() => {
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (compare) {
        ctx.drawImage(image, 0, 0);
        return;
      }
      const input = image
        .getContext('2d')
        ?.getImageData(0, 0, image.width, image.height);
      if (input)
        ctx.putImageData(
          new ImageData(
            stencilPixels(image.width, image.height, input.data, options),
            image.width,
            image.height
          ),
          0,
          0
        );
    });
    return () => cancelAnimationFrame(frame);
  }, [source.image, options, compare]);
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="min-w-0 space-y-5">
        <Upload
          label={copy.source}
          hint={copy.fileHint}
          busy={source.busy}
          onFile={source.load}
        />
        <p className="text-paper-muted text-sm leading-6">{copy.localNote}</p>
        {source.busy && <p role="status">{copy.loading}</p>}
        {(source.error || error) && (
          <p role="alert" className="text-vermilion text-sm">
            {source.error || error}
          </p>
        )}
        <fieldset
          disabled={!source.image}
          className="border-paper-line space-y-3 rounded-xl border p-4 disabled:opacity-50"
        >
          <legend className="px-2 text-sm font-semibold">{copy.preview}</legend>
          <label className="block text-sm">
            {copy.mode}
            <select
              value={options.mode}
              className={fieldClass}
              onChange={(event) =>
                setOptions((value) => ({
                  ...value,
                  mode: event.target.value as StencilOptions['mode'],
                }))
              }
            >
              <option value="threshold">{copy.thresholdMode}</option>
              <option value="edges">{copy.edgeMode}</option>
            </select>
          </label>
          <Range
            label={copy.threshold}
            value={options.threshold}
            min={1}
            max={254}
            onChange={(threshold) =>
              setOptions((value) => ({ ...value, threshold }))
            }
          />
          <Check
            label={copy.invert}
            checked={options.invert}
            onChange={(invert) => setOptions((value) => ({ ...value, invert }))}
          />
          <Check label={copy.compare} checked={compare} onChange={setCompare} />
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              setOptions({ mode: 'threshold', threshold: 128, invert: false });
              setCompare(false);
            }}
          >
            {copy.reset}
          </button>
          <button
            type="button"
            className={`${buttonClass} bg-paper-fg text-paper-bg`}
            disabled={!source.image || compare || source.busy}
            onClick={async () => {
              if (!canvasRef.current) return;
              try {
                setError('');
                await downloadTattooCanvas(
                  canvasRef.current,
                  'tattoo-stencil-draft.png'
                );
              } catch {
                setError(copy.error);
              }
            }}
          >
            {copy.download}
          </button>
        </div>
      </div>
      <div className="min-w-0">
        <div className="border-paper-line bg-paper-panel flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border">
          {source.image ? (
            <canvas
              ref={canvasRef}
              aria-label={copy.preview}
              role="img"
              className="block h-auto max-h-[75vh] w-auto max-w-full"
            />
          ) : (
            <p className="text-paper-muted max-w-sm px-6 py-16 text-center text-sm leading-7">
              {copy.emptyStencil}
            </p>
          )}
        </div>
        <p className="text-paper-muted mt-4 text-sm leading-6">
          {copy.resultNote}
        </p>
      </div>
    </div>
  );
}
