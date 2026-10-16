import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import { hasTattooGapShape } from '@/lib/tattoo-task';

type Point = { x: number; y: number };

export function TaskGapGuide({
  source,
  label,
  hint,
  clearLabel,
  errorLabel,
  onChange,
}: {
  source: HTMLCanvasElement | null;
  label: string;
  hint: string;
  clearLabel: string;
  errorLabel: string;
  onChange: (file: File | null) => void;
}) {
  const id = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const active = useRef<number | null>(null);
  const version = useRef(0);
  const [error, setError] = useState('');
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    canvas.width = source?.width ?? 720;
    canvas.height = source?.height ?? 540;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (source) context.drawImage(source, 0, 0);
    context.strokeStyle = '#e13f35';
    context.lineWidth = Math.max(canvas.width, canvas.height) / 180;
    context.lineCap = context.lineJoin = 'round';
    for (const stroke of strokes.current) {
      context.beginPath();
      stroke.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    }
  }, [source]);

  useEffect(() => {
    version.current++;
    strokes.current = [];
    active.current = null;
    onChange(null);
    redraw();
    return () => {
      version.current++;
    };
  }, [source, redraw, onChange]);

  function point(event: PointerEvent<HTMLCanvasElement>): Point {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  }

  function exportGuide() {
    const canvas = canvasRef.current;
    const token = ++version.current;
    if (!canvas || !hasTattooGapShape(strokes.current)) {
      onChange(null);
      return;
    }
    canvas.toBlob((blob) => {
      if (token !== version.current) return;
      if (!blob) {
        setError(errorLabel);
        onChange(null);
        return;
      }
      onChange(new File([blob], 'tattoo-gap-guide.png', { type: 'image/png' }));
    }, 'image/png');
  }

  return (
    <div className="min-w-0">
      <p id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </p>
      <p id={`${id}-hint`} className="text-paper-muted mt-2 text-sm leading-6">
        {hint}
      </p>
      <canvas
        ref={canvasRef}
        width={720}
        height={540}
        aria-label={label}
        aria-describedby={`${id}-hint`}
        className="border-paper-line mt-4 block h-auto max-h-96 w-auto max-w-full touch-none rounded-xl border bg-white"
        style={{
          aspectRatio: `${source?.width ?? 720} / ${source?.height ?? 540}`,
        }}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            active.current !== null ||
            strokes.current.length >= 40
          )
            return;
          event.preventDefault();
          active.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          strokes.current.push([point(event)]);
          onChange(null);
          setError('');
        }}
        onPointerMove={(event) => {
          if (active.current !== event.pointerId) return;
          const stroke = strokes.current.at(-1)!;
          if (stroke.length < 3000) stroke.push(point(event));
          redraw();
        }}
        onPointerUp={(event) => {
          if (active.current !== event.pointerId) return;
          active.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
          redraw();
          exportGuide();
        }}
        onPointerCancel={() => {
          active.current = null;
          strokes.current.pop();
          redraw();
          exportGuide();
        }}
      />
      <button
        type="button"
        className="border-paper-line mt-3 min-h-11 rounded-full border px-4 text-sm font-semibold"
        onClick={() => {
          version.current++;
          strokes.current = [];
          active.current = null;
          setError('');
          onChange(null);
          redraw();
        }}
      >
        {clearLabel}
      </button>
      {error && (
        <p className="text-vermilion mt-3 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
