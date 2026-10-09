import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BrandLogo, BrandMark } from './brand-logo';

const readSource = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('site branding', () => {
  it('renders the supplied wordmark with an accessible name', () => {
    const html = renderToStaticMarkup(<BrandLogo className="w-48" />);
    expect(html).toContain('src="/logo.png"');
    expect(html).toContain('alt="Tattoo Generator"');
    expect(html).toContain('w-48');
  });

  it('renders the compact mark for small surfaces', () => {
    const html = renderToStaticMarkup(<BrandMark alt="" />);
    expect(html).toContain('src="/favicon.png"');
    expect(html).toContain('alt=""');
  });

  it.each([
    '../components/site-header.tsx',
    '../components/site-footer.tsx',
    '../components/app-sidebar.tsx',
    '../components/agent/chats-sidebar.tsx',
    '../components/auth-shell.tsx',
  ])('uses the wordmark in %s', (path) => {
    expect(readSource(path)).toContain('<BrandLogo');
  });

  it.each([
    '../components/app-layout.tsx',
    '../components/agent/agent-layout.tsx',
  ])('uses the compact mark in %s', (path) => {
    expect(readSource(path)).toContain('<BrandMark');
  });

  it('sets the new icon, touch icon, and manifest in the shared page head', () => {
    const root = readSource('../routes/__root.tsx');
    expect(root).toContain("type: 'image/png', href: '/favicon.png'");
    expect(root).toContain("rel: 'apple-touch-icon', href: '/favicon.png'");
    expect(root).toContain("rel: 'manifest', href: '/site.webmanifest'");
    expect(root).toContain('`${appUrl}/logo.png`');
  });

  it('publishes the supplied transparent PNGs at canonical paths', () => {
    for (const [path, width, height] of [
      ['../../public/logo.png', 1536, 1024],
      ['../../public/favicon.png', 1254, 1254],
    ] as const) {
      const bytes = readFileSync(new URL(path, import.meta.url));
      expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(bytes.readUInt32BE(16)).toBe(width);
      expect(bytes.readUInt32BE(20)).toBe(height);
      expect(bytes[25]).toBe(6);
    }
  });
});
