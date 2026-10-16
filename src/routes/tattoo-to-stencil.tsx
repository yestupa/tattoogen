import { createFileRoute } from '@tanstack/react-router';

import { createPublicPageHead } from '@/lib/public-page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { TattooCanvasTool } from '@/blocks/tattoo-canvas';

import { DiscoveryPageShell } from './-tattoo-discovery';

export const Route = createFileRoute('/tattoo-to-stencil')({
  loader: () => {
    const locale: 'en' | 'zh' = getLocale() === 'zh' ? 'zh' : 'en';
    return {
      path: '/tattoo-to-stencil',
      locale,
      title: m['canvas.stencil.title']({}, { locale }),
      description: m['canvas.stencil.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? createPublicPageHead(loaderData) : {},
  component: () => (
    <DiscoveryPageShell>
      <TattooCanvasTool mode="stencil" />
    </DiscoveryPageShell>
  ),
});
