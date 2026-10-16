import { describe, expect, it } from 'vitest';

import { tattooExamples } from '@/content/tattoos/catalog';

import {
  emptyTattooFilters,
  filterTattooExamples,
  findTattooCollection,
  findTattooExample,
} from './tattoo-discovery';

describe('tattoo discovery', () => {
  it('looks up only exact published slugs and IDs', () => {
    expect(findTattooCollection('style', 'fine-line')?.slug).toBe('fine-line');
    expect(findTattooExample('fine-line-butterfly')?.image).toBe(
      '/imgs/butterfly/fine-line.webp'
    );
    for (const unknown of [
      'missing',
      '../fine-line',
      'FINE-LINE',
      'fine-line ',
    ]) {
      expect(findTattooCollection('style', unknown)).toBeUndefined();
      expect(findTattooExample(unknown)).toBeUndefined();
    }
  });

  it('combines visible search, style and placement filters instead of broadening matches', () => {
    const result = filterTattooExamples(
      tattooExamples,
      { query: '  BUTTERFLY  ', style: 'fine-line', placement: 'forearm' },
      'en'
    );
    expect(result.map((item) => item.id)).toContain('fine-line-butterfly');
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (item) =>
          item.styles.includes('fine-line') &&
          item.placements.includes('forearm')
      )
    ).toBe(true);
    expect(
      filterTattooExamples(
        tattooExamples,
        { ...emptyTattooFilters, query: '不存在的图案' },
        'zh'
      )
    ).toEqual([]);
    expect(
      filterTattooExamples(tattooExamples, {
        ...emptyTattooFilters,
        style: 'unknown',
      })
    ).toEqual([]);
  });

  it('finds localized captions and restores the full ordered gallery on reset', () => {
    expect(
      filterTattooExamples(
        tattooExamples,
        { ...emptyTattooFilters, query: '蓝玫瑰' },
        'zh'
      ).some((item) => item.id === 'blue-rose-thorns')
    ).toBe(true);
    expect(
      filterTattooExamples(
        tattooExamples,
        { ...emptyTattooFilters, query: 'fine line' },
        'en'
      ).some((item) => item.id === 'fine-line-butterfly')
    ).toBe(true);
    expect(filterTattooExamples(tattooExamples, emptyTattooFilters)).toEqual(
      tattooExamples
    );
    expect(
      filterTattooExamples(tattooExamples, {
        ...emptyTattooFilters,
        query: '  ',
      })
    ).toEqual(tattooExamples);
  });
});
