import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./globals.css', import.meta.url)),
  'utf8'
).toLowerCase();

describe('tattoo generator visual tokens', () => {
  it('uses the approved warm paper and violet light palette', () => {
    for (const color of [
      '#fbf8f3',
      '#fffdfc',
      '#171827',
      '#676779',
      '#7137f2',
      '#5f28d8',
      '#f1eaff',
      '#e6e0d8',
    ]) {
      expect(css).toContain(color);
    }
  });

  it('uses the approved dark surfaces and violet palette', () => {
    const dark = css.match(/\.dark\s*\{([^}]+)\}/)?.[1];
    expect(dark).toBeDefined();
    for (const color of [
      '#17151c',
      '#211e28',
      '#2a2632',
      '#f5f1ea',
      '#aaa3b4',
      '#9668ff',
      '#393441',
    ]) {
      expect(dark).toContain(color);
    }
  });

  it('exposes base, card, and shell radii to Tailwind', () => {
    expect(css).toMatch(/--radius:\s*0\.75rem\s*;/);
    expect(css).toMatch(/--radius-card:\s*0\.875rem\s*;/);
    expect(css).toMatch(/--radius-shell:\s*1\.125rem\s*;/);
  });

  it('keeps keyboard focus visible and touch targets at least 44px', () => {
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ring\)/
    );
    const touchTarget = css.match(/\.touch-target\s*\{([^}]+)\}/)?.[1];
    expect(touchTarget).toMatch(/min-width:\s*(44px|2\.75rem)\s*;/);
    expect(touchTarget).toMatch(/min-height:\s*(44px|2\.75rem)\s*;/);
  });

  it('provides reusable soft and panel shadows and local paper texture', () => {
    expect(css).toMatch(/--shadow-soft:\s*var\(--warm-violet-shadow-soft\)/);
    expect(css).toMatch(/--shadow-panel:\s*var\(--warm-violet-shadow-panel\)/);
    expect(css).toMatch(/--warm-violet-shadow-soft:\s*[^;]*color-mix\(/);
    expect(css).toMatch(/--warm-violet-shadow-panel:\s*[^;]*color-mix\(/);
    const texture = css.match(/\.paper-texture\s*\{([^}]+)\}/)?.[1];
    expect(texture).toMatch(/background-image:[\s\S]*gradient\(/);
    expect(texture).not.toMatch(/url\(|data:/);
  });

  it('disables nonessential motion when reduced motion is requested', () => {
    expect(css).toContain('(prefers-reduced-motion: reduce)');
    expect(css).toMatch(/animation:\s*none\s*!important/);
    expect(css).toMatch(/transition:\s*none\s*!important/);
    expect(css).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });
});
