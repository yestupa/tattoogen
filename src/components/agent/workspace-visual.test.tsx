import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PageState } from '../page-state';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('agent workspace presentation contract', () => {
  it('loads persisted history once per session without depending on each new navigation wrapper', () => {
    const route = source('../../routes/(agent)/chat/$sessionId.tsx');
    const history = route
      .split('// Load any persisted history')[1]
      .split('const send = useCallback')[0];
    expect(history).toContain('routerRef.current.replace');
    expect(history).toContain('}, [sessionId]);');
    expect(history).not.toContain('[sessionId, router]');
    expect(history).toContain('if (cancelled) return;');
    expect(history).toContain('seedRun(sessionId, storedToMessages(stored))');
  });
  it('keeps the PageState default heading compatible', () => {
    const html = renderToStaticMarkup(
      <PageState title="Empty" description="Start a design" />
    );
    expect(html).toContain('<h1');
  });

  it('renders an embedded empty state without adding a second page heading', () => {
    const html = renderToStaticMarkup(
      <PageState
        {...{ headingLevel: 2 }}
        title="Gallery"
        description="Your results appear here"
      />
    );
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
  });

  it('retains the guarded main workspace and exposes named navigation', () => {
    const layout = source('./agent-layout.tsx');
    expect(layout).toContain('SidebarInset');
    expect(layout).toContain('isPending || !userId');
    expect(layout).toContain("router.push('/sign-in')");
    expect(source('./chats-sidebar.tsx')).toContain('aria-label={m');
    expect(source('./chats-sidebar.tsx')).toContain('<nav');
    expect(source('./chats-sidebar.tsx')).toContain('right-2 z-10');
    expect(layout).toContain('window.matchMedia');
    expect(layout).toContain('1280');
    expect(layout).toContain('body:has([data-agent-workspace])');
  });

  it('uses the black ink shell with a warm paper working surface', () => {
    const layout = source('./agent-layout.tsx');
    expect(layout).toContain('bg-sidebar');
    expect(layout).toContain('paper-ui');
    expect(layout).toContain('bg-paper-bg');
    expect(layout).toContain('font-display');

    const sidebar = source('./chats-sidebar.tsx');
    expect(sidebar).toContain('text-sidebar-foreground');
    expect(sidebar).toContain('font-display');
  });

  it('keeps a tablet preview and uses an accessible mobile sheet', () => {
    const preview = source('./preview-pane.tsx');
    expect(preview).toContain('SheetContent');
    expect(preview).toContain('SheetTitle');
    expect(preview).toContain('useIsMobile');
    expect(preview).toContain('768');
    expect(preview).toContain('PageState');
    expect(preview).toContain('headingLevel={2}');
    expect(preview).toContain('annotationHandler({ source: current, guide })');
    expect(preview).toContain('/api/storage/download?url=');
    expect(preview).toContain('paper-ui');
    expect(preview).toContain('bg-paper-panel');
  });

  it('resets each client session to a visible tablet preview while clearing old images', () => {
    const route = source('../../routes/(agent)/chat/$sessionId.tsx');
    const defaults = route.match(
      /setPreviewOpen\(\s*window\.matchMedia\('\(min-width: 768px\)'\)\.matches\s*\)/g
    );
    expect(defaults).toHaveLength(2);
    for (const width of [390, 768, 1440]) {
      const window = {
        matchMedia: () => ({ matches: width >= 768 }),
      };
      let open = true;
      const setPreviewOpen = (next: boolean) => {
        open = next;
      };
      // Exercise the exact route-reset expression for both session effects.
      for (const reset of defaults ?? []) {
        new Function('window', 'setPreviewOpen', reset)(window, setPreviewOpen);
        expect(open).toBe(width >= 768);
      }
    }
    expect(route).toContain('if (search.preview) return;');
    expect(route.match(/clearPreviewImage\(\);/g)).toHaveLength(2);
    expect(route.match(/setPreviewImages\(\[\]\);/g)).toHaveLength(2);
  });

  it('keeps user-opened tablet navigation offcanvas without desktop auto-collapse', () => {
    const preview = source('./preview-pane.tsx');
    expect(preview).toContain('if (window.innerWidth < 1280) return;');
    const layout = source('./agent-layout.tsx');
    expect(layout).toContain('(min-width: 768px) and (max-width: 1279px)');
    expect(layout).toContain('[data-slot="sidebar-gap"]');
    expect(layout).toContain('width: 0;');
    expect(source('./chats-sidebar.tsx')).toContain(
      'isMobile ? setOpenMobile(false) : setOpen(false)'
    );
  });

  it('includes annotation popovers in Agent-only mobile touch sizing', () => {
    const layout = source('./agent-layout.tsx');
    expect(layout).toContain('body:has([data-agent-workspace])');
    expect(layout).toContain('[data-slot="popover-content"]');
    expect(layout).toContain('min-height: 44px;');
    expect(layout).toContain('min-width: 44px;');
    const annotation = source('./image-annotation.tsx');
    expect(annotation).toContain('flex shrink-0 flex-col items-stretch');
    expect(annotation).toContain('aria-label={option}');
    expect(annotation).toContain('aria-pressed={color === option}');
  });

  it('labels the prompt and retains all composer controls and callbacks', () => {
    const composer = source('./chat-composer.tsx');
    expect(composer).toContain('aria-label={placeholder}');
    expect(composer).toContain('size-11');
    for (const contract of [
      'onStop',
      'onAddFiles(images)',
      'onAddLibraryImages(images)',
      'onRemoveAttachment(item.id)',
      'ComposerSettings',
      'ComposerControls',
      'e.nativeEvent.isComposing',
      'disabled={disabled || submitDisabled}',
    ]) {
      expect(composer).toContain(contract);
    }
    expect(source('./composer-settings.tsx')).toContain(
      'aria-pressed={active}'
    );
    expect(composer).toContain('bg-paper-panel');
    expect(composer).toContain('border-paper-line');
  });

  it('announces streaming, keeps annotations, and honors reduced motion', () => {
    const transcript = source('./chat-transcript.tsx');
    expect(transcript).toContain('aria-busy={streaming}');
    expect(transcript).toContain('role="status"');
    expect(transcript).toContain('motion-safe:animate-spin');
    expect(transcript).toContain('usePreviewPane');
    expect(transcript).toContain('surfacedSrcs');
    expect(transcript).toContain('bg-vermilion/10');
    expect(transcript).toContain('font-display');
  });

  it('keeps both chat entry points on the shared paper workspace', () => {
    expect(source('../../routes/(agent)/chat/index.tsx')).toContain(
      'paper-texture'
    );
    const session = source('../../routes/(agent)/chat/$sessionId.tsx');
    expect(session).toContain('bg-paper-bg');
    expect(session).toContain('border-paper-line');
  });

  it('uses shared empty states in collection and editor routes without changing queries', () => {
    for (const name of ['chats', 'library', 'editor']) {
      expect(source(`../../routes/(agent)/${name}.tsx`)).toContain('PageState');
    }
    expect(source('../../routes/(agent)/chats.tsx')).toContain(
      'openRename(chat)'
    );
    expect(source('../../routes/(agent)/chats.tsx')).toContain(
      'openDelete(chat)'
    );
    expect(source('../../routes/(agent)/library.tsx')).toContain(
      'useInfiniteQuery'
    );
  });

  it('preserves launcher authentication, session handoff, examples and intrinsic image dimensions', () => {
    const launcher = source('./prompt-launcher.tsx');
    expect(launcher.match(/touch-target/g)?.length).toBeGreaterThanOrEqual(2);
    for (const contract of [
      'if (!session?.user)',
      'agent:initial-turn:',
      'applyExample(example)',
      'width={512}',
      'height={512}',
    ])
      expect(launcher).toContain(contract);
    expect(launcher.match(/<h1\b/g)).toHaveLength(1);
    expect(source('./upgrade-dialog.tsx')).toContain(
      '<Pricing compact redirect="/chat" />'
    );
  });
});
