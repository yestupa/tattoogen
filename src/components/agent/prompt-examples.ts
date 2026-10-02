import { Feather, Flame, Flower2, Type, type LucideIcon } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';

export interface PromptExample {
  key: string;
  title: string;
  prompt: string;
  /** Optional thumbnail; falls back to a gradient tile when absent. */
  image?: string;
  /** The "before" picture(s), attached to the composer when the example is
   *  picked, so the prompt has something to work on. A try-on case brings
   *  two: the person and the garment. */
  sourceImage?: string;
  sourceImages?: string[];
  swatch: string;
}

export interface PromptCategory {
  key: string;
  icon: LucideIcon;
  title: string;
  examples: PromptExample[];
}

// Warm ink-and-paper swatches keep prompt cards useful before every style has
// a finished showcase image.
const SWATCHES = [
  'from-stone-200 via-orange-100 to-amber-100',
  'from-red-200 via-rose-100 to-stone-100',
  'from-amber-200 via-stone-100 to-neutral-200',
  'from-neutral-300 via-stone-100 to-orange-100',
];

/**
 * Real before/after samples, keyed by example. `image` is the result shown in
 * the grid; `sourceImage` is the original it was made from. Examples without
 * an entry keep their gradient tile.
 */
const SAMPLES: Record<
  string,
  { image: string; sourceImage?: string; sourceImages?: string[] }
> = {
  'fine_line-1': {
    image: '/imgs/generated/tattoo-fine-line-phoenix-1790920629842.png',
  },
  'botanical-1': {
    image: '/imgs/generated/tattoo-peony-snake-1790920650819.png',
  },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fine_line: Feather,
  botanical: Flower2,
  traditional: Flame,
  lettering: Type,
};

const CATEGORY_KEYS = [
  'fine_line',
  'botanical',
  'traditional',
  'lettering',
] as const;

// Upper bound for the scan below, not a required count — a category ends at
// its first missing translation.
const MAX_ITEMS_PER_CATEGORY = 8;

/**
 * How many examples a category actually has. `tDynamic` echoes the key back
 * when there is no message for it, which is what marks the end — so dropping
 * an example is an edit to messages/*.json, not to this file.
 */
function itemCount(cat: string): number {
  let count = 0;
  while (count < MAX_ITEMS_PER_CATEGORY) {
    const key = `landing.examples.${cat}.item_${count + 1}_title`;
    if (tDynamic(key) === key) break;
    count += 1;
  }
  return count;
}

/**
 * The example browser's content: a handful of broad categories, each with a
 * few concrete scenarios whose prompt drops straight into the composer.
 * Reads i18n, so call it during render.
 */
export function promptCategories(): PromptCategory[] {
  return CATEGORY_KEYS.map((cat) => ({
    key: cat,
    icon: CATEGORY_ICONS[cat],
    title: tDynamic(`landing.examples.${cat}.title`),
    examples: Array.from({ length: itemCount(cat) }, (_, i) => {
      const key = `${cat}-${i + 1}`;
      return {
        key,
        title: tDynamic(`landing.examples.${cat}.item_${i + 1}_title`),
        prompt: tDynamic(`landing.examples.${cat}.item_${i + 1}_prompt`),
        swatch: SWATCHES[i % SWATCHES.length],
        ...SAMPLES[key],
      };
    }),
  }));
}
