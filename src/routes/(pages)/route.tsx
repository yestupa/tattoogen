import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <main className="paper-texture flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="touch-target text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {m['common.pages.back_to_home']()}
          </Link>
        </div>
        <div className="border-border bg-card shadow-soft rounded-shell mx-auto mt-6 max-w-3xl border p-6 sm:p-10 [&_h1]:font-serif [&_h1]:leading-tight [&_pre]:max-w-full [&_pre]:overflow-x-auto">
          <MDXProvider components={mdxComponents}>
            <Outlet />
          </MDXProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
}
