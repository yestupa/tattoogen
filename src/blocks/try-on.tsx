import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { BrandArtwork } from '@/components/brand-artwork';

export function TryOn() {
  return (
    <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto w-full max-w-lg">
          <div className="border-ink-line bg-ink-panel relative aspect-[4/5] overflow-hidden rounded-[2rem] border">
            <div className="absolute inset-x-[20%] -bottom-[20%] h-[112%] rounded-[48%] bg-[#bba990] shadow-[inset_0_0_80px_rgba(33,31,27,0.3)]" />
            <BrandArtwork className="text-ink-bg absolute top-[23%] left-1/2 w-[48%] -translate-x-1/2 -rotate-3 opacity-90" />
            <span className="bg-ink-bg/85 text-ink-fg border-ink-line absolute right-4 bottom-4 rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase backdrop-blur">
              {m['landing.try_on.preview_label']()}
            </span>
          </div>
          <span
            aria-hidden
            className="bg-vermilion absolute -top-3 -right-3 size-20 rounded-full opacity-80 blur-3xl"
          />
        </div>

        <div>
          <p className="eyebrow-vermilion">{m['landing.try_on.eyebrow']()}</p>
          <h2 className="font-display mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.try_on.title']()}
          </h2>
          <p className="text-ink-muted mt-6 max-w-xl text-base leading-7 sm:text-lg">
            {m['landing.try_on.description']()}
          </p>
          <p className="border-ink-line text-ink-muted mt-7 max-w-xl border-l pl-4 text-sm leading-6">
            {m['landing.try_on.note']()}
          </p>
          <Link
            href="/chat"
            className="touch-target bg-ink-fg text-ink-bg mt-8 inline-flex items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            {m['landing.try_on.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
