import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooDiscoveryIndex } from '@/blocks/tattoo-discovery';

import {
  DiscoveryPageShell,
  loadTattooDiscoveryIndex,
} from '../-tattoo-discovery';

export const Route = createFileRoute('/tattoo-ideas/')({
  loader: () => loadTattooDiscoveryIndex('ideas'),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooDiscoveryIndex kind="ideas" />
    </DiscoveryPageShell>
  ),
});
