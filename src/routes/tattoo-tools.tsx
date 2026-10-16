import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooTools } from '@/blocks/tattoo-tools';

import { DiscoveryPageShell } from './-tattoo-discovery';
import { loadTattooTaskPage } from './-tattoo-tasks';

export const Route = createFileRoute('/tattoo-tools')({
  loader: () => loadTattooTaskPage('hub'),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooTools />
    </DiscoveryPageShell>
  ),
});
