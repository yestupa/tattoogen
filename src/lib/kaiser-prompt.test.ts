import { describe, expect, it } from 'vitest';

import { buildKaiserTattooPrompt, type KaiserStyle } from './kaiser-prompt';

describe('buildKaiserTattooPrompt', () => {
  it('keeps the blue rose, fine-line direction and trimmed personal idea', () => {
    const prompt = buildKaiserTattooPrompt('fine_line', '  small crown  ');

    expect(prompt).toMatch(/blue rose/i);
    expect(prompt).toMatch(/fine-line/i);
    expect(prompt).toContain('Personal idea: small crown');
    expect(prompt).not.toContain('  small crown  ');
    expect(prompt).toMatch(/independent fan-inspired/i);
  });

  it('omits a blank idea and keeps the blue-rose thorn direction', () => {
    const prompt = buildKaiserTattooPrompt('blue_rose', '   ');

    expect(prompt).toMatch(/thorn vines/i);
    expect(prompt).not.toContain('Personal idea:');
    expect(prompt).toMatch(/tattoo flash/i);
  });

  it('distinguishes all five motifs without asking for official character art', () => {
    const styles: KaiserStyle[] = [
      'blue_rose',
      'fine_line',
      'thornwork',
      'crown',
      'watercolor',
    ];
    const prompts = styles.map((style) => buildKaiserTattooPrompt(style, ''));

    expect(new Set(prompts).size).toBe(styles.length);
    expect(prompts[2]).toMatch(/blackwork/i);
    expect(prompts[3]).toMatch(/keyhole/i);
    expect(prompts[4]).toMatch(/watercolor/i);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/no official logos or character portrait/i);
      expect(prompt).toMatch(/tattoo artist/i);
    }
  });
});
