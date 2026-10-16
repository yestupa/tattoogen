import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  tattooDiscoveryPaths,
  tattooExamples,
  tattooPlacements,
  tattooStyles,
  tattooTopics,
} from './catalog';

describe('public tattoo catalog', () => {
  it('publishes a distinct curated set with truthful public image sources', () => {
    expect(tattooExamples.length).toBeGreaterThanOrEqual(20);
    expect(tattooExamples.length).toBeLessThanOrEqual(30);
    expect(new Set(tattooExamples.map((item) => item.id)).size).toBe(
      tattooExamples.length
    );
    for (const item of tattooExamples) {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(item.image).toMatch(
        /^\/imgs\/(butterfly|throat|couple|fear-god|kaiser|poison-tree|angel-numbers)\//
      );
      expect(existsSync(resolve('public', item.image.slice(1)))).toBe(true);
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
      expect(item.prompt.length).toBeGreaterThan(60);
      expect(item.generatorPath).toMatch(/^\/[a-z-]+-generator$/);
      for (const locale of ['en', 'zh'] as const) {
        expect(item.title[locale].length).toBeGreaterThan(3);
        expect(item.description[locale].length).toBeGreaterThan(30);
      }
    }
  });

  it('connects every collection to at least three real examples and valid related paths', () => {
    expect(tattooStyles.map((item) => item.slug)).toEqual([
      'fine-line',
      'blackwork',
      'watercolor',
      'floral',
      'geometric',
      'lettering',
    ]);
    expect(tattooPlacements.map((item) => item.slug)).toEqual([
      'forearm',
      'wrist',
      'finger',
      'shoulder',
    ]);
    const publicPaths = new Set(tattooDiscoveryPaths());
    const examples = new Map(tattooExamples.map((item) => [item.id, item]));
    for (const group of [tattooStyles, tattooPlacements, tattooTopics]) {
      expect(new Set(group.map((item) => item.slug)).size).toBe(group.length);
      for (const item of group) {
        expect(item.exampleIds.length).toBeGreaterThanOrEqual(3);
        expect(new Set(item.exampleIds).size).toBe(item.exampleIds.length);
        item.exampleIds.forEach((id) =>
          expect(examples.has(id), `${item.slug}: ${id}`).toBe(true)
        );
        item.relatedPaths.forEach((path) =>
          expect(
            publicPaths.has(path) || /^\/[a-z-]+-generator$/.test(path)
          ).toBe(true)
        );
        for (const locale of ['en', 'zh'] as const) {
          expect(item.intro[locale].length).toBeGreaterThan(60);
          expect(item.brief[locale].length).toBeGreaterThan(40);
          expect(item.tips.length).toBeGreaterThanOrEqual(3);
          item.tips.forEach((tip) =>
            expect(tip[locale].length).toBeGreaterThan(10)
          );
        }
      }
    }
    const slugs = {
      styles: new Set(tattooStyles.map((item) => item.slug)),
      placements: new Set(tattooPlacements.map((item) => item.slug)),
      topics: new Set(tattooTopics.map((item) => item.slug)),
    };
    tattooExamples.forEach((item) => {
      item.styles.forEach((slug) => expect(slugs.styles.has(slug)).toBe(true));
      item.placements.forEach((slug) =>
        expect(slugs.placements.has(slug)).toBe(true)
      );
      item.topics.forEach((slug) => expect(slugs.topics.has(slug)).toBe(true));
    });
  });

  it('enumerates each index, collection and detail exactly once without private or query URLs', () => {
    const paths = tattooDiscoveryPaths();
    expect(paths).toEqual(
      expect.arrayContaining([
        '/tattoo-ideas',
        '/tattoo-styles',
        '/tattoo-placements',
      ])
    );
    expect(paths.length).toBe(
      3 +
        tattooStyles.length +
        tattooPlacements.length +
        tattooTopics.length +
        tattooExamples.length
    );
    expect(new Set(paths).size).toBe(paths.length);
    expect(
      paths.every((path) =>
        /^\/tattoo-(ideas|styles|placements|designs)(\/[a-z0-9-]+)?$/.test(path)
      )
    ).toBe(true);
    expect(
      paths.some((path) => /chat|upload|share|\?|#|\/zh\//.test(path))
    ).toBe(false);
  });
});
