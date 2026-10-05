import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { withUtmSource } from '@/lib/utm';
import { m } from '@/paraglide/messages.js';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const pathname = usePathname();
  // Session caches can resolve before hydration; match the anonymous SSR markup.
  const user = hydrated ? session?.user : undefined;

  return (
    <header
      className="border-border/70 bg-background/90 sticky top-0 z-50 w-full border-b backdrop-blur-md"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && mobileOpen) {
          setMobileOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="touch-target flex min-w-0 items-center gap-2.5 justify-self-start"
        >
          <img
            src={envConfigs.app_logo}
            alt={envConfigs.app_name}
            width={32}
            height={32}
            className="size-7"
          />
          <span className="truncate font-serif text-base sm:text-lg">
            {envConfigs.app_name}
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-2 lg:flex">
          {navLinks?.map((link) =>
            isExternalHref(link.href) ? (
              <a
                key={link.href}
                href={withUtmSource(link.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target text-muted-foreground hover:text-primary inline-flex items-center rounded-full px-3 text-sm transition-colors"
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
                  'touch-target inline-flex items-center rounded-full px-3 text-sm transition-colors',
                  isActiveHref(pathname, link.href)
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        {/* Desktop actions */}
        <div className="hidden items-center gap-2 justify-self-end lg:flex [&>button]:min-h-11 [&>button]:min-w-11">
          <LocaleSelector
            label={m['common.nav.switch_language']()}
            className="touch-target"
            localeHrefs={localeHrefs}
          />
          <ThemeToggle label={m['common.nav.toggle_theme']()} />
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
                'touch-target gap-1.5 rounded-full px-5'
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
          className="touch-target hover:bg-secondary flex items-center justify-center rounded-xl lg:hidden"
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
          className="border-border bg-background border-t px-4 pt-2 pb-4 lg:hidden"
        >
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  key={link.href}
                  href={withUtmSource(link.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target text-muted-foreground hover:bg-accent hover:text-foreground flex items-center rounded-md px-3 py-2 text-sm transition-colors"
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
                  className="touch-target text-muted-foreground hover:bg-accent hover:text-foreground flex items-center rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="border-border mt-3 flex items-center gap-2 border-t pt-3 [&>button]:min-h-11 [&>button]:min-w-11">
            <LocaleSelector
              label={m['common.nav.switch_language']()}
              className="touch-target"
              localeHrefs={localeHrefs}
            />
            <ThemeToggle label={m['common.nav.toggle_theme']()} />
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
                  'touch-target gap-1.5 rounded-full px-5'
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
