import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { BrandArtwork } from '@/components/brand-artwork';
import { buttonVariants } from '@/components/ui/button';

const artworkStyles = [
  'bg-[#f0e9dc] [&_svg]:rotate-[-7deg]',
  'bg-[#e7ddd0] [&_svg]:scale-90',
  'bg-[#f7f2e8] [&_svg]:rotate-[5deg]',
  'bg-[#d9cbbb] [&_svg]:scale-110',
  'bg-[#eee7dc] [&_svg]:-translate-x-3',
  'bg-[#e3d8ca] [&_svg]:rotate-[-3deg]',
  'bg-[#f5efe5] [&_svg]:translate-x-3',
  'bg-[#ddd0c1] [&_svg]:scale-95',
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
          {items.map((prompt, index) => (
            <article
              key={prompt}
              className={cn(
                'group border-paper-line bg-paper-panel relative overflow-hidden rounded-[1.1rem] border',
                artworkLayouts[index]
              )}
            >
              <div
                className={cn(
                  'paper-texture absolute inset-0 flex items-center justify-center',
                  artworkStyles[index]
                )}
              >
                <BrandArtwork
                  label={prompt}
                  className="text-paper-fg h-full w-auto max-w-full p-5 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="absolute right-3 bottom-3 left-3 rounded-xl border border-white/35 bg-black/72 p-3 backdrop-blur-sm">
                <p className="line-clamp-2 text-xs leading-5 text-white/80">
                  {prompt}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="text-paper-muted mt-5 text-center text-xs leading-relaxed">
          {m['landing.gallery.sample_note']()}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/chat"
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
