import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface PageHeadingProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeading({
  title,
  description,
  eyebrow,
  action,
  className,
}: PageHeadingProps) {
  return (
    <header
      className={cn(
        'flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-3">
        {eyebrow && (
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-foreground font-serif text-3xl tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
            {description}
          </div>
        )}
      </div>
      {action && (
        <div className="*:focus-visible:outline-ring flex shrink-0 flex-wrap gap-3 *:inline-flex *:min-h-11 *:items-center *:justify-center *:focus-visible:outline-2 *:focus-visible:outline-offset-4">
          {action}
        </div>
      )}
    </header>
  );
}
