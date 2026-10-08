import type { ComponentType } from 'react';
import { notFound, useLoaderData } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';

type PageMeta = {
  title: string;
  description: string;
  updated_at: string;
};

type PageModule = {
  default: ComponentType;
  meta: PageMeta;
};

// Eagerly bundle the static content pages (small legal/info MDX files).
// Keys are absolute from the project root.
const pages = import.meta.glob<PageModule>('/src/content/pages/*.mdx', {
  eager: true,
});

function loadPage(slug: string, locale: string): PageModule | null {
  return (
    pages[`/src/content/pages/${slug}.${locale}.mdx`] ??
    pages[`/src/content/pages/${slug}.${baseLocale}.mdx`] ??
    null
  );
}

type LoaderData = { meta: PageMeta; slug: string; locale: string };

// Shared route options for static MDX pages. Each page gets its own
// explicit route file (e.g. privacy-policy.tsx) so static segments
// always outrank dynamic ones — add a new page by creating the MDX
// content plus a thin route file using this factory.
export function staticPageRouteOptions(slug: string) {
  return {
    loader: (): LoaderData => {
      const locale = getLocale();
      const page = loadPage(slug, locale);
      if (!page) throw notFound();
      return { meta: page.meta, slug, locale };
    },
    head: ({ loaderData }: { loaderData?: LoaderData }) => {
      if (!loaderData) return {};
      const { meta, locale } = loaderData;
      const urlFor = (loc: (typeof locales)[number]) =>
        localizeUrl(new URL(`/${slug}`, envConfigs.app_url), { locale: loc })
          .href;
      const canonical = urlFor(locale as (typeof locales)[number]);
      return {
        meta: [
          { title: meta.title },
          { name: 'description', content: meta.description },
          { property: 'og:title', content: meta.title },
          { property: 'og:description', content: meta.description },
          { property: 'og:url', content: canonical },
          { name: 'twitter:title', content: meta.title },
          { name: 'twitter:description', content: meta.description },
        ],
        links: [
          { rel: 'canonical', href: canonical },
          ...locales.map((loc) => ({
            rel: 'alternate',
            hrefLang: loc,
            href: urlFor(loc),
          })),
          { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
        ],
      };
    },
    component: StaticPage,
  };
}

function StaticPage() {
  const { meta, slug, locale } = useLoaderData({
    strict: false,
  }) as LoaderData;

  const page = loadPage(slug, locale)!;
  const Content = page.default;

  return (
    <article>
      <header
        data-public-hero
        className="section-ink px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {m['common.pages.back_to_home']()}
          </Link>
          <h1 className="font-display mt-8 text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {meta.title}
          </h1>
          <p className="text-ink-muted mt-5 max-w-3xl text-base leading-7 sm:text-lg">
            {meta.description}
          </p>
          <p className="text-ink-muted mt-4 text-xs">
            {m['common.pages.last_updated']()}: {meta.updated_at}
          </p>
        </div>
      </header>
      <section className="section-paper paper-texture px-4 py-12 sm:px-6 sm:py-16">
        <div className="border-paper-line bg-paper-panel mx-auto max-w-4xl rounded-[1.4rem] border p-6 text-[15px] leading-7 shadow-[0_24px_70px_-48px_rgba(17,17,16,0.55)] sm:p-10 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
          <Content />
        </div>
      </section>
    </article>
  );
}
