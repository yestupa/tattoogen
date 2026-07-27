import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Circle,
  Eraser,
  Loader2,
  MoveUpRight,
  Pencil,
  Square,
  Type,
  Undo2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import type { PreviewImage } from '@/components/agent/preview-pane-context';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const CANVAS_SPACE = 1000;
const DEFAULT_MARK_COLOR = '#ef4444';
const DEFAULT_MARK_WIDTH = 12;
const SELECTED_MARK_COLOR = '#7c3aed';
const TEXT_FONT_SIZE = 42;
const MARK_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#7c3aed',
  '#171717',
];
const MARK_WIDTHS = [6, 12, 20];

type Point = { x: number; y: number };
type Tool = 'brush' | 'arrow' | 'rectangle' | 'ellipse' | 'text';
type MarkStyle = { color: string; width: number };
type Mark = MarkStyle &
  (
    | { type: 'brush'; points: Point[] }
    | { type: 'arrow'; start: Point; end: Point }
    | { type: 'rectangle'; start: Point; end: Point }
    | { type: 'ellipse'; start: Point; end: Point }
    | { type: 'text'; point: Point; text: string }
  );
type TextEntry = { point: Point; text: string };
type DragState = { index: number; mark: Mark; start: Point };
type Scale = { x: number; y: number };

/**
 * A focused annotation surface: it produces a single marked-up reference
 * image for the model, rather than becoming a general-purpose drawing app.
 */
export function ImageAnnotationEditor({
  source,
  onCancel,
  onComplete,
}: {
  source: PreviewImage;
  onCancel: () => void;
  onComplete: (guide: File) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [markColor, setMarkColor] = useState(DEFAULT_MARK_COLOR);
  const [markWidth, setMarkWidth] = useState(DEFAULT_MARK_WIDTH);
  const [textScale, setTextScale] = useState<Scale>({ x: 1, y: 1 });
  const [marks, setMarks] = useState<Mark[]>([]);
  const [draft, setDraft] = useState<Mark | null>(null);
  const [textEntry, setTextEntry] = useState<TextEntry | null>(null);
  const [selectedMarkIndex, setSelectedMarkIndex] = useState<number | null>(
    null
  );
  const [draggingMark, setDraggingMark] = useState<DragState | null>(null);
  const [exporting, setExporting] = useState(false);
  const textCommitted = useRef(false);

  useEffect(() => {
    if (selectedMarkIndex === null || exporting) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      )
        return;

      event.preventDefault();
      setMarks((previous) =>
        previous.filter((_, index) => index !== selectedMarkIndex)
      );
      setSelectedMarkIndex(null);
      setDraggingMark(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exporting, selectedMarkIndex]);

  // Load through our same-origin download proxy so remote storage images can
  // be safely flattened with the annotation overlay in a canvas.
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setDisplaySrc(null);
    setLoadFailed(false);
    setReady(false);
    setTextScale({ x: 1, y: 1 });
    setMarks([]);
    setDraft(null);
    setTextEntry(null);
    setSelectedMarkIndex(null);
    setDraggingMark(null);

    if (source.src.startsWith('data:') || source.src.startsWith('blob:')) {
      setDisplaySrc(source.src);
      return;
    }

    const proxyUrl = `/api/storage/download?url=${encodeURIComponent(source.src)}&name=${encodeURIComponent(source.name || 'image')}`;
    fetch(proxyUrl, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Image request failed: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setDisplaySrc(objectUrl);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source.src, source.name]);

  function pointFromClient(clientX: number, clientY: number): Point {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return {
      x: clamp(((clientX - bounds.left) / bounds.width) * CANVAS_SPACE),
      y: clamp(((clientY - bounds.top) / bounds.height) * CANVAS_SPACE),
    };
  }

  function pointFromEvent(event: ReactPointerEvent<SVGSVGElement>): Point {
    return pointFromClient(event.clientX, event.clientY);
  }

  function startMark(event: ReactPointerEvent<SVGSVGElement>) {
    if (!ready || exporting) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    setSelectedMarkIndex(null);
    if (tool === 'text') {
      textCommitted.current = false;
      setTextEntry({ point, text: '' });
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraft(
      tool === 'brush'
        ? { type: 'brush', points: [point], color: markColor, width: markWidth }
        : tool === 'arrow'
          ? {
              type: 'arrow',
              start: point,
              end: point,
              color: markColor,
              width: markWidth,
            }
          : tool === 'rectangle'
            ? {
                type: 'rectangle',
                start: point,
                end: point,
                color: markColor,
                width: markWidth,
              }
            : {
                type: 'ellipse',
                start: point,
                end: point,
                color: markColor,
                width: markWidth,
              }
    );
  }

  function moveMark(event: ReactPointerEvent<SVGSVGElement>) {
    if (draggingMark) {
      const point = pointFromEvent(event);
      const delta = clampDelta(
        draggingMark.mark,
        point.x - draggingMark.start.x,
        point.y - draggingMark.start.y
      );
      setMarks((previous) =>
        previous.map((mark, index) =>
          index === draggingMark.index
            ? translateMark(draggingMark.mark, delta)
            : mark
        )
      );
      return;
    }
    if (!draft || exporting) return;
    const point = pointFromEvent(event);
    setDraft((current) => (current ? updateMark(current, point) : current));
  }

  function finishMark(event: ReactPointerEvent<SVGSVGElement>) {
    if (draggingMark) {
      setDraggingMark(null);
      return;
    }
    if (!draft || exporting) return;
    const completed = updateMark(draft, pointFromEvent(event));
    if (isMeaningful(completed))
      setMarks((previous) => [...previous, completed]);
    setDraft(null);
  }

  function startMarkDrag(
    event: ReactPointerEvent<SVGGElement>,
    index: number,
    mark: Mark
  ) {
    if (exporting || textEntry) return;
    event.preventDefault();
    event.stopPropagation();
    const point = pointFromClient(event.clientX, event.clientY);
    svgRef.current?.setPointerCapture(event.pointerId);
    setSelectedMarkIndex(index);
    setDraggingMark({
      index,
      mark,
      start: point,
    });
  }

  function commitText(text: string) {
    if (!textEntry || textCommitted.current) return;
    textCommitted.current = true;
    const value = text.trim();
    if (value) {
      setMarks((previous) => [
        ...previous,
        {
          type: 'text',
          point: textEntry.point,
          text: value,
          color: markColor,
          width: markWidth,
        },
      ]);
    }
    setTextEntry(null);
  }

  async function exportGuide() {
    const image = imageRef.current;
    if (!image || marks.length === 0 || exporting) return;
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      marks.forEach((mark) =>
        drawMark(context, mark, canvas.width, canvas.height)
      );
      const blob = await canvasToBlob(canvas);
      const guide = new File([blob], annotationName(source.name), {
        type: 'image/jpeg',
      });
      onComplete(guide);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-1 border-b px-4 py-2">
        <AnnotationTool
          active={tool === 'rectangle'}
          label={m['agent.annotation.rectangle']()}
          onClick={() => setTool('rectangle')}
        >
          <Square className="size-4" />
        </AnnotationTool>
        <AnnotationTool
          active={tool === 'ellipse'}
          label={m['agent.annotation.circle']()}
          onClick={() => setTool('ellipse')}
        >
          <Circle className="size-4" />
        </AnnotationTool>
        <AnnotationTool
          active={tool === 'arrow'}
          label={m['agent.annotation.arrow']()}
          onClick={() => setTool('arrow')}
        >
          <MoveUpRight className="size-5 scale-x-110" strokeWidth={1.8} />
        </AnnotationTool>
        <AnnotationTool
          active={tool === 'brush'}
          label={m['agent.annotation.brush']()}
          onClick={() => setTool('brush')}
        >
          <Pencil className="size-4" />
        </AnnotationTool>
        <AnnotationTool
          active={tool === 'text'}
          label={m['agent.annotation.text']()}
          onClick={() => setTool('text')}
        >
          <Type className="size-4" />
        </AnnotationTool>
        <MarkStylePicker
          color={markColor}
          width={markWidth}
          onColorChange={setMarkColor}
          onWidthChange={setMarkWidth}
        />
        <span className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setMarks((previous) => previous.slice(0, -1));
            setSelectedMarkIndex(null);
            setDraggingMark(null);
          }}
          disabled={marks.length === 0 || exporting}
          aria-label={m['agent.annotation.undo']()}
          title={m['agent.annotation.undo']()}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setMarks([]);
            setTextEntry(null);
            setSelectedMarkIndex(null);
            setDraggingMark(null);
          }}
          disabled={marks.length === 0 || exporting}
          aria-label={m['agent.annotation.clear']()}
          title={m['agent.annotation.clear']()}
        >
          <Eraser className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="flex min-h-full min-w-full items-center justify-center">
          {loadFailed ? (
            <p className="text-muted-foreground text-sm">
              {m['agent.annotation.load_failed']()}
            </p>
          ) : !displaySrc ? (
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          ) : (
            <div className="relative max-h-full max-w-full">
              <img
                ref={imageRef}
                src={displaySrc}
                alt={source.alt || source.name || m['agent.preview.image']()}
                onLoad={(event) => {
                  const { naturalHeight, naturalWidth } = event.currentTarget;
                  const shortestSide = Math.min(naturalWidth, naturalHeight);
                  setTextScale({
                    x: shortestSide / naturalWidth,
                    y: shortestSide / naturalHeight,
                  });
                  setReady(true);
                }}
                className="block max-h-full max-w-full rounded-lg border object-contain shadow-sm"
              />
              {ready && (
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${CANVAS_SPACE} ${CANVAS_SPACE}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full touch-none"
                  onPointerDown={startMark}
                  onPointerMove={moveMark}
                  onPointerUp={finishMark}
                  onPointerCancel={() => {
                    setDraft(null);
                    setDraggingMark(null);
                  }}
                >
                  {marks.map((mark, index) => (
                    <AnnotationMark
                      key={index}
                      mark={mark}
                      textScale={textScale}
                      selected={index === selectedMarkIndex}
                      onPointerDown={(event, selectedMark) =>
                        startMarkDrag(event, index, selectedMark)
                      }
                    />
                  ))}
                  {draft && (
                    <AnnotationMark mark={draft} textScale={textScale} />
                  )}
                </svg>
              )}
              {textEntry && (
                <input
                  autoFocus
                  value={textEntry.text}
                  onChange={(event) =>
                    setTextEntry((current) =>
                      current ? { ...current, text: event.target.value } : null
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      commitText(event.currentTarget.value);
                    }
                    if (event.key === 'Escape') {
                      textCommitted.current = true;
                      setTextEntry(null);
                    }
                  }}
                  onBlur={(event) => commitText(event.currentTarget.value)}
                  placeholder={m['agent.annotation.text_placeholder']()}
                  className="border-primary bg-background text-foreground focus:ring-ring absolute z-10 h-8 w-44 rounded-md border px-2 text-xs shadow-md outline-none focus:ring-2"
                  style={{
                    left: `${Math.min(textEntry.point.x, 780) / 10}%`,
                    top: `${Math.min(textEntry.point.y, 960) / 10}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-border flex shrink-0 items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-muted-foreground min-w-0 text-xs">
          {m['agent.annotation.hint']()}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {m['agent.annotation.cancel']()}
          </Button>
          <Button
            type="button"
            onClick={() => void exportGuide()}
            disabled={!ready || marks.length === 0 || exporting}
          >
            {exporting && <Loader2 className="size-4 animate-spin" />}
            {m['agent.annotation.done']()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnnotationTool({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(active && 'text-primary')}
    >
      {children}
    </Button>
  );
}

function MarkStylePicker({
  color,
  width,
  onColorChange,
  onWidthChange,
}: {
  color: string;
  width: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={m['agent.annotation.style']()}
            title={m['agent.annotation.style']()}
            className="ml-1 rounded-md"
          />
        }
      >
        <span
          className="ring-background ring-offset-muted-foreground/20 size-4 rounded-full ring-2 ring-offset-1"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 gap-4 rounded-xl p-3">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">
            {m['agent.annotation.color']()}
          </p>
          <div className="flex flex-wrap gap-3">
            {MARK_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={option}
                aria-pressed={color === option}
                onClick={() => onColorChange(option)}
                className={cn(
                  'focus-visible:ring-ring flex size-4 cursor-pointer items-center justify-center rounded-full ring-offset-1 transition-transform outline-none hover:scale-110 focus-visible:ring-2',
                  color === option && 'ring-foreground ring-2 ring-offset-1'
                )}
                style={{ backgroundColor: option }}
              >
                {color === option && (
                  <span className="size-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">
            {m['agent.annotation.stroke_width']()}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {MARK_WIDTHS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={m['agent.annotation.stroke_width_option']({
                  width: option,
                })}
                aria-pressed={width === option}
                onClick={() => onWidthChange(option)}
                className={cn(
                  'border-border hover:bg-accent focus-visible:ring-ring flex h-9 cursor-pointer items-center justify-center rounded-md border transition-colors outline-none focus-visible:ring-2',
                  width === option && 'border-primary bg-primary/10'
                )}
              >
                <span
                  className="w-8 rounded-full bg-current"
                  style={{ height: Math.max(2, option / 2) }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AnnotationMark({
  mark,
  textScale,
  selected = false,
  onPointerDown,
}: {
  mark: Mark;
  textScale: Scale;
  selected?: boolean;
  onPointerDown?: (event: ReactPointerEvent<SVGGElement>, mark: Mark) => void;
}) {
  const color = selected ? SELECTED_MARK_COLOR : mark.color;
  const handlePointerDown = onPointerDown
    ? (event: ReactPointerEvent<SVGGElement>) => onPointerDown(event, mark)
    : undefined;

  if (mark.type === 'brush') {
    if (mark.points.length === 1) {
      return (
        <g
          className={onPointerDown ? 'cursor-move' : undefined}
          onPointerDown={handlePointerDown}
        >
          <circle
            cx={mark.points[0].x}
            cy={mark.points[0].y}
            r={mark.width / 2}
            fill={color}
          />
        </g>
      );
    }
    return (
      <g
        className={onPointerDown ? 'cursor-move' : undefined}
        onPointerDown={handlePointerDown}
      >
        <polyline
          points={mark.points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={mark.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  if (mark.type === 'arrow') {
    const head = arrowHead(mark.start, mark.end);
    return (
      <g
        className={onPointerDown ? 'cursor-move' : undefined}
        onPointerDown={handlePointerDown}
      >
        <line
          x1={mark.start.x}
          y1={mark.start.y}
          x2={mark.end.x}
          y2={mark.end.y}
          stroke="transparent"
          strokeWidth={Math.max(32, mark.width * 3)}
        />
        <line
          x1={mark.start.x}
          y1={mark.start.y}
          x2={mark.end.x}
          y2={mark.end.y}
          stroke={color}
          strokeWidth={mark.width}
          strokeLinecap="round"
        />
        <path
          d={`M ${head.left.x} ${head.left.y} L ${mark.end.x} ${mark.end.y} L ${head.right.x} ${head.right.y}`}
          fill="none"
          stroke={color}
          strokeWidth={mark.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  if (mark.type === 'rectangle') {
    const box = rectangleBox(mark.start, mark.end);
    return (
      <g
        className={onPointerDown ? 'cursor-move' : undefined}
        onPointerDown={handlePointerDown}
      >
        <rect
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          fill="transparent"
          stroke={color}
          strokeWidth={mark.width}
        />
      </g>
    );
  }
  if (mark.type === 'text') {
    return (
      <g
        className={onPointerDown ? 'cursor-move select-none' : undefined}
        onPointerDown={handlePointerDown}
      >
        <text
          x={mark.point.x}
          y={mark.point.y}
          transform={`translate(${mark.point.x} ${mark.point.y}) scale(${textScale.x} ${textScale.y}) translate(${-mark.point.x} ${-mark.point.y})`}
          fill={color}
          stroke="white"
          strokeWidth={Math.max(2, mark.width / 3)}
          paintOrder="stroke"
          fontSize={TEXT_FONT_SIZE}
          fontWeight={700}
        >
          {mark.text}
        </text>
      </g>
    );
  }
  const box = ellipseBox(mark.start, mark.end);
  return (
    <g
      className={onPointerDown ? 'cursor-move' : undefined}
      onPointerDown={handlePointerDown}
    >
      <ellipse
        cx={box.cx}
        cy={box.cy}
        rx={box.rx}
        ry={box.ry}
        fill="transparent"
        stroke={color}
        strokeWidth={mark.width}
      />
    </g>
  );
}

function updateMark(mark: Mark, point: Point): Mark {
  if (mark.type === 'brush')
    return { ...mark, points: [...mark.points, point] };
  if (mark.type === 'text') return mark;
  return { ...mark, end: point };
}

function isMeaningful(mark: Mark) {
  if (mark.type === 'brush') return mark.points.length > 1;
  if (mark.type === 'text') return mark.text.trim().length > 0;
  return distance(mark.start, mark.end) > 10;
}

function clamp(value: number) {
  return Math.min(CANVAS_SPACE, Math.max(0, value));
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampDelta(mark: Mark, x: number, y: number): Point {
  const bounds = markBounds(mark);
  return {
    x: Math.min(CANVAS_SPACE - bounds.right, Math.max(-bounds.left, x)),
    y: Math.min(CANVAS_SPACE - bounds.bottom, Math.max(-bounds.top, y)),
  };
}

function markBounds(mark: Mark) {
  const points =
    mark.type === 'brush'
      ? mark.points
      : mark.type === 'text'
        ? [mark.point]
        : [mark.start, mark.end];
  return {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y)),
  };
}

function translateMark(mark: Mark, delta: Point): Mark {
  const move = (point: Point) => ({
    x: point.x + delta.x,
    y: point.y + delta.y,
  });
  if (mark.type === 'brush') return { ...mark, points: mark.points.map(move) };
  if (mark.type === 'text') return { ...mark, point: move(mark.point) };
  return { ...mark, start: move(mark.start), end: move(mark.end) };
}

function arrowHead(start: Point, end: Point) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const size = 32;
  return {
    left: {
      x: end.x - size * Math.cos(angle - Math.PI / 6),
      y: end.y - size * Math.sin(angle - Math.PI / 6),
    },
    right: {
      x: end.x - size * Math.cos(angle + Math.PI / 6),
      y: end.y - size * Math.sin(angle + Math.PI / 6),
    },
  };
}

function ellipseBox(start: Point, end: Point) {
  return {
    cx: (start.x + end.x) / 2,
    cy: (start.y + end.y) / 2,
    rx: Math.abs(start.x - end.x) / 2,
    ry: Math.abs(start.y - end.y) / 2,
  };
}

function rectangleBox(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
  };
}

function drawMark(
  context: CanvasRenderingContext2D,
  mark: Mark,
  width: number,
  height: number
) {
  const point = (value: Point) => ({
    x: (value.x / CANVAS_SPACE) * width,
    y: (value.y / CANVAS_SPACE) * height,
  });
  const strokeWidth = (mark.width / CANVAS_SPACE) * Math.min(width, height);
  context.save();
  context.strokeStyle = mark.color;
  context.fillStyle = mark.color;
  context.lineWidth = strokeWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (mark.type === 'brush') {
    const points = mark.points.map(point);
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const current of points.slice(1)) context.lineTo(current.x, current.y);
    context.stroke();
  } else if (mark.type === 'arrow') {
    const start = point(mark.start);
    const end = point(mark.end);
    const head = arrowHead(start, end);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.moveTo(head.left.x, head.left.y);
    context.lineTo(end.x, end.y);
    context.lineTo(head.right.x, head.right.y);
    context.stroke();
  } else if (mark.type === 'ellipse') {
    const start = point(mark.start);
    const end = point(mark.end);
    const box = ellipseBox(start, end);
    context.beginPath();
    context.ellipse(box.cx, box.cy, box.rx, box.ry, 0, 0, Math.PI * 2);
    context.stroke();
  } else if (mark.type === 'rectangle') {
    const start = point(mark.start);
    const end = point(mark.end);
    const box = rectangleBox(start, end);
    context.strokeRect(box.x, box.y, box.width, box.height);
  } else {
    const anchor = point(mark.point);
    const fontSize = (TEXT_FONT_SIZE / CANVAS_SPACE) * Math.min(width, height);
    context.font = `700 ${fontSize}px sans-serif`;
    context.lineWidth = Math.max(2, fontSize * (mark.width / 120));
    context.strokeStyle = 'white';
    context.strokeText(mark.text, anchor.x, anchor.y);
    context.fillStyle = mark.color;
    context.fillText(mark.text, anchor.x, anchor.y);
  }
  context.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Could not export guide')),
      'image/jpeg',
      0.92
    );
  });
}

function annotationName(name: string | undefined) {
  const base = (name || 'image').replace(/\.[^.]+$/, '');
  return `${base}-annotation.jpg`;
}
