import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ThroatTattoo } from './throat-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('ThroatTattoo server-rendered page', () => {
  it('has one H1, a workspace, five front-neck concepts and honest preview copy', () => {
    const html = renderToStaticMarkup(<ThroatTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Throat Tattoo for Men Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('/imgs/throat/ornamental.webp');
    expect(html.match(/aria-pressed="true"/g)?.length).toBeGreaterThan(0);
    expect(html).toMatch(/preset.*examples/i);
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
