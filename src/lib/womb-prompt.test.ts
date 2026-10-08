import { describe, expect, it } from 'vitest';

import { buildWombTattooPrompt } from './womb-prompt';

describe('buildWombTattooPrompt', () => {
  it('keeps the lower-abdomen composition and selected style in the agent handoff', () => {
    const prompt = buildWombTattooPrompt(
      'floral',
      '  a lotus with small stars  '
    );

    expect(prompt).toMatch(/lower abdomen/i);
    expect(prompt).toMatch(/symmetr/i);
    expect(prompt).toMatch(/lotus and mirrored botanical vines/i);
    expect(prompt).toContain('Personal idea: a lotus with small stars');
    expect(prompt).not.toContain('  a lotus with small stars  ');
  });

  it('makes a useful style prompt without optional visitor text', () => {
    const prompt = buildWombTattooPrompt('gothic', '   ');

    expect(prompt).toMatch(/gothic heart/i);
    expect(prompt).toMatch(/tattoo flash/i);
    expect(prompt).not.toContain('Personal idea:');
  });
});
