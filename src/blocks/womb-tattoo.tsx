import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Heart,
  ImagePlus,
  MoveHorizontal,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import { cn } from '@/lib/utils';
import { buildWombTattooPrompt, type WombStyle } from '@/lib/womb-prompt';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type StyleCard = {
  key: WombStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function styleCards(): StyleCard[] {
  return [
    {
      key: 'gothic',
      title: m['womb.style.gothic.title'](),
      description: m['womb.style.gothic.description'](),
      alt: m['womb.style.gothic.alt'](),
      image: '/imgs/womb/gothic-heart.jpg',
    },
    {
      key: 'fine-line',
      title: m['womb.style.fine_line.title'](),
      description: m['womb.style.fine_line.description'](),
      alt: m['womb.style.fine_line.alt'](),
      image: '/imgs/womb/fine-line-heart.jpg',
    },
    {
      key: 'floral',
      title: m['womb.style.floral.title'](),
      description: m['womb.style.floral.description'](),
      alt: m['womb.style.floral.alt'](),
      image: '/imgs/womb/floral-lotus.jpg',
    },
    {
      key: 'neo-tribal',
      title: m['womb.style.neo_tribal.title'](),
      description: m['womb.style.neo_tribal.description'](),
      alt: m['womb.style.neo_tribal.alt'](),
      image: '/imgs/womb/neo-tribal-sigil.jpg',
    },
    {
      key: 'celestial',
      title: m['womb.style.celestial.title'](),
      description: m['womb.style.celestial.description'](),
      alt: m['womb.style.celestial.alt'](),
      image: '/imgs/womb/celestial-moon.jpg',
    },
  ];
}

const inkButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-ink-fg px-6 py-3 text-sm font-semibold text-ink-bg transition-transform hover:-translate-y-0.5';
const paperButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-paper-fg px-6 py-3 text-sm font-semibold text-paper-bg transition-transform hover:-translate-y-0.5';

export function WombTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] = useState<WombStyle>('gothic');
  const [galleryFilter, setGalleryFilter] = useState<WombStyle | 'all'>('all');
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
      icon: Sparkles,
      title: m['womb.ways.idea.title'](),
      description: m['womb.ways.idea.description'](),
    },
    {
      icon: ImagePlus,
      title: m['womb.ways.reference.title'](),
      description: m['womb.ways.reference.description'](),
    },
    {
      icon: Heart,
      title: m['womb.ways.symbol.title'](),
      description: m['womb.ways.symbol.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['womb.ways.proportion.title'](),
      description: m['womb.ways.proportion.description'](),
    },
  ];
  const features = [
    {
      title: m['womb.features.symmetry.title'](),
      description: m['womb.features.symmetry.description'](),
    },
    {
      title: m['womb.features.styles.title'](),
      description: m['womb.features.styles.description'](),
    },
    {
      title: m['womb.features.placement.title'](),
      description: m['womb.features.placement.description'](),
    },
    {
      title: m['womb.features.artist.title'](),
      description: m['womb.features.artist.description'](),
    },
  ];
  const steps = [
    {
      title: m['womb.steps.one.title'](),
      description: m['womb.steps.one.description'](),
    },
    {
      title: m['womb.steps.two.title'](),
      description: m['womb.steps.two.description'](),
    },
    {
      title: m['womb.steps.three.title'](),
      description: m['womb.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['womb.details.center.title'](),
      description: m['womb.details.center.description'](),
    },
    {
      title: m['womb.details.silhouette.title'](),
      description: m['womb.details.silhouette.description'](),
    },
    {
      title: m['womb.details.proportion.title'](),
      description: m['womb.details.proportion.description'](),
    },
  ];
  const questions = [
    { question: m['womb.faq.q1'](), answer: m['womb.faq.a1']() },
    { question: m['womb.faq.q2'](), answer: m['womb.faq.a2']() },
    { question: m['womb.faq.q3'](), answer: m['womb.faq.a3']() },
    { question: m['womb.faq.q4'](), answer: m['womb.faq.a4']() },
  ];

  function chooseStyle(style: WombStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
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
          prompt: buildWombTattooPrompt(selectedStyle, idea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['womb.generator.storage_error']());
      return;
    }
    setSubmitting(true);
    router.push(`/chat/${sessionId}`);
  }

  return (
    <>
      <section
        id="top"
        data-public-hero
        className="section-ink overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:pb-24"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow-vermilion">{m['womb.hero.eyebrow']()}</p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3.15rem,6.3vw,6.5rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['womb.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['womb.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['womb.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['womb.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['womb.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(168,62,44,0.4)]">
              <img
                src="/imgs/womb/gothic-heart.jpg"
                alt={m['womb.hero.image_alt']()}
                width={1086}
                height={1448}
                loading="eager"
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover object-center"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="bg-vermilion rounded-sm px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                {m['womb.hero.image_badge']()}
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['womb.hero.image_caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-3">
          {[
            { value: '05', label: m['womb.stats.styles']() },
            { value: '✦', label: m['womb.stats.symmetry']() },
            { value: '03', label: m['womb.stats.steps']() },
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
          <p className="eyebrow-vermilion">{m['womb.ways.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.ways.title']()}
          </h2>
          <p className="text-paper-muted mt-5 max-w-2xl text-base leading-7">
            {m['womb.ways.description']()}
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
            <p className="eyebrow-vermilion">{m['womb.generator.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['womb.generator.title']()}
            </h2>
            <p className="text-ink-muted mt-6 text-base leading-8">
              {m['womb.generator.description']()}
            </p>
            <p className="border-ink-line text-ink-muted mt-9 border-t pt-5 text-sm leading-6">
              {m['womb.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['womb.generator.preview_label']()}
              </span>
              <span className="text-vermilion text-xs font-semibold">
                {selected.title}
              </span>
            </div>
            <div className="bg-paper-bg mt-4 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl">
              <img
                src={selected.image}
                alt={selected.alt}
                width={1086}
                height={1448}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">
                {m['womb.generator.style_label']()}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {styles.map((style) => (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => setSelectedStyle(style.key)}
                    aria-pressed={style.key === selectedStyle}
                    className={cn(
                      'touch-target rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                      style.key === selectedStyle
                        ? 'border-ink-fg bg-ink-fg text-ink-bg'
                        : 'border-ink-line text-ink-muted hover:border-ink-fg hover:text-ink-fg'
                    )}
                  >
                    {style.title}
                  </button>
                ))}
              </div>
            </fieldset>
            <label
              htmlFor="womb-design-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['womb.generator.idea_label']()}
            </label>
            <textarea
              id="womb-design-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['womb.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['womb.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <p className="eyebrow-vermilion">{m['womb.features.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.features.title']()}
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
          <p className="eyebrow-vermilion">{m['womb.steps.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.steps.title']()}
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
          <p className="eyebrow-vermilion">{m['womb.gallery.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.gallery.title']()}
          </h2>
          <p className="text-paper-muted mt-5 max-w-2xl text-base leading-7">
            {m['womb.gallery.description']()}
          </p>
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['womb.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['womb.gallery.all']() },
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
            {visibleStyles.map((style, index) => (
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
                    {String(index + 1).padStart(2, '0')} / WOMBTATTOO
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
                    {m['womb.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['womb.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow-vermilion">{m['womb.placement.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['womb.placement.title']()}
            </h2>
            <p className="text-ink-muted mt-6 text-base leading-8">
              {m['womb.placement.description']()}
            </p>
            <ul className="border-ink-line mt-8 space-y-0 border-t">
              {[
                m['womb.placement.one'](),
                m['womb.placement.two'](),
                m['womb.placement.three'](),
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
              src="/imgs/womb/placement-concept.jpg"
              alt={m['womb.placement.image_alt']()}
              width={1448}
              height={1086}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['womb.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/womb/artist-desk.jpg"
              alt={m['womb.studio.image_alt']()}
              width={1672}
              height={941}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow-vermilion">{m['womb.studio.eyebrow']()}</p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['womb.studio.title']()}
            </h2>
            <p className="text-paper-muted mt-6 text-base leading-8">
              {m['womb.studio.description']()}
            </p>
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['womb.studio.one'](),
                m['womb.studio.two'](),
                m['womb.studio.three'](),
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
              {m['womb.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <p className="eyebrow-vermilion">{m['womb.details.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.details.title']()}
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
          <p className="eyebrow-vermilion">{m['womb.faq.eyebrow']()}</p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.faq.title']()}
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
          <p className="eyebrow-vermilion mt-6">{m['womb.final.eyebrow']()}</p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['womb.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['womb.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['womb.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
