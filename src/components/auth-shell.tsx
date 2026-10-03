import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { BrandArtwork } from '@/components/brand-artwork';

export interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  benefits?: readonly string[];
  brand?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  benefits = [],
  brand,
  children,
  className,
}: AuthShellProps) {
  return (
    <main
      className={cn(
        'bg-background flex min-h-svh items-center justify-center px-4 py-6 sm:px-6 md:py-12',
        className
      )}
    >
      <div className="bg-card text-card-foreground grid w-full max-w-5xl min-w-0 overflow-hidden rounded-3xl border shadow-sm md:grid-cols-2">
        <div className="bg-secondary/60 flex min-w-0 flex-col gap-4 border-b p-6 sm:p-8 md:gap-8 md:border-r md:border-b-0 md:p-10">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {brand}
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </p>
          </div>
          <BrandArtwork className="text-foreground/80 mx-auto h-32 w-auto max-w-full md:h-72 md:flex-1" />
          {benefits.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm md:flex-col">
              {benefits.map((benefit, index) => (
                <li
                  key={`${index}-${benefit}`}
                  className="flex min-w-0 items-start gap-2"
                >
                  <Check
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="wrap-anywhere">{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-8 p-6 sm:p-8 md:p-10">
          <header className="space-y-3">
            <h1 className="font-serif text-3xl tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            {description && (
              <div className="text-muted-foreground text-sm leading-relaxed text-pretty">
                {description}
              </div>
            )}
          </header>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
