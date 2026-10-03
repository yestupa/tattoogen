import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const blocks = [
  'hero',
  'models-strip',
  'features',
  'gallery',
  'stats',
  'pricing',
  'faq',
  'blog',
  'cta',
];

describe('public visual contracts', () => {
  it('keeps the session-cookie redirect and primary creation handoff', () => {
    const home = source('./index.tsx');
    expect(home).toContain('better-auth.session_token');
    expect(home).toContain("router.push('/chat')");
    expect(home).toContain("throw redirect({ to: '/chat' })");
    const launcher = source('../components/agent/prompt-launcher.tsx');
    for (const marker of [
      'agent:initial-turn:',
      'newAgentSessionId()',
      'composerSettings',
      'router.push(`/chat/${sessionId}`)',
    ])
      expect(launcher).toContain(marker);
  });

  it('composes every public section in narrative order inside one main', () => {
    const home = source('./index.tsx');
    const main = home.split('<main')[1]?.split('</main>')[0] ?? '';
    expect(
      [...main.matchAll(/<([A-Z]\w*)\b/g)].map((match) => match[1])
    ).toEqual([
      'Hero',
      'ModelsStrip',
      'Features',
      'Gallery',
      'Stats',
      'Pricing',
      'FAQ',
      'Blog',
      'CTA',
    ]);
    expect(home.match(/<main\b/g)).toHaveLength(1);
  });

  it('places the value proposition and launcher alongside original artwork and a compact preview', () => {
    const hero = source('../blocks/hero.tsx');
    expect(hero).toContain('lg:grid-cols-2');
    expect(hero).toContain('<PromptLauncher');
    expect(hero).toContain('<BrandArtwork');
    expect(hero).toContain('data-hero-preview');
    expect(hero).toContain('landing.hero.eyebrow');
    expect(hero).toContain('landing.hero.preview_prompt');
    expect(hero).not.toMatch(/https?:\/\//);
  });

  it('lets the hero launcher supply the sole home h1', () => {
    expect(
      source('../components/agent/prompt-launcher.tsx').match(/<h1\b/g)
    ).toHaveLength(1);
    for (const block of blocks)
      expect(source(`../blocks/${block}.tsx`)).not.toMatch(/<h1\b/);
  });

  it('retains the blog section even before posts are supplied', () => {
    const blog = source('../blocks/blog.tsx');
    expect(blog).not.toContain('if (posts.length === 0) return null');
    expect(blog).toContain('posts = []');
    expect(blog).toContain('href="/blog"');
  });

  it('uses the shared public shell and a page heading on pricing and legal pages', () => {
    expect(source('./pricing.tsx')).toContain('<h1');
    const legal = source('./(pages)/route.tsx');
    for (const marker of [
      '<Header',
      '<main',
      '<Footer',
      '<MDXProvider',
      '<Outlet',
    ])
      expect(legal).toContain(marker);
  });

  it('keeps metadata, queries and article rendering on their existing routes', () => {
    for (const path of [
      './index.tsx',
      './pricing.tsx',
      './blog/index.tsx',
      './blog/$slug.tsx',
    ]) {
      const route = source(path);
      expect(route).toContain('loader:');
      expect(route).toContain('head:');
      expect(route).toContain("rel: 'canonical'");
    }
    expect(source('./blog/index.tsx')).toContain('await getBlogPostsFn');
    expect(source('./blog/$slug.tsx')).toContain('await getBlogPostFn');
    expect(source('./blog/$slug.tsx')).toContain(
      '<MarkdownContent content={post.content'
    );
  });

  it('gives public images dimensions and lazy loading without reference-site assets', () => {
    for (const path of [
      '../components/blog-card.tsx',
      './blog/$slug.tsx',
      ...blocks.map((block) => `../blocks/${block}.tsx`),
    ]) {
      const text = source(path);
      expect(text).not.toMatch(/(?:tat\.ink|tat-ink)/i);
      const file = ts.createSourceFile(
        path,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      const visit = (node: ts.Node) => {
        if (
          ts.isJsxSelfClosingElement(node) &&
          node.tagName.getText(file) === 'img'
        ) {
          const attributes = node.attributes.properties.map((attribute) =>
            attribute.name?.getText(file)
          );
          for (const attribute of ['alt', 'width', 'height', 'loading'])
            expect(attributes, path).toContain(attribute);
        }
        ts.forEachChild(node, visit);
      };
      visit(file);
    }
  });

  it('centers desktop navigation and exposes a touch-sized mobile menu', () => {
    const header = source('../components/site-header.tsx');
    expect(header).toContain('lg:grid-cols-');
    expect(header).toContain('touch-target');
    expect(header).toContain('aria-controls="public-mobile-nav"');
  });

  it('restores keyboard focus to the mobile trigger when Escape closes the menu', () => {
    const header = source('../components/site-header.tsx');
    expect(header).toContain("event.key === 'Escape'");
    expect(header).toContain('menuButtonRef.current?.focus()');
    expect(header).toContain('ref={menuButtonRef}');
  });

  it.each(['en', 'zh'])('provides non-empty marketing copy in %s', (locale) => {
    const copy = JSON.parse(source(`../../messages/${locale}.json`));
    for (const key of [
      'landing.hero.preview_label',
      'landing.hero.preview_prompt',
      'landing.hero.preview_reply',
      'landing.gallery.sample_note',
      'landing.features.preview_prompt',
      'landing.features.preview_reply',
      'common.nav.open_menu',
      'common.nav.close_menu',
    ]) {
      expect(copy[key], key).toEqual(expect.any(String));
      expect(copy[key]?.trim(), key).not.toBe('');
    }
  });
});
