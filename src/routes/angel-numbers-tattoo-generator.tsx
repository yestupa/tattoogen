import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { AngelNumbersTattoo } from '@/blocks/angel-numbers-tattoo';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/angel-numbers-tattoo-generator')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['angel.meta.title']({}, { locale }),
      description: m['angel.meta.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { description, locale, title } = loaderData;
    const urlFor = (loc: typeof locale) =>
      localizeUrl(
        new URL('/angel-numbers-tattoo-generator', envConfigs.app_url),
        {
          locale: loc,
        }
      ).href;
    const imageUrl = new URL(
      '/imgs/angel-numbers/1111.webp',
      envConfigs.app_url
    ).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: urlFor(locale) },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
      ],
    };
  },
  component: AngelNumbersTattooPage,
});

function AngelNumbersTattooPage() {
  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AngelNumbersTattoo />
      </main>
      <Footer />
    </div>
  );
}
