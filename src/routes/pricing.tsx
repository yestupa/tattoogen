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
import { Pricing } from '@/blocks/pricing';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['landing.pricing.title']({}, { locale }),
      description: m['landing.pricing.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { description, locale } = loaderData;
    const title = `${loaderData.title} | ${envConfigs.app_name}`;
    const urlFor = (loc: typeof locale) =>
      localizeUrl(new URL('/pricing', envConfigs.app_url), { locale: loc })
        .href;
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
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section
          data-public-hero
          className="section-ink px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="section-shell text-center">
            <p className="eyebrow-vermilion">
              {m['landing.pricing.eyebrow']()}
            </p>
            <h1 className="font-display mx-auto mt-4 max-w-3xl text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
              {m['landing.pricing.title']()}
            </h1>
            <p className="text-ink-muted mx-auto mt-5 max-w-xl text-base leading-7 sm:text-lg">
              {m['landing.pricing.description']()}
            </p>
          </div>
        </section>
        <section className="section-paper paper-texture px-4 py-16 sm:px-6 sm:py-24">
          <div className="section-shell">
            <Pricing compact />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
