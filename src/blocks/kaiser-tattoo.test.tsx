import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { KaiserTattoo } from './kaiser-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('KaiserTattoo server-rendered page', () => {
  it('exposes a complete public design page without the credit-card claim', () => {
    const html = renderToStaticMarkup(<KaiserTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Design your Kaiser tattoo');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('src="/imgs/kaiser/blue-rose.jpg"');
    expect(html).toContain('alt="Blue rose tattoo flash');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
