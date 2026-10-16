import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { discoveryGeneratorLinks } from '@/content/tattoos/discovery-copy';

import { TattooTaskTool, TattooTools } from './tattoo-tools';

const { activeLocale } = vi.hoisted(() => ({ activeLocale: { value: 'en' } }));
vi.mock('@/paraglide/runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/paraglide/runtime.js')>()),
  getLocale: () => activeLocale.value,
}));

vi.mock('@/core/auth/client', () => ({
  useSession: () => ({ data: null, isPending: false, refetch: vi.fn() }),
}));
vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

describe('task hub and useful server-rendered forms', () => {
  beforeEach(() => {
    activeLocale.value = 'en';
  });
  it('exposes all seven real tasks and the ten existing topic generators', () => {
    const html = renderToStaticMarkup(<TattooTools />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    [
      '/tattoo-font-generator',
      '/image-to-tattoo',
      '/tattoo-idea-generator',
      '/tattoo-to-stencil',
      '/try-tattoo',
      '/tattoo-cover-up',
      '/tattoo-filler',
    ].forEach((path) => expect(html).toContain(`href="${path}"`));
    discoveryGeneratorLinks.forEach((link) =>
      expect(html).toContain(`href="${link.href}"`)
    );
  });

  it('serves a free font preview and explicit AI action as separate controls', () => {
    const html = renderToStaticMarkup(<TattooTaskTool kind="font" />);
    expect(html).toContain('Download free lettering PNG');
    expect(html).toContain('Create AI concept in the studio');
    expect(html).toContain('System font stack');
    expect(html).toContain('Exact words, name or phrase');
    expect(html).toContain('/tattoo-styles/lettering');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it('labels local idea output honestly and requests a real cover-up source', () => {
    const idea = renderToStaticMarkup(<TattooTaskTool kind="idea" />);
    expect(idea).toContain('deterministic briefs');
    expect(idea).toContain('Build my design directions');
    expect(idea).toContain('What should it mean to you?');
    const cover = renderToStaticMarkup(<TattooTaskTool kind="coverup" />);
    expect(cover).toContain('Source reference image');
    expect(cover).toContain('Rework and retain the existing motif');
    expect(cover).toContain('cannot inspect healed skin');
    expect(cover).toContain('accept="image/png,image/jpeg,image/webp"');
  });

  it('renders gap drawing and upload alternatives with realistic preservation limits', () => {
    const html = renderToStaticMarkup(<TattooTaskTool kind="filler" />);
    expect(html).toContain('<canvas');
    expect(html).toContain('Use a marked guide image');
    expect(html).toContain('drawn outline');
    expect(html).toContain('AI may still change');
    expect(html).toContain('Subject or theme');
  });

  it('renders real Chinese controls and explanatory content', () => {
    activeLocale.value = 'zh';
    const html = renderToStaticMarkup(<TattooTaskTool kind="font" />);
    expect(html).toContain('免费的本地文字预览');
    expect(html).toContain('免费下载文字 PNG');
    expect(html).toContain('准确的文字、姓名或短句');
    expect(html).toContain('AI 文字可能出现缺字');
    const hub = renderToStaticMarkup(<TattooTools />);
    expect(hub).toContain('选择适合你下一步的纹身工具');
    expect(hub).toContain('蝴蝶与变化主题');
  });
});
