import { describe, expect, it } from 'vitest';

import { buildJokerTattooPrompt, type JokerStyle } from './joker-prompt';

describe('buildJokerTattooPrompt', () => {
  it('uses the chosen design direction and a trimmed personal detail', () => {
    const prompt = buildJokerTattooPrompt(
      'card',
      '  a vintage playing card with a small rose  '
    );

    expect(prompt).toMatch(/joker tattoo design/i);
    expect(prompt).toMatch(/playing card/i);
    expect(prompt).toContain(
      'Personal detail: a vintage playing card with a small rose'
    );
    expect(prompt).not.toContain('  a vintage');
    expect(prompt).toMatch(/original jester/i);
    expect(prompt).toMatch(/no body mockup/i);
    expect(prompt).toMatch(/no watermark/i);
  });

  it('gives all eight gallery concepts distinct prompts', () => {
    const styles: JokerStyle[] = [
      'mask',
      'card',
      'grin',
      'jester',
      'masks',
      'diamond',
      'rose',
      'color_hat',
    ];
    const prompts = styles.map((style) => buildJokerTattooPrompt(style, ' '));

    expect(new Set(prompts).size).toBe(styles.length);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/standalone tattoo flash/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
