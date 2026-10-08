import {
  ArrowUpRight,
  ImagePlus,
  PenLine,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

export function StartWays() {
  const items = [
    {
      icon: Sparkles,
      title: m['landing.start.idea_title'](),
      description: m['landing.start.idea_description'](),
    },
    {
      icon: ImagePlus,
      title: m['landing.start.reference_title'](),
      description: m['landing.start.reference_description'](),
    },
    {
      icon: PenLine,
      title: m['landing.start.lettering_title'](),
      description: m['landing.start.lettering_description'](),
    },
    {
      icon: RefreshCcw,
      title: m['landing.start.cover_title'](),
      description: m['landing.start.cover_description'](),
    },
  ];

  return (
    <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="max-w-3xl">
          <p className="eyebrow-vermilion">{m['landing.start.eyebrow']()}</p>
          <h2 className="font-display mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.start.title']()}
          </h2>
          <p className="text-paper-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
            {m['landing.start.description']()}
          </p>
        </div>

        <div className="border-paper-line bg-paper-line mt-12 grid gap-px overflow-hidden rounded-[1.4rem] border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <Link
              key={item.title}
              href="/chat"
              className="group bg-paper-panel flex min-h-72 flex-col p-6 transition-colors hover:bg-[#f5f1e8] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="border-paper-line text-paper-fg flex size-12 items-center justify-center rounded-full border">
                  <item.icon aria-hidden className="size-5" />
                </span>
                <span className="text-paper-muted font-display text-xs font-semibold tracking-[0.14em]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-display mt-auto pt-12 text-2xl leading-tight font-semibold tracking-[-0.035em]">
                {item.title}
              </h3>
              <p className="text-paper-muted mt-3 text-sm leading-6">
                {item.description}
              </p>
              <span className="text-paper-fg mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
                {m['landing.start.card_cta']()}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
