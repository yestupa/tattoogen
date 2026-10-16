import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { TattooTaskTool } from '@/blocks/tattoo-tools';

import { DiscoveryPageShell } from './-tattoo-discovery';
import { loadTattooTaskPage } from './-tattoo-tasks';

export const Route = createFileRoute('/tattoo-cover-up')({
  loader: () => loadTattooTaskPage('coverup'),
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooTaskTool kind="coverup" />
    </DiscoveryPageShell>
  ),
});
