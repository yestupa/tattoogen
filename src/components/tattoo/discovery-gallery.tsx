import { useId, useState } from 'react';
import { ArrowUpRight, RotateCcw, Search } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import {
  emptyTattooFilters,
  filterTattooExamples,
} from '@/lib/tattoo-discovery';
import type { TattooExample, TattooLocale } from '@/content/tattoos/catalog';
import type { DiscoveryCopy } from '@/content/tattoos/discovery-copy';

type FilterOption = { value: string; label: string };
type GalleryLabels = Pick<
  DiscoveryCopy,
  | 'galleryTitle'
  | 'searchLabel'
  | 'searchPlaceholder'
  | 'styleLabel'
  | 'placementLabel'
  | 'allStyles'
  | 'allPlacements'
  | 'reset'
  | 'results'
  | 'emptyTitle'
  | 'emptyDescription'
  | 'viewDesign'
>;

export function DiscoveryGallery({
  examples,
  locale,
  styles,
  placements,
  labels,
}: {
  examples: TattooExample[];
  locale: TattooLocale;
  styles: FilterOption[];
  placements: FilterOption[];
  labels: GalleryLabels;
}) {
  const [filters, setFilters] = useState({ ...emptyTattooFilters });
  const searchId = useId();
  const visible = filterTattooExamples(examples, filters, locale);
  const inputClass =
    'mt-2 min-h-11 w-full min-w-0 rounded-lg border border-paper-line bg-paper-panel px-3 py-2 text-sm text-paper-fg outline-offset-2 focus-visible:outline-2 focus-visible:outline-vermilion';
  const isFiltered = Boolean(
    filters.query || filters.style || filters.placement
  );
  return (
    <section
      id="gallery"
      className="section-paper scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="section-shell min-w-0">
        <h2 className="font-display max-w-3xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          {labels.galleryTitle}
        </h2>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="border-paper-line mt-7 grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        >
          <label htmlFor={searchId} className="min-w-0 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Search aria-hidden className="size-4" />
              {labels.searchLabel}
            </span>
            <input
              id={searchId}
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  query: event.target.value,
                }))
              }
              placeholder={labels.searchPlaceholder}
              className={inputClass}
            />
          </label>
          <label
            htmlFor="discovery-style"
            className="min-w-0 text-sm font-semibold"
          >
            {labels.styleLabel}
            <select
              id="discovery-style"
              value={filters.style}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  style: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">{labels.allStyles}</option>
              {styles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label
            htmlFor="discovery-placement"
            className="min-w-0 text-sm font-semibold"
          >
            {labels.placementLabel}
            <select
              id="discovery-placement"
              value={filters.placement}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  placement: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">{labels.allPlacements}</option>
              {placements.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setFilters({ ...emptyTattooFilters })}
            disabled={!isFiltered}
            className="touch-target border-paper-line hover:border-vermilion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold disabled:opacity-45"
          >
            <RotateCcw aria-hidden className="size-4" />
            {labels.reset}
          </button>
        </form>
        <p
          role="status"
          aria-live="polite"
          className="text-paper-muted mt-5 text-sm"
        >
          {labels.results.replace('{count}', String(visible.length))}
        </p>
        {visible.length === 0 ? (
          <div className="border-paper-line mt-6 rounded-2xl border border-dashed p-8 text-center">
            <h3 className="font-display text-xl font-bold">
              {labels.emptyTitle}
            </h3>
            <p className="text-paper-muted mx-auto mt-3 max-w-lg text-sm leading-7">
              {labels.emptyDescription}
            </p>
            <button
              type="button"
              onClick={() => setFilters({ ...emptyTattooFilters })}
              className="text-vermilion mt-5 min-h-11 px-4 text-sm font-bold underline underline-offset-4"
            >
              {labels.reset}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((item) => (
              <article
                key={item.id}
                className="border-paper-line bg-paper-panel focus-within:border-vermilion focus-within:ring-vermilion min-w-0 overflow-hidden rounded-2xl border focus-within:ring-2"
              >
                <Link
                  href={`/tattoo-designs/${item.id}`}
                  className="group focus-visible:outline-vermilion block focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="aspect-square overflow-hidden bg-[#f0ece3]">
                    <img
                      src={item.image}
                      alt={item.title[locale]}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg leading-snug font-bold">
                      {item.title[locale]}
                    </h3>
                    <p className="text-paper-muted mt-2 text-sm leading-6">
                      {item.description[locale]}
                    </p>
                    <span className="text-vermilion mt-4 inline-flex items-center gap-1.5 text-xs font-bold">
                      {labels.viewDesign}
                      <ArrowUpRight aria-hidden className="size-4 shrink-0" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
