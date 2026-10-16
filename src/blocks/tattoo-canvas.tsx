import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import {
  TattooStencil,
  TattooTryOn,
  type CanvasToolCopy,
} from '@/components/tattoo/canvas-tools';
import { tattooExamples } from '@/content/tattoos/catalog';

function canvasCopy(): CanvasToolCopy {
  return {
    body: m['canvas.ui.body'](),
    design: m['canvas.ui.design'](),
    source: m['canvas.ui.source'](),
    fileHint: m['canvas.ui.fileHint'](),
    localNote: m['canvas.ui.localNote'](),
    chooseExample: m['canvas.ui.chooseExample'](),
    examplePlaceholder: m['canvas.ui.examplePlaceholder'](),
    loading: m['canvas.ui.loading'](),
    emptyTryOn: m['canvas.ui.emptyTryOn'](),
    emptyStencil: m['canvas.ui.emptyStencil'](),
    preview: m['canvas.ui.preview'](),
    moveHint: m['canvas.ui.moveHint'](),
    x: m['canvas.ui.x'](),
    y: m['canvas.ui.y'](),
    scale: m['canvas.ui.scale'](),
    rotation: m['canvas.ui.rotation'](),
    opacity: m['canvas.ui.opacity'](),
    removePaper: m['canvas.ui.removePaper'](),
    paperThreshold: m['canvas.ui.paperThreshold'](),
    compare: m['canvas.ui.compare'](),
    reset: m['canvas.ui.reset'](),
    download: m['canvas.ui.download'](),
    mode: m['canvas.ui.mode'](),
    thresholdMode: m['canvas.ui.thresholdMode'](),
    edgeMode: m['canvas.ui.edgeMode'](),
    threshold: m['canvas.ui.threshold'](),
    invert: m['canvas.ui.invert'](),
    resultNote: m['canvas.ui.resultNote'](),
    error: m['canvas.ui.error'](),
    fileTypeError: m['canvas.ui.fileTypeError'](),
    fileSizeError: m['canvas.ui.fileSizeError'](),
    dimensionError: m['canvas.ui.dimensionError'](),
  };
}

export function TattooCanvasTool({ mode }: { mode: 'tryon' | 'stencil' }) {
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  const stencil = mode === 'stencil';
  const copy = canvasCopy();
  if (stencil) copy.resultNote = m['canvas.stencil.note']();
  return (
    <section className="section-paper px-4 py-10 sm:px-6 sm:py-16">
      <div className="section-shell min-w-0">
        <nav
          aria-label={m['discovery.ui.breadcrumb']()}
          className="text-paper-muted mb-8 flex flex-wrap gap-2 text-sm"
        >
          <Link href="/" className="underline underline-offset-4">
            {m['canvas.home']()}
          </Link>
          <span aria-hidden>/</span>
          <Link href="/tattoo-tools" className="underline underline-offset-4">
            {m['canvas.tools']()}
          </Link>
        </nav>
        <p className="eyebrow-vermilion">{m['canvas.eyebrow']()}</p>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          {stencil
            ? m['canvas.stencil.heading']()
            : m['canvas.tryon.heading']()}
        </h1>
        <p className="text-paper-muted mt-5 max-w-3xl text-base leading-7">
          {stencil ? m['canvas.stencil.intro']() : m['canvas.tryon.intro']()}
        </p>
        <div className="mt-10">
          {stencil ? (
            <TattooStencil copy={copy} />
          ) : (
            <TattooTryOn
              copy={copy}
              examples={tattooExamples.map((item) => ({
                image: item.image,
                label: item.title[locale],
              }))}
            />
          )}
        </div>
        <aside className="border-paper-line mt-14 border-t pt-8">
          <h2 className="font-display text-2xl font-bold">
            {m['canvas.related']()}
          </h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link
              href="/tattoo-ideas"
              className="text-vermilion underline underline-offset-4"
            >
              {m['canvas.ideas']()}
            </Link>
            <Link
              href="/tattoo-tools"
              className="text-vermilion underline underline-offset-4"
            >
              {m['canvas.tools']()}
            </Link>
            <Link
              href={stencil ? '/try-tattoo' : '/tattoo-to-stencil'}
              className="text-vermilion underline underline-offset-4"
            >
              {stencil
                ? m['canvas.tryon.title']()
                : m['canvas.stencil.title']()}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
