import { Link } from '@/core/i18n/navigation';
import type { TattooTaskKind } from '@/lib/tattoo-task';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import type { TaskFontCopy } from '@/components/tattoo/task-font-preview';
import {
  TaskWorkbench,
  type TaskWorkbenchCopy,
} from '@/components/tattoo/task-workbench';
import { discoveryGeneratorLinks } from '@/content/tattoos/discovery-copy';

function workbenchCopy(): TaskWorkbenchCopy {
  const tokens = {
    theme: '{theme}',
    meaning: '{meaning}',
    mood: '{mood}',
    placement: '{placement}',
    style: '{style}',
    size: '{size}',
  };
  return {
    localNote: m['task.ui.localNote'](),
    textLabel: m['task.ui.textLabel'](),
    textPlaceholder: m['task.ui.textPlaceholder'](),
    themePlaceholder: m['task.ui.themePlaceholder'](),
    sourceLabel: m['task.ui.sourceLabel'](),
    sourceOptional: m['task.ui.sourceOptional'](),
    sourcePreview: m['task.ui.sourcePreview'](),
    guideLabel: m['task.ui.guideLabel'](),
    guidePreview: m['task.ui.guidePreview'](),
    drawGuide: m['task.ui.drawGuide'](),
    uploadGuide: m['task.ui.uploadGuide'](),
    drawLabel: m['task.ui.drawLabel'](),
    drawHint: m['task.ui.drawHint'](),
    clearGuide: m['task.ui.clearGuide'](),
    guideReady: m['task.ui.guideReady'](),
    guideNote: m['task.ui.guideNote'](),
    coverMode: m['task.ui.coverMode'](),
    coverUp: m['task.ui.coverUp'](),
    rework: m['task.ui.rework'](),
    aiAction: m['task.ui.aiAction'](),
    aiBusy: m['task.ui.aiBusy'](),
    aiNote: m['task.ui.aiNote'](),
    modelLabel: m['task.ui.modelLabel'](),
    creditsUnit: m['task.ui.creditsUnit'](),
    signIn: m['task.ui.signIn'](),
    signInHint: m['task.ui.signInHint'](),
    checkingSession: m['task.ui.checkingSession'](),
    buildIdeas: m['task.ui.buildIdeas'](),
    ideasTitle: m['task.ui.ideasTitle'](),
    ideasNote: m['task.ui.ideasNote'](),
    buildFirst: m['task.ui.buildFirst'](),
    selectDirection: m['task.ui.selectDirection'](),
    selectedDirection: m['task.ui.selectedDirection'](),
    labels: {
      theme: m['task.ui.themeLabel'](),
      meaning: m['task.ui.meaningLabel'](),
      mood: m['task.ui.moodLabel'](),
      placement: m['task.ui.placementLabel'](),
      style: m['task.ui.styleLabel'](),
      size: m['task.ui.sizeLabel'](),
      notes: m['task.ui.notesLabel'](),
    },
    fileHint: m['task.ui.fileHint'](),
    loading: m['task.ui.loading'](),
    removeImage: m['task.ui.removeImage'](),
    errors: {
      'exact-text-required': m['task.error.exactText'](),
      'source-required': m['task.error.source'](),
      'theme-required': m['task.error.theme'](),
      'guide-required': m['task.error.guide'](),
      'input-too-long': m['task.error.tooLong'](),
      'file-type': m['task.error.fileType'](),
      'file-size': m['task.error.fileSize'](),
      'image-dimensions': m['task.error.dimensions'](),
      image: m['task.error.image'](),
      'canvas-export': m['task.error.export'](),
      'storage-unavailable': m['task.error.storage'](),
      submit: m['task.error.submit'](),
    },
    directionTitles: [
      m['task.ui.directionOne'](),
      m['task.ui.directionTwo'](),
      m['task.ui.directionThree'](),
    ],
    ideaTemplates: [
      m['task.ui.ideaTemplateOne'](tokens),
      m['task.ui.ideaTemplateTwo'](tokens),
      m['task.ui.ideaTemplateThree'](tokens),
    ],
  };
}

function fontCopy(): TaskFontCopy {
  return {
    title: m['task.font.previewTitle'](),
    family: m['task.font.family'](),
    serif: m['task.font.serif'](),
    sans: m['task.font.sans'](),
    script: m['task.font.script'](),
    mono: m['task.font.mono'](),
    deviceNote: m['task.font.deviceNote'](),
    size: m['task.font.previewSize'](),
    spacing: m['task.font.spacing'](),
    layout: m['task.font.layout'](),
    lines: m['task.font.lines'](),
    stacked: m['task.font.stacked'](),
    download: m['task.font.download'](),
    empty: m['task.font.empty'](),
    previewLabel: m['task.font.previewLabel'](),
    exportError: m['task.error.export'](),
  };
}

function taskContent(kind: TattooTaskKind) {
  const pages = {
    font: {
      heading: m['task.font.heading'](),
      intro: m['task.font.intro'](),
      steps: [
        m['task.font.stepOne'](),
        m['task.font.stepTwo'](),
        m['task.font.stepThree'](),
      ],
      limit: m['task.font.limit'](),
    },
    image: {
      heading: m['task.image.heading'](),
      intro: m['task.image.intro'](),
      steps: [
        m['task.image.stepOne'](),
        m['task.image.stepTwo'](),
        m['task.image.stepThree'](),
      ],
      limit: m['task.image.limit'](),
    },
    idea: {
      heading: m['task.idea.heading'](),
      intro: m['task.idea.intro'](),
      steps: [
        m['task.idea.stepOne'](),
        m['task.idea.stepTwo'](),
        m['task.idea.stepThree'](),
      ],
      limit: m['task.idea.limit'](),
    },
    coverup: {
      heading: m['task.coverup.heading'](),
      intro: m['task.coverup.intro'](),
      steps: [
        m['task.coverup.stepOne'](),
        m['task.coverup.stepTwo'](),
        m['task.coverup.stepThree'](),
      ],
      limit: m['task.coverup.limit'](),
    },
    filler: {
      heading: m['task.filler.heading'](),
      intro: m['task.filler.intro'](),
      steps: [
        m['task.filler.stepOne'](),
        m['task.filler.stepTwo'](),
        m['task.filler.stepThree'](),
      ],
      limit: m['task.filler.limit'](),
    },
  };
  return pages[kind];
}

function toolLinks() {
  return [
    {
      href: '/tattoo-font-generator',
      label: m['task.hub.fontLabel'](),
      description: m['task.hub.fontDescription'](),
      local: true,
    },
    {
      href: '/image-to-tattoo',
      label: m['task.hub.imageLabel'](),
      description: m['task.hub.imageDescription'](),
      local: false,
    },
    {
      href: '/tattoo-idea-generator',
      label: m['task.hub.ideaLabel'](),
      description: m['task.hub.ideaDescription'](),
      local: true,
    },
    {
      href: '/tattoo-to-stencil',
      label: m['task.hub.stencilLabel'](),
      description: m['task.hub.stencilDescription'](),
      local: true,
    },
    {
      href: '/try-tattoo',
      label: m['task.hub.tryonLabel'](),
      description: m['task.hub.tryonDescription'](),
      local: true,
    },
    {
      href: '/tattoo-cover-up',
      label: m['task.hub.coverupLabel'](),
      description: m['task.hub.coverupDescription'](),
      local: false,
    },
    {
      href: '/tattoo-filler',
      label: m['task.hub.fillerLabel'](),
      description: m['task.hub.fillerDescription'](),
      local: false,
    },
  ];
}

function ToolBreadcrumb({ hub = false }: { hub?: boolean }) {
  return (
    <nav
      aria-label={m['task.ui.breadcrumb']()}
      className="text-paper-muted mb-8 flex flex-wrap items-center gap-2 text-sm"
    >
      <Link href="/" className="underline underline-offset-4">
        {m['task.ui.home']()}
      </Link>
      <span aria-hidden>/</span>
      {hub ? (
        <span aria-current="page">{m['task.ui.tools']()}</span>
      ) : (
        <Link href="/tattoo-tools" className="underline underline-offset-4">
          {m['task.ui.tools']()}
        </Link>
      )}
    </nav>
  );
}

export function TattooTools() {
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  return (
    <section className="section-paper px-4 py-10 sm:px-6 sm:py-16">
      <div className="section-shell min-w-0">
        <ToolBreadcrumb hub />
        <p className="eyebrow-vermilion">{m['task.ui.tools']()}</p>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          {m['task.hub.heading']()}
        </h1>
        <p className="text-paper-muted mt-5 max-w-3xl text-base leading-7">
          {m['task.hub.intro']()}
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {toolLinks().map((tool) => (
            <article
              key={tool.href}
              className="border-paper-line bg-paper-panel min-w-0 rounded-2xl border p-6"
            >
              <p className="text-vermilion text-xs font-semibold tracking-wide uppercase">
                {tool.local ? m['task.hub.local']() : m['task.hub.ai']()}
              </p>
              <h2 className="font-display mt-3 text-2xl font-bold">
                <Link
                  href={tool.href}
                  className="decoration-paper-line underline underline-offset-4 hover:decoration-current"
                >
                  {tool.label}
                </Link>
              </h2>
              <p className="text-paper-muted mt-3 text-sm leading-6">
                {tool.description}
              </p>
            </article>
          ))}
        </div>
        <section className="border-paper-line mt-14 border-t pt-8">
          <h2 className="font-display text-2xl font-bold">
            {m['task.hub.discoveryTitle']()}
          </h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4 text-sm font-semibold">
            <Link
              href="/tattoo-ideas"
              className="text-vermilion underline underline-offset-4"
            >
              {m['task.hub.ideasLink']()}
            </Link>
            <Link
              href="/tattoo-styles"
              className="text-vermilion underline underline-offset-4"
            >
              {m['task.hub.stylesLink']()}
            </Link>
            <Link
              href="/tattoo-placements"
              className="text-vermilion underline underline-offset-4"
            >
              {m['task.hub.placementsLink']()}
            </Link>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            {m['task.hub.generatorsTitle']()}
          </h2>
          <p className="text-paper-muted mt-3 max-w-3xl text-sm leading-6">
            {m['task.hub.generatorsIntro']()}
          </p>
          <ul className="mt-5 grid gap-3 text-sm font-semibold sm:grid-cols-2">
            {discoveryGeneratorLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-vermilion inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {item.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export function TattooTaskTool({ kind }: { kind: TattooTaskKind }) {
  const page = taskContent(kind);
  const links =
    kind === 'font'
      ? [
          {
            href: '/tattoo-styles/lettering',
            label: m['task.hub.letteringLink'](),
          },
          { href: '/tattoo-idea-generator', label: m['task.hub.ideaLabel']() },
          { href: '/try-tattoo', label: m['task.hub.tryonLabel']() },
        ]
      : kind === 'coverup' || kind === 'filler'
        ? [
            {
              href: '/tattoo-styles/blackwork',
              label: m['task.hub.blackworkLink'](),
            },
            { href: '/image-to-tattoo', label: m['task.hub.imageLabel']() },
            {
              href: kind === 'coverup' ? '/tattoo-filler' : '/tattoo-cover-up',
              label:
                kind === 'coverup'
                  ? m['task.hub.fillerLabel']()
                  : m['task.hub.coverupLabel'](),
            },
          ]
        : [
            { href: '/tattoo-ideas', label: m['task.hub.ideasLink']() },
            {
              href: '/tattoo-placements',
              label: m['task.hub.placementsLink'](),
            },
            {
              href:
                kind === 'image'
                  ? '/tattoo-to-stencil'
                  : '/tattoo-font-generator',
              label:
                kind === 'image'
                  ? m['task.hub.stencilLabel']()
                  : m['task.hub.fontLabel'](),
            },
          ];
  return (
    <section className="section-paper px-4 py-10 sm:px-6 sm:py-16">
      <div className="section-shell min-w-0">
        <ToolBreadcrumb />
        <p className="eyebrow-vermilion">{m['task.ui.eyebrow']()}</p>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          {page.heading}
        </h1>
        <p className="text-paper-muted mt-5 max-w-3xl text-base leading-7">
          {page.intro}
        </p>
        <div className="mt-10">
          <TaskWorkbench
            kind={kind}
            copy={workbenchCopy()}
            fontCopy={fontCopy()}
          />
        </div>
        <section className="border-paper-line mt-14 border-t pt-8">
          <h2 className="font-display text-2xl font-bold">
            {m['task.ui.howTitle']()}
          </h2>
          <ol className="mt-5 max-w-4xl list-decimal space-y-4 pl-5 text-sm leading-7">
            {page.steps.map((step) => (
              <li key={step} className="pl-2">
                {step}
              </li>
            ))}
          </ol>
          <p className="text-paper-muted mt-6 max-w-4xl text-sm leading-7">
            {page.limit}
          </p>
        </section>
        <aside className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            {m['task.ui.relatedTitle']()}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-vermilion inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
