import { m } from '@/paraglide/messages.js';
import { PromptLauncher } from '@/components/agent/prompt-launcher';
import { BrandArtwork } from '@/components/brand-artwork';

export function Hero() {
  return (
    <section className="section-ink overflow-hidden px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="eyebrow-vermilion mb-5">
            {m['landing.hero.eyebrow']()}
          </p>
          <PromptLauncher className="landing-hero-launcher [&>h1]:font-display [&>h1]:!text-ink-fg [&>p]:!text-ink-muted [&>form]:border-paper-line [&>form]:bg-paper-panel [&>div]:min-w-0 [&>form]:mt-9 [&>form]:shadow-[0_24px_80px_-45px_rgba(0,0,0,0.9)] [&>h1]:text-left [&>h1]:text-[clamp(3.25rem,6.4vw,5.75rem)] [&>h1]:leading-[0.9] [&>h1]:font-semibold [&>h1]:tracking-[-0.065em] [&>h1]:text-balance [&>p]:max-w-xl [&>p]:text-left [&>p]:text-base [&>p]:leading-7 sm:[&>p]:text-lg" />
        </div>
        <div
          data-hero-preview
          className="border-ink-line bg-ink-panel relative overflow-hidden rounded-[1.5rem] border p-4 sm:p-6 lg:mt-6"
        >
          <div className="text-ink-muted flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
            <span aria-hidden className="bg-vermilion size-2 rounded-full" />
            {m['landing.hero.preview_label']()}
          </div>
          <div className="border-ink-line bg-paper-bg paper-texture mt-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1rem] border">
            <BrandArtwork className="text-paper-fg h-full max-h-[30rem] w-auto max-w-full p-5 sm:p-8" />
          </div>
          <div className="mt-5 space-y-3 text-sm leading-relaxed">
            <p className="bg-ink-fg text-ink-bg ml-6 rounded-xl rounded-tr-sm px-4 py-3">
              {m['landing.hero.preview_prompt']()}
            </p>
            <p className="border-ink-line text-ink-muted mr-6 rounded-xl rounded-tl-sm border px-4 py-3">
              {m['landing.hero.preview_reply']()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
