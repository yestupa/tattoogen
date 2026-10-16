import type { LocalizedText } from './types';

export type TattooNextStep = {
  href: string;
  label: LocalizedText;
  description: LocalizedText;
};

const links = {
  ideas: {
    href: '/tattoo-ideas',
    label: { en: 'Browse tattoo ideas', zh: '浏览纹身灵感' },
    description: {
      en: 'Compare actual concept artwork before choosing a direction.',
      zh: '比较真实设计示例，再确定创作方向。',
    },
  },
  fineLine: {
    href: '/tattoo-styles/fine-line',
    label: { en: 'Fine-line tattoo ideas', zh: '细线纹身灵感' },
    description: {
      en: 'Compare open linework and simpler compositions.',
      zh: '比较疏朗线条与较简洁的构图。',
    },
  },
  blackwork: {
    href: '/tattoo-styles/blackwork',
    label: { en: 'Blackwork tattoo ideas', zh: '黑色填充纹身灵感' },
    description: {
      en: 'Explore strong silhouettes and deliberate negative space.',
      zh: '查看鲜明剪影与有意保留的留白。',
    },
  },
  floral: {
    href: '/tattoo-styles/floral',
    label: { en: 'Floral tattoo ideas', zh: '花卉纹身灵感' },
    description: {
      en: 'Find a botanical direction for your personal design.',
      zh: '寻找适合个人图案的植物与花卉方向。',
    },
  },
  geometric: {
    href: '/tattoo-styles/geometric',
    label: { en: 'Geometric tattoo ideas', zh: '几何纹身灵感' },
    description: {
      en: 'Compare symmetry, spacing and ornamental shapes.',
      zh: '比较对称、间距和装饰性形状。',
    },
  },
  watercolor: {
    href: '/tattoo-styles/watercolor',
    label: { en: 'Watercolor tattoo ideas', zh: '水彩纹身灵感' },
    description: {
      en: 'Compare color accents around a readable outline.',
      zh: '比较围绕清晰轮廓展开的彩色处理。',
    },
  },
  lettering: {
    href: '/tattoo-styles/lettering',
    label: { en: 'Lettering tattoo ideas', zh: '文字纹身灵感' },
    description: {
      en: 'Explore different ways to arrange meaningful words.',
      zh: '探索有意义文字的不同排版方式。',
    },
  },
  rose: {
    href: '/tattoo-ideas/rose',
    label: { en: 'Rose tattoo ideas', zh: '玫瑰纹身灵感' },
    description: {
      en: 'Compare rose shapes, linework and supporting details.',
      zh: '比较玫瑰形态、线条和辅助细节。',
    },
  },
  sunMoon: {
    href: '/tattoo-ideas/sun-and-moon',
    label: { en: 'Sun, moon and celestial ideas', zh: '太阳、月亮与星空灵感' },
    description: {
      en: 'Explore paired symbols and related celestial accents.',
      zh: '探索配对符号与相关星月元素。',
    },
  },
  forearm: {
    href: '/tattoo-placements/forearm',
    label: { en: 'Forearm tattoo ideas', zh: '前臂纹身构图' },
    description: {
      en: 'Think through length, orientation and visible detail.',
      zh: '比较长度、朝向与可见细节。',
    },
  },
  wrist: {
    href: '/tattoo-placements/wrist',
    label: { en: 'Wrist tattoo ideas', zh: '手腕纹身构图' },
    description: {
      en: 'Compare compact concepts and restrained details.',
      zh: '比较紧凑构图与克制的细节。',
    },
  },
  font: {
    href: '/tattoo-font-generator',
    label: { en: 'Compare tattoo lettering', zh: '比较纹身字体' },
    description: {
      en: 'Preview your exact text before requesting an AI design.',
      zh: '先预览准确文字，再选择是否使用 AI 设计。',
    },
  },
  image: {
    href: '/image-to-tattoo',
    label: {
      en: 'Turn a reference into a concept',
      zh: '把参考图转成纹身概念',
    },
    description: {
      en: 'Choose a style and explain what the image should retain.',
      zh: '选择风格，说明参考图需要保留的特点。',
    },
  },
  tryOn: {
    href: '/try-tattoo',
    label: { en: 'Try the placement on your photo', zh: '在自己的照片上试贴' },
    description: {
      en: 'Move, resize and rotate a local photo overlay.',
      zh: '在本地照片中移动、缩放和旋转图案。',
    },
  },
  stencil: {
    href: '/tattoo-to-stencil',
    label: { en: 'Inspect an outline draft', zh: '查看线稿草稿' },
    description: {
      en: 'Compare an outline with the original before artist review.',
      zh: '对比原图与轮廓，再交由纹身师判断。',
    },
  },
  poisonMeaning: {
    href: '/blog/poison-tree-tattoo-meaning',
    label: { en: 'What a poison tree can mean', zh: '了解毒树纹身的含义' },
    description: {
      en: 'Read the poem connection and choose your own interpretation.',
      zh: '了解诗歌出处，选择自己的表达。',
    },
  },
  butterflyMeaning: {
    href: '/blog/butterfly-tattoo-meaning',
    label: { en: 'Butterfly symbolism and design', zh: '蝴蝶的象征与设计选择' },
    description: {
      en: 'Connect your personal meaning with pose and style.',
      zh: '把个人含义与翅膀姿态、风格联系起来。',
    },
  },
  numberMeaning: {
    href: '/blog/222-tattoo-meaning',
    label: {
      en: '222 symbolism and design choices',
      zh: '222 的含义与设计选择',
    },
    description: {
      en: 'Separate personal meaning from predictions and compare fonts.',
      zh: '明确个人含义，并比较字体与数字排版。',
    },
  },
} satisfies Record<string, TattooNextStep>;

const routes: Record<string, (keyof typeof links)[]> = {
  womb: ['floral', 'geometric', 'tryOn'],
  'fear-god': ['font', 'lettering', 'stencil'],
  kaiser: ['rose', 'watercolor', 'tryOn'],
  'poison-tree': ['poisonMeaning', 'blackwork', 'forearm'],
  butterfly: ['butterflyMeaning', 'fineLine', 'tryOn'],
  couple: ['sunMoon', 'floral', 'font'],
  'angel-numbers': ['numberMeaning', 'font', 'wrist'],
  joker: ['blackwork', 'image', 'stencil'],
  'ghost-face': ['blackwork', 'fineLine', 'stencil'],
  throat: ['geometric', 'tryOn', 'stencil'],
  'poison-tree-tattoo-meaning': ['blackwork', 'forearm', 'tryOn'],
  'butterfly-tattoo-meaning': ['fineLine', 'floral', 'tryOn'],
  '222-tattoo-meaning': ['font', 'wrist', 'stencil'],
  'tattoo-aftercare': ['ideas', 'font', 'tryOn'],
};

export function tattooNextSteps(context = ''): TattooNextStep[] {
  return (routes[context] ?? ['ideas', 'tryOn', 'stencil']).map(
    (key) => links[key]
  );
}
