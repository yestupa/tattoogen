import { ArrowRight, Copy } from 'lucide-react';

import type { DiscoveryCopy } from '@/content/tattoos/discovery-copy';

import {
  discoveryPrimaryButton,
  discoverySecondaryButton,
  type DiscoveryImage,
} from './discovery-primitives';

type DetailLabels = Pick<
  DiscoveryCopy,
  | 'detailImageNote'
  | 'promptTitle'
  | 'promptLabel'
  | 'promptDescription'
  | 'generate'
  | 'generating'
  | 'copyPrompt'
>;

export function DiscoveryDetail({
  image,
  prompt,
  onPromptChange,
  onCopy,
  onGenerate,
  submitting,
  labels,
}: {
  image: DiscoveryImage;
  prompt: string;
  onPromptChange: (value: string) => void;
  onCopy: () => void;
  onGenerate: () => void;
  submitting: boolean;
  labels: DetailLabels;
}) {
  return (
    <section className="section-paper px-4 py-12 sm:px-6 sm:py-16">
      <div className="section-shell grid min-w-0 gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <figure className="min-w-0">
          <div className="border-paper-line overflow-hidden rounded-2xl border bg-[#f0ece3]">
            <img
              src={image.image}
              width={image.width}
              height={image.height}
              alt={image.alt}
              fetchPriority="high"
              decoding="async"
              className="max-h-[760px] w-full object-contain"
            />
          </div>
          <figcaption className="text-paper-muted mt-4 text-sm leading-6">
            {labels.detailImageNote}
          </figcaption>
        </figure>
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {labels.promptTitle}
          </h2>
          <p className="text-paper-muted mt-4 text-base leading-7">
            {labels.promptDescription}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onGenerate();
            }}
            className="mt-7"
          >
            <label
              htmlFor="discovery-prompt"
              className="block text-sm font-semibold"
            >
              {labels.promptLabel}
            </label>
            <textarea
              id="discovery-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              maxLength={6000}
              rows={9}
              className="border-paper-line bg-paper-panel focus-visible:outline-vermilion mt-3 w-full min-w-0 resize-y rounded-xl border p-4 text-sm leading-7 outline-offset-2 focus-visible:outline-2"
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting || !prompt.trim()}
                className={`${discoveryPrimaryButton} disabled:opacity-50`}
              >
                {submitting ? labels.generating : labels.generate}
                <ArrowRight aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                onClick={onCopy}
                className={discoverySecondaryButton}
              >
                <Copy aria-hidden className="size-4" />
                {labels.copyPrompt}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
