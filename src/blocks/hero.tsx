import { m } from '@/paraglide/messages.js';
import { PromptLauncher } from '@/components/agent/prompt-launcher';
import { BrandArtwork } from '@/components/brand-artwork';

export function Hero() {
  return (
    <section className="paper-texture px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="text-primary mb-5 text-xs font-semibold tracking-[0.18em] uppercase">
            {m['landing.hero.eyebrow']()}
          </p>
          <PromptLauncher className="[&>div]:min-w-0 [&>h1]:text-left [&>h1]:text-4xl [&>h1]:leading-tight [&>h1]:text-balance sm:[&>h1]:text-5xl [&>p]:text-left [&>p]:leading-7" />
        </div>
        <div
          data-hero-preview
          className="border-border bg-card shadow-panel rounded-shell overflow-hidden border p-5 sm:p-8 lg:mt-4"
        >
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span aria-hidden className="bg-primary size-2 rounded-full" />
            {m['landing.hero.preview_label']()}
          </div>
          <div className="border-border bg-background paper-texture rounded-card mt-5 flex aspect-[4/3] items-center justify-center border">
            <BrandArtwork className="text-foreground h-full max-h-80 w-auto max-w-full p-5" />
          </div>
          <div className="mt-5 space-y-3 text-sm leading-relaxed">
            <p className="bg-secondary text-secondary-foreground rounded-card ml-6 rounded-tr-sm px-4 py-3">
              {m['landing.hero.preview_prompt']()}
            </p>
            <p className="border-border text-muted-foreground rounded-card mr-6 rounded-tl-sm border px-4 py-3">
              {m['landing.hero.preview_reply']()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
