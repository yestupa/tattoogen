import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Cross,
  Lightbulb,
  MoveHorizontal,
  PenLine,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import {
  buildFearGodTattooPrompt,
  type FearGodStyle,
} from '@/lib/fear-god-prompt';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type StyleCard = {
  key: FearGodStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function styleCards(): StyleCard[] {
  return [
    {
      key: 'gothic',
      title: m['fear.style.gothic.title'](),
      description: m['fear.style.gothic.description'](),
      alt: m['fear.style.gothic.alt'](),
      image: '/imgs/fear-god/blackletter.jpg',
    },
    {
      key: 'script',
      title: m['fear.style.script.title'](),
      description: m['fear.style.script.description'](),
      alt: m['fear.style.script.alt'](),
      image: '/imgs/fear-god/script.jpg',
    },
    {
      key: 'minimal',
      title: m['fear.style.minimal.title'](),
      description: m['fear.style.minimal.description'](),
      alt: m['fear.style.minimal.alt'](),
      image: '/imgs/fear-god/minimal.jpg',
    },
    {
      key: 'cross',
      title: m['fear.style.cross.title'](),
      description: m['fear.style.cross.description'](),
      alt: m['fear.style.cross.alt'](),
      image: '/imgs/fear-god/cross.jpg',
    },
    {
      key: 'hands',
      title: m['fear.style.hands.title'](),
      description: m['fear.style.hands.description'](),
      alt: m['fear.style.hands.alt'](),
      image: '/imgs/fear-god/praying-hands.jpg',
    },
  ];
}

const inkButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-ink-fg px-6 py-3 text-sm font-semibold text-ink-bg transition-transform hover:-translate-y-0.5';
const paperButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-paper-fg px-6 py-3 text-sm font-semibold text-paper-bg transition-transform hover:-translate-y-0.5';

export function FearGodTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] = useState<FearGodStyle>('gothic');
  const [galleryFilter, setGalleryFilter] = useState<FearGodStyle | 'all'>(
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
      icon: Lightbulb,
      title: m['fear.ways.meaning.title'](),
      description: m['fear.ways.meaning.description'](),
    },
    {
      icon: Type,
      title: m['fear.ways.lettering.title'](),
      description: m['fear.ways.lettering.description'](),
    },
    {
      icon: Cross,
      title: m['fear.ways.symbols.title'](),
      description: m['fear.ways.symbols.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['fear.ways.placement.title'](),
      description: m['fear.ways.placement.description'](),
    },
  ];
  const features = [
    {
      title: m['fear.features.lettering.title'](),
      description: m['fear.features.lettering.description'](),
    },
    {
      title: m['fear.features.directions.title'](),
      description: m['fear.features.directions.description'](),
    },
    {
      title: m['fear.features.placement.title'](),
      description: m['fear.features.placement.description'](),
    },
    {
      title: m['fear.features.artist.title'](),
      description: m['fear.features.artist.description'](),
    },
  ];
  const steps = [
    {
      title: m['fear.steps.one.title'](),
      description: m['fear.steps.one.description'](),
    },
    {
      title: m['fear.steps.two.title'](),
      description: m['fear.steps.two.description'](),
    },
    {
      title: m['fear.steps.three.title'](),
      description: m['fear.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['fear.details.lettering.title'](),
      description: m['fear.details.lettering.description'](),
    },
    {
      title: m['fear.details.composition.title'](),
      description: m['fear.details.composition.description'](),
    },
    {
      title: m['fear.details.readability.title'](),
      description: m['fear.details.readability.description'](),
    },
  ];
  const questions = [
    { question: m['fear.faq.q1'](), answer: m['fear.faq.a1']() },
    { question: m['fear.faq.q2'](), answer: m['fear.faq.a2']() },
    { question: m['fear.faq.q3'](), answer: m['fear.faq.a3']() },
    { question: m['fear.faq.q4'](), answer: m['fear.faq.a4']() },
  ];

  function chooseStyle(style: FearGodStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    document.getElementById('fear-design-idea')?.focus({ preventScroll: true });
  }

  function createDesign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const sessionId = newAgentSessionId();
    try {
      sessionStorage.setItem(
        `agent:initial-turn:${sessionId}`,
        JSON.stringify({
          prompt: buildFearGodTattooPrompt(selectedStyle, idea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['fear.generator.storage_error']());
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
            <p className="eyebrow-vermilion">{m['fear.hero.eyebrow']()}</p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3.1rem,6.2vw,6.2rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['fear.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['fear.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['fear.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['fear.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['fear.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(168,62,44,0.4)]">
              <img
                src="/imgs/fear-god/blackletter.jpg"
                alt={m['fear.hero.image_alt']()}
                width={1086}
                height={1448}
                loading="eager"
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover object-center"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="bg-vermilion rounded-sm px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                {m['fear.hero.image_badge']()}
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['fear.hero.image_caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-3">
          {[
            { value: '05', label: m['fear.stats.styles']() },
            { value: 'FEAR GOD', label: m['fear.stats.meaning']() },
            { value: '03', label: m['fear.stats.steps']() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-ink-line border-b py-6 sm:border-r sm:border-b-0 sm:px-8 sm:first:pl-0 sm:last:border-r-0"
            >
              <p className="font-display text-3xl font-bold">{stat.value}</p>
              <p className="text-ink-muted mt-2 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <p className="eyebrow-vermilion">{m['fear.ways.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.ways.title']()}
          </h2>
          <p className="text-paper-muted mt-5 max-w-2xl text-base leading-7">
            {m['fear.ways.description']()}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article
                key={item.title}
                className="border-paper-line bg-paper-panel min-h-64 rounded-xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <item.icon aria-hidden className="text-vermilion size-7" />
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
            <p className="eyebrow-vermilion">{m['fear.generator.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['fear.generator.title']()}
            </h2>
            <p className="text-ink-muted mt-6 text-base leading-8">
              {m['fear.generator.description']()}
            </p>
            <p className="border-ink-line text-ink-muted mt-9 border-t pt-5 text-sm leading-6">
              {m['fear.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['fear.generator.preview_label']()}
              </span>
              <span className="text-vermilion text-xs font-semibold">
                {selected.title}
              </span>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <fieldset>
                <legend className="text-sm font-semibold">
                  {m['fear.generator.style_label']()}
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
                          ? 'border-ink-fg bg-ink-fg text-ink-bg'
                          : 'border-ink-line text-ink-muted hover:border-ink-fg hover:text-ink-fg'
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
                <div className="bg-paper-bg flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={selected.image}
                    alt={selected.alt}
                    width={1086}
                    height={1448}
                    loading="lazy"
                    style={{ height: `${scale}%` }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-ink-muted text-xs">
                    {selected.title} · FEAR GOD
                  </span>
                  <a
                    href={selected.image}
                    download={`fear-god-tattoo-${selected.key}.jpg`}
                    className="text-ink-fg touch-target text-xs font-semibold underline underline-offset-4"
                  >
                    {m['fear.generator.save_example']()}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <label
                htmlFor="fear-design-scale"
                className="text-sm font-semibold"
              >
                {m['fear.generator.scale_label']()}
              </label>
              <output
                htmlFor="fear-design-scale"
                className="text-ink-muted text-sm"
              >
                {scale}%
              </output>
            </div>
            <input
              id="fear-design-scale"
              type="range"
              min={65}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="accent-vermilion mt-3 w-full"
            />
            <label
              htmlFor="fear-design-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['fear.generator.idea_label']()}
            </label>
            <textarea
              id="fear-design-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['fear.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['fear.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <p className="eyebrow-vermilion">{m['fear.features.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.features.title']()}
          </h2>
          <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-paper-panel p-7 sm:p-9"
              >
                <span className="text-vermilion font-display text-sm font-bold">
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
          <p className="eyebrow-vermilion">{m['fear.steps.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.steps.title']()}
          </h2>
          <ol className="border-ink-line mt-12 grid border-t md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-ink-line border-b py-7 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <span className="text-vermilion font-display text-3xl font-bold">
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
          <p className="eyebrow-vermilion">{m['fear.gallery.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.gallery.title']()}
          </h2>
          <p className="text-paper-muted mt-5 max-w-2xl text-base leading-7">
            {m['fear.gallery.description']()}
          </p>
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['fear.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['fear.gallery.all']() },
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
                <img
                  src={style.image}
                  alt={style.alt}
                  width={1086}
                  height={1448}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="p-5 sm:p-6">
                  <p className="text-vermilion text-xs font-bold tracking-[0.13em] uppercase">
                    FEAR GOD / {style.key.toUpperCase()}
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
                    {m['fear.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
            {galleryFilter === 'all' && (
              <div className="bg-vermilion flex flex-col justify-between rounded-2xl p-8 text-white">
                <p className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
                  {m['fear.gallery.cta.line1']()}
                  <br />
                  {m['fear.gallery.cta.line2']()}
                  <br />
                  {m['fear.gallery.cta.line3']()}
                </p>
                <a
                  href="#generator"
                  className="touch-target mt-12 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {m['fear.hero.primary']()}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['fear.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow-vermilion">{m['fear.placement.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['fear.placement.title']()}
            </h2>
            <p className="text-ink-muted mt-6 text-base leading-8">
              {m['fear.placement.description']()}
            </p>
            <ul className="border-ink-line mt-8 space-y-0 border-t">
              {[
                m['fear.placement.one'](),
                m['fear.placement.two'](),
                m['fear.placement.three'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-vermilion">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-ink-line bg-ink-panel overflow-hidden rounded-2xl border">
            <img
              src="/imgs/fear-god/forearm-placement.jpg"
              alt={m['fear.placement.image_alt']()}
              width={1448}
              height={1086}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['fear.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/fear-god/artist-desk.jpg"
              alt={m['fear.studio.image_alt']()}
              width={1672}
              height={941}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow-vermilion">{m['fear.studio.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['fear.studio.title']()}
            </h2>
            <p className="text-paper-muted mt-6 text-base leading-8">
              {m['fear.studio.description']()}
            </p>
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['fear.studio.one'](),
                m['fear.studio.two'](),
                m['fear.studio.three'](),
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden className="text-vermilion">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#gallery" className={cn(paperButton, 'mt-9')}>
              {m['fear.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <p className="eyebrow-vermilion">{m['fear.details.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.details.title']()}
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {details.map((detail, index) => (
              <article
                key={detail.title}
                className="border-ink-line bg-ink-panel rounded-xl border p-7"
              >
                <span className="text-vermilion font-display text-sm font-bold">
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
          <p className="eyebrow-vermilion">{m['fear.faq.eyebrow']()}</p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.faq.title']()}
          </h2>
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
                    className="text-vermilion text-2xl group-open:rotate-45"
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
          <PenLine aria-hidden className="text-vermilion mx-auto size-9" />
          <p className="eyebrow-vermilion mt-6">{m['fear.final.eyebrow']()}</p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['fear.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['fear.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['fear.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
