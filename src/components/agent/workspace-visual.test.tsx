import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PageState } from '../page-state';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('agent workspace presentation contract', () => {
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
  });

  it('announces streaming, keeps annotations, and honors reduced motion', () => {
    const transcript = source('./chat-transcript.tsx');
    expect(transcript).toContain('aria-busy={streaming}');
    expect(transcript).toContain('role="status"');
    expect(transcript).toContain('motion-safe:animate-spin');
    expect(transcript).toContain('usePreviewPane');
    expect(transcript).toContain('surfacedSrcs');
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
