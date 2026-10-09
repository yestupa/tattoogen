import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Download,
  Layers3,
  MoveHorizontal,
  PenLine,
  ScanLine,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import {
  buildThroatTattooPrompt,
  type ThroatTattooStyle,
} from '@/lib/throat-tattoo-prompt';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type StyleCard = {
  key: ThroatTattooStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function styleCards(): StyleCard[] {
  return [
    {
      key: 'ornamental',
      title: m['throat.style.ornamental.title'](),
      description: m['throat.style.ornamental.description'](),
      alt: m['throat.style.ornamental.alt'](),
      image: '/imgs/throat/ornamental.webp',
    },
    {
      key: 'blackwork_wings',
      title: m['throat.style.blackwork_wings.title'](),
      description: m['throat.style.blackwork_wings.description'](),
      alt: m['throat.style.blackwork_wings.alt'](),
      image: '/imgs/throat/blackwork-wings.webp',
    },
    {
      key: 'rose',
      title: m['throat.style.rose.title'](),
      description: m['throat.style.rose.description'](),
      alt: m['throat.style.rose.alt'](),
      image: '/imgs/throat/rose.webp',
    },
    {
      key: 'snake',
      title: m['throat.style.snake.title'](),
      description: m['throat.style.snake.description'](),
      alt: m['throat.style.snake.alt'](),
      image: '/imgs/throat/snake.webp',
    },
    {
      key: 'geometric',
      title: m['throat.style.geometric.title'](),
      description: m['throat.style.geometric.description'](),
      alt: m['throat.style.geometric.alt'](),
      image: '/imgs/throat/geometric.webp',
    },
  ];
}

const inkButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-[#e9e2d2] px-6 py-3 text-sm font-bold text-[#111110] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9e2d2]';
const paperButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-paper-fg px-6 py-3 text-sm font-semibold text-paper-bg transition-transform hover:-translate-y-0.5';

function SectionHeading({
  eyebrow,
  title,
  description,
  ink = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  ink?: boolean;
}) {
  return (
    <>
      <p
        className={cn(
          'font-display text-xs font-bold tracking-[0.2em] uppercase',
          ink ? 'text-[#e9e2d2]' : 'text-[#873740]'
        )}
      >
        {eyebrow}
      </p>
      <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-5 max-w-2xl text-base leading-8',
            ink ? 'text-ink-muted' : 'text-paper-muted'
          )}
        >
          {description}
        </p>
      )}
    </>
  );
}

export function ThroatTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] =
    useState<ThroatTattooStyle>('ornamental');
  const [galleryFilter, setGalleryFilter] = useState<ThroatTattooStyle | 'all'>(
    'all'
  );
  const [scale, setScale] = useState(90);
  const [idea, setIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const styles = styleCards();
  const selected = styles.find((style) => style.key === selectedStyle)!;
  const visibleStyles =
    galleryFilter === 'all'
      ? styles
      : styles.filter((style) => style.key === galleryFilter);

  const startingPoints = [
    {
      icon: ScanLine,
      title: m['throat.ways.motif.title'](),
      description: m['throat.ways.motif.description'](),
    },
    {
      icon: Layers3,
      title: m['throat.ways.composition.title'](),
      description: m['throat.ways.composition.description'](),
    },
    {
      icon: PenLine,
      title: m['throat.ways.ink.title'](),
      description: m['throat.ways.ink.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['throat.ways.placement.title'](),
      description: m['throat.ways.placement.description'](),
    },
  ];
  const features = [
    {
      title: m['throat.features.symmetry.title'](),
      description: m['throat.features.symmetry.description'](),
    },
    {
      title: m['throat.features.negative_space.title'](),
      description: m['throat.features.negative_space.description'](),
    },
    {
      title: m['throat.features.between.title'](),
      description: m['throat.features.between.description'](),
    },
    {
      title: m['throat.features.artist.title'](),
      description: m['throat.features.artist.description'](),
    },
  ];
  const steps = [
    {
      title: m['throat.steps.one.title'](),
      description: m['throat.steps.one.description'](),
    },
    {
      title: m['throat.steps.two.title'](),
      description: m['throat.steps.two.description'](),
    },
    {
      title: m['throat.steps.three.title'](),
      description: m['throat.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['throat.details.composition.title'](),
      description: m['throat.details.composition.description'](),
    },
    {
      title: m['throat.details.ink.title'](),
      description: m['throat.details.ink.description'](),
    },
    {
      title: m['throat.details.placement.title'](),
      description: m['throat.details.placement.description'](),
    },
  ];
  const questions = [
    { question: m['throat.faq.q1'](), answer: m['throat.faq.a1']() },
    { question: m['throat.faq.q2'](), answer: m['throat.faq.a2']() },
    { question: m['throat.faq.q3'](), answer: m['throat.faq.a3']() },
    { question: m['throat.faq.q4'](), answer: m['throat.faq.a4']() },
  ];

  function chooseStyle(style: ThroatTattooStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    document.getElementById('throat-design-idea')?.focus({
      preventScroll: true,
    });
  }

  function createDesign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const sessionId = newAgentSessionId();
    try {
      sessionStorage.setItem(
        `agent:initial-turn:${sessionId}`,
        JSON.stringify({
          prompt: buildThroatTattooPrompt(selectedStyle, idea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['throat.generator.storage_error']());
      return;
    }
    setSubmitting(true);
    router.push(`/chat/${sessionId}`);
  }

  return (
    <>
      <section
        data-public-hero
        className="section-ink overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:pb-24"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[#e9e2d2] uppercase">
              {m['throat.hero.eyebrow']()}
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3.1rem,6.2vw,6.2rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['throat.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['throat.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['throat.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['throat.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['throat.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(135,55,64,0.35)]">
              <img
                src="/imgs/throat/ornamental.webp"
                alt={m['throat.hero.image_alt']()}
                width={1100}
                height={1100}
                loading="eager"
                fetchPriority="high"
                className="aspect-square w-full object-contain"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="rounded-sm bg-[#873740] px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                {m['throat.hero.image_badge']()}
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['throat.hero.image_caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '05', label: m['throat.stats.styles']() },
            { value: 'FRONT', label: m['throat.stats.motif']() },
            { value: '03', label: m['throat.stats.steps']() },
            { value: 'HD', label: m['throat.stats.examples']() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-ink-line border-b py-6 sm:border-r sm:px-6 sm:last:border-r-0 lg:border-b-0 lg:first:pl-0"
            >
              <p className="font-display text-2xl font-bold sm:text-3xl">
                {stat.value}
              </p>
              <p className="text-ink-muted mt-2 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['throat.ways.eyebrow']()}
            title={m['throat.ways.title']()}
            description={m['throat.ways.description']()}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article
                key={item.title}
                className="border-paper-line bg-paper-panel min-h-64 rounded-xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <item.icon aria-hidden className="size-7 text-[#873740]" />
                  <span className="text-paper-muted font-display text-xs font-bold">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-display mt-10 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-paper-muted mt-3 text-sm leading-6">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="generator"
        className="section-ink scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading
              ink
              eyebrow={m['throat.generator.eyebrow']()}
              title={m['throat.generator.title']()}
              description={m['throat.generator.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['throat.features.symmetry.title'](),
                m['throat.features.negative_space.title'](),
                m['throat.features.artist.title'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#e9e2d2]">
                    ✦
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-8 text-sm leading-7">
              {m['throat.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['throat.generator.preview_label']()}
              </span>
              <span className="text-xs font-semibold text-[#e9e2d2]">
                {selected.title}
              </span>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <fieldset>
                <legend className="text-sm font-semibold">
                  {m['throat.generator.style_label']()}
                </legend>
                <div className="mt-3 grid gap-2">
                  {styles.map((style, index) => (
                    <button
                      key={style.key}
                      type="button"
                      onClick={() => setSelectedStyle(style.key)}
                      aria-pressed={style.key === selectedStyle}
                      className={cn(
                        'touch-target flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                        style.key === selectedStyle
                          ? 'border-[#e9e2d2] bg-[#e9e2d2] text-[#111110]'
                          : 'border-ink-line text-ink-muted hover:text-ink-fg hover:border-[#e9e2d2]'
                      )}
                    >
                      <span>{style.title}</span>
                      <span className="font-display text-xs opacity-60">
                        0{index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <div className="bg-paper-bg flex aspect-square items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={selected.image}
                    alt={selected.alt}
                    width={1100}
                    height={1100}
                    loading="lazy"
                    style={{ height: `${scale}%` }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-ink-muted text-xs">
                    {selected.title} · THROAT TATTOO
                  </span>
                  <a
                    href={selected.image}
                    download={`throat-tattoo-${selected.key}.webp`}
                    className="text-ink-fg touch-target inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"
                  >
                    <Download aria-hidden className="size-3" />
                    {m['throat.generator.save_example']()}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <label
                htmlFor="throat-design-scale"
                className="text-sm font-semibold"
              >
                {m['throat.generator.scale_label']()}
              </label>
              <output
                htmlFor="throat-design-scale"
                className="text-ink-muted text-sm"
              >
                {scale}%
              </output>
            </div>
            <input
              id="throat-design-scale"
              type="range"
              min={65}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="mt-3 w-full accent-[#e9e2d2]"
            />
            <label
              htmlFor="throat-design-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['throat.generator.idea_label']()}
            </label>
            <textarea
              id="throat-design-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['throat.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['throat.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['throat.features.eyebrow']()}
            title={m['throat.features.title']()}
          />
          <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-paper-panel p-7 sm:p-9"
              >
                <span className="font-display text-sm font-bold text-[#873740]">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-8 text-2xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-paper-muted mt-3 text-sm leading-7">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            ink
            eyebrow={m['throat.steps.eyebrow']()}
            title={m['throat.steps.title']()}
          />
          <ol className="border-ink-line mt-12 grid border-t md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-ink-line border-b py-7 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <span className="font-display text-3xl font-bold text-[#e9e2d2]">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-10 text-2xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-ink-muted mt-3 text-sm leading-7">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="gallery"
        className="section-paper scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['throat.gallery.eyebrow']()}
            title={m['throat.gallery.title']()}
            description={m['throat.gallery.description']()}
          />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['throat.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['throat.gallery.all']() },
              ...styles,
            ].map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => setGalleryFilter(style.key)}
                aria-pressed={galleryFilter === style.key}
                className={cn(
                  'touch-target rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  galleryFilter === style.key
                    ? 'border-paper-fg bg-paper-fg text-paper-bg'
                    : 'border-paper-line text-paper-muted hover:border-paper-fg hover:text-paper-fg'
                )}
              >
                {style.title}
              </button>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleStyles.map((style) => (
              <article
                key={style.key}
                className="border-paper-line bg-paper-panel overflow-hidden rounded-2xl border"
              >
                <div className="bg-paper-bg flex aspect-square items-center justify-center">
                  <img
                    src={style.image}
                    alt={style.alt}
                    width={1100}
                    height={1100}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold tracking-[0.13em] text-[#873740] uppercase">
                    THROAT TATTOO / {style.key.replace('_', ' ')}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-semibold">
                    {style.title}
                  </h3>
                  <p className="text-paper-muted mt-2 min-h-12 text-sm leading-6">
                    {style.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => chooseStyle(style.key)}
                    className="touch-target text-paper-fg mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    {m['throat.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
            {galleryFilter === 'all' && (
              <div className="flex flex-col justify-between rounded-2xl bg-[#873740] p-8 text-white">
                <p className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
                  {m['throat.gallery.cta.line1']()}
                  <br />
                  {m['throat.gallery.cta.line2']()}
                  <br />
                  {m['throat.gallery.cta.line3']()}
                </p>
                <a
                  href="#generator"
                  className="touch-target mt-12 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {m['throat.hero.primary']()}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['throat.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              ink
              eyebrow={m['throat.placement.eyebrow']()}
              title={m['throat.placement.title']()}
              description={m['throat.placement.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['throat.placement.one'](),
                m['throat.placement.two'](),
                m['throat.placement.three'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#e9e2d2]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-ink-line bg-ink-panel overflow-hidden rounded-2xl border">
            <img
              src="/imgs/throat/front-neck-placement.webp"
              alt={m['throat.placement.image_alt']()}
              width={1280}
              height={960}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['throat.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/throat/artist-desk.webp"
              alt={m['throat.studio.image_alt']()}
              width={1280}
              height={720}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={m['throat.studio.eyebrow']()}
              title={m['throat.studio.title']()}
              description={m['throat.studio.description']()}
            />
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['throat.studio.one'](),
                m['throat.studio.two'](),
                m['throat.studio.three'](),
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden className="text-[#873740]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#gallery" className={cn(paperButton, 'mt-9')}>
              {m['throat.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            ink
            eyebrow={m['throat.details.eyebrow']()}
            title={m['throat.details.title']()}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {details.map((detail, index) => (
              <article
                key={detail.title}
                className="border-ink-line bg-ink-panel rounded-xl border p-7"
              >
                <span className="font-display text-sm font-bold text-[#e9e2d2]">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-9 text-2xl font-semibold">
                  {detail.title}
                </h3>
                <p className="text-ink-muted mt-3 text-sm leading-7">
                  {detail.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell max-w-4xl">
          <SectionHeading
            eyebrow={m['throat.faq.eyebrow']()}
            title={m['throat.faq.title']()}
          />
          <div className="border-paper-line mt-10 border-t">
            {questions.map((item) => (
              <details
                key={item.question}
                className="border-paper-line group border-b py-5"
              >
                <summary className="font-display touch-target flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold marker:content-none">
                  {item.question}
                  <span
                    aria-hidden
                    className="text-2xl text-[#873740] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-paper-muted max-w-3xl pt-2 pb-3 text-sm leading-7">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="section-shell max-w-3xl">
          <PenLine aria-hidden className="mx-auto size-9 text-[#e9e2d2]" />
          <p className="font-display mt-6 text-xs font-bold tracking-[0.2em] text-[#e9e2d2] uppercase">
            {m['throat.final.eyebrow']()}
          </p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['throat.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['throat.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['throat.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
