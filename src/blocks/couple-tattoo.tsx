import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Download,
  Heart,
  Link2,
  MoveHorizontal,
  PenLine,
  ScanLine,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import { buildCoupleTattooPrompt, type CoupleStyle } from '@/lib/couple-prompt';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type PairCard = {
  key: CoupleStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function pairCards(): PairCard[] {
  return [
    {
      key: 'sun_moon',
      title: m['couple.style.sun_moon.title'](),
      description: m['couple.style.sun_moon.description'](),
      alt: m['couple.style.sun_moon.alt'](),
      image: '/imgs/couple/sun-moon.webp',
    },
    {
      key: 'matching_hearts',
      title: m['couple.style.matching_hearts.title'](),
      description: m['couple.style.matching_hearts.description'](),
      alt: m['couple.style.matching_hearts.alt'](),
      image: '/imgs/couple/matching-hearts.webp',
    },
    {
      key: 'botanical',
      title: m['couple.style.botanical.title'](),
      description: m['couple.style.botanical.description'](),
      alt: m['couple.style.botanical.alt'](),
      image: '/imgs/couple/botanical.webp',
    },
    {
      key: 'swallows',
      title: m['couple.style.swallows.title'](),
      description: m['couple.style.swallows.description'](),
      alt: m['couple.style.swallows.alt'](),
      image: '/imgs/couple/swallows.webp',
    },
    {
      key: 'mountain_wave',
      title: m['couple.style.mountain_wave.title'](),
      description: m['couple.style.mountain_wave.description'](),
      alt: m['couple.style.mountain_wave.alt'](),
      image: '/imgs/couple/mountain-wave.webp',
    },
  ];
}

const accent = '#cda7a3';
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
          ink ? 'text-[#cda7a3]' : 'text-[#966b69]'
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

export function CoupleTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] = useState<CoupleStyle>('sun_moon');
  const [galleryFilter, setGalleryFilter] = useState<CoupleStyle | 'all'>(
    'all'
  );
  const [scale, setScale] = useState(90);
  const [idea, setIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pairs = pairCards();
  const selected = pairs.find((pair) => pair.key === selectedStyle)!;
  const visiblePairs =
    galleryFilter === 'all'
      ? pairs
      : pairs.filter((pair) => pair.key === galleryFilter);

  const startingPoints = [
    {
      icon: Heart,
      title: m['couple.ways.matching.title'](),
      description: m['couple.ways.matching.description'](),
    },
    {
      icon: Link2,
      title: m['couple.ways.complementary.title'](),
      description: m['couple.ways.complementary.description'](),
    },
    {
      icon: ScanLine,
      title: m['couple.ways.both.title'](),
      description: m['couple.ways.both.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['couple.ways.details.title'](),
      description: m['couple.ways.details.description'](),
    },
  ];
  const features = [
    {
      title: m['couple.features.complete.title'](),
      description: m['couple.features.complete.description'](),
    },
    {
      title: m['couple.features.choice.title'](),
      description: m['couple.features.choice.description'](),
    },
    {
      title: m['couple.features.ink.title'](),
      description: m['couple.features.ink.description'](),
    },
    {
      title: m['couple.features.placement.title'](),
      description: m['couple.features.placement.description'](),
    },
  ];
  const steps = [
    {
      title: m['couple.steps.one.title'](),
      description: m['couple.steps.one.description'](),
    },
    {
      title: m['couple.steps.two.title'](),
      description: m['couple.steps.two.description'](),
    },
    {
      title: m['couple.steps.three.title'](),
      description: m['couple.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['couple.details.line.title'](),
      description: m['couple.details.line.description'](),
    },
    {
      title: m['couple.details.space.title'](),
      description: m['couple.details.space.description'](),
    },
    {
      title: m['couple.details.orientation.title'](),
      description: m['couple.details.orientation.description'](),
    },
  ];
  const questions = [
    { question: m['couple.faq.q1'](), answer: m['couple.faq.a1']() },
    { question: m['couple.faq.q2'](), answer: m['couple.faq.a2']() },
    { question: m['couple.faq.q3'](), answer: m['couple.faq.a3']() },
    { question: m['couple.faq.q4'](), answer: m['couple.faq.a4']() },
  ];

  function choosePair(style: CoupleStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    document.getElementById('couple-design-idea')?.focus({
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
          prompt: buildCoupleTattooPrompt(selectedStyle, idea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['couple.generator.storage_error']());
      return;
    }
    setSubmitting(true);
    router.push(`/chat/${sessionId}`);
  }

  return (
    <>
      <section
        data-public-hero
        className="section-ink overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-20 lg:pb-24"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[#cda7a3] uppercase">
              {m['couple.hero.eyebrow']()}
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3rem,4vw,3.8rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['couple.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['couple.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['couple.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['couple.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['couple.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
            <ul className="text-ink-muted mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm">
              {[
                m['couple.hero.trust.one'](),
                m['couple.hero.trust.two'](),
                m['couple.hero.trust.three'](),
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden style={{ color: accent }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(205,167,163,0.45)]">
              <img
                src="/imgs/couple/sun-moon.webp"
                alt={m['couple.hero.image_alt']()}
                width={1100}
                height={1100}
                loading="eager"
                fetchPriority="high"
                className="aspect-square w-full object-contain"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="rounded-sm bg-[#966b69] px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                {m['couple.hero.image.badge']()}
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['couple.hero.image.caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '05', label: m['couple.stats.themes']() },
            { value: '02', label: m['couple.stats.pair']() },
            { value: '03', label: m['couple.stats.steps']() },
            { value: 'HD', label: m['couple.stats.examples']() },
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
            eyebrow={m['couple.ways.eyebrow']()}
            title={m['couple.ways.title']()}
            description={m['couple.ways.description']()}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article
                key={item.title}
                className="border-paper-line bg-paper-panel min-h-64 rounded-xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <item.icon aria-hidden className="size-7 text-[#966b69]" />
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
              eyebrow={m['couple.generator.eyebrow']()}
              title={m['couple.generator.title']()}
              description={m['couple.generator.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['couple.features.complete.title'](),
                m['couple.features.choice.title'](),
                m['couple.features.ink.title'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#cda7a3]">
                    ✦
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-8 text-sm leading-7">
              {m['couple.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['couple.generator.preview_label']()}
              </span>
              <span className="text-xs font-semibold text-[#cda7a3]">
                {selected.title}
              </span>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <fieldset>
                <legend className="text-sm font-semibold">
                  {m['couple.generator.style_label']()}
                </legend>
                <div className="mt-3 grid gap-2">
                  {pairs.map((pair, index) => (
                    <button
                      key={pair.key}
                      type="button"
                      onClick={() => setSelectedStyle(pair.key)}
                      aria-pressed={pair.key === selectedStyle}
                      className={cn(
                        'touch-target flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                        pair.key === selectedStyle
                          ? 'border-[#cda7a3] bg-[#cda7a3] text-[#111110]'
                          : 'border-ink-line text-ink-muted hover:text-ink-fg hover:border-[#cda7a3]'
                      )}
                    >
                      <span>{pair.title}</span>
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
                    {selected.title}
                  </span>
                  <a
                    href={selected.image}
                    download={`couple-tattoo-${selected.key}.webp`}
                    className="text-ink-fg touch-target inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"
                  >
                    <Download aria-hidden className="size-3" />
                    {m['couple.generator.save_example']()}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <label
                htmlFor="couple-design-scale"
                className="text-sm font-semibold"
              >
                {m['couple.generator.scale_label']()}
              </label>
              <output
                htmlFor="couple-design-scale"
                className="text-ink-muted text-sm"
              >
                {scale}%
              </output>
            </div>
            <input
              id="couple-design-scale"
              type="range"
              min={65}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="mt-3 w-full accent-[#cda7a3]"
            />
            <label
              htmlFor="couple-design-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['couple.generator.idea_label']()}
            </label>
            <textarea
              id="couple-design-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['couple.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['couple.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['couple.features.eyebrow']()}
            title={m['couple.features.title']()}
          />
          <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-paper-panel p-7 sm:p-9"
              >
                <span className="font-display text-sm font-bold text-[#966b69]">
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
            eyebrow={m['couple.steps.eyebrow']()}
            title={m['couple.steps.title']()}
          />
          <ol className="border-ink-line mt-12 grid border-t md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-ink-line border-b py-7 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <span className="font-display text-3xl font-bold text-[#cda7a3]">
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
            eyebrow={m['couple.gallery.eyebrow']()}
            title={m['couple.gallery.title']()}
            description={m['couple.gallery.description']()}
          />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['couple.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['couple.gallery.all']() },
              ...pairs,
            ].map((pair) => (
              <button
                key={pair.key}
                type="button"
                onClick={() => setGalleryFilter(pair.key)}
                aria-pressed={galleryFilter === pair.key}
                className={cn(
                  'touch-target rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  galleryFilter === pair.key
                    ? 'border-paper-fg bg-paper-fg text-paper-bg'
                    : 'border-paper-line text-paper-muted hover:border-paper-fg hover:text-paper-fg'
                )}
              >
                {pair.title}
              </button>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePairs.map((pair) => (
              <article
                key={pair.key}
                className="border-paper-line bg-paper-panel overflow-hidden rounded-2xl border"
              >
                <div className="bg-paper-bg flex aspect-square items-center justify-center">
                  <img
                    src={pair.image}
                    alt={pair.alt}
                    width={1100}
                    height={1100}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold tracking-[0.13em] text-[#966b69] uppercase">
                    COUPLE TATTOO / {pair.key.replace('_', ' ')}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-semibold">
                    {pair.title}
                  </h3>
                  <p className="text-paper-muted mt-2 min-h-12 text-sm leading-6">
                    {pair.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => choosePair(pair.key)}
                    className="touch-target text-paper-fg mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    {m['couple.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
            {galleryFilter === 'all' && (
              <div className="flex flex-col justify-between rounded-2xl bg-[#966b69] p-8 text-white">
                <p className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
                  {m['couple.gallery.cta']()}
                </p>
                <a
                  href="#generator"
                  className="touch-target mt-12 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {m['couple.generator.submit']()}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['couple.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              ink
              eyebrow={m['couple.placement.eyebrow']()}
              title={m['couple.placement.title']()}
              description={m['couple.placement.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['couple.placement.one'](),
                m['couple.placement.two'](),
                m['couple.placement.three'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#cda7a3]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-ink-line bg-ink-panel overflow-hidden rounded-2xl border">
            <img
              src="/imgs/couple/wrist-placement.webp"
              alt={m['couple.placement.image_alt']()}
              width={1280}
              height={960}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['couple.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/couple/artist-desk.webp"
              alt={m['couple.studio.image_alt']()}
              width={1280}
              height={720}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={m['couple.studio.eyebrow']()}
              title={m['couple.studio.title']()}
              description={m['couple.studio.description']()}
            />
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['couple.studio.one'](),
                m['couple.studio.two'](),
                m['couple.studio.three'](),
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden className="text-[#966b69]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#gallery" className={cn(paperButton, 'mt-9')}>
              {m['couple.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            ink
            eyebrow={m['couple.details.eyebrow']()}
            title={m['couple.details.title']()}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {details.map((detail, index) => (
              <article
                key={detail.title}
                className="border-ink-line bg-ink-panel rounded-xl border p-7"
              >
                <span className="font-display text-sm font-bold text-[#cda7a3]">
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

      <section
        id="faq"
        className="section-paper scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="section-shell max-w-4xl">
          <SectionHeading
            eyebrow={m['couple.faq.eyebrow']()}
            title={m['couple.faq.title']()}
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
                    className="text-2xl text-[#966b69] group-open:rotate-45"
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
          <PenLine aria-hidden className="mx-auto size-9 text-[#cda7a3]" />
          <p className="font-display mt-6 text-xs font-bold tracking-[0.2em] text-[#cda7a3] uppercase">
            {m['couple.final.eyebrow']()}
          </p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['couple.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['couple.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['couple.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
