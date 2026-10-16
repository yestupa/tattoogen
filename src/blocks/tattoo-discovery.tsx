import { useState } from 'react';
import { toast } from 'sonner';

import { useRouter } from '@/core/i18n/navigation';
import { newAgentSessionId } from '@/lib/agent';
import {
  findTattooCollection,
  findTattooExample,
  tattooCollectionPath,
  type TattooCollectionKind,
} from '@/lib/tattoo-discovery';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { useComposerSettings } from '@/hooks/use-composer-settings';
import { DiscoveryDetail } from '@/components/tattoo/discovery-detail';
import { DiscoveryGallery } from '@/components/tattoo/discovery-gallery';
import {
  DiscoveryBrief,
  DiscoveryCollections,
  DiscoveryHero,
  DiscoveryLinks,
  type DiscoveryLink,
} from '@/components/tattoo/discovery-primitives';
import {
  tattooExamples,
  tattooPlacements,
  tattooStyles,
  tattooTopics,
  type TattooExample,
  type TattooLocale,
} from '@/content/tattoos/catalog';
import {
  discoveryGeneratorLinks,
  discoveryIndexes,
  type DiscoveryCopy,
} from '@/content/tattoos/discovery-copy';

type IndexKind = 'ideas' | 'styles' | 'placements';
const indexPaths = {
  ideas: '/tattoo-ideas',
  styles: '/tattoo-styles',
  placements: '/tattoo-placements',
};
const collectionIndex = {
  style: 'styles',
  placement: 'placements',
  topic: 'ideas',
} as const;
const indexCollections = {
  ideas: tattooTopics,
  styles: tattooStyles,
  placements: tattooPlacements,
};
const indexCollectionKinds = {
  ideas: 'topic',
  styles: 'style',
  placements: 'placement',
} as const;

const currentLocale = (): TattooLocale => (getLocale() === 'zh' ? 'zh' : 'en');

function readDiscoveryCopy(locale: TattooLocale): DiscoveryCopy {
  const options = { locale };
  return {
    eyebrow: m['discovery.ui.eyebrow']({}, options),
    breadcrumb: m['discovery.ui.breadcrumb']({}, options),
    home: m['discovery.ui.home']({}, options),
    ideas: m['discovery.ui.ideas']({}, options),
    styles: m['discovery.ui.styles']({}, options),
    placements: m['discovery.ui.placements']({}, options),
    tools: m['discovery.ui.tools']({}, options),
    browseTopics: m['discovery.ui.browseTopics']({}, options),
    compareStyles: m['discovery.ui.compareStyles']({}, options),
    browsePlacements: m['discovery.ui.browsePlacements']({}, options),
    galleryTitle: m['discovery.ui.galleryTitle']({}, options),
    searchLabel: m['discovery.ui.searchLabel']({}, options),
    searchPlaceholder: m['discovery.ui.searchPlaceholder']({}, options),
    styleLabel: m['discovery.ui.styleLabel']({}, options),
    placementLabel: m['discovery.ui.placementLabel']({}, options),
    allStyles: m['discovery.ui.allStyles']({}, options),
    allPlacements: m['discovery.ui.allPlacements']({}, options),
    reset: m['discovery.ui.reset']({}, options),
    results: m['discovery.ui.results']({ count: '{count}' }, options),
    emptyTitle: m['discovery.ui.emptyTitle']({}, options),
    emptyDescription: m['discovery.ui.emptyDescription']({}, options),
    viewDesign: m['discovery.ui.viewDesign']({}, options),
    conceptNote: m['discovery.ui.conceptNote']({}, options),
    briefTitle: m['discovery.ui.briefTitle']({}, options),
    tipsTitle: m['discovery.ui.tipsTitle']({}, options),
    relatedTitle: m['discovery.ui.relatedTitle']({}, options),
    nextTitle: m['discovery.ui.nextTitle']({}, options),
    generatorsTitle: m['discovery.ui.generatorsTitle']({}, options),
    detailEyebrow: m['discovery.ui.detailEyebrow']({}, options),
    detailImageNote: m['discovery.ui.detailImageNote']({}, options),
    promptTitle: m['discovery.ui.promptTitle']({}, options),
    promptLabel: m['discovery.ui.promptLabel']({}, options),
    promptDescription: m['discovery.ui.promptDescription']({}, options),
    generate: m['discovery.ui.generate']({}, options),
    generating: m['discovery.ui.generating']({}, options),
    copyPrompt: m['discovery.ui.copyPrompt']({}, options),
    copied: m['discovery.ui.copied']({}, options),
    copyError: m['discovery.ui.copyError']({}, options),
    storageError: m['discovery.ui.storageError']({}, options),
    stylesTitle: m['discovery.ui.stylesTitle']({}, options),
    placementsTitle: m['discovery.ui.placementsTitle']({}, options),
    topicsTitle: m['discovery.ui.topicsTitle']({}, options),
    themeLink: m['discovery.ui.themeLink']({}, options),
    tryOn: m['discovery.ui.tryOn']({}, options),
    stencil: m['discovery.ui.stencil']({}, options),
    ideaTool: m['discovery.ui.ideaTool']({}, options),
    fontTool: m['discovery.ui.fontTool']({}, options),
    imageTool: m['discovery.ui.imageTool']({}, options),
  };
}

function navigation(locale: TattooLocale): DiscoveryLink[] {
  const copy = readDiscoveryCopy(locale);
  return [
    { href: '/tattoo-ideas', label: copy.ideas },
    { href: '/tattoo-styles', label: copy.styles },
    { href: '/tattoo-placements', label: copy.placements },
    { href: '/tattoo-tools', label: copy.tools },
  ];
}

function pathLabel(path: string, locale: TattooLocale) {
  const nav = navigation(locale).find((item) => item.href === path);
  if (nav) return nav.label;
  for (const kind of ['style', 'placement', 'topic'] as const) {
    const collection = indexCollections[collectionIndex[kind]].find(
      (item) => tattooCollectionPath(kind, item.slug) === path
    );
    if (collection) return collection.label[locale];
  }
  return (
    discoveryGeneratorLinks.find((item) => item.href === path)?.label[locale] ??
    readDiscoveryCopy(locale).tools
  );
}

function gallery(examples: TattooExample[], locale: TattooLocale) {
  return (
    <DiscoveryGallery
      examples={examples}
      locale={locale}
      labels={readDiscoveryCopy(locale)}
      styles={tattooStyles.map((item) => ({
        value: item.slug,
        label: item.label[locale],
      }))}
      placements={tattooPlacements.map((item) => ({
        value: item.slug,
        label: item.label[locale],
      }))}
    />
  );
}

function nextTools(locale: TattooLocale, lettering = false): DiscoveryLink[] {
  const copy = readDiscoveryCopy(locale);
  return [
    { href: '/tattoo-idea-generator', label: copy.ideaTool },
    ...(lettering
      ? [{ href: '/tattoo-font-generator', label: copy.fontTool }]
      : [{ href: '/image-to-tattoo', label: copy.imageTool }]),
    { href: '/try-tattoo', label: copy.tryOn },
    { href: '/tattoo-to-stencil', label: copy.stencil },
  ];
}

export function TattooDiscoveryIndex({ kind }: { kind: IndexKind }) {
  const locale = currentLocale();
  const copy = readDiscoveryCopy(locale);
  const page = discoveryIndexes[kind];
  const cards = indexCollections[kind].map((item) => {
    const example = findTattooExample(item.exampleIds[0])!;
    return {
      href: tattooCollectionPath(indexCollectionKinds[kind], item.slug),
      title: item.label[locale],
      description: item.description[locale],
      image: example.image,
      width: example.width,
      height: example.height,
      alt: example.title[locale],
    };
  });
  return (
    <>
      <DiscoveryHero
        eyebrow={copy.eyebrow}
        title={page.title[locale]}
        intro={page.intro[locale]}
        note={copy.conceptNote}
        breadcrumbLabel={copy.breadcrumb}
        breadcrumbs={[
          { href: '/', label: copy.home },
          { href: indexPaths[kind], label: copy[kind] },
        ]}
        navigation={navigation(locale)}
      />
      <DiscoveryCollections
        title={
          kind === 'ideas'
            ? copy.browseTopics
            : kind === 'styles'
              ? copy.compareStyles
              : copy.browsePlacements
        }
        items={cards}
      />
      {kind === 'ideas' && gallery(tattooExamples, locale)}
      <section className="section-paper px-4 pb-14 sm:px-6">
        <div className="section-shell space-y-10">
          <DiscoveryLinks
            title={copy.nextTitle}
            links={nextTools(locale, kind === 'styles')}
          />
          <DiscoveryLinks
            title={copy.generatorsTitle}
            links={discoveryGeneratorLinks.map((item) => ({
              href: item.href,
              label: item.label[locale],
            }))}
          />
        </div>
      </section>
    </>
  );
}

export function TattooDiscoveryCollection({
  kind,
  slug,
}: {
  kind: TattooCollectionKind;
  slug: string;
}) {
  const locale = currentLocale();
  const collection = findTattooCollection(kind, slug);
  if (!collection) return null;
  const copy = readDiscoveryCopy(locale);
  const indexKind = collectionIndex[kind];
  const examples = collection.exampleIds
    .map(findTattooExample)
    .filter((item): item is TattooExample => Boolean(item));
  return (
    <>
      <DiscoveryHero
        eyebrow={copy.eyebrow}
        title={collection.title[locale]}
        intro={collection.intro[locale]}
        note={copy.conceptNote}
        breadcrumbLabel={copy.breadcrumb}
        breadcrumbs={[
          { href: '/', label: copy.home },
          { href: indexPaths[indexKind], label: copy[indexKind] },
          {
            href: tattooCollectionPath(kind, slug),
            label: collection.label[locale],
          },
        ]}
        navigation={navigation(locale)}
      />
      {gallery(examples, locale)}
      <DiscoveryBrief
        title={copy.briefTitle}
        brief={collection.brief[locale]}
        tipsTitle={copy.tipsTitle}
        tips={collection.tips.map((tip) => tip[locale])}
      />
      <section className="section-paper px-4 pb-14 sm:px-6">
        <div className="section-shell space-y-10">
          <DiscoveryLinks
            title={copy.relatedTitle}
            links={collection.relatedPaths.map((href) => ({
              href,
              label: pathLabel(href, locale),
            }))}
          />
          <DiscoveryLinks
            title={copy.nextTitle}
            links={nextTools(locale, slug === 'lettering')}
          />
        </div>
      </section>
    </>
  );
}

export function TattooDiscoveryDesign({ designId }: { designId: string }) {
  const example = findTattooExample(designId);
  if (!example) return null;
  return (
    <TattooDiscoveryDesignContent
      key={example.id}
      example={example}
      locale={currentLocale()}
    />
  );
}

function TattooDiscoveryDesignContent({
  example,
  locale,
}: {
  example: TattooExample;
  locale: TattooLocale;
}) {
  const copy = readDiscoveryCopy(locale);
  const router = useRouter();
  const [composerSettings] = useComposerSettings();
  const [prompt, setPrompt] = useState(example.prompt);
  const [submitting, setSubmitting] = useState(false);

  function generate() {
    if (submitting || !prompt.trim()) return;
    const sessionId = newAgentSessionId();
    try {
      sessionStorage.setItem(
        `agent:initial-turn:${sessionId}`,
        JSON.stringify({
          prompt: prompt.trim(),
          settings: composerSettings,
          attachments: [],
        })
      );
    } catch {
      toast.error(copy.storageError);
      return;
    }
    setSubmitting(true);
    router.push(`/chat/${sessionId}`);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(copy.copied);
    } catch {
      toast.error(copy.copyError);
    }
  }

  const tagLinks = (kind: TattooCollectionKind, slugs: string[]) =>
    slugs.map((slug) => ({
      href: tattooCollectionPath(kind, slug),
      label: findTattooCollection(kind, slug)!.label[locale],
    }));
  return (
    <>
      <DiscoveryHero
        eyebrow={copy.detailEyebrow}
        title={example.title[locale]}
        intro={example.description[locale]}
        note={copy.conceptNote}
        breadcrumbLabel={copy.breadcrumb}
        breadcrumbs={[
          { href: '/', label: copy.home },
          { href: '/tattoo-ideas', label: copy.ideas },
          {
            href: `/tattoo-designs/${example.id}`,
            label: example.title[locale],
          },
        ]}
        navigation={navigation(locale)}
      />
      <DiscoveryDetail
        image={{
          image: example.image,
          width: example.width,
          height: example.height,
          alt: example.title[locale],
        }}
        prompt={prompt}
        onPromptChange={setPrompt}
        onCopy={copyPrompt}
        onGenerate={generate}
        submitting={submitting}
        labels={copy}
      />
      <section className="section-paper px-4 pb-14 sm:px-6">
        <div className="section-shell space-y-9">
          <DiscoveryLinks
            title={copy.stylesTitle}
            links={tagLinks('style', example.styles)}
          />
          <DiscoveryLinks
            title={copy.placementsTitle}
            links={tagLinks('placement', example.placements)}
          />
          <DiscoveryLinks
            title={copy.topicsTitle}
            links={tagLinks('topic', example.topics)}
          />
          <DiscoveryLinks
            title={copy.relatedTitle}
            links={[
              {
                href: example.generatorPath,
                label: pathLabel(example.generatorPath, locale),
              },
            ]}
          />
          <DiscoveryLinks
            title={copy.nextTitle}
            links={nextTools(locale, example.styles.includes('lettering'))}
          />
        </div>
      </section>
    </>
  );
}
