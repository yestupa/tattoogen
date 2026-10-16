import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooDiscoveryCollection } from '@/blocks/tattoo-discovery';

import {
  DiscoveryPageShell,
  loadTattooDiscoveryCollection,
} from '../-tattoo-discovery';

export const Route = createFileRoute('/tattoo-placements/$slug')({
  loader: ({ params }) =>
    loadTattooDiscoveryCollection('placement', params.slug),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useLoaderData();
  return (
    <DiscoveryPageShell>
      <TattooDiscoveryCollection kind="placement" slug={slug} />
    </DiscoveryPageShell>
  );
}
