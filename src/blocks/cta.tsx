import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="section-ink border-ink-line border-t px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="border-ink-line bg-ink-panel relative overflow-hidden rounded-[1.5rem] border px-6 py-16 text-center sm:px-12 sm:py-24">
          <span
            aria-hidden
            className="bg-vermilion absolute top-0 left-1/2 h-px w-28 -translate-x-1/2"
          />
          <h2 className="font-display text-4xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-7xl">
            {m['landing.cta.title']()}
          </h2>
          <p className="text-ink-muted mx-auto mt-5 max-w-xl text-base leading-7 sm:text-lg">
            {m['landing.cta.subtitle']()}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'touch-target bg-ink-fg text-ink-bg gap-2 rounded-full px-7 shadow-none hover:bg-white'
              )}
            >
              {m['landing.cta.primary']()}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="#pricing"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'touch-target border-ink-line text-ink-fg hover:bg-ink-fg hover:text-ink-bg rounded-full bg-transparent px-7'
              )}
            >
              {m['landing.cta.secondary']()}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
