import { Cpu, GitBranch, MessageSquare, Network } from 'lucide-react';

import { m } from '@/paraglide/messages.js';

export function Features() {
  const items = [
    {
      icon: MessageSquare,
      title: m['landing.features.conversational_title'](),
      description: m['landing.features.conversational_description'](),
    },
    {
      icon: Network,
      title: m['landing.features.canvas_title'](),
      description: m['landing.features.canvas_description'](),
    },
    {
      icon: Cpu,
      title: m['landing.features.multimodel_title'](),
      description: m['landing.features.multimodel_desc'](),
    },
    {
      icon: GitBranch,
      title: m['landing.features.version_title'](),
      description: m['landing.features.version_description'](),
    },
  ];

  return (
    <section
      id="features"
      className="section-paper px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow-vermilion">
              {m['landing.features.eyebrow']()}
            </p>
            <h2 className="font-display mt-4 text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
              {m['landing.features.title']()}
            </h2>
          </div>
          <p className="text-paper-muted max-w-2xl text-base leading-7 sm:text-lg lg:justify-self-end">
            {m['landing.features.description']()}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="border-paper-line bg-paper-panel min-w-0 rounded-[1.25rem] border p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="bg-paper-fg text-paper-bg flex size-11 items-center justify-center rounded-full">
                  <item.icon aria-hidden className="size-5" />
                </div>
                <span className="text-paper-muted font-display text-xs font-semibold">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-display mt-8 text-xl leading-snug font-semibold tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="text-paper-muted mt-3 text-sm leading-6">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="border-paper-line bg-paper-panel mt-5 grid gap-px overflow-hidden rounded-[1.25rem] border sm:grid-cols-2">
          <p className="bg-paper-panel px-6 py-5 text-sm leading-6 font-medium">
            {m['landing.features.preview_prompt']()}
          </p>
          <p className="text-paper-muted bg-[#f3efe7] px-6 py-5 text-sm leading-6">
            {m['landing.features.preview_reply']()}
          </p>
        </div>
      </div>
    </section>
  );
}
