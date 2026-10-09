import { describe, expect, it } from 'vitest';

import {
  buildButterflyTattooPrompt,
  type ButterflyStyle,
} from './butterfly-prompt';

describe('buildButterflyTattooPrompt', () => {
  it('uses the selected butterfly style and trims the personal detail', () => {
    const prompt = buildButterflyTattooPrompt(
      'butterfly_tree',
      '  three butterflies near the roots  '
    );

    expect(prompt).toMatch(/butterfly tattoo design/i);
    expect(prompt).toMatch(/branches/i);
    expect(prompt).toContain(
      'Personal detail: three butterflies near the roots'
    );
    expect(prompt).not.toContain('  three butterflies near the roots  ');
  });

  it('makes five distinct tattoo-flash directions without a body mockup', () => {
    const styles: ButterflyStyle[] = [
      'butterfly_tree',
      'fine_line',
      'blackwork',
      'floral',
      'watercolor',
    ];
    const prompts = styles.map((style) =>
      buildButterflyTattooPrompt(style, ' ')
    );

    expect(new Set(prompts).size).toBe(styles.length);
    expect(prompts[1]).toMatch(/fine-line/i);
    expect(prompts[2]).toMatch(/blackwork/i);
    expect(prompts[3]).toMatch(/floral/i);
    expect(prompts[4]).toMatch(/watercolor/i);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/standalone tattoo flash/i);
      expect(prompt).toMatch(/not a body mockup/i);
      expect(prompt).toMatch(/tattoo artist/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
