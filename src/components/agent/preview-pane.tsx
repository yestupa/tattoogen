import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Download, ExternalLink, Pencil, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImageAnnotationEditor } from '@/components/agent/image-annotation';
import {
  usePreviewPane,
  type PreviewImage,
} from '@/components/agent/preview-pane-context';
import { BrandArtwork } from '@/components/brand-artwork';
import { PageState } from '@/components/page-state';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';

// Pane sizing: never squeeze the conversation below MIN_CHAT_WIDTH, and keep
// the pane itself within a comfortable range.
const MIN_PANE_WIDTH = 300;
const MAX_PANE_WIDTH = 1100;
const MIN_CHAT_WIDTH = 320;
const DESKTOP_BREAKPOINT = 768;
// Mirrors SIDEBAR_WIDTH / SIDEBAR_WIDTH_ICON in components/ui/sidebar.
const SIDEBAR_WIDTH = 256;
const SIDEBAR_ICON_WIDTH = 0;
// Re-expanding needs more room than collapsing frees, so the sidebar can't
// flip back and forth around a single pixel.
const EXPAND_HYSTERESIS = 80;

function chatWidthFor(paneWidth: number, sidebarShown: boolean) {
  return (
    window.innerWidth -
    paneWidth -
    (sidebarShown ? SIDEBAR_WIDTH : SIDEBAR_ICON_WIDTH)
  );
}

function clampPaneWidth(next: number) {
  if (typeof window === 'undefined') return next;
  // Mobile uses a sheet. Inline tablet/desktop width must also match the
  // rendered 50vw limit so sidebar calculations use a reachable pane width.
  const room =
    window.innerWidth >= DESKTOP_BREAKPOINT
      ? window.innerWidth - MIN_CHAT_WIDTH - SIDEBAR_ICON_WIDTH
      : MAX_PANE_WIDTH;
  const visualLimit =
    window.innerWidth >= DESKTOP_BREAKPOINT
      ? window.innerWidth / 2
      : MAX_PANE_WIDTH;
  const max = Math.max(
    MIN_PANE_WIDTH,
    Math.min(MAX_PANE_WIDTH, room, visualLimit)
  );
  return Math.min(max, Math.max(MIN_PANE_WIDTH, next));
}

export function PreviewPane({
  hasExplicitPreview = false,
}: {
  hasExplicitPreview?: boolean;
}) {
  const { open, setOpen, image, images, openImage, annotationHandler } =
    usePreviewPane();
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [width, setWidth] = useState(400);
  const isMobile = useIsMobile();
  const [annotating, setAnnotating] = useState(false);
  // Only re-open the sidebar if we're the ones who closed it.
  const autoCollapsed = useRef(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    // Explicit route intent wins over the mobile default. This effect does not
    // depend on `open`, so manually closing the sheet remains a user choice.
    const syncPreview = () => setOpen(desktop.matches || hasExplicitPreview);
    syncPreview();
    desktop.addEventListener('change', syncPreview);
    return () => desktop.removeEventListener('change', syncPreview);
  }, [setOpen, hasExplicitPreview]);

  useEffect(() => {
    if (!open) return;
    const stopDrag = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mouseup', stopDrag);
      stopDrag();
    };
  }, [open]);

  useEffect(() => {
    if (!open) setAnnotating(false);
  }, [open]);

  // Re-clamp when the window changes size so a wide pane can't eat the whole
  // conversation on a narrower screen.
  useEffect(() => {
    if (!open) return;
    const onResize = () => setWidth((current) => clampPaneWidth(current));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  // Trade the sidebar for conversation width: collapse it once the chat gets
  // cramped, restore it when the pane shrinks back.
  useEffect(() => {
    if (!open) return;
    // Tablet navigation overlays the chat; opening it must remain a user choice.
    if (window.innerWidth < 1280) return;
    if (sidebarOpen && chatWidthFor(width, true) < MIN_CHAT_WIDTH) {
      autoCollapsed.current = true;
      setSidebarOpen(false);
    } else if (
      !sidebarOpen &&
      autoCollapsed.current &&
      chatWidthFor(width, true) >= MIN_CHAT_WIDTH + EXPAND_HYSTERESIS
    ) {
      autoCollapsed.current = false;
      setSidebarOpen(true);
    }
  }, [open, width, sidebarOpen, setSidebarOpen]);

  function startResize(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (moveEvent: globalThis.MouseEvent) => {
      setWidth(clampPaneWidth(window.innerWidth - moveEvent.clientX));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Nothing picked yet — show the newest image, the one a viewer came for.
  const current = image ?? images[images.length - 1] ?? null;

  useEffect(() => {
    setAnnotating(false);
  }, [current?.src, annotationHandler]);

  if (!open) return null;

  const index = current ? images.findIndex((i) => i.src === current.src) : -1;
  const title =
    index >= 0
      ? m['agent.preview.counter']({ current: index + 1, total: images.length })
      : m['agent.preview.gallery']({ count: images.length });

  const content = (
    <div className="bg-card border-border [&_button]:focus-visible:outline-ring flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border [&_a]:min-h-11 [&_a]:min-w-11 [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2">
      <div className="border-border flex min-h-16 shrink-0 items-center justify-between gap-2 border-b px-3">
        <span className="truncate text-sm font-medium">
          {annotating ? m['agent.annotation.title']() : title}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {current?.src && !annotating && (
            <>
              {annotationHandler && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAnnotating(true)}
                  aria-label={m['agent.annotation.start']()}
                  title={m['agent.annotation.start']()}
                  className="text-muted-foreground hover:text-foreground size-11 rounded-xl"
                >
                  <Pencil className="size-4" />
                </Button>
              )}
              <a
                href={current.src}
                target="_blank"
                rel="noreferrer"
                aria-label={m['agent.preview.open']()}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-muted-foreground hover:text-foreground size-11 rounded-xl'
                )}
              >
                <ExternalLink className="size-4" />
              </a>
              {/* Proxied: <a download> is ignored cross-origin, so the
                    storage URL would just open in a tab. */}
              <a
                href={`/api/storage/download?url=${encodeURIComponent(
                  current.src
                )}${current.name ? `&name=${encodeURIComponent(current.name)}` : ''}`}
                download={current.name}
                aria-label={m['agent.preview.download']()}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-muted-foreground hover:text-foreground size-11 rounded-xl'
                )}
              >
                <Download className="size-4" />
              </a>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (annotating) setAnnotating(false);
              else setOpen(false);
            }}
            aria-label={
              annotating
                ? m['agent.annotation.cancel']()
                : m['agent.preview.close']()
            }
            className="text-muted-foreground hover:text-foreground size-11 rounded-xl"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {current && annotating && annotationHandler ? (
        <ImageAnnotationEditor
          source={current}
          onCancel={() => setAnnotating(false)}
          onComplete={(guide) => {
            annotationHandler({ source: current, guide });
            setAnnotating(false);
          }}
        />
      ) : current ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="bg-secondary/30 min-h-0 flex-1 overflow-auto p-4">
            {/* Centred both ways: a short image shouldn't hug the top of a
                  tall pane. */}
            <div className="flex min-h-full items-center justify-center">
              <PreviewImageElement
                src={current.src}
                alt={current.alt || current.name || m['agent.preview.image']()}
                className="max-h-none max-w-full rounded-2xl border object-contain shadow-sm"
              />
            </div>
          </div>
          <div className="border-border min-w-0 border-t px-4 py-3">
            <p className="truncate text-sm font-medium">
              {current.name || current.alt || m['agent.preview.image']()}
            </p>
            {current.alt && current.alt !== current.name && (
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed break-words">
                {current.alt}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">{title}</p>
          </div>
          {images.length > 1 && (
            <FilmStrip
              images={images}
              current={current}
              onSelect={(next) => {
                setAnnotating(false);
                openImage(next);
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center overflow-auto p-4">
          <EmptyPreview />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="bg-sidebar w-full max-w-full gap-0 p-2 motion-reduce:transition-none sm:max-w-full"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {m['agent.preview.gallery']({ count: images.length })}
            </SheetTitle>
            <SheetDescription>
              {m['agent.preview.empty_description']()}
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      aria-label={m['agent.preview.gallery']({ count: images.length })}
      className="relative flex h-dvh max-w-[50vw] shrink-0 py-2 pr-2"
      style={{ width }}
    >
      <div
        onMouseDown={startResize}
        className="group absolute top-6 bottom-6 -left-1.5 hidden w-3 cursor-col-resize xl:block"
        aria-hidden="true"
      >
        <span className="group-hover:bg-primary/50 group-active:bg-primary absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent" />
      </div>
      {content}
    </aside>
  );
}

/**
 * Every image in the conversation, oldest first — uploads and results alike.
 * Clicking one swaps the large view above it.
 */
function FilmStrip({
  images,
  current,
  onSelect,
}: {
  images: PreviewImage[];
  current: PreviewImage;
  onSelect: (image: PreviewImage) => void;
}) {
  return (
    <div className="shrink-0 overflow-x-auto px-4 py-3">
      <div className="flex gap-2">
        {images.map((item) => {
          const selected = item.src === current.src;
          return (
            <button
              key={item.src}
              type="button"
              onClick={() => onSelect(item)}
              title={item.name || item.alt || m['agent.preview.image']()}
              aria-label={item.name || item.alt || m['agent.preview.image']()}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'bg-muted size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                selected
                  ? 'border-primary'
                  : 'hover:border-border border-transparent'
              )}
            >
              <PreviewImageElement
                src={item.src}
                alt={item.alt || item.name || m['agent.preview.image']()}
                className="size-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <PageState
      headingLevel={2}
      artwork={<BrandArtwork className="text-primary mx-auto max-w-32" />}
      title={m['agent.preview.empty_title']()}
      description={m['agent.preview.empty_description']()}
      className="border-0 bg-transparent px-3 py-8 sm:px-3 sm:py-8 [&_h2]:text-xl [&_h2]:sm:text-2xl"
    />
  );
}

function PreviewImageElement({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={className} />;
}
