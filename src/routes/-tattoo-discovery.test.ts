import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

import { tattooDiscoveryPaths } from '@/content/tattoos/catalog';

import {
  loadTattooDiscoveryCollection,
  loadTattooDiscoveryDesign,
  loadTattooDiscoveryIndex,
} from './-tattoo-discovery';

vi.mock('@/blocks/header', () => ({ Header: () => null }));
vi.mock('@/blocks/footer', () => ({ Footer: () => null }));

describe('discovery public route loaders', () => {
  it('loads independent indexes and valid collection and example pages', () => {
    expect(loadTattooDiscoveryIndex('ideas').path).toBe('/tattoo-ideas');
    expect(loadTattooDiscoveryIndex('styles').path).toBe('/tattoo-styles');
    expect(loadTattooDiscoveryIndex('placements').path).toBe(
      '/tattoo-placements'
    );
    const style = loadTattooDiscoveryCollection('style', 'fine-line');
    expect(style.path).toBe('/tattoo-styles/fine-line');
    expect(style.title).toContain('Fine line');
    const design = loadTattooDiscoveryDesign('fine-line-butterfly');
    expect(design.path).toBe('/tattoo-designs/fine-line-butterfly');
    expect(design.image).toBe('/imgs/butterfly/fine-line.webp');
    expect(tattooDiscoveryPaths()).toContain(design.path);
  });

  it('throws an actual router 404 for uncurated slugs and private-style IDs', () => {
    const calls = [
      () => loadTattooDiscoveryCollection('style', 'missing'),
      () => loadTattooDiscoveryCollection('topic', 'phoenix'),
      () => loadTattooDiscoveryCollection('placement', 'forearm '),
      () => loadTattooDiscoveryDesign('user-upload-123'),
    ];
    for (const call of calls) {
      let thrown: unknown;
      try {
        call();
      } catch (error) {
        thrown = error;
      }
      expect(isNotFound(thrown)).toBe(true);
    }
  });
});
