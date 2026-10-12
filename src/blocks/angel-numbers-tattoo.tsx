import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Download,
  Hash,
  MoveHorizontal,
  PenLine,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import {
  buildAngelNumbersTattooPrompt,
  type AngelNumberStyle,
} from '@/lib/angel-numbers-prompt';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';

type NumberCard = {
  key: AngelNumberStyle;
  title: string;
  description: string;
  alt: string;
  image: string;
};

function numberCards(): NumberCard[] {
  return [
    {
      key: '111',
      title: m['angel.style.111.title'](),
      description: m['angel.style.111.description'](),
      alt: m['angel.style.111.alt'](),
      image: '/imgs/angel-numbers/111.webp',
    },
    {
      key: '222',
      title: m['angel.style.222.title'](),
      description: m['angel.style.222.description'](),
      alt: m['angel.style.222.alt'](),
      image: '/imgs/angel-numbers/222.webp',
    },
    {
      key: '333',
      title: m['angel.style.333.title'](),
      description: m['angel.style.333.description'](),
      alt: m['angel.style.333.alt'](),
      image: '/imgs/angel-numbers/333.webp',
    },
    {
      key: '444',
      title: m['angel.style.444.title'](),
      description: m['angel.style.444.description'](),
      alt: m['angel.style.444.alt'](),
      image: '/imgs/angel-numbers/444.webp',
    },
    {
      key: '555',
      title: m['angel.style.555.title'](),
      description: m['angel.style.555.description'](),
      alt: m['angel.style.555.alt'](),
      image: '/imgs/angel-numbers/555.webp',
    },
    {
      key: '777',
      title: m['angel.style.777.title'](),
      description: m['angel.style.777.description'](),
      alt: m['angel.style.777.alt'](),
      image: '/imgs/angel-numbers/777.webp',
    },
    {
      key: '888',
      title: m['angel.style.888.title'](),
      description: m['angel.style.888.description'](),
      alt: m['angel.style.888.alt'](),
      image: '/imgs/angel-numbers/888.webp',
    },
    {
      key: '11:11',
      title: m['angel.style.1111.title'](),
      description: m['angel.style.1111.description'](),
      alt: m['angel.style.1111.alt'](),
      image: '/imgs/angel-numbers/1111.webp',
    },
  ];
}

const gold = '#d0ad7a';
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
          ink ? 'text-[#d0ad7a]' : 'text-[#886538]'
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

export function AngelNumbersTattoo() {
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [selectedStyle, setSelectedStyle] = useState<AngelNumberStyle>('11:11');
  const [galleryFilter, setGalleryFilter] = useState<AngelNumberStyle | 'all'>(
    'all'
  );
  const [scale, setScale] = useState(90);
  const [personalIdea, setPersonalIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const cards = numberCards();
  const selected = cards.find((card) => card.key === selectedStyle)!;
  const visibleCards =
    galleryFilter === 'all'
      ? cards
      : cards.filter((card) => card.key === galleryFilter);

  const startingPoints = [
    {
      icon: Hash,
      title: m['angel.ways.number.title'](),
      description: m['angel.ways.number.description'](),
    },
    {
      icon: PenLine,
      title: m['angel.ways.lettering.title'](),
      description: m['angel.ways.lettering.description'](),
    },
    {
      icon: Sparkles,
      title: m['angel.ways.ornament.title'](),
      description: m['angel.ways.ornament.description'](),
    },
    {
      icon: MoveHorizontal,
      title: m['angel.ways.placement.title'](),
      description: m['angel.ways.placement.description'](),
    },
  ];
  const features = [
    {
      title: m['angel.features.one.title'](),
      description: m['angel.features.one.description'](),
    },
    {
      title: m['angel.features.two.title'](),
      description: m['angel.features.two.description'](),
    },
    {
      title: m['angel.features.three.title'](),
      description: m['angel.features.three.description'](),
    },
    {
      title: m['angel.features.four.title'](),
      description: m['angel.features.four.description'](),
    },
  ];
  const steps = [
    {
      title: m['angel.steps.one.title'](),
      description: m['angel.steps.one.description'](),
    },
    {
      title: m['angel.steps.two.title'](),
      description: m['angel.steps.two.description'](),
    },
    {
      title: m['angel.steps.three.title'](),
      description: m['angel.steps.three.description'](),
    },
  ];
  const details = [
    {
      title: m['angel.details.one.title'](),
      description: m['angel.details.one.description'](),
    },
    {
      title: m['angel.details.two.title'](),
      description: m['angel.details.two.description'](),
    },
    {
      title: m['angel.details.three.title'](),
      description: m['angel.details.three.description'](),
    },
  ];
  const questions = [
    { question: m['angel.faq.q1'](), answer: m['angel.faq.a1']() },
    { question: m['angel.faq.q2'](), answer: m['angel.faq.a2']() },
    { question: m['angel.faq.q3'](), answer: m['angel.faq.a3']() },
    { question: m['angel.faq.q4'](), answer: m['angel.faq.a4']() },
  ];

  function chooseStyle(style: AngelNumberStyle) {
    setSelectedStyle(style);
    document.getElementById('generator')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    document.getElementById('angel-personal-idea')?.focus({
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
          prompt: buildAngelNumbersTattooPrompt(selectedStyle, personalIdea),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(m['angel.generator.storage_error']());
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
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[#d0ad7a] uppercase">
              {m['angel.hero.eyebrow']()}
            </p>
            <h1 className="font-display mt-5 max-w-2xl text-[clamp(3rem,4vw,3.8rem)] leading-[0.94] font-black tracking-[-0.055em] text-balance uppercase">
              {m['angel.hero.title']()}
            </h1>
            <p className="font-display mt-5 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {m['angel.hero.subtitle']()}
            </p>
            <p className="text-ink-muted mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {m['angel.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#generator" className={inkButton}>
                {m['angel.hero.primary']()}
                <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#gallery"
                className="touch-target border-ink-line text-ink-fg hover:bg-ink-panel inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
              >
                {m['angel.hero.secondary']()}
                <ArrowDownRight aria-hidden className="size-4" />
              </a>
            </div>
            <ul className="text-ink-muted mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm">
              {[
                m['angel.hero.trust.one'](),
                m['angel.hero.trust.two'](),
                m['angel.hero.trust.three'](),
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden style={{ color: gold }}>
                    ✦
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative lg:pl-5">
            <div className="border-ink-line bg-paper-bg overflow-hidden rounded-[1.25rem] border shadow-[0_26px_80px_-40px_rgba(208,173,122,0.45)]">
              <img
                src="/imgs/angel-numbers/1111.webp"
                alt={m['angel.hero.image_alt']()}
                width={1100}
                height={1100}
                loading="eager"
                fetchPriority="high"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="border-ink-line bg-ink-panel relative z-10 -mt-12 ml-4 max-w-72 rounded-xl border p-5 shadow-2xl sm:ml-[-1.5rem]">
              <span className="rounded-sm bg-[#886538] px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-white uppercase">
                AI-CREATED FLASH
              </span>
              <p className="font-display mt-4 text-base font-semibold">
                {m['angel.hero.image.caption']()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="section-shell border-ink-line grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '08', label: m['angel.stats.one']() },
            { value: '01', label: m['angel.stats.two']() },
            { value: '03', label: m['angel.stats.three']() },
            { value: '08', label: m['angel.stats.four']() },
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
            eyebrow={m['angel.ways.eyebrow']()}
            title={m['angel.ways.title']()}
            description={m['angel.ways.description']()}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article
                key={item.title}
                className="border-paper-line bg-paper-panel min-h-64 rounded-xl border p-6"
              >
                <div className="flex items-start justify-between">
                  <item.icon aria-hidden className="size-7 text-[#886538]" />
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
              eyebrow={m['angel.generator.eyebrow']()}
              title={m['angel.generator.title']()}
              description={m['angel.generator.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['angel.features.one.title'](),
                m['angel.features.two.title'](),
                m['angel.features.three.title'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#d0ad7a]">
                    ✦
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-8 text-sm leading-7">
              {m['angel.generator.note']()}
            </p>
          </div>
          <form
            onSubmit={createDesign}
            className="border-ink-line bg-ink-panel rounded-[1.5rem] border p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-muted text-xs font-bold tracking-[0.13em] uppercase">
                {m['angel.generator.preview_label']()}
              </span>
              <span className="text-xs font-semibold text-[#d0ad7a]">
                {selected.title}
              </span>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
              <fieldset>
                <legend className="text-sm font-semibold">
                  {m['angel.generator.style_label']()}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
                  {cards.map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedStyle(card.key)}
                      aria-pressed={card.key === selectedStyle}
                      className={cn(
                        'touch-target font-display rounded-lg border px-2 py-2.5 text-center text-sm font-bold transition-colors',
                        card.key === selectedStyle
                          ? 'border-[#d0ad7a] bg-[#d0ad7a] text-[#111110]'
                          : 'border-ink-line text-ink-muted hover:text-ink-fg hover:border-[#d0ad7a]'
                      )}
                    >
                      {card.key}
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
                    style={{ width: `${scale}%` }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-ink-muted text-xs">
                    {selected.title}
                  </span>
                  <a
                    href={selected.image}
                    download={`angel-numbers-tattoo-${selected.key.replace(':', '')}.webp`}
                    className="text-ink-fg touch-target inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4"
                  >
                    <Download aria-hidden className="size-3" />
                    {m['angel.generator.save_example']()}
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <label
                htmlFor="angel-design-scale"
                className="text-sm font-semibold"
              >
                {m['angel.generator.scale_label']()}
              </label>
              <output
                htmlFor="angel-design-scale"
                className="text-ink-muted text-sm"
              >
                {scale}%
              </output>
            </div>
            <input
              id="angel-design-scale"
              type="range"
              min={65}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="mt-3 w-full accent-[#d0ad7a]"
            />
            <label
              htmlFor="angel-personal-idea"
              className="mt-6 block text-sm font-semibold"
            >
              {m['angel.generator.idea_label']()}
            </label>
            <textarea
              id="angel-personal-idea"
              name="personalIdea"
              value={personalIdea}
              onChange={(event) => setPersonalIdea(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={m['angel.generator.idea_placeholder']()}
              className="border-ink-line bg-ink-bg text-ink-fg placeholder:text-ink-muted mt-3 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(inkButton, 'mt-5 w-full disabled:opacity-60')}
            >
              {m['angel.generator.submit']()}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            eyebrow={m['angel.features.eyebrow']()}
            title={m['angel.features.title']()}
          />
          <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="bg-paper-panel p-7 sm:p-9"
              >
                <span className="font-display text-sm font-bold text-[#886538]">
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
            eyebrow={m['angel.steps.eyebrow']()}
            title={m['angel.steps.title']()}
          />
          <ol className="border-ink-line mt-12 grid border-t md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-ink-line border-b py-7 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
              >
                <span className="font-display text-3xl font-bold text-[#d0ad7a]">
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
            eyebrow={m['angel.gallery.eyebrow']()}
            title={m['angel.gallery.title']()}
            description={m['angel.gallery.description']()}
          />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label={m['angel.generator.style_label']()}
          >
            {[
              { key: 'all' as const, title: m['angel.gallery.all']() },
              ...cards,
            ].map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setGalleryFilter(card.key)}
                aria-pressed={galleryFilter === card.key}
                className={cn(
                  'touch-target rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  galleryFilter === card.key
                    ? 'border-paper-fg bg-paper-fg text-paper-bg'
                    : 'border-paper-line text-paper-muted hover:border-paper-fg hover:text-paper-fg'
                )}
              >
                {card.key === 'all' ? card.title : card.key}
              </button>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((card) => (
              <article
                key={card.key}
                className="border-paper-line bg-paper-panel overflow-hidden rounded-2xl border"
              >
                <div className="bg-paper-bg flex aspect-square items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.alt}
                    width={1100}
                    height={1100}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold tracking-[0.13em] text-[#886538] uppercase">
                    ANGEL NUMBERS / {card.key}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-paper-muted mt-2 min-h-12 text-sm leading-6">
                    {card.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => chooseStyle(card.key)}
                    className="touch-target text-paper-fg mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    {m['angel.gallery.select']()}
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                </div>
              </article>
            ))}
            {galleryFilter === 'all' && (
              <div className="flex flex-col justify-between rounded-2xl bg-[#886538] p-8 text-white">
                <p className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
                  {m['angel.gallery.cta']()}
                </p>
                <a
                  href="#generator"
                  className="touch-target mt-12 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {m['angel.generator.submit']()}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-paper-muted mt-6 text-sm leading-6">
            {m['angel.gallery.note']()}
          </p>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              ink
              eyebrow={m['angel.placement.eyebrow']()}
              title={m['angel.placement.title']()}
              description={m['angel.placement.description']()}
            />
            <ul className="border-ink-line mt-8 border-t">
              {[
                m['angel.placement.one'](),
                m['angel.placement.two'](),
                m['angel.placement.three'](),
              ].map((point) => (
                <li
                  key={point}
                  className="border-ink-line flex items-center gap-3 border-b py-4 text-sm"
                >
                  <span aria-hidden className="text-[#d0ad7a]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <figure className="border-ink-line bg-ink-panel overflow-hidden rounded-2xl border">
            <img
              src="/imgs/angel-numbers/wrist-placement.webp"
              alt={m['angel.placement.image_alt']()}
              width={1280}
              height={960}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="text-ink-muted p-4 text-xs font-bold tracking-[0.12em] uppercase">
              {m['angel.placement.caption']()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <img
              src="/imgs/angel-numbers/artist-desk.webp"
              alt={m['angel.studio.image_alt']()}
              width={1280}
              height={720}
              loading="lazy"
              className="border-paper-line aspect-video w-full rounded-2xl border object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={m['angel.studio.eyebrow']()}
              title={m['angel.studio.title']()}
              description={m['angel.studio.description']()}
            />
            <ul className="mt-8 space-y-3 text-sm font-medium">
              {[
                m['angel.studio.one'](),
                m['angel.studio.two'](),
                m['angel.studio.three'](),
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden className="text-[#886538]">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href="#gallery" className={cn(paperButton, 'mt-9')}>
              {m['angel.studio.cta']()}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
        <div className="section-shell">
          <SectionHeading
            ink
            eyebrow={m['angel.details.eyebrow']()}
            title={m['angel.details.title']()}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {details.map((detail, index) => (
              <article
                key={detail.title}
                className="border-ink-line bg-ink-panel rounded-xl border p-7"
              >
                <span className="font-display text-sm font-bold text-[#d0ad7a]">
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
            eyebrow={m['angel.faq.eyebrow']()}
            title={m['angel.faq.title']()}
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
                    className="text-2xl text-[#886538] group-open:rotate-45"
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
          <ScanLine aria-hidden className="mx-auto size-9 text-[#d0ad7a]" />
          <p className="font-display mt-6 text-xs font-bold tracking-[0.2em] text-[#d0ad7a] uppercase">
            {m['angel.final.eyebrow']()}
          </p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['angel.final.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-6 max-w-xl text-base leading-7">
            {m['angel.final.description']()}
          </p>
          <a href="#generator" className={cn(inkButton, 'mt-8')}>
            {m['angel.final.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
