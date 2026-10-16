import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { TattooCanvasTool } from '@/blocks/tattoo-canvas';

import { DiscoveryPageShell } from './-tattoo-discovery';

export const Route = createFileRoute('/try-tattoo')({
  loader: () => {
    const locale: 'en' | 'zh' = getLocale() === 'zh' ? 'zh' : 'en';
    return {
      path: '/try-tattoo',
      locale,
      title: m['canvas.tryon.title']({}, { locale }),
      description: m['canvas.tryon.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooCanvasTool mode="tryon" />
    </DiscoveryPageShell>
  ),
});
