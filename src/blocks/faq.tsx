import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';

export function FAQ() {
  const items = [
    { q: m['landing.faq.q_1'](), a: m['landing.faq.a_1']() },
    { q: m['landing.faq.q_2'](), a: m['landing.faq.a_2']() },
    { q: m['landing.faq.q_3'](), a: m['landing.faq.a_3']() },
    { q: m['landing.faq.q_4'](), a: m['landing.faq.a_4']() },
    { q: m['landing.faq.q_5'](), a: m['landing.faq.a_5']() },
    { q: m['landing.faq.q_6'](), a: m['landing.faq.a_6']() },
    { q: m['landing.faq.q_7'](), a: m['landing.faq.a_7']() },
    { q: m['landing.faq.q_8'](), a: m['landing.faq.a_8']() },
    { q: m['landing.faq.q_9'](), a: m['landing.faq.a_9']() },
    { q: m['landing.faq.q_10'](), a: m['landing.faq.a_10']() },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="section-paper border-paper-line border-t px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="section-shell">
        <div className="text-center">
          <p className="eyebrow-vermilion">{m['landing.faq.eyebrow']()}</p>
          <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            {m['landing.faq.title']()}
          </h2>
        </div>

        <ul className="divide-paper-line border-paper-line bg-paper-panel mx-auto mt-12 max-w-4xl divide-y rounded-[1.25rem] border">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`public-faq-${i}`}
                  className="touch-target flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[#f5f1e8] sm:px-7 sm:py-6"
                >
                  <span className="text-paper-fg text-sm font-semibold sm:text-base">
                    {item.q}
                  </span>
                  <span className="border-paper-line text-paper-muted flex size-8 shrink-0 items-center justify-center rounded-full border">
                    {isOpen ? (
                      <Minus aria-hidden className="size-3.5" />
                    ) : (
                      <Plus aria-hidden className="size-3.5" />
                    )}
                  </span>
                </button>
                <div
                  id={`public-faq-${i}`}
                  aria-hidden={!isOpen}
                  className={cn(
                    'text-paper-muted grid overflow-hidden text-sm leading-relaxed transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="min-h-0">
                    <p className="px-5 pb-5 sm:px-7 sm:pb-6">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
