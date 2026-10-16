import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export type RelatedLink = { href: string; label: string; description: string };

export function RelatedLinks({
  heading,
  description,
  links,
}: {
  heading: string;
  description: string;
  links: RelatedLink[];
}) {
  return (
    <section className="section-paper border-paper-line border-t px-4 py-14 sm:px-6 sm:py-20">
      <div className="section-shell">
        <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {heading}
        </h2>
        <p className="text-paper-muted mt-4 max-w-2xl text-sm leading-7 sm:text-base">
          {description}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="touch-target border-paper-line bg-paper-panel hover:border-vermilion group rounded-2xl border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="text-paper-fg flex items-start justify-between gap-3 font-semibold">
                {link.label}
                <ArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
              <span className="text-paper-muted mt-3 block text-sm leading-6">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
