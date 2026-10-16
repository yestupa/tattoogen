import type { ReactNode } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export type DiscoveryLink = { href: string; label: string };
export type DiscoveryImage = {
  image: string;
  width: number;
  height: number;
  alt: string;
};

export const discoveryPrimaryButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full bg-vermilion px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-vermilion/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermilion';
export const discoverySecondaryButton =
  'touch-target inline-flex items-center justify-center gap-2 rounded-full border border-paper-line bg-paper-panel px-5 py-3 text-sm font-semibold text-paper-fg hover:border-vermilion focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermilion';

export function DiscoveryHero({
  eyebrow,
  title,
  intro,
  note,
  breadcrumbLabel,
  breadcrumbs,
  navigation,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  note: string;
  breadcrumbLabel: string;
  breadcrumbs: DiscoveryLink[];
  navigation: DiscoveryLink[];
  children?: ReactNode;
}) {
  return (
    <section
      data-public-hero
      className="section-ink px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-16"
    >
      <div className="section-shell min-w-0">
        <nav aria-label={breadcrumbLabel} className="text-ink-muted text-xs">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {breadcrumbs.map((item, index) => (
              <li
                key={item.href}
                className="flex max-w-full items-center gap-2"
              >
                {index > 0 && (
                  <ChevronRight aria-hidden className="size-3 shrink-0" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span aria-current="page" className="break-words">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-ink-fg">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="text-vermilion-on-ink mt-9 text-xs font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display mt-4 max-w-5xl text-[clamp(2.6rem,5.8vw,5.6rem)] leading-[1.02] font-black tracking-[-0.045em] text-balance break-words">
          {title}
        </h1>
        <p className="text-ink-fg/85 mt-6 max-w-3xl text-base leading-8 sm:text-lg">
          {intro}
        </p>
        <p className="text-ink-muted mt-4 max-w-3xl text-sm leading-6">
          {note}
        </p>
        <nav className="mt-7 flex flex-wrap gap-2" aria-label={eyebrow}>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="touch-target border-ink-line hover:border-vermilion-on-ink inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
            >
              {item.label}
              <ArrowRight aria-hidden className="size-3" />
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </section>
  );
}

export function DiscoveryLinks({
  title,
  links,
}: {
  title: string;
  links: DiscoveryLink[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="min-w-0">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {links.map((item) => (
          <li key={item.href} className="max-w-full">
            <Link
              href={item.href}
              className={`${discoverySecondaryButton} break-words`}
            >
              {item.label}
              <ArrowRight aria-hidden className="size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DiscoveryCollections({
  title,
  items,
}: {
  title: string;
  items: Array<
    DiscoveryImage & { href: string; title: string; description: string }
  >;
}) {
  return (
    <section className="section-paper px-4 py-12 sm:px-6 sm:py-16">
      <div className="section-shell">
        <h2 className="font-display max-w-3xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          {title}
        </h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.href}
              className="border-paper-line bg-paper-panel focus-within:border-vermilion focus-within:ring-vermilion min-w-0 overflow-hidden rounded-2xl border focus-within:ring-2"
            >
              <Link
                href={item.href}
                className="group focus-visible:outline-vermilion block h-full focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f0ece3]">
                  <img
                    src={item.image}
                    width={item.width}
                    height={item.height}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.025]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl leading-tight font-bold">
                    {item.title}
                  </h3>
                  <p className="text-paper-muted mt-3 text-sm leading-6">
                    {item.description}
                  </p>
                  <ArrowRight
                    aria-hidden
                    className="text-vermilion mt-4 size-5"
                  />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiscoveryBrief({
  title,
  brief,
  tipsTitle,
  tips,
}: {
  title: string;
  brief: string;
  tipsTitle: string;
  tips: string[];
}) {
  return (
    <section className="section-paper px-4 py-12 sm:px-6">
      <div className="section-shell border-paper-line grid gap-8 border-t pt-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="text-paper-muted mt-4 text-base leading-8">{brief}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {tipsTitle}
          </h2>
          <ul className="text-paper-muted mt-4 space-y-3">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-sm leading-7">
                <span aria-hidden className="text-vermilion">
                  ↗
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
