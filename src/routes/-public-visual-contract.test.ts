import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const blocks = [
  'hero',
  'stats',
  'start-ways',
  'workbench',
  'features',
  'steps',
  'gallery',
  'try-on',
  'studio',
  'reviews',
  'pricing',
  'blog',
  'faq',
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
      'Stats',
      'StartWays',
      'Workbench',
      'Features',
      'Steps',
      'Gallery',
      'TryOn',
      'Studio',
      'Reviews',
      'Pricing',
      'Blog',
      'FAQ',
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

  it('gives the centered blog entry a 44px touch target', () => {
    const text = source('../blocks/blog.tsx');
    const file = ts.createSourceFile(
      'blog.tsx',
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const entryClasses: string[] = [];
    const visit = (node: ts.Node) => {
      if (
        ts.isJsxOpeningElement(node) &&
        node.tagName.getText(file) === 'Link'
      ) {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const href = attributes.find(
          (attribute) => attribute.name.getText(file) === 'href'
        );
        if (href?.initializer?.getText(file) === '"/blog"') {
          const className = attributes.find(
            (attribute) => attribute.name.getText(file) === 'className'
          );
          entryClasses.push(className?.initializer?.getText(file) ?? '');
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    expect(entryClasses).toHaveLength(1);
    expect(entryClasses[0]).toContain('touch-target');
    expect(text).toContain('text-center');
    expect(source('../styles/globals.css')).toMatch(
      /\.touch-target\s*\{[^}]*min-height:\s*44px/
    );
  });

  it.each(['en', 'zh'])(
    'describes conditional signup credits in %s without a monthly free allowance',
    (locale) => {
      const copy = JSON.parse(source(`../../messages/${locale}.json`));
      const answer = copy['landing.faq.a_2'];
      expect(answer).not.toMatch(/80|per month|monthly|每月|月度/i);
      expect(answer).toMatch(/sign up|signup|register|注册/i);
      expect(answer).toMatch(/may|可能/i);
      expect(answer).toMatch(/current|当前/i);
      expect(answer).toMatch(/trial|试用/i);
    }
  );

  it.each(['en', 'zh'])(
    'keeps the published FAQ claims supported and non-absolute in %s',
    (locale) => {
      const copy = JSON.parse(source(`../../messages/${locale}.json`));
      const unsupportedClaims = {
        a_5: /never.*train|permanently|at rest|绝不|彻底|存储时.*加密/i,
        a_6: /all paid|full commercial license|free.*commercial|完整商用授权|免费版.*商/i,
        a_7: /monthly|fair.use queue|月度|公平队列/i,
        a_8: /10 seconds|10 秒|Google.*GitHub/i,
        a_10: /every message|weekly|每条消息|每周/i,
      };
      for (const [answer, unsupported] of Object.entries(unsupportedClaims)) {
        expect(copy[`landing.faq.${answer}`]).toEqual(expect.any(String));
        expect(copy[`landing.faq.${answer}`].trim()).not.toBe('');
        expect(copy[`landing.faq.${answer}`]).not.toMatch(unsupported);
      }
    }
  );

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
      '../components/agent/prompt-launcher.tsx',
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
      let imageCount = 0;
      const visit = (node: ts.Node) => {
        if (
          ts.isJsxSelfClosingElement(node) &&
          node.tagName.getText(file) === 'img'
        ) {
          imageCount += 1;
          const attributes = node.attributes.properties.map((attribute) =>
            attribute.name?.getText(file)
          );
          for (const attribute of ['alt', 'width', 'height', 'loading'])
            expect(attributes, path).toContain(attribute);
          const imageAttributes = node.attributes.properties.filter(
            ts.isJsxAttribute
          );
          const loading = imageAttributes.find(
            (attribute) => attribute.name.getText(file) === 'loading'
          );
          expect(loading?.initializer?.getText(file), path).toBe('"lazy"');
          for (const dimension of ['width', 'height']) {
            const attribute = imageAttributes.find(
              (attribute) => attribute.name.getText(file) === dimension
            );
            expect(attribute?.initializer?.getText(file), path).toMatch(
              /^\{[1-9]\d*\}$/
            );
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(file);
      if (path.endsWith('/prompt-launcher.tsx'))
        expect(imageCount).toBeGreaterThan(0);
    }
  });

  it('centers desktop navigation and exposes a touch-sized mobile menu', () => {
    const header = source('../components/site-header.tsx');
    expect(header).toContain('lg:grid-cols-');
    expect(header).toContain('touch-target');
    expect(header).toContain('aria-controls="public-mobile-nav"');
  });

  it('uses a dark public header with a scroll-aware treatment', () => {
    const header = source('../components/site-header.tsx');
    expect(header).toContain('data-public-header');
    expect(header).toContain('data-scrolled={scrolled}');
    expect(header).toContain("window.addEventListener('scroll'");
    expect(header).toContain('bg-ink-bg');
  });

  it('restores keyboard focus to the mobile trigger when Escape closes the menu', () => {
    const header = source('../components/site-header.tsx');
    expect(header).toContain("event.key === 'Escape'");
    expect(header).toContain('menuButtonRef.current?.focus()');
    expect(header).toContain('ref={menuButtonRef}');
  });

  it('keeps the public footer dark and free of template attribution', () => {
    const footer = source('../components/site-footer.tsx');
    const footerBlock = source('../blocks/footer.tsx');
    expect(footer).toContain('data-public-footer');
    expect(footer).toContain('bg-ink-bg');
    expect(footerBlock).toContain("href: '/blog'");
    expect(footerBlock).toContain("href: '/contact'");
    expect(`${footer}\n${footerBlock}`).not.toMatch(/Built with|ShipAny/i);
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
