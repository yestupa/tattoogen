import {
  tattooExamples,
  tattooPlacements,
  tattooStyles,
  tattooTopics,
  type TattooExample,
  type TattooLocale,
} from '@/content/tattoos/catalog';

export type TattooCollectionKind = 'style' | 'placement' | 'topic';
export type TattooFilters = { query: string; style: string; placement: string };
export const emptyTattooFilters: TattooFilters = {
  query: '',
  style: '',
  placement: '',
};

const collections = {
  style: tattooStyles,
  placement: tattooPlacements,
  topic: tattooTopics,
};
const prefixes = {
  style: '/tattoo-styles',
  placement: '/tattoo-placements',
  topic: '/tattoo-ideas',
};

export function tattooCollectionPath(kind: TattooCollectionKind, slug: string) {
  return `${prefixes[kind]}/${slug}`;
}

export function findTattooCollection(kind: TattooCollectionKind, slug: string) {
  return collections[kind].find((item) => item.slug === slug);
}

export function findTattooExample(id: string) {
  return tattooExamples.find((item) => item.id === id);
}

const normalizeSearch = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase().replace(/[-_]/g, ' ').trim();

export function filterTattooExamples(
  examples: TattooExample[],
  filters: TattooFilters,
  locale: TattooLocale = 'en'
) {
  const terms = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);
  return examples.filter((item) => {
    if (filters.style && !item.styles.includes(filters.style)) return false;
    if (filters.placement && !item.placements.includes(filters.placement))
      return false;
    if (terms.length === 0) return true;
    const labels = [
      ...item.styles.map(
        (slug) => findTattooCollection('style', slug)?.label[locale] ?? slug
      ),
      ...item.placements.map(
        (slug) => findTattooCollection('placement', slug)?.label[locale] ?? slug
      ),
      ...item.topics.map(
        (slug) => findTattooCollection('topic', slug)?.label[locale] ?? slug
      ),
    ];
    const haystack = normalizeSearch(
      [
        item.title[locale],
        item.description[locale],
        ...item.styles,
        ...item.placements,
        ...item.topics,
        ...labels,
      ].join(' ')
    );
    return terms.every((term) => haystack.includes(term));
  });
}
