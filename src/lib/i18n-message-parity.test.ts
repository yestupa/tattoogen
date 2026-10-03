import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { TextField } from '@/components/form-field';

type Messages = { [key: string]: string | Messages };

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const flatten = (messages: Messages, prefix = ''): Record<string, string> =>
  Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof value === 'string'
        ? [[path, value]]
        : Object.entries(flatten(value, path));
    })
  );
const dictionaries = {
  en: flatten(JSON.parse(source('../../messages/en.json'))),
  zh: flatten(JSON.parse(source('../../messages/zh.json'))),
};

describe('locale message parity', () => {
  it('keeps the complete English and Chinese key sets aligned', () => {
    const en = Object.keys(dictionaries.en).sort();
    const zh = Object.keys(dictionaries.zh).sort();
    const missing = {
      en: zh.filter((key) => !en.includes(key)),
      zh: en.filter((key) => !zh.includes(key)),
    };
    expect(missing, JSON.stringify(missing, null, 2)).toEqual({
      en: [],
      zh: [],
    });
    expect(en).toEqual(zh);
  });

  it.each(['en', 'zh'] as const)(
    'keeps visual system and metadata messages nonblank in %s',
    (locale) => {
      const visualPrefixes = [
        'common.',
        'landing.',
        'blog.',
        'auth.',
        'agent.',
        'settings.',
        'admin.',
      ];
      const blank = Object.entries(dictionaries[locale])
        .filter(([key]) =>
          visualPrefixes.some((prefix) => key.startsWith(prefix))
        )
        .filter(([, value]) => !value.trim())
        .map(([key]) => key);
      expect(blank).toEqual([]);
    }
  );
});

function legalMeta(slug: string, locale: 'en' | 'zh') {
  const text = source(`../content/pages/${slug}.${locale}.mdx`);
  const expression = text.match(/export const meta = (\{[\s\S]*?\n\});/)![1];
  return new Function(`return (${expression});`)() as {
    title: string;
    description: string;
  };
}

function routeHead(
  path: string,
  locale: 'en' | 'zh',
  post?: object,
  slug?: string
) {
  const text = source(path);
  const ast = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  let expression = '';
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'head')
      expression = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const js = ts.transpile(`const head = ${expression};`, {
    target: ts.ScriptTarget.ES2022,
  });
  const messages = Object.fromEntries(
    Object.keys(dictionaries.en).map((key) => [
      key,
      (_: unknown, options?: { locale: 'en' | 'zh' }) =>
        dictionaries[options?.locale ?? locale][key],
    ])
  );
  return new Function(
    'envConfigs',
    'm',
    'localizeUrl',
    'locales',
    'baseLocale',
    'getLocale',
    'loaderData',
    'slug',
    `${js}\nreturn head({ loaderData });`
  )(
    {
      app_url: 'https://tattoo.example',
      app_name: 'Tattoo Generator',
      app_description: 'English env description',
    },
    messages,
    localizeUrl,
    locales,
    baseLocale,
    () => locale,
    {
      locale,
      post,
      title: dictionaries[locale]['landing.pricing.title'],
      description: dictionaries[locale]['landing.pricing.description'],
      meta: slug ? legalMeta(slug, locale) : undefined,
    },
    slug
  );
}

describe('public localized metadata', () => {
  const routes = [
    ['../routes/index.tsx', '/'],
    ['../routes/pricing.tsx', '/pricing'],
    ['../routes/blog/index.tsx', '/blog'],
    ['../routes/blog/$slug.tsx', '/blog/tattoo-story'],
  ] as const;

  it.each(['en', 'zh'] as const)(
    'owns accurate canonical and language alternates in %s',
    (locale) => {
      const titles: string[] = [];
      for (const [path, href] of routes) {
        const head = routeHead(path, locale, {
          slug: 'tattoo-story',
          title: 'Tattoo Story',
          description: 'A tattoo design story',
        });
        const title = head.meta.find(
          (meta: { title?: string }) => meta.title
        )?.title;
        expect(title, path).toBeTruthy();
        titles.push(title);
        expect(
          head.meta.find(
            (meta: { name?: string }) => meta.name === 'description'
          )?.content,
          path
        ).toBeTruthy();
        expect(
          head.links.filter((link: { rel: string }) => link.rel === 'canonical')
        ).toEqual([
          {
            rel: 'canonical',
            href: localizeUrl(`https://tattoo.example${href}`, { locale }).href,
          },
        ]);
        expect(
          head.links.filter((link: { rel: string }) => link.rel === 'alternate')
        ).toEqual([
          ...locales.map((loc) => ({
            rel: 'alternate',
            hrefLang: loc,
            href: localizeUrl(`https://tattoo.example${href}`, { locale: loc })
              .href,
          })),
          {
            rel: 'alternate',
            hrefLang: 'x-default',
            href: localizeUrl(`https://tattoo.example${href}`, {
              locale: baseLocale,
            }).href,
          },
        ]);
      }
      expect(new Set(titles).size).toBe(routes.length);
    }
  );

  it('keeps root defaults localized and leaves language alternates to pages', () => {
    const head = routeHead('../routes/__root.tsx', 'zh');
    expect(
      head.links.filter((link: { rel: string }) => link.rel === 'alternate')
    ).toEqual([]);
    expect(
      head.meta.find((meta: { name?: string }) => meta.name === 'description')
        ?.content
    ).toBe(dictionaries.zh['common.metadata.description']);
    expect(source('../routes/__root.tsx')).not.toContain('window.location');
  });
});

describe('legal page metadata', () => {
  it.each(['en', 'zh'] as const)(
    'owns legal page language and social metadata in %s',
    (locale) => {
      for (const slug of ['privacy-policy', 'terms-of-service']) {
        const expected = legalMeta(slug, locale);
        const head = routeHead(
          '../routes/(pages)/-static-page.tsx',
          locale,
          undefined,
          slug
        );
        expect(head.links).toEqual([
          {
            rel: 'canonical',
            href: localizeUrl(`https://tattoo.example/${slug}`, { locale })
              .href,
          },
          ...locales.map((loc) => ({
            rel: 'alternate',
            hrefLang: loc,
            href: localizeUrl(`https://tattoo.example/${slug}`, { locale: loc })
              .href,
          })),
          {
            rel: 'alternate',
            hrefLang: 'x-default',
            href: localizeUrl(`https://tattoo.example/${slug}`, {
              locale: baseLocale,
            }).href,
          },
        ]);
        expect(
          head.meta.find(
            (meta: { property?: string }) => meta.property === 'og:title'
          )?.content
        ).toBe(expected.title);
        expect(
          head.meta.find(
            (meta: { property?: string }) => meta.property === 'og:description'
          )?.content
        ).toBe(expected.description);
        expect(
          head.meta.find(
            (meta: { property?: string }) => meta.property === 'og:url'
          )?.content
        ).toBe(head.links[0].href);
        expect(
          head.meta.find(
            (meta: { name?: string }) => meta.name === 'twitter:title'
          )?.content
        ).toBe(expected.title);
        expect(
          head.meta.find(
            (meta: { name?: string }) => meta.name === 'twitter:description'
          )?.content
        ).toBe(expected.description);
      }
    }
  );
});

describe('localized accessible labels', () => {
  const labels = [
    ['common.action.close', '../blocks/support-widget.tsx', '<DialogContent>'],
    [
      'common.state.request_failed',
      '../blocks/support-widget.tsx',
      "|| 'Failed'",
    ],
    [
      'common.sign.sign_in_failed',
      '../routes/(auth)/sign-in.tsx',
      "|| 'Sign in failed'",
    ],
    [
      'common.upload.uploading',
      '../components/image-uploader.tsx',
      'Uploading...',
    ],
    [
      'common.upload.limit',
      '../components/image-uploader.tsx',
      'Max {maxSizeMB}MB',
    ],
    [
      'common.upload.failed_detail',
      '../components/image-uploader.tsx',
      '`Upload failed:',
    ],
    [
      'common.upload.failed',
      '../components/image-uploader.tsx',
      "'Upload failed'",
    ],
    [
      'common.upload.failed',
      '../components/agent/prompt-launcher.tsx',
      "|| 'Upload failed'",
    ],
    [
      'common.sign.request_failed',
      '../routes/(auth)/forgot-password.tsx',
      "|| 'Request failed'",
    ],
    [
      'common.sign.reset_failed',
      '../routes/(auth)/reset-password.tsx',
      "|| 'Reset failed'",
    ],
    [
      'common.sign.sign_up_failed',
      '../routes/(auth)/sign-up.tsx',
      "|| 'Sign up failed'",
    ],
    [
      'common.nav.switch_language',
      '../components/locale-selector.tsx',
      'Switch language',
    ],
    [
      'common.nav.toggle_theme',
      '../components/theme-toggle.tsx',
      'Toggle theme',
    ],
    ['common.user.fallback_name', '../components/site-header.tsx', "|| 'User'"],
    [
      'common.user.fallback_name',
      '../components/agent/chats-sidebar.tsx',
      "|| 'User'",
    ],
    [
      'common.upload.replace',
      '../components/image-uploader.tsx',
      'aria-label="Replace image"',
    ],
    [
      'common.upload.remove',
      '../components/image-uploader.tsx',
      'aria-label="Remove image"',
    ],
    ['common.upload.upload', '../components/image-uploader.tsx', '>Upload<'],
    [
      'common.upload.preview',
      '../components/image-uploader.tsx',
      'alt="Preview"',
    ],
    [
      'common.upload.drop',
      '../components/image-uploader.tsx',
      'Drop to upload',
    ],
    [
      'common.upload.failed',
      '../components/image-uploader.tsx',
      '`Upload failed:',
    ],
    [
      'common.upload.images_only',
      '../components/image-uploader.tsx',
      "toast.error('Only image files are supported')",
    ],
    [
      'common.upload.not_image',
      '../components/image-uploader.tsx',
      '`"${file.name}" is not an image`',
    ],
    [
      'common.upload.too_large',
      '../components/image-uploader.tsx',
      '`"${file.name}" exceeds',
    ],
    [
      'agent.chat.scroll_to_bottom',
      '../routes/(agent)/chat/$sessionId.tsx',
      'aria-label="Scroll to bottom"',
    ],
    ['agent.editor.canvas', '../routes/(agent)/editor.tsx', '>Canvas<'],
    [
      'common.footer.built_with',
      '../components/built-with-shipany.tsx',
      '>Built with<',
    ],
    [
      'common.footer.rights_reserved',
      '../components/site-footer.tsx',
      '. All rights reserved.',
    ],
  ] as const;
  it.each(labels)(
    '%s replaces the hardcoded label in %s',
    (key, path, hardcoded) => {
      for (const locale of ['en', 'zh'] as const)
        expect(
          dictionaries[locale][key]?.trim(),
          `${locale}:${key}`
        ).toBeTruthy();
      expect(source(path)).not.toContain(hardcoded);
    }
  );

  it('passes loading, menu and fallback labels into the reusable workspace layout', () => {
    const layout = source('../components/app-layout.tsx');
    expect(layout).not.toContain('@/paraglide/messages.js');
    for (const label of [
      'loadingTitle',
      'mobileNavLabel',
      'fallbackUserName',
    ]) {
      expect(layout).toContain(label);
      for (const route of ['settings', 'admin'])
        expect(source(`../routes/${route}/route.tsx`)).toContain(`${label}={`);
    }
  });

  it('gives the public support dialog a localized custom close control', () => {
    const support = source('../blocks/support-widget.tsx');
    expect(support).toContain('showCloseButton={false}');
    expect(support).toContain("aria-label={m['common.action.close']()}");
    expect(support).toContain('touch-target absolute top-2 right-2');
    expect(support).toContain('<DialogClose');
  });
});

describe('form field accessible validation', () => {
  const render = (errors: unknown[], touched = true) =>
    renderToStaticMarkup(
      createElement(TextField, {
        field: {
          name: 'email',
          state: { value: '', meta: { isTouched: touched, errors } },
          handleChange() {},
          handleBlur() {},
        } as any,
        label: 'Email',
        'aria-describedby': 'email-hint',
      } as any)
    );

  it('connects a visible error to the input while preserving its hint', () => {
    const html = render([{ message: 'Enter a valid email' }]);
    const id = html.match(/<input[^>]*\sid="([^"]+)"/)![1];
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(`aria-describedby="email-hint ${id}-error"`);
    expect(html).toContain(`id="${id}-error"`);
  });

  it.each([false, true])(
    'never references an absent error when touched is %s',
    (touched) => {
      const html = render(touched ? [] : ['Enter a valid email'], touched);
      const id = html.match(/<input[^>]*\sid="([^"]+)"/)![1];
      expect(html).toContain('aria-describedby="email-hint"');
      expect(html).not.toContain(`${id}-error`);
      expect(html).not.toContain('aria-invalid="true"');
    }
  );

  const fieldElement = (props: Record<string, unknown> = {}) =>
    createElement(TextField, {
      field: {
        name: 'email',
        state: {
          value: '',
          meta: { isTouched: true, errors: ['Invalid email'] },
        },
        handleChange() {},
        handleBlur() {},
      } as any,
      label: 'Email',
      ...props,
    } as any);

  it('gives same-name instances distinct SSR-stable ids while preserving names', () => {
    const element = createElement('form', null, fieldElement(), fieldElement());
    const html = renderToStaticMarkup(element);
    const ids = [...html.matchAll(/<input[^>]*\sid="([^"]+)"/g)].map(
      (match) => match[1]
    );
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(renderToStaticMarkup(element)).toBe(html);
    expect([...html.matchAll(/name="email"/g)]).toHaveLength(2);
    for (const id of ids) {
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`aria-describedby="${id}-error"`);
      expect(html).toContain(`id="${id}-error"`);
    }
  });

  it('honors explicit ids and deduplicates existing hint and error references', () => {
    const html = renderToStaticMarkup(
      fieldElement({
        id: 'billing-email',
        'aria-describedby':
          'email-hint email-hint billing-email-error billing-email-error',
      })
    );
    expect(html).toContain('id="billing-email"');
    expect(html).toContain('for="billing-email"');
    expect(html).toContain('name="email"');
    expect(html).toContain('id="billing-email-error"');
    expect(html).toContain('aria-describedby="email-hint billing-email-error"');
  });

  it('omits describedby when there is no visible error or caller hint', () => {
    const html = renderToStaticMarkup(
      fieldElement({
        field: {
          name: 'email',
          state: { value: '', meta: { isTouched: true, errors: [] } },
          handleChange() {},
          handleBlur() {},
        },
      })
    );
    expect(html).not.toContain('aria-describedby');
    expect(html).not.toContain('aria-invalid=');
  });

  it('associates the sign-in password error with its custom password input', () => {
    const signin = source('../routes/(auth)/sign-in.tsx');
    expect(signin).toMatch(
      /aria-describedby=\{\s*errMsg\s*\?\s*`\$\{field\.name\}-error`\s*:\s*undefined\s*\}/
    );
    expect(signin).toContain('id={`${field.name}-error`}');
  });
});

describe('reviewed fallback branches', () => {
  const cases = [
    [
      '../routes/(agent)/chat/$sessionId.tsx',
      'common.upload.failed',
      '上传失败',
      1,
    ],
    [
      '../components/rich-text-editor.tsx',
      'common.upload.failed',
      '上传失败',
      2,
    ],
    ['../blocks/pricing.tsx', 'landing.pricing.checkout_failed', '结账失败', 2],
    ['../routes/settings/tickets.tsx', 'common.action.failed', '操作失败', 4],
    ['../routes/admin/tickets.tsx', 'common.action.failed', '操作失败', 3],
    ['../routes/admin/permissions.tsx', 'common.action.failed', '操作失败', 3],
    [
      '../routes/admin/invite-codes.tsx',
      'common.action.copy_failed',
      '复制失败',
      1,
    ],
    ['../routes/admin/settings.tsx', 'common.select.placeholder', '请选择…', 1],
  ] as const;

  // Execute the actual fallback expressions with an empty error/response, not
  // just a spelling check. AST selection also pins each affected branch count.
  it.each(cases)(
    'localizes every empty-error branch in %s',
    (path, key, chinese, count) => {
      const ast = ts.createSourceFile(
        path,
        source(path),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      const expressions: ts.Expression[] = [];
      const visit = (node: ts.Node) => {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(ast) === 'toast.error'
        ) {
          const argument = node.arguments[0];
          if (
            argument &&
            (/Upload failed|Checkout failed|'Failed'/.test(
              argument.getText(ast)
            ) ||
              argument.getText(ast).includes(key) ||
              argument.getText(ast).includes('uploadFailedLabel'))
          )
            expressions.push(argument);
        }
        if (
          path.includes('/chat/') &&
          ts.isPropertyAssignment(node) &&
          node.name.getText(ast) === 'error'
        )
          expressions.push(node.initializer);
        if (
          key === 'common.select.placeholder' &&
          ts.isJsxAttribute(node) &&
          node.name.getText(ast) === 'placeholder' &&
          node.initializer &&
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression?.getText(ast).startsWith('placeholder ||')
        )
          expressions.push(node.initializer.expression);
        ts.forEachChild(node, visit);
      };
      visit(ast);
      expect(expressions).toHaveLength(count);
      for (const locale of ['en', 'zh'] as const) {
        const expected = locale === 'zh' ? chinese : dictionaries.en[key];
        expect(dictionaries[locale][key]).toBe(expected);
        const m = Object.fromEntries(
          Object.entries(dictionaries[locale]).map(([name, text]) => [
            name,
            () => text,
          ])
        );
        for (const expression of expressions) {
          const js = ts.transpile(
            `const result = ${expression.getText(ast)};`,
            { target: ts.ScriptTarget.ES2022 }
          );
          const evaluate = new Function(
            'm',
            'e',
            'err',
            'data',
            'ApiError',
            'placeholder',
            'uploadFailedLabel',
            `${js}\nreturn result;`
          );
          expect(
            evaluate(
              m,
              { message: '' },
              { message: '' },
              { message: '' },
              class ApiError {},
              '',
              dictionaries[locale]['common.upload.failed']
            )
          ).toBe(expected);
          if (ts.isBinaryExpression(expression)) {
            expect(
              evaluate(
                m,
                { message: 'Server detail' },
                { message: 'Server detail' },
                { message: 'Server detail' },
                class ApiError {},
                'Custom placeholder',
                dictionaries[locale]['common.upload.failed']
              )
            ).toBe(
              key === 'common.select.placeholder'
                ? 'Custom placeholder'
                : 'Server detail'
            );
          }
        }
      }
    }
  );

  it('supplies the durable rich editor with a required localized upload label', () => {
    expect(source('../components/rich-text-editor.tsx')).toMatch(
      /uploadFailedLabel:\s*string/
    );
    expect(source('../components/rich-text-editor.tsx')).not.toContain(
      '@/paraglide/messages.js'
    );
    expect(source('../routes/admin/posts.tsx')).toContain(
      "uploadFailedLabel={m['common.upload.failed']()}"
    );
  });
});

describe('decorative icon accessibility', () => {
  it.each([
    '../components/image-uploader.tsx',
    '../components/agent/prompt-launcher.tsx',
    '../blocks/support-widget.tsx',
    '../routes/(agent)/editor.tsx',
    '../routes/(agent)/chat/$sessionId.tsx',
  ])('hides decorative icons in %s', (path) => {
    const file = ts.createSourceFile(
      path,
      source(path),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const iconNames = file.statements
      .filter(ts.isImportDeclaration)
      .filter(
        (node) =>
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === 'lucide-react'
      )
      .flatMap((node) =>
        node.importClause?.namedBindings &&
        ts.isNamedImports(node.importClause.namedBindings)
          ? node.importClause.namedBindings.elements.map(
              (element) => element.name.text
            )
          : []
      );
    const missing: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const name = node.tagName.getText(file);
        if (
          (iconNames.includes(name) || name.endsWith('.icon')) &&
          !node.attributes.properties.some(
            (attribute) =>
              ts.isJsxAttribute(attribute) &&
              attribute.name.getText(file) === 'aria-hidden'
          )
        )
          missing.push(name);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    expect(missing).toEqual([]);
  });
});
