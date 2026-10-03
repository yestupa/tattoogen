import { readFileSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { AuthShell } from '@/components/auth-shell';

const readSource = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

const authRoutes = [
  {
    route: 'sign-in',
    markers: [
      'signIn.email',
      'safeCallbackUrl',
      'sendVerificationEmail',
      'signIn.social',
      'form.handleSubmit',
    ],
  },
  {
    route: 'sign-up',
    markers: [
      'signUp.email',
      'safeCallbackUrl',
      '/api/invite-codes/validate',
      '/api/invite-codes/redeem',
      'emailVerificationEnabled',
      'signIn.social',
    ],
  },
  {
    route: 'forgot-password',
    markers: [
      'requestPasswordReset',
      'redirectTo',
      'passwordResetEnabled',
      'setSentEmail',
      'form.handleSubmit',
    ],
  },
  {
    route: 'reset-password',
    markers: [
      'resetPassword',
      'tokenChecked',
      'resetSchema',
      'newPassword',
      'form.handleSubmit',
    ],
  },
  {
    route: 'verify-email',
    markers: [
      'RESEND_COOLDOWN_SECONDS',
      'checkSessionAndRedirect',
      'handleResend',
      'handleContinue',
      'safeDecodeCallbackUrl',
      'visibilitychange',
    ],
  },
  {
    route: 'redeem-invite',
    markers: [
      'handleSubmit',
      'handleSignOut',
      'needsInvite',
      '/api/invite-codes/validate',
      '/api/invite-codes/redeem',
      "localizeHref('/chat')",
    ],
  },
];

const newCopyKeys = [
  'common.auth.eyebrow',
  'common.auth.benefit_explore',
  'common.auth.benefit_refine',
  'common.auth.benefit_save',
  'common.auth.security_note',
  'common.state.loading_title',
  'common.state.loading_description',
  'common.state.forbidden_title',
  'common.state.forbidden_description',
  'common.state.empty_title',
  'common.state.empty_description',
  'common.state.search_empty_title',
  'common.state.search_empty_description',
  'common.state.request_failed',
  'common.not_found.description',
  'common.not_found.start_creating',
];

describe('authentication and root visual contracts', () => {
  it.each([
    { locale: 'en', isPending: true },
    { locale: 'en', isPending: false },
    { locale: 'zh', isPending: true },
    { locale: 'zh', isPending: false },
  ])(
    'renders the real initial invite loading branch in $locale with session pending $isPending',
    ({ locale, isPending }) => {
      // Compile the actual component without importing route/auth contexts.
      // Real React hooks retain checking=true; effects do not run during SSR.
      const source = ts.createSourceFile(
        'redeem-invite.tsx',
        readSource('./(auth)/redeem-invite.tsx'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      const component = source.statements.find(
        (statement): statement is ts.FunctionDeclaration =>
          ts.isFunctionDeclaration(statement) &&
          statement.name?.text === 'RedeemInvitePage'
      );
      expect(component).toBeDefined();
      const compiled = ts.transpileModule(component!.getText(source), {
        compilerOptions: { jsx: ts.JsxEmit.React },
      }).outputText;
      const copy: Record<string, string> = JSON.parse(
        readSource(`../../messages/${locale}.json`)
      );
      const RedeemInvitePage = new Function(
        'React',
        'useEffect',
        'useState',
        'useSession',
        'useRouter',
        'AuthShell',
        'envConfigs',
        'm',
        `${compiled}\nreturn RedeemInvitePage;`
      )(
        React,
        React.useEffect,
        React.useState,
        () => ({ data: null, isPending }),
        () => ({ push: () => {} }),
        AuthShell,
        { app_name: 'Tattoo Generator' },
        Object.fromEntries(
          Object.entries(copy).map(([key, value]) => [key, () => value])
        )
      ) as React.ComponentType;
      const html = renderToStaticMarkup(React.createElement(RedeemInvitePage));

      expect(html.match(/<main\b/g)).toHaveLength(1);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('data-brand-artwork="tattoo-generator"');
      expect(html).toContain(copy['common.state.loading_title']);
      expect(html).toContain(copy['common.state.loading_description']);
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).not.toContain('<form');
    }
  );

  it.each(authRoutes)(
    'presents $route inside the shared auth shell',
    ({ route }) => {
      const source = readSource(`./(auth)/${route}.tsx`);
      expect(source).toMatch(
        /import\s+\{\s*AuthShell\s*\}\s+from\s+'@\/components\/auth-shell'/
      );
      expect(source).toMatch(/<AuthShell\b/);
      expect(source).toContain('common.auth.security_note');
    }
  );

  it.each(authRoutes)(
    'retains the existing $route auth workflow',
    ({ route, markers }) => {
      const source = readSource(`./(auth)/${route}.tsx`);
      for (const marker of markers) expect(source).toContain(marker);
      expect(source).toContain("content: 'noindex, nofollow'");
    }
  );

  it.each(['NotFound', 'RootError'])(
    'uses PageState for the %s fallback',
    (name) => {
      const source = readSource('./__root.tsx');
      expect(source).toMatch(
        /import\s+\{\s*PageState\s*\}\s+from\s+'@\/components\/page-state'/
      );
      const fallback = source
        .split(`function ${name}(`)[1]
        ?.split('\nfunction ')[0];
      expect(fallback).toMatch(/<PageState\b/);
      expect(fallback).toContain('<BrandArtwork');
      expect(source).toContain('notFoundComponent: NotFound');
      expect(source).toContain('errorComponent: RootError');
    }
  );

  it.each(['en', 'zh'])(
    'provides matched auth and page-state copy in %s',
    (locale) => {
      const copy: Record<string, unknown> = JSON.parse(
        readSource(`../../messages/${locale}.json`)
      );
      for (const key of newCopyKeys) {
        expect(copy[key], key).toEqual(expect.any(String));
        expect(String(copy[key]).trim(), key).not.toBe('');
      }
    }
  );
});
