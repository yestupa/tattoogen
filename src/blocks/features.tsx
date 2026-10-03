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
    <section id="features" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
            {m['landing.features.eyebrow']()}
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {m['landing.features.title']()}
          </h2>
          <p className="text-muted-foreground mt-5 leading-7">
            {m['landing.features.description']()}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="border-border bg-card shadow-soft rounded-card min-w-0 border p-6"
            >
              <div className="bg-secondary text-primary flex size-11 items-center justify-center rounded-xl">
                <item.icon aria-hidden className="size-5" />
              </div>
              <h3 className="mt-6 text-lg leading-snug font-semibold">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        <div className="border-border bg-secondary/40 rounded-shell mt-6 grid gap-5 border p-6 sm:grid-cols-2 sm:p-8">
          <p className="bg-card text-foreground rounded-card px-5 py-4 text-sm leading-6">
            {m['landing.features.preview_prompt']()}
          </p>
          <p className="text-secondary-foreground flex items-center text-sm leading-6">
            {m['landing.features.preview_reply']()}
          </p>
        </div>
      </div>
    </section>
  );
}
