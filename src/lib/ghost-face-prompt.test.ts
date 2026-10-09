import { describe, expect, it } from 'vitest';

import {
  buildGhostFaceTattooPrompt,
  type GhostFaceStyle,
} from './ghost-face-prompt';

describe('buildGhostFaceTattooPrompt', () => {
  it('uses the selected mask style and trims the personal idea', () => {
    const prompt = buildGhostFaceTattooPrompt(
      'black_grey',
      '  cracked porcelain texture  '
    );

    expect(prompt).toMatch(/ghostly mask tattoo design/i);
    expect(prompt).toMatch(/black-and-grey/i);
    expect(prompt).toContain('Personal detail: cracked porcelain texture.');
    expect(prompt).not.toContain('  cracked porcelain texture  ');
    expect(prompt).toMatch(/plain light background/i);
    expect(prompt).toMatch(/tattoo artist should adapt/i);
  });

  it('provides five distinct directions and no mockup or watermark', () => {
    const styles: GhostFaceStyle[] = [
      'black_grey',
      'fine_line',
      'blackwork',
      'sketch',
      'black_crimson',
    ];
    const prompts = styles.map((style) =>
      buildGhostFaceTattooPrompt(style, ' ')
    );

    expect(new Set(prompts).size).toBe(styles.length);
    expect(prompts[1]).toMatch(/fine-line/i);
    expect(prompts[2]).toMatch(/blackwork/i);
    expect(prompts[3]).toMatch(/sketch/i);
    expect(prompts[4]).toMatch(/crimson/i);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/standalone tattoo flash/i);
      expect(prompt).toMatch(/not a body mockup/i);
      expect(prompt).toMatch(/no text or watermark/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
