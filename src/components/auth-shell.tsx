import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { BrandArtwork } from '@/components/brand-artwork';
import { BrandLogo } from '@/components/brand-logo';

export interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  benefits?: readonly string[];
  children: ReactNode;
  className?: string;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  benefits = [],
  children,
  className,
}: AuthShellProps) {
  return (
    <main
      className={cn(
        'section-ink paper-texture relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:py-12',
        className
      )}
    >
      <div
        className="bg-vermilion/20 pointer-events-none absolute top-[-14rem] right-[-12rem] size-[32rem] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div className="border-ink-line bg-ink-panel relative grid w-full max-w-5xl min-w-0 overflow-hidden rounded-[1.6rem] border shadow-[0_32px_90px_-45px_rgba(0,0,0,0.95)] md:grid-cols-[0.92fr_1.08fr]">
        <div className="flex min-w-0 flex-col gap-5 border-b border-white/10 p-6 sm:p-8 md:gap-8 md:border-r md:border-b-0 md:p-10">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Link href="/" className="touch-target inline-flex items-center">
              <BrandLogo className="w-48 sm:w-56" />
            </Link>
            <p className="eyebrow-vermilion">{eyebrow}</p>
          </div>
          <BrandArtwork className="text-ink-fg/85 mx-auto h-32 w-auto max-w-full md:h-72 md:flex-1" />
          {benefits.length > 0 && (
            <ul className="text-ink-muted flex flex-wrap gap-x-5 gap-y-3 text-sm md:flex-col">
              {benefits.map((benefit, index) => (
                <li
                  key={`${index}-${benefit}`}
                  className="flex min-w-0 items-start gap-2"
                >
                  <Check
                    className="text-vermilion mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="wrap-anywhere">{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="paper-ui bg-paper-bg text-paper-fg flex min-w-0 flex-col justify-center gap-8 p-6 sm:p-8 md:p-10 lg:p-12">
          <header className="space-y-3">
            <h1 className="font-display text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              {title}
            </h1>
            {description && (
              <div className="text-muted-foreground text-sm leading-relaxed text-pretty">
                {description}
              </div>
            )}
          </header>
          <div className="min-w-0 [&_button]:min-h-11 [&_button]:min-w-11 [&_input]:min-h-11">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
