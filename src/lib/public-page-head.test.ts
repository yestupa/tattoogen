import { describe, expect, it } from 'vitest';

import { envConfigs } from '@/config';

import { createPublicPageHead } from './public-page-head';

describe('public page metadata', () => {
  it.each(['en', 'zh'] as const)(
    'owns a canonical and complete language alternates for %s',
    (locale) => {
      const head = createPublicPageHead({
        path: '/tattoo-styles/fine-line',
        locale,
        title: 'Fine line tattoo ideas',
        description: 'Explore line spacing and useful examples.',
        image: '/imgs/butterfly/fine-line.webp',
        imageWidth: 825,
        imageHeight: 1100,
        imageAlt: 'Fine line butterfly',
      });
      const origin = new URL(envConfigs.app_url).origin;
      const canonical = `${origin}${locale === 'zh' ? '/zh' : ''}/tattoo-styles/fine-line`;
      expect(head.links).toContainEqual({ rel: 'canonical', href: canonical });
      expect(
        head.links.filter((link) => link.rel === 'canonical')
      ).toHaveLength(1);
      expect(head.links.filter((link) => link.rel === 'alternate')).toEqual([
        {
          rel: 'alternate',
          hrefLang: 'en',
          href: `${origin}/tattoo-styles/fine-line`,
        },
        {
          rel: 'alternate',
          hrefLang: 'zh',
          href: `${origin}/zh/tattoo-styles/fine-line`,
        },
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: `${origin}/tattoo-styles/fine-line`,
        },
      ]);
      expect(head.meta).toContainEqual({
        title: `Fine line tattoo ideas | ${envConfigs.app_name}`,
      });
      expect(head.meta).toContainEqual({
        property: 'og:url',
        content: canonical,
      });
      expect(head.meta).toContainEqual({
        property: 'og:image',
        content: `${origin}/imgs/butterfly/fine-line.webp`,
      });
      expect(head.meta).toContainEqual({
        property: 'og:image:width',
        content: '825',
      });
      expect(head.meta).toContainEqual({
        property: 'og:image:height',
        content: '1100',
      });
      expect(head.meta).toContainEqual({
        property: 'og:image:alt',
        content: 'Fine line butterfly',
      });
    }
  );

  it('removes gallery parameters from canonical URLs and rejects nonpublic URLs', () => {
    const args = {
      locale: 'en' as const,
      title: 'Ideas',
      description: 'Public ideas',
    };
    expect(
      createPublicPageHead({
        ...args,
        path: '/tattoo-ideas?style=floral#gallery',
      }).links.find((link) => link.rel === 'canonical')?.href
    ).toBe(`${new URL(envConfigs.app_url).origin}/tattoo-ideas`);
    for (const path of [
      'https://outside.example/tattoo-ideas',
      '//outside.example/x',
      '/chat/private',
      '/api/upload',
      '/settings',
    ]) {
      expect(() => createPublicPageHead({ ...args, path })).toThrow();
    }
  });

  it('rejects encoded private paths, locale prefixes and ambiguous separators', () => {
    const args = {
      locale: 'en' as const,
      title: 'Ideas',
      description: 'Public ideas',
    };
    const rejected = [
      '/%61dmin',
      '/zh/settings',
      '/en/tattoo-ideas',
      '/%7a%68/tattoo-ideas',
      '/chat%2fprivate',
      '/tattoo-ideas%5cprivate',
      '/\\outside.example/tattoo-ideas',
      '/tattoo-ideas\\private',
      '/tattoo-ideas\u0000',
      '/tattoo-ideas%0A',
      '/%2561dmin',
      '/tattoo-ideas/%GG',
    ];
    for (const path of rejected) {
      expect(
        () => createPublicPageHead({ ...args, path }),
        JSON.stringify(path)
      ).toThrow();
    }
  });
});
