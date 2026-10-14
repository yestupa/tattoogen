import { describe, expect, it, vi } from 'vitest';

import { serverAsyncLocalStorage } from './paraglide/runtime.js';
import server from './server';

vi.mock('@tanstack/react-start/server-entry', () => ({
  default: {
    fetch: async (request: Request) => {
      const { getLocale, localizeUrl } = await import('./paraglide/runtime.js');
      const initialLocale = getLocale();
      await new Promise((resolve) => setTimeout(resolve, 5));
      return Response.json({
        initialLocale,
        locale: getLocale(),
        canonical: localizeUrl(new URL('/', request.url)).href,
      });
    },
  },
}));

describe('SSR locale isolation', () => {
  it('has a stable locale context before the first request starts', () => {
    expect(serverAsyncLocalStorage).toBeDefined();
  });

  it('keeps overlapping English and Chinese requests in their own locale', async () => {
    const context = serverAsyncLocalStorage;
    const locales = Array.from({ length: 20 }, (_, index) =>
      index % 2 === 0 ? 'en' : 'zh'
    );
    const results = await Promise.all(
      locales.map(async (locale) => {
        const path = locale === 'zh' ? '/zh' : '/';
        const response = await server.fetch(
          new Request(`https://tattoo.example${path}`)
        );
        return response.json();
      })
    );
    expect(serverAsyncLocalStorage).toBe(context);
    results.forEach((result, index) => {
      const locale = locales[index];
      expect(result).toEqual({
        initialLocale: locale,
        locale,
        canonical: `https://tattoo.example${locale === 'zh' ? '/zh' : '/'}`,
      });
    });
  });
});
