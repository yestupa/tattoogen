export type TattooLocale = 'en' | 'zh';
export type LocalizedText = Record<TattooLocale, string>;

export type TattooExample = {
  id: string;
  image: string;
  width: number;
  height: number;
  title: LocalizedText;
  description: LocalizedText;
  prompt: string;
  styles: string[];
  /** Suggested adaptations of flat artwork, not claims of on-skin previews. */
  placements: string[];
  topics: string[];
  generatorPath: string;
};

export type TattooCollection = {
  slug: string;
  label: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  intro: LocalizedText;
  brief: LocalizedText;
  tips: LocalizedText[];
  exampleIds: string[];
  relatedPaths: string[];
  keyword: string;
};

export const localized = (en: string, zh: string): LocalizedText => ({
  en,
  zh,
});
