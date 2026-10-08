import type { ReactNode } from 'react';
import {
  CircleAlert,
  Compass,
  Inbox,
  LoaderCircle,
  Shield,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export type PageStateVariant =
  | 'loading'
  | 'empty'
  | 'forbidden'
  | 'error'
  | 'not-found';

export interface PageStateProps {
  variant?: PageStateVariant;
  code?: string;
  artwork?: ReactNode;
  title: string;
  description: ReactNode;
  detail?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  headingLevel?: 1 | 2 | 3;
}

const stateIcons = {
  loading: LoaderCircle,
  empty: Inbox,
  forbidden: Shield,
  error: CircleAlert,
  'not-found': Compass,
};

export function PageState({
  variant = 'empty',
  code,
  artwork,
  title,
  description,
  detail,
  primaryAction,
  secondaryAction,
  className,
  headingLevel = 1,
}: PageStateProps) {
  const loading = variant === 'loading';
  const Icon = stateIcons[variant];
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';

  return (
    <section
      className={cn(
        'paper-ui border-paper-line bg-paper-panel text-paper-fg mx-auto flex w-full max-w-3xl min-w-0 flex-col items-center rounded-[1.5rem] border px-6 py-12 text-center shadow-[0_24px_70px_-48px_rgba(17,17,16,0.55)] sm:px-10 sm:py-16',
        className
      )}
    >
      {artwork !== undefined ? (
        <div className="mb-6 w-full max-w-56">{artwork}</div>
      ) : (
        <div
          className="bg-secondary text-primary mb-6 flex size-16 items-center justify-center rounded-2xl"
          aria-hidden="true"
        >
          <Icon
            className={cn('size-7', loading && 'motion-safe:animate-spin')}
          />
        </div>
      )}
      <div
        className="w-full space-y-3"
        role={loading ? 'status' : undefined}
        aria-live={loading ? 'polite' : undefined}
      >
        {code && (
          <p className="text-primary text-sm font-semibold tracking-widest">
            {code}
          </p>
        )}
        <Heading className="font-display text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
          {title}
        </Heading>
        <div className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed text-pretty sm:text-base">
          {description}
        </div>
      </div>
      {detail && (
        <div className="text-muted-foreground mt-5 max-w-xl text-sm leading-relaxed wrap-anywhere">
          {detail}
        </div>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="*:focus-visible:outline-ring mt-8 flex w-full flex-col items-stretch justify-center gap-3 *:inline-flex *:min-h-11 *:items-center *:justify-center *:focus-visible:outline-2 *:focus-visible:outline-offset-4 sm:w-auto sm:flex-row sm:flex-wrap">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </section>
  );
}
