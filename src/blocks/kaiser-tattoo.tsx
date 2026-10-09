import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Crown,
  Flower2,
  MoveHorizontal,
  Palette,
  PenLine,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import { buildKaiserTattooPrompt, type KaiserStyle } from '@/lib/kaiser-prompt';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type StyleCard = {
  key: KaiserStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function styleCards(): StyleCard[] {
  return [
    {
      key: 'blue_rose',
      title: m['kaiser.style.blue_rose.title'](),
      description: m['kaiser.style.blue_rose.description'](),
      alt: m['kaiser.style.blue_rose.alt'](),
      image: '/imgs/kaiser/blue-rose.jpg',
    },
    {
      key: 'fine_line',
      title: m['kaiser.style.fine_line.title'](),
      description: m['kaiser.style.fine_line.description'](),
      alt: m['kaiser.style.fine_line.alt'](),
      image: '/imgs/kaiser/fine-line.jpg',
    },
    {
      key: 'thornwork',
      title: m['kaiser.style.thornwork.title'](),
      description: m['kaiser.style.thornwork.description'](),
      alt: m['kaiser.style.thornwork.alt'](),
      image: '/imgs/kaiser/thornwork.jpg',
    },
    {
      key: 'crown',
      title: m['kaiser.style.crown.title'](),
      description: m['kaiser.style.crown.description'](),
      alt: m['kaiser.style.crown.alt'](),
      image: '/imgs/kaiser/crown.jpg',
    },
    {
      key: 'watercolor',
      title: m['kaiser.style.watercolor.title'](),
      description: m['kaiser.style.watercolor.description'](),
      alt: m['kaiser.style.watercolor.alt'](),
      image: '/imgs/kaiser/watercolor.jpg',
    },
  ];
}

const inkButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-ink-fg px-6 py-3 text-sm font-semibold text-ink-bg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9ec5ff]';
const paperButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-paper-fg px-6 py-3 text-sm font-semibold text-paper-bg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245aab]';

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
          ink ? 'text-[#9ec5ff]' : 'text-[#245aab]'
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

export function KaiserTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] = useState<KaiserStyle>('blue_rose');
  const [galleryFilter, setGalleryFilter] = useState<KaiserStyle | 'all'>(
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
      icon: Flower2,
      title: m['kaiser.ways.rose.title'](),
      description: m['kaiser.ways.rose.description'](),
    },
    {
      icon: Palette,
      title: m['kaiser.ways.story.title'](),
      description: m['kaiser.ways.story.description'](),
    },
    {
      icon: Crown,
      title: m['kaiser.ways.symbols.title'](),
      description: m['kaiser.ways.symbols.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['kaiser.ways.placement.title'](),
      description: m['kaiser.ways.placement.description'](),
    },
  ];
  const features = [
    {
      title: m['kaiser.features.rose.title'](),
      description: m['kaiser.features.rose.description'](),
    },
    {
      title: m['kaiser.features.directions.title'](),
      description: m['kaiser.features.directions.description'](),
    },
    {
      title: m['kaiser.features.placement.title'](),
      description: m['kaiser.features.placement.description'](),
    },
    {
      title: m['kaiser.features.artist.title'](),
      description: m['kaiser.features.artist.description'](),
    },
  ];
  const steps = [
    {
      title: m['kaiser.steps.one.title'](),
      description: m['kaiser.steps.one.description'](),
    },
    {
      title: m['kaiser.steps.two.title'](),
      description: m['kaiser.steps.two.description'](),
    },
    {
      title: m['kaiser.steps.three.title'](),
      description: m['kaiser.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['kaiser.details.rose.title'](),
      description: m['kaiser.details.rose.description'](),
    },
    {
      title: m['kaiser.details.thorns.title'](),
      description: m['kaiser.details.thorns.description'](),
    },
    {
      title: m['kaiser.details.color.title'](),
      description: m['kaiser.details.color.description'](),
    },
  ];
  const questions = [
    { question: m['kaiser.faq.q1'](), answer: m['kaiser.faq.a1']() },
    { question: m['kaiser.faq.q2'](), answer: m['kaiser.faq.a2']() },
    { question: m['kaiser.faq.q3'](), answer: m['kaiser.faq.a3']() },
    { question: m['kaiser.faq.q4'](), answer: m['kaiser.faq.a4']() },
  ];

  function chooseStyle(style: KaiserStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    document.getElementById('kaiser-design-idea')?.focus({
      preventScroll: true,
    });
  }

  function createDesign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const sessionId = newAgentSessionId();
    try {
      sessionStorage.setItem(
        'agent:initial-turn:' + sessionId,
        JSON.stringify({
          prompt: buildKaiserTattooPrompt(selectedStyle, idea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['kaiser.generator.storage_error']());
      return;
    }
    setSubmitting(true);
    router.push('/chat/' + sessionId);
  }

  return (
    <>
      <section
        data-public-hero
        className="section-ink overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:pb-24"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[#9ec5ff] uppercase">
              {m['kaiser.hero.eyebrow']()}
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3.1rem,6.2vw,6.2rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['kaiser.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['kaiser.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['kaiser.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['kaiser.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['kaiser.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(36,90,171,0.45)]">
              <img
                src="/imgs/kaiser/blue-rose.jpg"
                alt={m['kaiser.hero.image_alt']()}
                width={1086}
                height={1448}
                loading="eager"
                fetchPriority="high"
                className="aspect-[4/3] w-full object-contain"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="rounded-sm bg-[#245aab] px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                {m['kaiser.hero.image_badge']()}
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['kaiser.hero.image_caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '05', label: m['kaiser.stats.styles']() },
            { value: 'BLUE ROSE', label: m['kaiser.stats.motif']() },
            { value: '03', label: m['kaiser.stats.steps']() },
            { value: 'HD', label: m['kaiser.stats.examples']() },
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
            eyebrow={m['kaiser.ways.eyebrow']()}
            title={m['kaiser.ways.title']()}
            description={m['kaiser.ways.description']()}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article
                key={item.title}
                className="border-paper-line bg-paper-panel min-h-64 rounded-xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <item.icon aria-hidden className="size-7 text-[#245aab]" />
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
              eyebrow={m['kaiser.generator.eyebrow']()}
              title={m['kaiser.generator.title']()}
              description={m['kaiser.generator.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['kaiser.features.directions.title'](),
                m['kaiser.features.rose.title'](),
                m['kaiser.features.placement.title'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#9ec5ff]">
                    ✦
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-8 text-sm leading-7">
              {m['kaiser.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['kaiser.generator.preview_label']()}
              </span>
              <span className="text-xs font-semibold text-[#9ec5ff]">
                {selected.title}
              </span>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <fieldset>
                <legend className="text-sm font-semibold">
                  {m['kaiser.generator.style_label']()}
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
                    style={{ height: String(scale) + '%' }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-ink-muted text-xs">
                    {selected.title} · KAISER TATTOO
                  </span>
                  <a
                    href={selected.image}
                    download={'kaiser-tattoo-' + selected.key + '.jpg'}
                    className="text-ink-fg touch-target text-xs font-semibold underline underline-offset-4"
                  >
                    {m['kaiser.generator.save_example']()}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <label
                htmlFor="kaiser-design-scale"
                className="text-sm font-semibold"
              >
                {m['kaiser.generator.scale_label']()}
              </label>
              <output
                htmlFor="kaiser-design-scale"
                className="text-ink-muted text-sm"
              >
                {scale}%
              </output>
            </div>
            <input
              id="kaiser-design-scale"
              type="range"
              min={65}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="mt-3 w-full accent-[#245aab]"
            />
            <label
              htmlFor="kaiser-design-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['kaiser.generator.idea_label']()}
            </label>
            <textarea
              id="kaiser-design-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['kaiser.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['kaiser.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['kaiser.features.eyebrow']()}
            title={m['kaiser.features.title']()}
          />
          <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-paper-panel p-7 sm:p-9"
              >
                <span className="font-display text-sm font-bold text-[#245aab]">
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
            eyebrow={m['kaiser.steps.eyebrow']()}
            title={m['kaiser.steps.title']()}
          />
          <ol className="border-ink-line mt-12 grid border-t md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-ink-line border-b py-7 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <span className="font-display text-3xl font-bold text-[#9ec5ff]">
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
            eyebrow={m['kaiser.gallery.eyebrow']()}
            title={m['kaiser.gallery.title']()}
            description={m['kaiser.gallery.description']()}
          />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['kaiser.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['kaiser.gallery.all']() },
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
                  <p className="text-xs font-bold tracking-[0.13em] text-[#245aab] uppercase">
                    KAISER TATTOO / {style.key.replace('_', ' ')}
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
                    {m['kaiser.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
            {galleryFilter === 'all' && (
              <div className="flex flex-col justify-between rounded-2xl bg-[#245aab] p-8 text-white">
                <p className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
                  {m['kaiser.gallery.cta.line1']()}
                  <br />
                  {m['kaiser.gallery.cta.line2']()}
                  <br />
                  {m['kaiser.gallery.cta.line3']()}
                </p>
                <a
                  href="#generator"
                  className="touch-target mt-12 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {m['kaiser.hero.primary']()}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['kaiser.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              ink
              eyebrow={m['kaiser.placement.eyebrow']()}
              title={m['kaiser.placement.title']()}
              description={m['kaiser.placement.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['kaiser.placement.one'](),
                m['kaiser.placement.two'](),
                m['kaiser.placement.three'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#9ec5ff]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-ink-line bg-ink-panel overflow-hidden rounded-2xl border">
            <img
              src="/imgs/kaiser/forearm-placement.jpg"
              alt={m['kaiser.placement.image_alt']()}
              width={1448}
              height={1086}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['kaiser.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/kaiser/artist-desk.jpg"
              alt={m['kaiser.studio.image_alt']()}
              width={1672}
              height={941}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={m['kaiser.studio.eyebrow']()}
              title={m['kaiser.studio.title']()}
              description={m['kaiser.studio.description']()}
            />
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['kaiser.studio.one'](),
                m['kaiser.studio.two'](),
                m['kaiser.studio.three'](),
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden className="text-[#245aab]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#gallery" className={cn(paperButton, 'mt-9')}>
              {m['kaiser.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            ink
            eyebrow={m['kaiser.details.eyebrow']()}
            title={m['kaiser.details.title']()}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {details.map((detail, index) => (
              <article
                key={detail.title}
                className="border-ink-line bg-ink-panel rounded-xl border p-7"
              >
                <span className="font-display text-sm font-bold text-[#9ec5ff]">
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
            eyebrow={m['kaiser.faq.eyebrow']()}
            title={m['kaiser.faq.title']()}
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
                    className="text-2xl text-[#245aab] group-open:rotate-45"
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
          <PenLine aria-hidden className="mx-auto size-9 text-[#9ec5ff]" />
          <p className="font-display mt-6 text-xs font-bold tracking-[0.2em] text-[#9ec5ff] uppercase">
            {m['kaiser.final.eyebrow']()}
          </p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['kaiser.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['kaiser.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['kaiser.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
