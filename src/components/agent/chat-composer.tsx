import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Images,
  Loader2,
  Paperclip,
  Plus,
  Square,
  X,
} from 'lucide-react';

import { imageFilesFromClipboard, type PendingAttachment } from '@/lib/agent';
import { type AgentComposerSettings } from '@/lib/agent-settings';
import { apiGet } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { ComposerControls } from '@/components/agent/composer-controls';
import { ComposerSettings } from '@/components/agent/composer-settings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface LibraryAttachment {
  id: string;
  src: string;
  name: string;
  alt: string;
}

interface LibraryData {
  images?: LibraryAttachment[];
  nextCursor?: string;
}

/**
 * The prompt input shared by the launcher (landing hero + /chat) and the
 * chat session page: image thumbnails, "+" menu for local uploads, paste-to-
 * upload, model settings and submit. The owner keeps the state — this only
 * renders it.
 */
export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  attachments,
  onAddFiles,
  onAddLibraryImages,
  onRemoveAttachment,
  settings,
  onSettingsChange,
  disabled = false,
  submitDisabled = false,
  streaming = false,
  onStop,
  collapsible = false,
  size = 'lg',
  toolbarExtra,
  textareaRef,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  attachments: PendingAttachment[];
  onAddFiles: (files: File[]) => void;
  onAddLibraryImages: (images: LibraryAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  settings: AgentComposerSettings;
  onSettingsChange: (settings: AgentComposerSettings) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  /** A turn is in flight: submit turns into a stop button. */
  streaming?: boolean;
  onStop?: () => void;
  /** Start as a single-line pill and open on click (the chat page). */
  collapsible?: boolean;
  /** `lg` on the start screens, `sm` for the follow-up box in a session. */
  size?: 'sm' | 'lg';
  /** Rendered next to the "+" menu (e.g. the selected example category). */
  toolbarExtra?: ReactNode;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textarea = textareaRef ?? ownTextareaRef;
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Removing an attachment while zoomed shouldn't leave a dangling index.
  const zoomed = zoomIndex !== null && !!attachments[zoomIndex];

  // Under a transcript the composer is one line until it's needed: the full
  // box (model, ratio, quality) is a lot of furniture to park over the
  // conversation when the next message is usually a sentence. Anything that
  // means work is pending — typed text, an attachment — keeps it open.
  const collapsed =
    collapsible && !expanded && !value.trim() && attachments.length === 0;

  // The collapsed pill has no textarea to focus, so focus it once it exists.
  useEffect(() => {
    if (collapsible && expanded) textarea.current?.focus();
  }, [collapsible, expanded, textarea]);

  const submit = () => {
    onSubmit();
    // Back to one line for the next message — but only when there was
    // something to send, or a blocked submit would fold the box away.
    if (value.trim() || attachments.some((item) => item.status === 'uploaded'))
      setExpanded(false);
  };

  // Mid-turn the same slot stops the run — a generation can take a minute,
  // and waiting one out for a prompt you've already changed your mind about
  // is the worst part of the wait.
  const actionButton =
    streaming && onStop ? (
      <Button
        type="button"
        size="icon"
        onClick={onStop}
        aria-label={m['agent.chat.stop']()}
        title={m['agent.chat.stop']()}
        className="size-8 shrink-0 rounded-full"
      >
        <Square className="size-3 fill-current" />
      </Button>
    ) : (
      <Button
        type="submit"
        size="icon"
        aria-label={m['agent.home.submit']()}
        disabled={disabled || submitDisabled}
        className="size-8 shrink-0 rounded-full"
      >
        <ArrowUp className="size-4" />
      </Button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onBlur={(event) => {
        // Focus leaving an empty composer folds it back to one line. Menus
        // and dialogs are portalled out of this form, so focus landing in one
        // reads as "left the composer" — check for that before collapsing, or
        // picking a model would close the box the menu is anchored to.
        if (!collapsible || !expanded) return;
        if (value.trim() || attachments.length > 0) return;
        const next = event.relatedTarget as HTMLElement | null;
        if (next) {
          if (event.currentTarget.contains(next)) return;
          if (
            next.closest(
              '[data-slot="dropdown-menu-content"],[data-slot="dropdown-menu-sub-content"],[data-slot="dialog-content"],[data-slot="popover-content"]'
            )
          )
            return;
        }
        setExpanded(false);
      }}
      className={cn(
        'border-border bg-card rounded-3xl border shadow-sm transition-shadow focus-within:shadow-md',
        className
      )}
    >
      {collapsed && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setExpanded(true)}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setExpanded(true);
            }
          }}
          className="flex cursor-text items-center gap-2 px-3 py-2.5"
        >
          <span
            aria-hidden
            className="border-border text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full border"
          >
            <Plus className="size-4" />
          </span>
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
            {placeholder}
          </span>
          {actionButton}
        </div>
      )}

      {!collapsed && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {attachments.map((item, index) => (
            <div
              key={item.id}
              className="border-border bg-background relative size-16 overflow-hidden rounded-md border"
              title={item.error || item.name}
            >
              <button
                type="button"
                onClick={() => setZoomIndex(index)}
                className="block size-full cursor-zoom-in"
                aria-label={m['agent.composer.zoom_image']()}
              >
                <img
                  src={item.preview}
                  alt={item.name}
                  className={cn(
                    'size-full object-cover',
                    item.status === 'error' && 'opacity-50'
                  )}
                />
              </button>
              {item.status === 'uploading' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                  <Loader2 className="size-4 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemoveAttachment(item.id)}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label={m['landing.hero.remove_image']()}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {zoomed && (
        <AttachmentLightbox
          attachments={attachments}
          index={zoomIndex!}
          onIndexChange={setZoomIndex}
          onClose={() => setZoomIndex(null)}
        />
      )}

      <textarea
        ref={textarea}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onPaste={(e) => {
          const images = imageFilesFromClipboard(e.clipboardData);
          if (images.length === 0) return;
          e.preventDefault();
          onAddFiles(images);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        rows={size === 'lg' ? 3 : 2}
        disabled={disabled}
        className={cn(
          'text-foreground placeholder:text-muted-foreground w-full resize-none rounded-3xl bg-transparent px-4 pt-4 pb-2 leading-relaxed focus:outline-none',
          size === 'lg' ? 'min-h-[92px] text-sm' : 'min-h-[64px] text-sm',
          collapsed && 'hidden'
        )}
      />

      {/* Wraps on narrow screens: "+" + category chip + model + settings +
          submit is wider than a 390px viewport. */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 px-3 pb-3',
          collapsed && 'hidden'
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={disabled}
                  aria-label={m['agent.home.attach']()}
                  className="text-muted-foreground size-8 rounded-full"
                />
              }
            >
              <Plus className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Paperclip className="size-4" />
                {m['landing.hero.upload_local']()}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLibraryOpen(true)}
                className="gap-2"
              >
                <Images className="size-4" />
                {m['agent.composer.add_from_library']()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              onAddFiles(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = '';
            }}
          />
          {toolbarExtra}
        </div>
        {/* ml-auto keeps this group right-aligned after the row wraps. */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <ComposerControls
            settings={settings}
            onChange={onSettingsChange}
            disabled={disabled}
          />
          <ComposerSettings
            settings={settings}
            onChange={onSettingsChange}
            disabled={disabled}
          />
          {actionButton}
        </div>
      </div>

      <LibraryPicker
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onAdd={(images) => {
          onAddLibraryImages(images);
          setLibraryOpen(false);
        }}
      />
    </form>
  );
}

/** Select already-generated images without asking the user to upload again. */
function LibraryPicker({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (images: LibraryAttachment[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const libraryQuery = useInfiniteQuery({
    queryKey: ['agent-library', 'composer-picker'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      apiGet<LibraryData>(
        pageParam
          ? `/api/agent/library?limit=30&cursor=${encodeURIComponent(pageParam)}`
          : '/api/agent/library?limit=30'
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: open,
  });
  const images =
    libraryQuery.data?.pages.flatMap((page) => page.images ?? []) ?? [];

  useEffect(() => {
    if (!open) setSelectedIds(new Set());
  }, [open]);

  function toggleImage(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selected = images.filter((image) => selectedIds.has(image.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(80dvh,46rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m['agent.composer.library_title']()}</DialogTitle>
          <DialogDescription>
            {m['agent.composer.library_description']()}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain pr-1">
          {libraryQuery.isLoading ? (
            <LibraryPickerState text={m['agent.library.loading']()} />
          ) : libraryQuery.isError ? (
            <LibraryPickerState
              text={m['agent.composer.library_load_failed']()}
            />
          ) : images.length === 0 ? (
            <LibraryPickerState text={m['agent.composer.library_empty']()} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => {
                  const selected = selectedIds.has(image.id);
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => toggleImage(image.id)}
                      aria-pressed={selected}
                      className={cn(
                        'group border-border bg-muted focus-visible:ring-ring relative aspect-square overflow-hidden rounded-md border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
                        selected && 'border-primary ring-primary/30 ring-2'
                      )}
                    >
                      <img
                        src={image.src}
                        alt={image.alt || image.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                      {selected && (
                        <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full shadow-sm">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {libraryQuery.hasNextPage && (
                <div className="mt-3 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => libraryQuery.fetchNextPage()}
                    disabled={libraryQuery.isFetchingNextPage}
                  >
                    {libraryQuery.isFetchingNextPage
                      ? m['agent.library.loading']()
                      : m['agent.library.load_more']()}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onAdd(selected)}
            disabled={selected.length === 0}
          >
            {m['agent.composer.add_selected']({ count: selected.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LibraryPickerState({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 px-6 text-center text-sm">
      <ImageIcon className="size-5" />
      <p>{text}</p>
    </div>
  );
}

/**
 * Full-screen viewer for the composer's attachments: click a thumbnail to
 * zoom, arrow keys or the side buttons to move between them, Esc or a click
 * on the backdrop to close. Self-contained rather than reusing the chat's
 * preview pane, because the composer also runs on the landing page, outside
 * the agent layout that provides it.
 */
function AttachmentLightbox({
  attachments,
  index,
  onIndexChange,
  onClose,
}: {
  attachments: PendingAttachment[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const total = attachments.length;
  const current = attachments[index];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (total < 2) return;
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total);
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % total);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, total, onIndexChange, onClose]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={m['agent.composer.close_zoom']()}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange((index - 1 + total) % total);
            }}
            aria-label={m['agent.composer.previous_image']()}
            className="absolute left-4 flex size-9 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange((index + 1) % total);
            }}
            aria-label={m['agent.composer.next_image']()}
            className="absolute right-4 flex size-9 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
          <span className="absolute bottom-6 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white">
            {index + 1} / {total}
          </span>
        </>
      )}

      {/* Clicks on the image itself shouldn't dismiss the viewer. */}
      <img
        src={current.preview}
        alt={current.name}
        onClick={(event) => event.stopPropagation()}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
