import { describe, expect, it } from 'vitest';

import {
  buildAngelNumbersTattooPrompt,
  type AngelNumberStyle,
} from './angel-numbers-prompt';

describe('buildAngelNumbersTattooPrompt', () => {
  it('preserves the exact chosen number and trims the personal idea', () => {
    const prompt = buildAngelNumbersTattooPrompt(
      '11:11',
      '  a quiet reminder of my grandmother  '
    );

    expect(prompt).toMatch(/angel numbers tattoo design/i);
    expect(prompt).toContain('11:11');
    expect(prompt).toContain('four ones separated by one colon');
    expect(prompt).toContain(
      'Personal detail: a quiet reminder of my grandmother'
    );
    expect(prompt).not.toContain('  a quiet reminder');
  });

  it('gives each of eight presets a distinct direction without inventing meanings', () => {
    const styles: AngelNumberStyle[] = [
      '111',
      '222',
      '333',
      '444',
      '555',
      '777',
      '888',
      '11:11',
    ];
    const prompts = styles.map((style) =>
      buildAngelNumbersTattooPrompt(style, ' ')
    );

    expect(new Set(prompts).size).toBe(styles.length);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/tattoo flash/i);
      expect(prompt).toMatch(/exact selected sequence/i);
      expect(prompt).toMatch(/no body mockup/i);
      expect(prompt).toMatch(/no watermark/i);
      expect(prompt).not.toContain('Personal detail:');
    }
  });
});
