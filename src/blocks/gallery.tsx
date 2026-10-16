import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { buttonVariants } from '@/components/ui/button';
import { tattooExamples } from '@/content/tattoos/catalog';

const featuredIds = [
  'fine-line-butterfly',
  'blackwork-eagle',
  'watercolor-blue-rose',
  'geometric-neck-ornament',
  'paired-botanical-branches',
  'fear-god-script',
  'fine-line-bare-tree',
  'sun-and-moon-pair',
];

const artworkLayouts = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  'sm:row-span-2',
  '',
  'sm:col-span-2',
  '',
  '',
];

export function Gallery() {
  const locale = getLocale();
  const items = featuredIds.flatMap((id) =>
    tattooExamples.filter((item) => item.id === id)
  );

  return (
    <section id="gallery" className="section-paper px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="text-center">
          <p className="eyebrow-vermilion">{m['landing.gallery.eyebrow']()}</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.gallery.title']()}
          </h2>
          <p className="text-paper-muted mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg">
            {m['landing.gallery.description']()}
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[16rem] gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className={cn(
                'group border-paper-line bg-paper-panel focus-within:border-vermilion focus-within:ring-vermilion relative overflow-hidden rounded-[1.1rem] border focus-within:ring-2',
                artworkLayouts[index]
              )}
            >
              <Link
                href={`/tattoo-designs/${item.id}`}
                className="touch-target absolute inset-0 flex flex-col focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
              >
                <img
                  src={item.image}
                  alt={item.title[locale]}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  className="min-h-0 w-full flex-1 object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="border-paper-line bg-paper-panel text-paper-fg block shrink-0 border-t p-4 text-sm font-semibold">
                  {item.title[locale]}
                </span>
              </Link>
            </article>
          ))}
        </div>

        <p className="text-paper-muted mt-5 text-center text-xs leading-relaxed">
          {m['landing.gallery.sample_note']()}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/tattoo-ideas"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'touch-target border-paper-fg text-paper-fg hover:bg-paper-fg hover:text-paper-bg gap-2 rounded-full bg-transparent px-6'
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
