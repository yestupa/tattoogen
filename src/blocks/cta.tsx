import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="border-border from-secondary via-card to-card shadow-panel rounded-shell relative mx-auto max-w-6xl overflow-hidden border bg-gradient-to-br px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="relative">
          <h2 className="text-foreground font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {m['landing.cta.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base sm:text-lg">
            {m['landing.cta.subtitle']()}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'touch-target gap-2 rounded-full px-7'
              )}
            >
              {m['landing.cta.primary']()}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="#pricing"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'touch-target rounded-full px-7'
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
