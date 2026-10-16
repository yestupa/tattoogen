import type { TattooTaskKind } from '@/lib/tattoo-task';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';

export const tattooTaskPagePaths = {
  hub: '/tattoo-tools',
  font: '/tattoo-font-generator',
  image: '/image-to-tattoo',
  idea: '/tattoo-idea-generator',
  coverup: '/tattoo-cover-up',
  filler: '/tattoo-filler',
} as const;

export function loadTattooTaskPage(kind: TattooTaskKind | 'hub') {
  const locale: 'en' | 'zh' = getLocale() === 'zh' ? 'zh' : 'en';
  const options = { locale };
  const pages = {
    hub: {
      title: m['task.hub.title']({}, options),
      description: m['task.hub.description']({}, options),
    },
    font: {
      title: m['task.font.title']({}, options),
      description: m['task.font.description']({}, options),
    },
    image: {
      title: m['task.image.title']({}, options),
      description: m['task.image.description']({}, options),
    },
    idea: {
      title: m['task.idea.title']({}, options),
      description: m['task.idea.description']({}, options),
    },
    coverup: {
      title: m['task.coverup.title']({}, options),
      description: m['task.coverup.description']({}, options),
    },
    filler: {
      title: m['task.filler.title']({}, options),
      description: m['task.filler.description']({}, options),
    },
  };
  return { path: tattooTaskPagePaths[kind], locale, ...pages[kind] };
}
