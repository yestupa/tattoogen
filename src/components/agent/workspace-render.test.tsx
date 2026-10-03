import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route as LibraryRoute } from '@/routes/(agent)/library';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaultComposerSettings } from '@/lib/agent-settings';

import { ChatComposer } from './chat-composer';
import { ChatTranscript } from './chat-transcript';
import { PreviewPane } from './preview-pane';

// SSR does not run effects. Capture the real component's mount callbacks so
// its responsive decision can be exercised without adding a DOM dependency.
const mountEffects = vi.hoisted(() => [] as (() => unknown)[]);
const effectDependencies = vi.hoisted(
  () => [] as (readonly unknown[] | undefined)[]
);
const stateUpdates = vi.hoisted(() => [] as unknown[]);
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useEffect: (effect: () => unknown, dependencies?: readonly unknown[]) => {
      mountEffects.push(effect);
      effectDependencies.push(dependencies);
    },
    useState: (initial: unknown) => {
      const [value, setValue] = react.useState(initial);
      return [
        value,
        (update: unknown) => {
          stateUpdates.push(update);
          setValue(update);
        },
      ];
    },
  };
});

const preview = vi.hoisted(() => ({
  open: true,
  setOpen: vi.fn(),
  image: null as null | { src: string; name: string; alt: string },
  images: [] as { src: string; name: string; alt: string }[],
  openImage: vi.fn(),
  clearImage: vi.fn(),
  setImages: vi.fn(),
  annotationHandler: null,
}));
vi.mock('@/components/agent/preview-pane-context', () => ({
  usePreviewPane: () => preview,
}));
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ open: true, setOpen: vi.fn() }),
}));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
vi.mock('@/core/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/i18n/navigation')>()),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/components/agent/agent-header-context', () => ({
  useAgentHeader: () => ({ setContent: vi.fn() }),
}));

describe('workspace rendered semantics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([390, 768, 1440])(
    'enters Library at %i with matching responsive preview and clears the previous selection',
    (width) => {
      mountEffects.length = 0;
      effectDependencies.length = 0;
      preview.setOpen.mockClear();
      preview.clearImage.mockClear();
      const LibraryPage = LibraryRoute.options.component!;
      renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <LibraryPage />
        </QueryClientProvider>
      );
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: width >= 768 }),
      });
      const lifecycleIndex = effectDependencies.findIndex(
        (deps) =>
          deps?.includes(preview.clearImage) && deps.includes(preview.setImages)
      );
      expect(lifecycleIndex).toBeGreaterThanOrEqual(0);
      mountEffects[lifecycleIndex]();
      expect(preview.setOpen).toHaveBeenLastCalledWith(width >= 768);
      expect(preview.clearImage).toHaveBeenCalledOnce();
    }
  );

  it.each([768, 1440])(
    'clamps a previously wide preview to half the %i viewport',
    (width) => {
      mountEffects.length = 0;
      stateUpdates.length = 0;
      renderToStaticMarkup(<PreviewPane />);
      const listeners = new Map<string, () => void>();
      vi.stubGlobal('window', {
        innerWidth: width,
        matchMedia: () => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
        addEventListener: (event: string, handler: () => void) =>
          listeners.set(event, handler),
        removeEventListener: vi.fn(),
      });
      // Run the actual PreviewPane effects to obtain its resize state updater.
      mountEffects.forEach((effect) => effect());
      listeners.get('resize')!();
      const update = stateUpdates.find(
        (value) => typeof value === 'function'
      ) as (current: number) => number;
      expect(update).toBeTypeOf('function');
      expect(update(1040)).toBeLessThanOrEqual(width / 2);
      expect(update(1040)).toBe(width / 2);
    }
  );

  it.each([
    { width: 390, hasExplicitPreview: false, expected: false },
    { width: 390, hasExplicitPreview: true, expected: true },
    { width: 768, hasExplicitPreview: false, expected: true },
    { width: 768, hasExplicitPreview: true, expected: true },
    { width: 1440, hasExplicitPreview: false, expected: true },
    { width: 1440, hasExplicitPreview: true, expected: true },
  ])(
    'mounts preview at $width with explicit intent $hasExplicitPreview as $expected',
    ({ width, hasExplicitPreview, expected }) => {
      mountEffects.length = 0;
      preview.setOpen.mockClear();
      renderToStaticMarkup(<PreviewPane {...{ hasExplicitPreview }} />);
      vi.stubGlobal('window', {
        matchMedia: () => ({
          matches: width >= 768,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      });
      mountEffects[0]();
      expect(preview.setOpen).toHaveBeenLastCalledWith(expected);
    }
  );

  it('renders a named complementary gallery with a secondary empty heading', () => {
    const html = renderToStaticMarkup(<PreviewPane />);
    expect(html).toMatch(/<aside aria-label="[^"]+"/);
    expect(html).toContain('<h2');
    expect(html).not.toContain('<h1');
    expect(html).toContain('data-brand-artwork');
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders the selected real image, its metadata, and the original download proxy', () => {
    preview.image = {
      src: '/fixture-result.svg',
      name: 'Botanical flash',
      alt: 'Fine line rose',
    };
    preview.images = [preview.image];
    const html = renderToStaticMarkup(<PreviewPane />);
    expect(html).toContain('src="/fixture-result.svg"');
    expect(html).toContain('Botanical flash');
    expect(html).toContain('Fine line rose');
    expect(html).toContain('/api/storage/download?url=%2Ffixture-result.svg');
    expect(html).toContain('download="Botanical flash"');
    preview.image = null;
    preview.images = [];
  });

  it('renders a labelled prompt and disabled submit, then switches to the stop action', () => {
    const props = {
      value: '',
      onValueChange: vi.fn(),
      onSubmit: vi.fn(),
      placeholder: 'Describe your tattoo',
      attachments: [],
      onAddFiles: vi.fn(),
      onAddLibraryImages: vi.fn(),
      onRemoveAttachment: vi.fn(),
      settings: defaultComposerSettings(),
      onSettingsChange: vi.fn(),
      submitDisabled: true,
    };
    const render = (streaming: boolean) =>
      renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <ChatComposer {...props} streaming={streaming} onStop={vi.fn()} />
        </QueryClientProvider>
      );
    const idle = render(false);
    expect(idle).toContain('aria-label="Describe your tattoo"');
    expect(idle).toMatch(/type="submit"[^>]*disabled=""/);
    expect(idle).toContain('size-11');
    const running = render(true);
    expect(running).not.toContain('type="submit"');
    expect(running).toContain('aria-label="Stop generating"');
  });

  it('renders a busy transcript with a polite streaming announcement and no injected h1', () => {
    const html = renderToStaticMarkup(
      <ChatTranscript
        messages={[]}
        streaming
        sessionId="fixture"
        attachedImages={new Map()}
        surfacedSrcs={new Set()}
      />
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status" aria-live="polite"');
    expect(html).not.toContain('<h1');
  });
});
