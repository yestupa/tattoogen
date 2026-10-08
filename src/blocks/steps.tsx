import { m } from '@/paraglide/messages.js';

export function Steps() {
  const items = [
    {
      title: m['landing.steps.item_1_title'](),
      description: m['landing.steps.item_1_description'](),
    },
    {
      title: m['landing.steps.item_2_title'](),
      description: m['landing.steps.item_2_description'](),
    },
    {
      title: m['landing.steps.item_3_title'](),
      description: m['landing.steps.item_3_description'](),
    },
  ];

  return (
    <section className="section-ink px-4 py-20 sm:px-6 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow-vermilion">{m['landing.steps.eyebrow']()}</p>
            <h2 className="font-display mt-4 max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
              {m['landing.steps.title']()}
            </h2>
          </div>
          <p className="text-ink-muted max-w-2xl text-base leading-7 lg:justify-self-end">
            {m['landing.steps.description']()}
          </p>
        </div>

        <ol className="border-ink-line mt-12 grid border-y lg:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.title}
              className="border-ink-line relative py-8 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <span className="text-vermilion font-display text-sm font-bold tracking-[0.12em]">
                {m['landing.steps.item_label']({ number: `0${index + 1}` })}
              </span>
              <h3 className="font-display mt-8 text-2xl leading-tight font-semibold tracking-[-0.035em]">
                {item.title}
              </h3>
              <p className="text-ink-muted mt-4 text-sm leading-6">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
