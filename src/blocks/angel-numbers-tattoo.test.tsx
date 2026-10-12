import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AngelNumbersTattoo } from './angel-numbers-tattoo';

vi.mock('@/core/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('AngelNumbersTattoo server-rendered page', () => {
  it('shows one H1, eight number designs, the generator and FAQ without the credit-card claim', () => {
    const html = renderToStaticMarkup(<AngelNumbersTattoo />);

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Angel Numbers Tattoo Generator');
    expect(html).toContain('id="generator"');
    expect(html).toContain('id="gallery"');
    expect(html).toContain('id="faq"');
    for (const style of [
      '111',
      '222',
      '333',
      '444',
      '555',
      '777',
      '888',
      '1111',
    ]) {
      expect(html).toContain(`/imgs/angel-numbers/${style}.webp`);
    }
    expect(html).toContain('name="personalIdea"');
    expect(html).not.toMatch(/No credit card required|无需信用卡/i);
  });
});
