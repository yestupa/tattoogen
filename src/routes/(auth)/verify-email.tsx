import { useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { authClient, useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { deLocalizeHref, localizeHref } from '@/paraglide/runtime.js';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';

const RESEND_COOLDOWN_SECONDS = 60;

function safeDecodeCallbackUrl(raw?: string | null) {
  if (!raw) return '/';
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('/')) return decoded;
    return '/';
  } catch {
    return '/';
  }
}

function stripLocalePrefix(path: string) {
  if (!path?.startsWith('/')) return '/';
  return deLocalizeHref(path);
}

function getCooldownKey(email?: string | null) {
  return `verify-email:lastSentAt:${String(email || '').toLowerCase()}`;
}

function getCooldownRemainingSeconds(email?: string | null) {
  if (typeof window === 'undefined') return 0;
  if (!email) return 0;
  const raw = window.localStorage.getItem(getCooldownKey(email));
  const last = raw ? Number(raw) : 0;
  if (!last || Number.isNaN(last)) return 0;
  const elapsedSeconds = Math.floor((Date.now() - last) / 1000);
  return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsedSeconds);
}

function markSentNow(email?: string | null) {
  if (typeof window === 'undefined') return;
  if (!email) return;
  try {
    window.localStorage.setItem(getCooldownKey(email), String(Date.now()));
  } catch {}
}

function VerifyEmailPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [paramsReady, setParamsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialSendFailed, setInitialSendFailed] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const lastSessionCheckAtRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    const cb = params.get('callbackUrl');
    const sent = params.get('sent');

    setEmail(e);
    setCallbackUrl(cb);
    setParamsReady(true);
    setInitialSendFailed(sent === '0');

    if (sent === '1') {
      if (getCooldownRemainingSeconds(e) === 0) {
        markSentNow(e);
      }
      setCooldownSeconds(getCooldownRemainingSeconds(e));
    } else {
      setCooldownSeconds(getCooldownRemainingSeconds(e));
    }
    if (sent !== null) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('sent');
        window.history.replaceState({}, '', url.toString());
      } catch {}
    }
  }, []);

  // If user lands here without context, send to sign-in.
  useEffect(() => {
    if (paramsReady && !email && !callbackUrl) {
      router.replace('/sign-in');
    }
  }, [paramsReady, email, callbackUrl, router]);

  const nextUrl = useMemo(() => {
    const decoded = safeDecodeCallbackUrl(callbackUrl);
    return stripLocalePrefix(decoded);
  }, [callbackUrl]);

  const signInPath = useMemo(() => {
    const query = new URLSearchParams();
    query.set('callbackUrl', nextUrl || '/');
    return `/sign-in?${query.toString()}`;
  }, [nextUrl]);

  const hardNavigateToNextUrl = () => {
    if (typeof window === 'undefined') return;
    window.location.assign(localizeHref(nextUrl));
  };

  const checkSessionAndRedirect = async () => {
    const now = Date.now();
    if (now - lastSessionCheckAtRef.current < 800) return;
    lastSessionCheckAtRef.current = now;
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        hardNavigateToNextUrl();
      }
    } catch {}
  };

  // Cooldown ticker
  useEffect(() => {
    if (!paramsReady) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds(getCooldownRemainingSeconds(email));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [email, paramsReady]);

  // If session exists, redirect to next.
  useEffect(() => {
    if (!isPending && session?.user) {
      hardNavigateToNextUrl();
    }
  }, [isPending, session?.user, nextUrl]);

  // Brief polling on mount: detect verification link → cookie → session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      await checkSessionAndRedirect();
      if (attempts >= maxAttempts) return;
      const { data } = await authClient.getSession();
      if (!data?.user) {
        window.setTimeout(tick, 1000);
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [nextUrl]);

  // Cross-tab sync: re-check session on focus / visibility change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = () => void checkSessionAndRedirect();
    const onVisibility = () => {
      if (document.visibilityState === 'visible')
        void checkSessionAndRedirect();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [nextUrl]);

  const handleResend = async () => {
    if (!email) {
      toast.error(m['common.sign.verify_email_email_required']());
      return;
    }
    if (loading) return;
    if (getCooldownRemainingSeconds(email) > 0) return;

    try {
      setLoading(true);
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: localizeHref(nextUrl || '/'),
      });
      if (result?.error) {
        toast.error(
          result.error.message || m['common.sign.verify_email_send_failed']()
        );
        return;
      }
      setInitialSendFailed(false);
      markSentNow(email);
      setCooldownSeconds(getCooldownRemainingSeconds(email));
    } catch (e: any) {
      toast.error(e?.message || m['common.sign.verify_email_send_failed']());
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (session?.user) {
      hardNavigateToNextUrl();
      return;
    }
    void (async () => {
      await checkSessionAndRedirect();
      const { data } = await authClient.getSession();
      if (data?.user) {
        hardNavigateToNextUrl();
      } else {
        // User hasn't verified yet — show a toast instead of redirecting
        toast.error(m['common.sign.verify_email_not_verified_yet']());
      }
    })();
  };

  return (
    <AuthShell
      eyebrow={m['common.auth.eyebrow']()}
      title={m['common.sign.verify_email_page_title']()}
      description={
        <>
          {m['common.sign.verify_email_page_description']()}
          {email ? ` ${email}` : ''}
        </>
      }
      benefits={[
        m['common.auth.benefit_explore'](),
        m['common.auth.benefit_refine'](),
        m['common.auth.benefit_save'](),
      ]}
    >
      {initialSendFailed && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed"
        >
          {m['common.sign.verify_email_initial_send_failed']()}
        </div>
      )}
      <div className="grid gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading || cooldownSeconds > 0}
          onClick={handleResend}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : cooldownSeconds > 0 ? (
            m['common.sign.resend_verification_countdown']({
              seconds: cooldownSeconds,
            })
          ) : (
            m['common.sign.resend_verification']()
          )}
        </Button>

        <Button
          type="button"
          className="w-full"
          disabled={isPending}
          onClick={handleContinue}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            m['common.sign.verify_email_continue']()
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => router.push(signInPath)}
        >
          {m['common.sign.back_to_sign_in']()}
        </Button>
      </div>
      <p className="text-muted-foreground mt-4 text-center text-xs">
        {m['common.sign.verify_email_tip']()}
      </p>
      <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
        {m['common.auth.security_note']()}
      </p>
    </AuthShell>
  );
}

export const Route = createFileRoute('/(auth)/verify-email')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: VerifyEmailPage,
});
