/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ThemeProvider } from 'next-themes';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { getQueryClient } from '@/lib/query-client';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Ads } from '@/components/analytics/ads';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { Plausible } from '@/components/analytics/plausible';
import { BrandArtwork } from '@/components/brand-artwork';
import { CustomerService } from '@/components/customer-service';
import { GoogleOneTap } from '@/components/google-one-tap';
import { PageState } from '@/components/page-state';
import { SandboxPreviewBridge } from '@/components/sandbox-preview-bridge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

import '@fontsource-variable/inter';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/libre-baskerville/400-italic.css';
import '@/styles/globals.css';

// Analytics IDs live in the DB config (1h-cached service). Fetched via a
// server function so drizzle/db code never reaches the client bundle.
const getAnalyticsConfigs = createServerFn().handler(async () => {
  const { getAllConfigs } = await import('@/modules/config/service');
  const configs = await getAllConfigs();
  return {
    gaId: configs.google_analytics_id?.trim() || '',
    plausibleDomain: configs.plausible_domain?.trim() || '',
    plausibleSrc: configs.plausible_src?.trim() || '',
    adsenseCode: configs.adsense_code?.trim() || '',
    crispWebsiteId:
      configs.crisp_enabled === 'true'
        ? configs.crisp_website_id?.trim() || ''
        : '',
    tawkPropertyId:
      configs.tawk_enabled === 'true'
        ? configs.tawk_property_id?.trim() || ''
        : '',
    tawkWidgetId:
      configs.tawk_enabled === 'true'
        ? configs.tawk_widget_id?.trim() || ''
        : '',
  };
});

export const Route = createRootRoute({
  loader: () => getAnalyticsConfigs(),
  head: () => {
    // Use the configured public origin on both SSR and hydration. Page routes
    // own their canonical and language links, including the current path.
    const appUrl = new URL(envConfigs.app_url).origin;
    const description = m['common.metadata.description'](
      {},
      { locale: getLocale() }
    );
    // Social-card defaults. A route's own head() overrides the ones it repeats
    // (title/description), so pages only restate what differs.
    const ogImage = `${appUrl}/logo.png`;
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: envConfigs.app_name },
        { name: 'description', content: description },
        { property: 'og:site_name', content: envConfigs.app_name },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: envConfigs.app_name },
        { property: 'og:description', content: description },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: envConfigs.app_name },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
      links: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: envConfigs.app_name,
            description,
            url: appUrl,
            publisher: {
              '@type': 'Organization',
              name: envConfigs.app_name,
              logo: ogImage,
            },
          }).replace(/</g, '\\u003c'),
        },
      ],
    };
  },
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootComponent() {
  const analytics = Route.useLoaderData();

  return (
    <QueryClientProvider client={getQueryClient()}>
      {/* Light is the default look; visitors who pick dark (or "system" in the
          toggle) keep their choice in localStorage. */}
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <Outlet />
        <SandboxPreviewBridge />
        <Toaster position="top-center" richColors />
        <GoogleOneTap />
        {analytics?.gaId ? (
          <GoogleAnalytics measurementId={analytics.gaId} />
        ) : null}
        {analytics?.plausibleDomain || analytics?.plausibleSrc ? (
          <Plausible
            domain={analytics.plausibleDomain}
            src={analytics.plausibleSrc || undefined}
          />
        ) : null}
        {analytics?.adsenseCode ? <Ads code={analytics.adsenseCode} /> : null}
        <CustomerService
          crispWebsiteId={analytics?.crispWebsiteId || undefined}
          tawkPropertyId={analytics?.tawkPropertyId || undefined}
          tawkWidgetId={analytics?.tawkWidgetId || undefined}
        />
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
      <PageState
        variant="not-found"
        code="404"
        artwork={<BrandArtwork />}
        title={m['common.not_found.message']()}
        description={m['common.not_found.description']()}
        primaryAction={
          <Link href="/chat" className={buttonVariants()}>
            {m['common.not_found.start_creating']()}
          </Link>
        }
        secondaryAction={
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            {m['common.not_found.back_home']()}
          </Link>
        }
      />
    </main>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  const requestError = error as Error & {
    status?: number;
    statusCode?: number;
    retryable?: boolean;
  };
  const status = requestError.status ?? requestError.statusCode;
  const retryable =
    requestError.retryable !== false &&
    (status === undefined || status === 408 || status === 429 || status >= 500);

  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
      <PageState
        variant="error"
        artwork={<BrandArtwork />}
        title={m['common.error.title']()}
        description={m['common.state.request_failed']()}
        detail={
          import.meta.env.DEV && error instanceof Error ? (
            <pre className="bg-muted max-w-full overflow-auto rounded p-4 text-xs">
              {error.message}
            </pre>
          ) : undefined
        }
        primaryAction={
          retryable ? (
            <Button type="button" onClick={reset}>
              {m['common.error.retry']()}
            </Button>
          ) : undefined
        }
        secondaryAction={
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            {m['common.not_found.back_home']()}
          </Link>
        }
      />
    </main>
  );
}
