import type { ReactNode } from 'react';
import { notFound } from '@tanstack/react-router';

import {
  findTattooCollection,
  findTattooExample,
  tattooCollectionPath,
  type TattooCollectionKind,
} from '@/lib/tattoo-discovery';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import type { TattooLocale } from '@/content/tattoos/catalog';
import { discoveryIndexes } from '@/content/tattoos/discovery-copy';

const currentLocale = (): TattooLocale => (getLocale() === 'zh' ? 'zh' : 'en');

export function loadTattooDiscoveryIndex(
  kind: 'ideas' | 'styles' | 'placements'
) {
  const locale = currentLocale();
  const page = discoveryIndexes[kind];
  return {
    kind,
    locale,
    path: `/tattoo-${kind}`,
    title: page.title[locale],
    description: page.description[locale],
  };
}

export function loadTattooDiscoveryCollection(
  kind: TattooCollectionKind,
  slug: string
) {
  const collection = findTattooCollection(kind, slug);
  if (!collection) throw notFound();
  const locale = currentLocale();
  const example = findTattooExample(collection.exampleIds[0])!;
  return {
    kind,
    slug,
    locale,
    path: tattooCollectionPath(kind, slug),
    title: collection.title[locale],
    description: collection.description[locale],
    image: example.image,
    imageWidth: example.width,
    imageHeight: example.height,
    imageAlt: example.title[locale],
  };
}

export function loadTattooDiscoveryDesign(designId: string) {
  const example = findTattooExample(designId);
  if (!example) throw notFound();
  const locale = currentLocale();
  return {
    designId,
    locale,
    path: `/tattoo-designs/${designId}`,
    title: example.title[locale],
    description: example.description[locale],
    image: example.image,
    imageWidth: example.width,
    imageHeight: example.height,
    imageAlt: example.title[locale],
  };
}

export function DiscoveryPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ink-bg text-ink-fg flex min-h-screen flex-col">
      <Header />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
