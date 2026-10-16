import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tattooExamples } from '@/content/tattoos/catalog';

import {
  TattooDiscoveryCollection,
  TattooDiscoveryDesign,
  TattooDiscoveryIndex,
} from './tattoo-discovery';

const { localeState } = vi.hoisted(() => ({ localeState: { value: 'en' } }));

vi.mock('@/lib/agent', () => ({ newAgentSessionId: () => 's-discovery-test' }));
vi.mock('@/paraglide/runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/paraglide/runtime.js')>()),
  getLocale: () => localeState.value,
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

describe('discovery server-rendered content', () => {
  beforeEach(() => {
    localeState.value = 'en';
  });

  it('renders the default gallery, visible filters and published detail links without interaction', () => {
    const html = renderToStaticMarkup(<TattooDiscoveryIndex kind="ideas" />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('type="search"');
    expect(html).toContain('id="discovery-style"');
    expect(html).toContain('id="discovery-placement"');
    expect(html).toContain('Reset filters');
    tattooExamples.forEach((item) =>
      expect(html).toContain(`/tattoo-designs/${item.id}`)
    );
    expect(html).toContain('width="825"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('/tattoo-ideas/phoenix');
  });

  it('renders useful collection guidance and separate example captions', () => {
    const html = renderToStaticMarkup(
      <TattooDiscoveryCollection kind="topic" slug="sun-and-moon" />
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('not additional sun-and-moon pairs');
    expect(html).toContain('333 beneath a crescent moon');
    expect(html).toContain('11:11 with a star');
    expect(html).toContain('/couple-tattoo-generator');
    expect(html).toContain('/try-tattoo');
    expect(html).toContain('/tattoo-to-stencil');
  });

  it('renders a real prompt, exact public image and relevant tool links on example detail', () => {
    const html = renderToStaticMarkup(
      <TattooDiscoveryDesign designId="fine-line-butterfly" />
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('/imgs/butterfly/fine-line.webp');
    expect(html).toContain('sparse wing veins');
    expect(html).toContain('Reuse this prompt');
    expect(html).toContain('/tattoo-styles/fine-line');
    expect(html).toContain('/butterfly-tattoo-generator');
    expect(html).toContain('/try-tattoo');
    expect(html).toContain('/tattoo-to-stencil');
    expect(html).not.toMatch(
      /verified customer|customer photo|finished tattoo/i
    );
  });

  it('renders actual Chinese collection and detail content in Chinese locale', () => {
    localeState.value = 'zh';
    const collection = renderToStaticMarkup(
      <TattooDiscoveryCollection kind="placement" slug="finger" />
    );
    expect(collection).toContain('适合与纹身师一起简化的手指纹身灵感');
    expect(collection).toContain('部位适配方向');
    expect(collection).toContain('面包屑导航');
    const detail = renderToStaticMarkup(
      <TattooDiscoveryDesign designId="fine-line-butterfly" />
    );
    expect(detail).toContain('复用这段提示词');
    expect(detail).toContain('细线蝴蝶');
    expect(detail.match(/<h1\b/g)).toHaveLength(1);
  });
});
