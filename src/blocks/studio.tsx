import { ArrowRight, Download, Layers3, MessageCircleMore } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { BrandArtwork } from '@/components/brand-artwork';

export function Studio() {
  const items = [
    {
      icon: MessageCircleMore,
      text: m['landing.studio.feature_1'](),
    },
    { icon: Layers3, text: m['landing.studio.feature_2']() },
    { icon: Download, text: m['landing.studio.feature_3']() },
  ];

  return (
    <section className="section-paper px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <p className="eyebrow-vermilion">{m['landing.studio.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.studio.title']()}
          </h2>
          <p className="text-paper-muted mt-6 max-w-xl text-base leading-7 sm:text-lg">
            {m['landing.studio.description']()}
          </p>
          <ul className="mt-8 grid gap-3">
            {items.map((item) => (
              <li
                key={item.text}
                className="border-paper-line bg-paper-panel flex items-center gap-4 rounded-xl border px-4 py-3"
              >
                <span className="bg-paper-fg text-paper-bg flex size-9 shrink-0 items-center justify-center rounded-full">
                  <item.icon aria-hidden className="size-4" />
                </span>
                <span className="text-sm font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/chat"
            className="touch-target bg-paper-fg text-paper-bg mt-8 inline-flex items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            {m['landing.studio.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="border-paper-line bg-paper-panel rounded-[1.5rem] border p-5 shadow-[0_24px_70px_-48px_rgba(17,17,16,0.55)] sm:p-7">
          <div className="border-paper-line flex items-center justify-between border-b pb-4">
            <span className="font-display text-xs font-bold tracking-[0.14em] uppercase">
              {m['landing.studio.card_label']()}
            </span>
            <span className="bg-vermilion size-2.5 rounded-full" />
          </div>
          <div className="paper-texture border-paper-line bg-paper-bg mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-xl border">
            <BrandArtwork className="text-paper-fg h-full w-auto p-8" />
          </div>
          <p className="text-paper-muted mt-5 text-sm leading-6">
            {m['landing.studio.card_note']()}
          </p>
        </div>
      </div>
    </section>
  );
}
