import { tattooPlacements, tattooStyles, tattooTopics } from './collections';
import { tattooExamples } from './examples';

export type {
  TattooLocale,
  LocalizedText,
  TattooExample,
  TattooCollection,
} from './types';
export { tattooExamples, tattooStyles, tattooPlacements, tattooTopics };

/** Locale-free, curated public routes only. Used by hubs and the sitemap. */
export function tattooDiscoveryPaths(): string[] {
  return [
    '/tattoo-ideas',
    '/tattoo-styles',
    '/tattoo-placements',
    ...tattooStyles.map((item) => `/tattoo-styles/${item.slug}`),
    ...tattooPlacements.map((item) => `/tattoo-placements/${item.slug}`),
    ...tattooTopics.map((item) => `/tattoo-ideas/${item.slug}`),
    ...tattooExamples.map((item) => `/tattoo-designs/${item.id}`),
  ];
}
