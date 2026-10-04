import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync('src/components/app-sidebar.tsx', 'utf8');
describe('selecting the current mobile sidebar route', () => {
  it('wires all five internal link surfaces to the current-route handler', () => {
    expect(
      source.match(/onClickCapture=\{closeCurrentNavigation\}/g)
    ).toHaveLength(5);
  });
  it.each([
    {
      name: 'current localized route',
      href: 'https://example.test/zh/settings/profile',
      closes: true,
    },
    {
      name: 'different route waits for resolution',
      href: 'https://example.test/zh/settings/billing',
      closes: false,
    },
    {
      name: 'new tab',
      href: 'https://example.test/zh/settings/profile',
      target: '_blank',
      closes: false,
    },
    {
      name: 'modified click',
      href: 'https://example.test/zh/settings/profile',
      ctrlKey: true,
      closes: false,
    },
    {
      name: 'middle click',
      href: 'https://example.test/zh/settings/profile',
      button: 1,
      closes: false,
    },
    {
      name: 'different query',
      href: 'https://example.test/zh/settings/profile?tab=other',
      closes: false,
    },
  ])('$name', ({ href, target = '', ctrlKey = false, button = 0, closes }) => {
    const body = source.match(
      /function closeCurrentNavigation\([^]*?\) \{([^]*?)\n  \}/
    )?.[1];
    expect(body).toBeDefined();
    const close = vi.fn();
    const preventDefault = vi.fn();
    new Function('event', 'window', 'setOpenMobile', ts.transpile(body!))(
      {
        button,
        ctrlKey,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        currentTarget: { href, target },
        preventDefault,
      },
      { location: { href: 'https://example.test/zh/settings/profile' } },
      close
    );
    expect(close).toHaveBeenCalledTimes(closes ? 1 : 0);
    expect(preventDefault).toHaveBeenCalledTimes(closes ? 1 : 0);
    if (closes) expect(close).toHaveBeenCalledWith(false);
  });
});
