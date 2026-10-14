import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Locale = 'en' | 'zh';
type Messages = Record<string, string>;

const source = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const dictionaries: Record<Locale, Messages> = {
  en: JSON.parse(source('../../messages/en.json')),
  zh: JSON.parse(source('../../messages/zh.json')),
};

const publicTitles = [
  ['landing.metadata.title', /AI Tattoo Generator/i, /AI 纹身生成器/],
  [
    'landing.pricing.meta_title',
    /AI Tattoo Generator Pricing/i,
    /AI 纹身生成器价格/,
  ],
  ['blog.meta_title', /Tattoo Design Blog/i, /纹身设计博客/],
  ['contact.meta_title', /Contact.*Support/i, /联系.*支持/],
  ['womb.meta.title', /Womb Tattoo Generator/i, /Womb Tattoo|下腹部纹身/],
  ['fear.meta.title', /Fear God Tattoo Generator/i, /Fear God/],
  ['kaiser.meta.title', /Kaiser Tattoo Generator/i, /Kaiser/],
  ['poison.meta.title', /Poison Tree Tattoo Generator/i, /Poison Tree/],
  ['butterfly.meta.title', /Butterfly Tattoo Generator/i, /蝴蝶纹身生成器/],
  ['ghost.meta.title', /Ghost Face Tattoo Generator/i, /Ghost Face/],
  ['throat.meta.title', /Throat Tattoo Designs for Men/i, /男士喉部纹身/],
  ['couple.meta.title', /Couple Tattoo Generator/i, /情侣纹身生成器/],
  ['angel.meta.title', /Angel Numbers Tattoo Generator/i, /天使数字纹身生成器/],
  ['joker.meta.title', /Joker Tattoo Generator/i, /Joker/],
] as const;

describe('public search titles', () => {
  it.each(['en', 'zh'] as const)(
    'gives every marketing route a unique, intent-matched %s title',
    (locale) => {
      const titles = publicTitles.map(([key, enKeyword, zhKeyword]) => {
        const title = dictionaries[locale][key]?.replace(
          '{appName}',
          'Tattoo Generator'
        );
        expect(title, key).toBeTruthy();
        expect(title, key).toMatch(locale === 'en' ? enKeyword : zhKeyword);
        return title;
      });
      expect(new Set(titles).size).toBe(titles.length);
    }
  );

  it('avoids repeated theme keywords and a generic brand suffix', () => {
    for (const [key, keyword] of [
      ['butterfly.meta.title', 'Butterfly Tattoo'],
      ['ghost.meta.title', 'Ghost Face Tattoo'],
      ['joker.meta.title', 'Joker Tattoo'],
    ]) {
      const title = dictionaries.en[key];
      expect(
        title.toLowerCase().split(keyword.toLowerCase()).length - 1,
        key
      ).toBe(1);
    }
    expect(dictionaries.en['angel.meta.title']).not.toContain(
      'Best AI Tattoo Generator'
    );
    expect(
      dictionaries.en['contact.meta_title'].match(/Tattoo Generator/g)
    ).toHaveLength(1);
  });

  it('wires dedicated pricing and blog titles into their route metadata', () => {
    expect(source('./pricing.tsx')).toContain(
      "m['landing.pricing.meta_title']"
    );
    expect(source('./blog/index.tsx')).toContain("m['blog.meta_title']");
  });
});
