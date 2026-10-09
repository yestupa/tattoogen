import { describe, expect, it } from 'vitest';

import {
  buildThroatTattooPrompt,
  type ThroatTattooStyle,
} from './throat-tattoo-prompt';

describe('buildThroatTattooPrompt', () => {
  it('uses the selected front-neck motif and trims a personal detail', () => {
    const prompt = buildThroatTattooPrompt(
      'ornamental',
      '  small star below the center  '
    );

    expect(prompt).toMatch(/front of the neck/i);
    expect(prompt).toMatch(/ornamental.*dotwork/i);
    expect(prompt).toContain('Personal detail: small star below the center.');
    expect(prompt).not.toContain('  small star below the center  ');
    expect(prompt).toMatch(/plain light background/i);
    expect(prompt).toMatch(/tattoo artist should adapt/i);
  });

  it('offers five distinct directions without a mockup or watermark', () => {
    const styles: ThroatTattooStyle[] = [
      'ornamental',
      'blackwork_wings',
      'rose',
      'snake',
      'geometric',
    ];
    const prompts = styles.map((style) => buildThroatTattooPrompt(style, ' '));

    expect(new Set(prompts).size).toBe(styles.length);
    expect(prompts[1]).toMatch(/blackwork.*wings/i);
    expect(prompts[2]).toMatch(/rose/i);
    expect(prompts[3]).toMatch(/snake/i);
    expect(prompts[4]).toMatch(/geometric/i);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/standalone tattoo flash/i);
      expect(prompt).toMatch(/not a body mockup/i);
      expect(prompt).toMatch(/no text or watermark/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
