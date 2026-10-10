import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CoupleTattoo } from './couple-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('CoupleTattoo server-rendered page', () => {
  it('renders the design reference, working generator, five pairs and FAQ', () => {
    const html = renderToStaticMarkup(<CoupleTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Couple Tattoo Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('id="faq"');
    expect(html).toContain('/imgs/couple/sun-moon.webp');
    expect(html).toContain('/imgs/couple/matching-hearts.webp');
    expect(html).toContain('/imgs/couple/botanical.webp');
    expect(html).toContain('/imgs/couple/swallows.webp');
    expect(html).toContain('/imgs/couple/mountain-wave.webp');
    expect(html).toMatch(/style preview/i);
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
