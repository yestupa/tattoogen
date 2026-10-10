import { describe, expect, it } from 'vitest';

import { buildCoupleTattooPrompt, type CoupleStyle } from './couple-prompt';

describe('buildCoupleTattooPrompt', () => {
  it('creates two complete and coordinated designs from a selected theme', () => {
    const prompt = buildCoupleTattooPrompt(
      'sun_moon',
      '  our first trip together  '
    );

    expect(prompt).toMatch(/couple tattoo design/i);
    expect(prompt).toMatch(/two separate, complete tattoo designs/i);
    expect(prompt).toMatch(/sun/i);
    expect(prompt).toMatch(/moon/i);
    expect(prompt).toContain('Personal detail: our first trip together');
    expect(prompt).not.toContain('  our first trip together  ');
  });

  it('keeps the five themes distinct and avoids text, mockups and watermarks', () => {
    const styles: CoupleStyle[] = [
      'sun_moon',
      'matching_hearts',
      'botanical',
      'swallows',
      'mountain_wave',
    ];
    const prompts = styles.map((style) => buildCoupleTattooPrompt(style, ' '));

    expect(new Set(prompts).size).toBe(styles.length);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/standalone tattoo flash/i);
      expect(prompt).toMatch(/not a body mockup/i);
      expect(prompt).toMatch(/no text or watermark/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
