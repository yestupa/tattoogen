import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import type { TattooLocale } from '@/content/tattoos/catalog';

export type PublicPageHeadInput = {
  /** Locale-free route path. Query and hash are omitted from the canonical. */
  path: string;
  locale: TattooLocale;
  title: string;
  description: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
};

function publicPathname(path: string, origin: string) {
  const unsafeCharacters = /[\\\u0000-\u001f\u007f-\u009f]/;
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    unsafeCharacters.test(path)
  )
    throw new Error('An unambiguous public local path is required');

  const url = new URL(path, origin);
  if (url.origin !== origin || /%(?:2f|5c)/i.test(url.pathname))
    throw new Error('Public paths must stay on the configured origin');

  // Decode before comparing access-sensitive segments. Residual escapes are
  // rejected so another decoder cannot turn a second layer into a private URL.
  const decoded = decodeURIComponent(url.pathname);
  if (unsafeCharacters.test(decoded) || /%[0-9a-f]{2}/i.test(decoded))
    throw new Error(
      'Encoded path separators and nested escapes are unsupported'
    );
  const normalized = decoded.toLowerCase();
  if (
    /^\/(?:api|chat|share|settings|admin)(?:\/|$)/.test(normalized) ||
    locales.some(
      (locale) =>
        normalized === '/' + locale || normalized.startsWith('/' + locale + '/')
    )
  )
    throw new Error('A locale-free public route is required');

  return url.pathname.replace(/\/$/, '') || '/';
}

export function createPublicPageHead({
  path,
  locale,
  title,
  description,
  image = '/logo.png',
  imageWidth,
  imageHeight,
  imageAlt = title,
}: PublicPageHeadInput) {
  const origin = new URL(envConfigs.app_url).origin;
  const pathname = publicPathname(path, origin);
  const urlFor = (targetLocale: TattooLocale) =>
    localizeUrl(new URL(pathname, origin), { locale: targetLocale }).href;
  const canonical = urlFor(locale);
  const pageTitle = `${title} | ${envConfigs.app_name}`;
  const imageUrl = new URL(image, origin).href;
  return {
    meta: [
      { title: pageTitle },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: envConfigs.app_name },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: imageUrl },
      ...(imageWidth && imageHeight
        ? [
            { property: 'og:image:width', content: String(imageWidth) },
            { property: 'og:image:height', content: String(imageHeight) },
          ]
        : []),
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: imageAlt },
    ],
    links: [
      { rel: 'canonical', href: canonical },
      ...locales.map((targetLocale) => ({
        rel: 'alternate',
        hrefLang: targetLocale,
        href: urlFor(targetLocale),
      })),
      { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
    ],
  };
}
