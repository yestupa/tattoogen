import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooTaskTool } from '@/blocks/tattoo-tools';

import { DiscoveryPageShell } from './-tattoo-discovery';
import { loadTattooTaskPage } from './-tattoo-tasks';

export const Route = createFileRoute('/image-to-tattoo')({
  loader: () => loadTattooTaskPage('image'),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooTaskTool kind="image" />
    </DiscoveryPageShell>
  ),
});
