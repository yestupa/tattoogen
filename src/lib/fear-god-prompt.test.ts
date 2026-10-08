import { describe, expect, it } from 'vitest';

import { buildFearGodTattooPrompt } from './fear-god-prompt';

describe('buildFearGodTattooPrompt', () => {
  it('preserves the exact lettering, selected script style, and trimmed idea', () => {
    const prompt = buildFearGodTattooPrompt('script', '  small olive leaves  ');

    expect(prompt).toContain('FEAR GOD');
    expect(prompt).toMatch(/flowing script/i);
    expect(prompt).toContain('Personal idea: small olive leaves');
    expect(prompt).not.toContain('  small olive leaves  ');
    expect(prompt).toMatch(/verify.*spelling/i);
  });

  it('omits an empty optional idea while retaining the blackletter direction', () => {
    const prompt = buildFearGodTattooPrompt('gothic', '   ');

    expect(prompt).toMatch(/blackletter/i);
    expect(prompt).toMatch(/tattoo flash/i);
    expect(prompt).not.toContain('Personal idea:');
  });

  it('distinguishes the praying-hands symbol treatment', () => {
    const prompt = buildFearGodTattooPrompt('hands', 'forearm placement');

    expect(prompt).toMatch(/praying hands/i);
    expect(prompt).toContain('Personal idea: forearm placement');
  });
});
