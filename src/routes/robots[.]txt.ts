import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = [
          'User-Agent: *',
          'Allow: /',
          'Disallow: /admin',
          'Disallow: /settings',
          'Disallow: /api/',
          ...locales.flatMap((locale) => {
            const prefix = localizeUrl(new URL('/', envConfigs.app_url), {
              locale,
            }).pathname.replace(/\/$/, '');
            return prefix
              ? ['/admin', '/settings', '/api/'].map(
                  (path) => `Disallow: ${prefix}${path}`
                )
              : [];
          }),
          'Disallow: /*?*',
          '',
          `Sitemap: ${envConfigs.app_url}/sitemap.xml`,
          '',
        ].join('\n');
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
