import { describe, expect, it, vi } from 'vitest';

import { createPublicPageHead } from '@/lib/public-page-head';

import { loadTattooTaskPage } from './-tattoo-tasks';

const { activeLocale } = vi.hoisted(() => ({ activeLocale: { value: 'en' } }));
vi.mock('@/paraglide/runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/paraglide/runtime.js')>()),
  getLocale: () => activeLocale.value,
}));

describe('task page metadata', () => {
  it('gives each public task a distinct title and locale-free canonical input', () => {
    activeLocale.value = 'en';
    const pages = (
      ['hub', 'font', 'image', 'idea', 'coverup', 'filler'] as const
    ).map(loadTattooTaskPage);
    expect(new Set(pages.map((page) => page.path)).size).toBe(6);
    expect(new Set(pages.map((page) => page.title)).size).toBe(6);
    pages.forEach((page) => {
      expect(page.description.length).toBeGreaterThan(50);
      const head = createPublicPageHead(page);
      expect(
        head.links.find((link) => link.rel === 'canonical')?.href
      ).toContain(page.path);
      expect(
        head.links
          .filter((link) => link.rel === 'alternate')
          .map((link) => link.hrefLang)
      ).toEqual(['en', 'zh', 'x-default']);
    });
  });

  it('loads real Chinese metadata and a Chinese self-canonical', () => {
    activeLocale.value = 'zh';
    const page = loadTattooTaskPage('font');
    expect(page.title).toContain('纹身字体');
    const head = createPublicPageHead(page);
    expect(head.links.find((link) => link.rel === 'canonical')?.href).toContain(
      '/zh/tattoo-font-generator'
    );
  });
});
