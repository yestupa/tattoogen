import { describe, expect, it } from 'vitest';

import {
  buildPoisonTreeTattooPrompt,
  type PoisonTreeStyle,
} from './poison-tree-prompt';

describe('buildPoisonTreeTattooPrompt', () => {
  it('keeps the bare tree and trimmed personal idea', () => {
    const prompt = buildPoisonTreeTattooPrompt(
      'bare_tree',
      '  one small red apple  '
    );

    expect(prompt).toMatch(/poison tree tattoo/i);
    expect(prompt).toMatch(/bare branches/i);
    expect(prompt).toMatch(/exposed roots/i);
    expect(prompt).toContain('Personal detail: one small red apple');
    expect(prompt).not.toContain('  one small red apple  ');
  });

  it('omits a blank detail and asks for tattoo flash, not a body mockup', () => {
    const prompt = buildPoisonTreeTattooPrompt('fine_line', '   ');

    expect(prompt).toMatch(/fine-line/i);
    expect(prompt).not.toContain('Personal detail:');
    expect(prompt).toMatch(/standalone tattoo flash/i);
    expect(prompt).toMatch(/not a body mockup/i);
  });

  it('gives all five example styles distinct directions and an artist caveat', () => {
    const styles: PoisonTreeStyle[] = [
      'bare_tree',
      'fine_line',
      'blackwork',
      'poison_apple',
      'etching',
    ];
    const prompts = styles.map((style) =>
      buildPoisonTreeTattooPrompt(style, '')
    );

    expect(new Set(prompts).size).toBe(styles.length);
    expect(prompts[2]).toMatch(/blackwork/i);
    expect(prompts[3]).toMatch(/red apple/i);
    expect(prompts[4]).toMatch(/etching/i);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/tattoo artist/i);
    }
  });
});
