import { m } from '@/paraglide/messages.js';

export function Reviews() {
  const items = [
    {
      title: m['landing.reviews.item_1_title'](),
      description: m['landing.reviews.item_1_description'](),
    },
    {
      title: m['landing.reviews.item_2_title'](),
      description: m['landing.reviews.item_2_description'](),
    },
    {
      title: m['landing.reviews.item_3_title'](),
      description: m['landing.reviews.item_3_description'](),
    },
  ];

  return (
    <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow-vermilion">
              {m['landing.reviews.eyebrow']()}
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              {m['landing.reviews.title']()}
            </h2>
          </div>
          <p className="text-ink-muted max-w-2xl text-base leading-7 lg:justify-self-end">
            {m['landing.reviews.description']()}
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="border-ink-line bg-ink-panel flex min-h-64 flex-col rounded-[1.25rem] border p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="text-vermilion text-[0.68rem] font-bold tracking-[0.14em] uppercase">
                  {m['landing.reviews.scenario_label']()}
                </span>
                <span className="text-ink-muted font-display text-xs font-semibold">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-display mt-auto pt-12 text-2xl leading-tight font-semibold tracking-[-0.035em]">
                {item.title}
              </h3>
              <p className="text-ink-muted mt-4 text-sm leading-6">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        <p className="text-ink-muted mt-6 text-xs leading-5">
          {m['landing.reviews.disclaimer']()}
        </p>
      </div>
    </section>
  );
}
