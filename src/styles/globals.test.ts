import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./globals.css', import.meta.url)),
  'utf8'
).toLowerCase();

function blockBody(selector: string): string {
  const start = css.indexOf('{', css.indexOf(selector));
  if (!css.includes(selector) || start < 0) return '';
  let depth = 1;
  let end = start + 1;
  while (depth > 0 && end < css.length) {
    if (css[end] === '{') depth++;
    if (css[end] === '}') depth--;
    end++;
  }
  return css.slice(start + 1, end - 1);
}

const light =
  Array.from(css.matchAll(/:root\s*\{([^}]+)\}/g)).find((match) =>
    match[1].includes('--background:')
  )?.[1] ?? '';
const dark = blockBody('.dark {');

type Rgb = readonly [number, number, number];

function rgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function blend(foreground: Rgb, background: Rgb, alpha: number): Rgb {
  return [
    foreground[0] * alpha + background[0] * (1 - alpha),
    foreground[1] * alpha + background[1] * (1 - alpha),
    foreground[2] * alpha + background[2] * (1 - alpha),
  ];
}

function luminance(color: Rgb): number {
  const linear = color.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground: Rgb, background: Rgb): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function darkHex(name: string): string | undefined {
  return dark.match(new RegExp(`--${name}:\\s*(#[a-f0-9]{6})\\s*;`))?.[1];
}

describe('tattoo generator visual tokens', () => {
  it('uses the approved warm paper and ink light palette', () => {
    for (const [name, color] of Object.entries({
      background: '#faf8f4',
      card: '#ffffff',
      foreground: '#211f1b',
      'muted-foreground': '#6f6a5f',
      primary: '#171613',
      'primary-hover': '#2c2b27',
      secondary: '#f1ede5',
      border: '#e5e0d4',
    })) {
      expect(light).toMatch(new RegExp(`--${name}:\\s*${color}\\s*;`));
    }
  });

  it('uses the approved dark ink palette', () => {
    for (const [name, color] of Object.entries({
      background: '#111110',
      card: '#1a1a18',
      secondary: '#211f1b',
      foreground: '#f4f0e8',
      'muted-foreground': '#9b9488',
      primary: '#e9e2d2',
      border: '#2c2b27',
    })) {
      expect(dark).toMatch(new RegExp(`--${name}:\\s*${color}\\s*;`));
    }
  });

  it('exposes the approved reference anchors and display family', () => {
    expect(css).toMatch(/--ink-bg:\s*#111110\s*;/);
    expect(css).toMatch(/--ink-panel:\s*#1a1a18\s*;/);
    expect(css).toMatch(/--paper-bg:\s*#faf8f4\s*;/);
    expect(css).toMatch(/--vermilion:\s*#a83e2c\s*;/);
    expect(css).toMatch(/--font-display:\s*'archivo variable'/);
  });

  it('maintains readable primary text contrast on dark cards', () => {
    const readable = rgb(darkHex('primary-readable') ?? darkHex('primary')!);
    expect(contrast(readable, rgb(darkHex('card')!))).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it.each(['card', 'secondary'])(
    'maintains readable primary contrast on a 10%% primary tint over %s',
    (surface) => {
      const readable = rgb(darkHex('primary-readable') ?? darkHex('primary')!);
      const tinted = blend(
        rgb(darkHex('primary')!),
        rgb(darkHex(surface)!),
        0.1
      );
      expect(contrast(readable, tinted)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it('maintains primary button foreground contrast during dark hover', () => {
    const hover = darkHex('primary-hover');
    const background = hover
      ? rgb(hover)
      : blend(rgb(darkHex('primary')!), rgb(darkHex('card')!), 0.8);
    expect(dark).toMatch(/--primary-foreground:\s*var\(--background\)\s*;/);
    expect(
      contrast(rgb(darkHex('background')!), background)
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('applies accessible dark derivatives to primary text and exact primary interactive hover', () => {
    expect(css).toMatch(
      /--color-primary-readable:\s*var\(--primary-readable\)/
    );
    expect(blockBody('.dark .text-primary')).toMatch(
      /color:\s*var\(--primary-readable\)\s*;/
    );
    const hover = blockBody(
      ".dark :is(a, button, [role='button']).bg-primary:hover"
    );
    expect(hover).toMatch(/background-color:\s*var\(--primary-hover\)\s*;/);
    expect(hover).toMatch(/color:\s*var\(--primary-foreground\)\s*;/);
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

  it('provides reusable ink shadows and local paper texture', () => {
    expect(css).toMatch(/--shadow-soft:\s*var\(--ink-shadow-soft\)/);
    expect(css).toMatch(/--shadow-panel:\s*var\(--ink-shadow-panel\)/);
    expect(css).toMatch(/--ink-shadow-soft:\s*[^;]*color-mix\(/);
    expect(css).toMatch(/--ink-shadow-panel:\s*[^;]*color-mix\(/);
    const texture = css.match(/\.paper-texture\s*\{([^}]+)\}/)?.[1];
    expect(texture).toMatch(/background-image:[\s\S]*gradient\(/);
    expect(texture).not.toMatch(/url\(|data:/);
  });

  it('disables nonessential motion when reduced motion is requested', () => {
    const reducedMotion = blockBody('@media (prefers-reduced-motion: reduce)');
    expect(reducedMotion).toMatch(/animation:\s*none\s*!important/);
    expect(reducedMotion).toMatch(/transition:\s*none\s*!important/);
    expect(reducedMotion).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });
});
