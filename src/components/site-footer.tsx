import type { ComponentType, SVGProps } from 'react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { withUtmSource } from '@/lib/utm';
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
  rightsReservedLabel,
}: {
  tagline?: string;
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  copyright?: string;
  languageLabel: string;
  rightsReservedLabel: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-public-footer
      className="bg-ink-bg text-ink-fg border-ink-line border-t"
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-7 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mb-14 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <Link
              href="/"
              className="touch-target font-display mb-5 inline-flex items-center gap-2.5 text-lg font-bold tracking-[-0.03em]"
            >
              <img
                src={envConfigs.app_logo}
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-full ring-1 ring-white/15"
              />
              {envConfigs.app_name}
            </Link>
            {tagline && (
              <p className="font-display max-w-2xl text-3xl leading-[1.08] font-semibold tracking-[-0.045em] text-balance sm:text-4xl lg:text-5xl">
                {tagline}
              </p>
            )}
          </div>

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
                <div key={col.title} className="space-y-4">
                  <p className="text-ink-fg text-xs font-semibold tracking-[0.16em] uppercase">
                    {col.title}
                  </p>
                  <ul className="space-y-1">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {isExternalHref(link.href) ? (
                          <a
                            href={withUtmSource(link.href)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center text-sm transition-colors"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            className="touch-target text-ink-muted hover:text-ink-fg inline-flex items-center text-sm transition-colors"
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
        </div>

        <div className="border-ink-line flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {socials && socials.length > 0 && (
              <div className="flex items-center gap-5">
                {socials.map((s) =>
                  isExternalHref(s.href) ? (
                    <a
                      key={s.label}
                      href={withUtmSource(s.href)}
                      aria-label={s.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target text-ink-muted hover:text-ink-fg flex items-center justify-center rounded-full transition-colors"
                    >
                      <s.icon aria-hidden className="size-[18px]" />
                    </a>
                  ) : (
                    <Link
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="touch-target text-ink-muted hover:text-ink-fg flex items-center justify-center rounded-full transition-colors"
                    >
                      <s.icon aria-hidden className="size-[18px]" />
                    </Link>
                  )
                )}
              </div>
            )}
            <span className="text-ink-muted text-sm">
              {copyright ?? (
                <>
                  © {year} {envConfigs.app_name}. {rightsReservedLabel}
                </>
              )}
            </span>
          </div>
          <LocaleSelector
            label={languageLabel}
            variant="pill"
            className="touch-target border-ink-line text-ink-muted hover:bg-ink-panel hover:text-ink-fg"
          />
        </div>
      </div>
    </footer>
  );
}
