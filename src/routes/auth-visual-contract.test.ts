import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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
