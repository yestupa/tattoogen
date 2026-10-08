import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { WombTattoo } from '@/blocks/womb-tattoo';

export const Route = createFileRoute('/womb-tattoo-generator')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['womb.meta.title']({}, { locale }),
      description: m['womb.meta.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { description, locale, title } = loaderData;
    const urlFor = (loc: typeof locale) =>
      localizeUrl(new URL('/womb-tattoo-generator', envConfigs.app_url), {
        locale: loc,
      }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: urlFor(locale) },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
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
  component: WombTattooPage,
});

function WombTattooPage() {
  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <WombTattoo />
      </main>
      <Footer />
    </div>
  );
}
