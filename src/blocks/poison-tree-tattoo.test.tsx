import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { PoisonTreeTattoo } from './poison-tree-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PoisonTreeTattoo server-rendered page', () => {
  it('renders one heading, generator, style gallery and clear examples', () => {
    const html = renderToStaticMarkup(<PoisonTreeTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Poison Tree Tattoo Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('src="/imgs/poison-tree/bare-tree.webp"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toMatch(/style examples/i);
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
