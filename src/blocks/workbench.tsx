import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { BrandArtwork } from '@/components/brand-artwork';

export function Workbench() {
  const stages = [
    m['landing.workbench.stage_1'](),
    m['landing.workbench.stage_2'](),
    m['landing.workbench.stage_3'](),
  ];

  return (
    <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow-vermilion">
            {m['landing.workbench.eyebrow']()}
          </p>
          <h2 className="font-display mt-4 max-w-xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.workbench.title']()}
          </h2>
          <p className="text-ink-muted mt-6 max-w-xl text-base leading-7 sm:text-lg">
            {m['landing.workbench.description']()}
          </p>
          <ol className="border-ink-line mt-9 space-y-0 border-y">
            {stages.map((stage, index) => (
              <li
                key={stage}
                className="border-ink-line flex items-center gap-4 border-b py-4 last:border-b-0"
              >
                <span className="text-vermilion font-display text-sm font-bold">
                  0{index + 1}
                </span>
                <span className="text-ink-fg text-sm font-medium sm:text-base">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/chat"
            className="touch-target bg-ink-fg text-ink-bg mt-8 inline-flex items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            {m['landing.workbench.cta']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="border-ink-line bg-ink-panel overflow-hidden rounded-[1.5rem] border p-3 sm:p-5">
          <div className="border-ink-line bg-paper-bg relative aspect-video overflow-hidden rounded-[1rem] border">
            <div className="absolute inset-0 [background-image:linear-gradient(to_right,#211f1b_1px,transparent_1px),linear-gradient(to_bottom,#211f1b_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.09]" />
            <BrandArtwork className="text-paper-fg absolute inset-0 m-auto h-full w-auto p-6 sm:p-9" />
            <span className="bg-vermilion absolute top-4 left-4 rounded-full px-3 py-1 text-[0.65rem] font-bold tracking-[0.13em] text-white uppercase">
              {m['landing.workbench.visual_label']()}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="text-ink-muted text-sm leading-6">
              {m['landing.workbench.visual_note']()}
            </p>
            <div className="flex gap-2" aria-hidden>
              <span className="bg-ink-fg size-3 rounded-full" />
              <span className="bg-vermilion size-3 rounded-full" />
              <span className="border-ink-line size-3 rounded-full border" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
