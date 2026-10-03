import type { ComponentType, SVGProps } from 'react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { withUtmSource } from '@/lib/utm';
import { BuiltWithShipAny } from '@/components/built-with-shipany';
import { LocaleSelector } from '@/components/locale-selector';

export interface FooterColumn {
  title: string;
  /** external: open in a new tab. Off-site (http) hrefs always open in a new tab. */
  links: { label: string; href: string; external?: boolean }[];
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export interface FooterSocial {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  label: string;
}

export function SiteFooter({
  tagline,
  columns,
  socials,
  copyright,
  languageLabel,
  builtWithLabel,
  rightsReservedLabel,
}: {
  tagline?: string;
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  copyright?: string;
  languageLabel: string;
  builtWithLabel: string;
  rightsReservedLabel: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-card text-foreground border-t">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-6 sm:px-6 sm:pt-16">
        <Link
          href="/"
          className="touch-target mb-5 inline-flex items-center gap-2.5 font-serif text-lg"
        >
          <img
            src={envConfigs.app_logo}
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          {envConfigs.app_name}
        </Link>
        {tagline && (
          <p className="mb-12 max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {tagline}
          </p>
        )}

        {columns && columns.length > 0 && (
          <div
            className={cn(
              'grid gap-x-8 gap-y-10 sm:gap-x-12',
              columns.length <= 3
                ? 'grid-cols-2 sm:grid-cols-3'
                : columns.length === 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            )}
          >
            {columns.map((col) => (
              <div key={col.title} className="space-y-5">
                <p className="text-foreground text-sm font-semibold tracking-wide">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {isExternalHref(link.href) ? (
                        <a
                          href={withUtmSource(link.href)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="touch-target text-muted-foreground hover:text-primary inline-flex items-center text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          className="touch-target text-muted-foreground hover:text-primary inline-flex items-center text-sm transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Socials + language row */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {socials && socials.length > 0 ? (
            <div className="flex items-center gap-5">
              {socials.map((s) =>
                isExternalHref(s.href) ? (
                  <a
                    key={s.label}
                    href={withUtmSource(s.href)}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target text-muted-foreground hover:text-primary flex items-center justify-center rounded-full transition-colors"
                  >
                    <s.icon aria-hidden className="size-[18px]" />
                  </a>
                ) : (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="touch-target text-muted-foreground hover:text-primary flex items-center justify-center rounded-full transition-colors"
                  >
                    <s.icon aria-hidden className="size-[18px]" />
                  </Link>
                )
              )}
            </div>
          ) : (
            <div />
          )}
          <LocaleSelector
            label={languageLabel}
            variant="pill"
            className="touch-target border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          />
        </div>

        {/* Bottom bar */}
        <div className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <BuiltWithShipAny label={builtWithLabel} />
          <span className="text-muted-foreground text-sm">
            {copyright ?? (
              <>
                © {year}{' '}
                {/* The brand links home — the one coloured word down here. */}
                <Link
                  href="/"
                  className="text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {envConfigs.app_name}
                </Link>
                . {rightsReservedLabel}
              </>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
