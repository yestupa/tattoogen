import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooDiscoveryDesign } from '@/blocks/tattoo-discovery';

import {
  DiscoveryPageShell,
  loadTattooDiscoveryDesign,
} from '../-tattoo-discovery';

export const Route = createFileRoute('/tattoo-designs/$designId')({
  loader: ({ params }) => loadTattooDiscoveryDesign(params.designId),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: DesignPage,
});

function DesignPage() {
  const { designId } = Route.useLoaderData();
  return (
    <DiscoveryPageShell>
      <TattooDiscoveryDesign designId={designId} />
    </DiscoveryPageShell>
  );
}
