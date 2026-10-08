import { m } from '@/paraglide/messages.js';

export function Stats() {
  const items = [
    {
      value: m['landing.stats.value_1'](),
      label: m['landing.stats.label_1'](),
    },
    {
      value: m['landing.stats.value_2'](),
      label: m['landing.stats.label_2'](),
    },
    {
      value: m['landing.stats.value_3'](),
      label: m['landing.stats.label_3'](),
    },
    {
      value: m['landing.stats.value_4'](),
      label: m['landing.stats.label_4'](),
    },
  ];

  return (
    <section className="section-ink border-ink-line border-y px-4 sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
        {items.map((s) => (
          <div
            key={s.label}
            className="border-ink-line flex min-h-36 flex-col justify-center border-b px-4 py-7 text-center odd:border-r sm:min-h-40 sm:border-r sm:border-b-0 sm:last:border-r-0"
          >
            <div className="text-vermilion font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              {s.value}
            </div>
            <div className="text-ink-muted mt-3 text-xs leading-snug tracking-[0.08em] uppercase sm:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
