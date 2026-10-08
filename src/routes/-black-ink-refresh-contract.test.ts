import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('black ink site refresh contracts', () => {
  it('uses the approved ink paper and vermilion anchors', () => {
    const css = source('../styles/globals.css').toLowerCase();
    expect(css).toContain('--ink-bg: #111110;');
    expect(css).toContain('--ink-panel: #1a1a18;');
    expect(css).toContain('--paper-bg: #faf8f4;');
    expect(css).toContain('--vermilion: #a83e2c;');
  });

  it('keeps small accent copy readable on ink surfaces', () => {
    const css = source('../styles/globals.css').toLowerCase();
    expect(css).toContain('--vermilion-on-ink: #cf6651;');
    expect(css).toMatch(
      /\.section-ink\s+\.eyebrow-vermilion\s*\{[^}]*var\(--vermilion-on-ink\)/
    );
    expect(css).toMatch(
      /\.landing-hero-launcher\s*\{[^}]*--muted-foreground:\s*var\(--ink-muted\)/
    );
  });

  it('includes visible dropdown copy in accessible names', () => {
    const settings = source('../components/agent/composer-settings.tsx');
    const localeSelector = source('../components/locale-selector.tsx');
    expect(settings).toContain(
      'aria-label={`${resolutionLabel} · ${aspectLabel}.'
    );
    expect(localeSelector).toContain("variant === 'pill'");
    expect(localeSelector).toContain('`${localeName}. ${label}`');
  });

  it('composes the approved homepage narrative', () => {
    const home = source('./index.tsx');
    expect(home.indexOf('<Hero')).toBeLessThan(home.indexOf('<Stats'));
    expect(home.indexOf('<Stats')).toBeLessThan(home.indexOf('<StartWays'));
    expect(home.indexOf('<StartWays')).toBeLessThan(home.indexOf('<Workbench'));
    expect(home.indexOf('<Workbench')).toBeLessThan(home.indexOf('<Features'));
    expect(home.indexOf('<Features')).toBeLessThan(home.indexOf('<Steps'));
    expect(home.indexOf('<Steps')).toBeLessThan(home.indexOf('<Gallery'));
    expect(home.indexOf('<Gallery')).toBeLessThan(home.indexOf('<TryOn'));
    expect(home.indexOf('<TryOn')).toBeLessThan(home.indexOf('<Studio'));
    expect(home.indexOf('<Studio')).toBeLessThan(home.indexOf('<Reviews'));
    expect(home.indexOf('<Reviews')).toBeLessThan(home.indexOf('<Pricing'));
    expect(home.indexOf('<Pricing')).toBeLessThan(home.indexOf('<Blog'));
    expect(home.indexOf('<Blog')).toBeLessThan(home.indexOf('<FAQ'));
    expect(home.indexOf('<FAQ')).toBeLessThan(home.indexOf('<CTA'));
  });

  it('does not publish the removed disclaimer or remote reference assets', () => {
    const combined =
      source('../../messages/en.json') +
      source('../../messages/zh.json') +
      source('./index.tsx');
    expect(combined).not.toContain('No credit card required');
    expect(combined).not.toContain('无需信用卡');
    expect(combined).not.toMatch(/tat\.ink/i);
  });

  it('loads Archivo locally without the legacy serif display font', () => {
    const root = source('./__root.tsx');
    const packageJson = source('../../package.json');
    expect(root).toContain('@fontsource-variable/archivo');
    expect(packageJson).toContain('"@fontsource-variable/archivo"');
    expect(root).not.toContain('@fontsource/libre-baskerville');
    expect(packageJson).not.toContain('"@fontsource/libre-baskerville"');
  });

  it('keeps every new story block local, translated, and surface-aware', () => {
    for (const block of [
      'start-ways',
      'workbench',
      'steps',
      'try-on',
      'studio',
      'reviews',
    ]) {
      const text = source(`../blocks/${block}.tsx`);
      expect(text).toMatch(/section-(?:ink|paper)/);
      expect(text).toContain('@/paraglide/messages.js');
      expect(text).not.toMatch(/https?:\/\//);
    }
  });
});
