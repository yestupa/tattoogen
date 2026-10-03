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
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="border-border bg-secondary/40 rounded-shell mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 border p-6 sm:grid-cols-4 sm:p-10">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-primary font-serif text-3xl tracking-tight sm:text-4xl">
              {s.value}
            </div>
            <div className="text-muted-foreground mt-2 text-sm leading-snug">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
