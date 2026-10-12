import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from './footer';
import { JokerTattoo } from './joker-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('JokerTattoo public page', () => {
  it('server-renders the generator, eight original designs and FAQ', () => {
    const html = renderToStaticMarkup(<JokerTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Joker Tattoo Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('id="faq"');
    for (const design of [
      'mask',
      'card',
      'grin',
      'jester',
      'masks',
      'diamond',
      'rose',
      'color-hat',
    ]) {
      expect(html).toContain(`/imgs/joker/${design}.webp`);
    }
    expect(html).toContain('name="personalIdea"');
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });

  it('links to the Joker page from the public footer', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('href="/joker-tattoo-generator"');
  });
});
