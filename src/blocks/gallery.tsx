import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { BrandArtwork } from '@/components/brand-artwork';
import { buttonVariants } from '@/components/ui/button';

// Original artwork studies, explicitly labelled as illustrative prompts.
const swatches = [
  'bg-background',
  'bg-secondary/40',
  'bg-muted',
  'bg-secondary/70',
];

export function Gallery() {
  const items = [
    m['landing.gallery.item_1'](),
    m['landing.gallery.item_2'](),
    m['landing.gallery.item_3'](),
    m['landing.gallery.item_4'](),
    m['landing.gallery.item_5'](),
    m['landing.gallery.item_6'](),
    m['landing.gallery.item_7'](),
    m['landing.gallery.item_8'](),
  ];

  return (
    <section id="gallery" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-primary text-xs font-medium tracking-[0.18em] uppercase">
            {m['landing.gallery.eyebrow']()}
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {m['landing.gallery.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
            {m['landing.gallery.description']()}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((prompt, i) => (
            <article
              key={i}
              className="border-border bg-card shadow-soft rounded-card overflow-hidden border"
            >
              <div
                className={cn(
                  'paper-texture relative flex aspect-[4/5] w-full items-center justify-center',
                  swatches[i % swatches.length]
                )}
              >
                <BrandArtwork
                  className={cn(
                    'text-foreground h-full w-auto max-w-full p-5',
                    i % 2 === 1 && 'rotate-6'
                  )}
                />
              </div>
              <div className="p-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  &ldquo;{prompt}&rdquo;
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="text-muted-foreground mt-5 text-center text-xs leading-relaxed">
          {m['landing.gallery.sample_note']()}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/chat"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'touch-target gap-2 rounded-full px-6'
            )}
          >
            {m['landing.gallery.view_all']()}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
