import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { withUtmSource } from '@/lib/utm';
import { m } from '@/paraglide/messages.js';
import { BrandLogo } from '@/components/brand-logo';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { buttonVariants } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  /** Open in a new tab. Off-site (http) hrefs always open in a new tab. */
  external?: boolean;
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

/** Exact match, or a prefix match for nested routes (`/chat/<id>`). */
function isActiveHref(pathname: string, href: string) {
  if (href.includes('#')) return false;
  const path = href.split(/[?#]/)[0];
  if (!path.startsWith('/') || path === '/') return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader({
  navLinks,
  localeHrefs,
}: {
  navLinks?: NavLink[];
  localeHrefs?: Partial<Record<'en' | 'zh', string>>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);
  const pathname = usePathname();
  // Session caches can resolve before hydration; match the anonymous SSR markup.
  const user = hydrated ? session?.user : undefined;

  return (
    <header
      data-public-header
      data-scrolled={scrolled}
      className={cn(
        'bg-ink-bg/95 text-ink-fg border-ink-line sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-shadow duration-300',
        scrolled && 'shadow-[0_16px_42px_-28px_rgba(0,0,0,0.9)]'
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileOpen) {
          setMobileOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          href="/"
          className="touch-target group flex min-w-0 items-center justify-self-start"
        >
          <BrandLogo className="w-44 sm:w-48 xl:w-52" />
        </Link>

        <nav className="hidden items-center justify-center gap-2 lg:flex">
          {navLinks?.map((link) =>
            isExternalHref(link.href) ? (
              <a
                key={link.href}
                href={withUtmSource(link.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center rounded-full px-3 text-sm transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                aria-current={
                  isActiveHref(pathname, link.href) ? 'page' : undefined
                }
                className={cn(
                  'touch-target after:bg-vermilion relative inline-flex items-center rounded-full px-3 text-sm font-medium transition-colors after:absolute after:right-3 after:bottom-1.5 after:left-3 after:h-px after:origin-left after:transition-transform',
                  isActiveHref(pathname, link.href)
                    ? 'text-ink-fg after:scale-x-100'
                    : 'text-ink-muted hover:text-ink-fg after:scale-x-0'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        {/* Desktop actions */}
        <div className="[&>button]:text-ink-muted [&>button]:hover:bg-ink-panel [&>button]:hover:text-ink-fg hidden items-center gap-2 justify-self-end lg:flex [&>button]:min-h-11 [&>button]:min-w-11">
          <LocaleSelector
            label={m['common.nav.switch_language']()}
            className="touch-target"
            localeHrefs={localeHrefs}
          />
          {user ? (
            <SiteUserMenu
              name={user.name || m['common.user.fallback_name']()}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href="/chat"
              className={cn(
                buttonVariants(),
                'touch-target bg-ink-fg text-ink-bg gap-1.5 rounded-full px-5 shadow-none hover:bg-white'
              )}
            >
              {m['common.nav.get_started']()}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          ref={menuButtonRef}
          type="button"
          className="touch-target text-ink-fg hover:bg-ink-panel flex items-center justify-center rounded-xl transition-colors lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={
            mobileOpen
              ? m['common.nav.close_menu']()
              : m['common.nav.open_menu']()
          }
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-nav"
        >
          {mobileOpen ? (
            <X aria-hidden className="size-5" />
          ) : (
            <Menu aria-hidden className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="public-mobile-nav"
          className="border-ink-line bg-ink-bg border-t px-4 pt-2 pb-4 lg:hidden"
        >
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  key={link.href}
                  href={withUtmSource(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target text-ink-muted hover:bg-ink-panel hover:text-ink-fg flex items-center rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  aria-current={
                    isActiveHref(pathname, link.href) ? 'page' : undefined
                  }
                  className={cn(
                    'touch-target text-ink-muted hover:bg-ink-panel hover:text-ink-fg flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors',
                    isActiveHref(pathname, link.href)
                      ? 'border-vermilion bg-ink-panel text-ink-fg'
                      : 'border-transparent'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="border-ink-line [&>button]:text-ink-muted [&>button]:hover:bg-ink-panel [&>button]:hover:text-ink-fg mt-3 flex items-center gap-2 border-t pt-3 [&>button]:min-h-11 [&>button]:min-w-11">
            <LocaleSelector
              label={m['common.nav.switch_language']()}
              className="touch-target"
              localeHrefs={localeHrefs}
            />
            <div className="flex-1" />
            {user ? (
              <SiteUserMenu
                name={user.name || m['common.user.fallback_name']()}
                email={user.email}
                image={user.image}
              />
            ) : (
              <Link
                href="/chat"
                className={cn(
                  buttonVariants(),
                  'touch-target bg-ink-fg text-ink-bg gap-1.5 rounded-full px-5 shadow-none hover:bg-white'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {m['common.nav.get_started']()}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
