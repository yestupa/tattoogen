import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { CoupleTattoo } from '@/blocks/couple-tattoo';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/couple-tattoo-generator')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['couple.meta.title']({}, { locale }),
      description: m['couple.meta.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { description, locale, title } = loaderData;
    const urlFor = (loc: typeof locale) =>
      localizeUrl(new URL('/couple-tattoo-generator', envConfigs.app_url), {
        locale: loc,
      }).href;
    const imageUrl = new URL('/imgs/couple/sun-moon.webp', envConfigs.app_url)
      .href;
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
  component: CoupleTattooPage,
});

function CoupleTattooPage() {
  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CoupleTattoo />
      </main>
      <Footer />
    </div>
  );
}
