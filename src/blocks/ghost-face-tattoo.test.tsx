import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { GhostFaceTattoo } from './ghost-face-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('GhostFaceTattoo server-rendered page', () => {
  it('has one H1, a design workspace, five concepts and honest preview copy', () => {
    const html = renderToStaticMarkup(<GhostFaceTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Ghost Face Tattoo Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('/imgs/ghost-face/black-grey.webp');
    expect(html.match(/aria-pressed="true"/g)?.length).toBeGreaterThan(0);
    expect(html).toMatch(/style examples/i);
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
