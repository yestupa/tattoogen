import { readFileSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { deLocalizeHref, localizeHref } from '@/paraglide/runtime.js';

const source = ts.createSourceFile(
  'verify-email.tsx',
  readFileSync(new URL('./verify-email.tsx', import.meta.url), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

function declaration(name: string, statements = source.statements) {
  const statement = statements.find(
    (node) =>
      (ts.isFunctionDeclaration(node) && node.name?.text === name) ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (item) => ts.isIdentifier(item.name) && item.name.text === name
        ))
  );
  if (!statement) throw new Error(`Missing real route declaration: ${name}`);
  return ts.transpileModule(statement.getText(source), {
    fileName: 'verify-email.tsx',
    compilerOptions: { jsx: ts.JsxEmit.React },
  }).outputText;
}

// Execute the actual route handler with its boundary dependencies supplied.
// This keeps the regression on shipped behavior without starting the router.
// Callback tests below also exercise the real generated Paraglide runtime.
function continuation(
  getSession = vi.fn().mockResolvedValue({ data: null, error: null }),
  session: { user: object } | null = null
) {
  const component = source.statements.find(
    (node): node is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(node) && node.name?.text === 'VerifyEmailPage'
  )!;
  const router = { push: vi.fn() };
  const navigate = vi.fn();
  const toast = { error: vi.fn() };
  const setCheckingSession = vi.fn();
  const handle = new Function(
    'session',
    'authClient',
    'router',
    'signInPath',
    'hardNavigateToNextUrl',
    'checkSessionAndRedirect',
    'toast',
    'm',
    'continueInFlightRef',
    'setCheckingSession',
    `${declaration('handleContinue', component.body!.statements)}\nreturn handleContinue;`
  )(
    session,
    { getSession },
    router,
    '/sign-in?callbackUrl=%2Ftattoo-cover-up',
    navigate,
    vi.fn().mockResolvedValue(undefined),
    toast,
    {
      'common.sign.verify_email_not_verified_yet': () => 'Not verified yet',
      'common.sign.verify_email_check_failed': () => 'Please try again',
    },
    { current: false },
    setCheckingSession
  ) as () => Promise<void>;
  return { handle, router, navigate, toast, getSession, setCheckingSession };
}

async function settle(handle: () => Promise<void>) {
  await handle();
  await new Promise(setImmediate);
}

describe('email verification continuation', () => {
  it('offers sign-in when the verification happened in a different browser', async () => {
    const flow = continuation();
    await settle(flow.handle);
    expect(flow.router.push).toHaveBeenCalledWith(
      '/sign-in?callbackUrl=%2Ftattoo-cover-up'
    );
    expect(flow.toast.error).not.toHaveBeenCalled();
    expect(flow.navigate).not.toHaveBeenCalled();
  });

  it('refreshes the session before continuing to the original destination', async () => {
    const flow = continuation(
      vi
        .fn()
        .mockResolvedValue({ data: { user: { id: 'verified' } }, error: null })
    );
    await settle(flow.handle);
    expect(flow.getSession).toHaveBeenCalledExactlyOnceWith({
      query: { disableCookieCache: true },
    });
    expect(flow.navigate).toHaveBeenCalledOnce();
    expect(flow.router.push).not.toHaveBeenCalled();
  });

  it('does not trust a stale client session after it has expired', async () => {
    const flow = continuation(undefined, { user: { id: 'expired' } });
    await settle(flow.handle);
    expect(flow.getSession).toHaveBeenCalledOnce();
    expect(flow.router.push).toHaveBeenCalledOnce();
    expect(flow.navigate).not.toHaveBeenCalled();
  });

  it('reports a session request failure without claiming the email is unverified', async () => {
    const flow = continuation(
      vi.fn().mockResolvedValue({ data: null, error: { status: 500 } })
    );
    await settle(flow.handle);
    expect(flow.toast.error).toHaveBeenCalledExactlyOnceWith(
      'Please try again'
    );
    expect(flow.router.push).not.toHaveBeenCalled();
    expect(flow.navigate).not.toHaveBeenCalled();
  });

  it('handles a disconnected network and permits a subsequent retry', async () => {
    const flow = continuation(
      vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({
        data: null,
        error: null,
      })
    );
    await settle(flow.handle);
    expect(flow.toast.error).toHaveBeenCalledWith('Please try again');
    expect(flow.router.push).not.toHaveBeenCalled();
    expect(flow.setCheckingSession).toHaveBeenLastCalledWith(false);
    await settle(flow.handle);
    expect(flow.router.push).toHaveBeenCalledOnce();
  });

  it('prevents duplicate Continue requests while a check is in progress', async () => {
    let resolve!: (result: { data: null; error: null }) => void;
    const pending = new Promise((done) => {
      resolve = done;
    });
    const flow = continuation(vi.fn().mockReturnValue(pending));
    const first = flow.handle();
    await flow.handle();
    expect(flow.getSession).toHaveBeenCalledOnce();
    expect(flow.setCheckingSession).toHaveBeenCalledWith(true);
    resolve({ data: null, error: null });
    await first;
    expect(flow.router.push).toHaveBeenCalledOnce();
    expect(flow.setCheckingSession).toHaveBeenLastCalledWith(false);
  });
});

describe('verification page hydration', () => {
  it.each([true, false])(
    'uses stable initial button content when session pending is %s',
    (isPending) => {
      const Page = new Function(
        'React',
        'useCallback',
        'useEffect',
        'useMemo',
        'useRef',
        'useState',
        'useSession',
        'useRouter',
        'deLocalizeHref',
        'AuthShell',
        'Button',
        'Loader2',
        'm',
        `${declaration('safeDecodeCallbackUrl')}\n${declaration('stripLocalePrefix')}\n${declaration('VerifyEmailPage')}\nreturn VerifyEmailPage;`
      )(
        React,
        React.useCallback,
        React.useEffect,
        React.useMemo,
        React.useRef,
        React.useState,
        () => ({ data: null, isPending }),
        () => ({ push: vi.fn(), replace: vi.fn() }),
        (path: string) => path,
        ({ children }: React.PropsWithChildren) =>
          React.createElement('main', null, children),
        (props: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
          React.createElement('button', props),
        () => React.createElement('svg', { 'data-session-loading': true }),
        new Proxy({}, { get: (_, key) => () => String(key) })
      ) as React.ComponentType;
      const html = renderToStaticMarkup(React.createElement(Page));
      expect(html).toContain('data-session-loading="true"');
      expect(html).not.toContain('common.sign.verify_email_continue');
    }
  );
});

describe('verification callback destination', () => {
  const decode = new Function(
    `${declaration('safeDecodeCallbackUrl')}\nreturn safeDecodeCallbackUrl;`
  )() as (raw?: string | null) => string;
  const stripLocale = new Function(
    'deLocalizeHref',
    `${declaration('safeDecodeCallbackUrl')}\n${declaration('stripLocalePrefix')}\nreturn stripLocalePrefix;`
  )(deLocalizeHref) as (raw: string) => string;

  it.each([
    '/tattoo-cover-up',
    '/zh/tattoo-filler',
    '/tattoo-cover-up?prompt=rose%20%26%20moon',
  ])('preserves the internal destination %s', (path) => {
    expect(decode(path)).toBe(path);
  });

  it('accepts legacy fully encoded internal destinations', () => {
    expect(decode('%2Ftattoo-cover-up')).toBe('/tattoo-cover-up');
  });

  it.each([
    null,
    '',
    'https://example.com',
    '//example.com',
    '%2F%2Fexample.com',
    '/\\example.com',
    '/\n/example.com',
    '/sign-in?callbackUrl=%2Fverify-email',
    '/zh/verify-email',
    '/%76erify-email?email=verification-qa%40example.invalid',
    '/zh/%73ign-in',
    '/%2fexample.com',
    '/%5cexample.com',
    '/a/..//example.com',
  ])('rejects external or looping destinations %s', (path) => {
    expect(decode(path)).toBe('/');
  });

  it.each([
    '/zh//example.com',
    '/a/..//example.com',
    '/zh/%2e%2e//example.com',
  ])('keeps the final localized callback inside this site for %s', (path) => {
    const nextUrl = stripLocale(decode(path));
    expect(nextUrl).toBe('/');
    for (const locale of ['en', 'zh'] as const) {
      const localized = localizeHref(nextUrl, { locale });
      expect(localized.startsWith('/')).toBe(true);
      expect(localized.startsWith('//')).toBe(false);
    }
  });
});
