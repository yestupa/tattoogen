import { localized as l, type TattooLocale } from './types';

const en = {
  eyebrow: 'Explore the design library',
  breadcrumb: 'Breadcrumb',
  home: 'Home',
  ideas: 'Tattoo ideas',
  styles: 'Tattoo styles',
  placements: 'Tattoo placements',
  tools: 'Tattoo tools',
  browseTopics: 'Start with a subject',
  compareStyles: 'Compare six visual approaches',
  browsePlacements: 'Plan a placement',
  galleryTitle: 'Find a design starting point',
  searchLabel: 'Search the gallery',
  searchPlaceholder: 'Try butterfly, rose, lettering…',
  styleLabel: 'Style',
  placementLabel: 'Placement adaptation',
  allStyles: 'All styles',
  allPlacements: 'All placements',
  reset: 'Reset filters',
  results: '{count} design concepts',
  emptyTitle: 'No designs match these filters',
  emptyDescription:
    'Try a shorter search or clear a style or placement. You can also reset all filters.',
  viewDesign: 'View design and prompt',
  conceptNote:
    'Curated concept artwork. Placement tags suggest adaptations of flat designs; they are not on-skin previews.',
  briefTitle: 'A starting brief for your artist',
  tipsTitle: 'Details to decide together',
  relatedTitle: 'Keep exploring',
  nextTitle: 'Turn the reference into your next step',
  generatorsTitle: 'Explore a theme workbench',
  detailEyebrow: 'Curated design concept',
  detailImageNote:
    'Flat concept artwork for discussion and adaptation with a tattoo artist.',
  promptTitle: 'Reuse this prompt',
  promptLabel: 'Edit your starting brief',
  promptDescription:
    'Change the motif, size or direction before opening the studio. This action sends the text only; the gallery artwork is not attached.',
  generate: 'Create a new concept',
  generating: 'Opening studio…',
  copyPrompt: 'Copy prompt',
  copied: 'Prompt copied',
  copyError: 'Select and copy the prompt text manually.',
  storageError:
    'Your browser could not save the starting brief. Check browser storage and try again.',
  stylesTitle: 'Explore this style',
  placementsTitle: 'Placement adaptations',
  topicsTitle: 'Related subjects',
  themeLink: 'Open the theme generator',
  tryOn: 'Try a placement on your photo',
  stencil: 'Make a stencil draft',
  ideaTool: 'Build a personal design brief',
  fontTool: 'Explore tattoo lettering',
  imageTool: 'Work from your reference image',
};

const zh: typeof en = {
  eyebrow: '探索设计图库',
  breadcrumb: '面包屑导航',
  home: '首页',
  ideas: '纹身灵感',
  styles: '纹身风格',
  placements: '纹身部位',
  tools: '纹身工具',
  browseTopics: '从主题开始选择',
  compareStyles: '比较六种视觉方向',
  browsePlacements: '规划纹身部位',
  galleryTitle: '寻找设计起点',
  searchLabel: '搜索图库',
  searchPlaceholder: '试试蝴蝶、玫瑰、文字……',
  styleLabel: '风格',
  placementLabel: '部位适配方向',
  allStyles: '全部风格',
  allPlacements: '全部部位',
  reset: '重置筛选',
  results: '{count} 个设计概念',
  emptyTitle: '没有符合当前筛选的设计',
  emptyDescription:
    '可以缩短搜索词，或清除风格、部位条件，也可以重置全部筛选。',
  viewDesign: '查看设计与提示词',
  conceptNote:
    '图库展示经过整理的概念稿。部位标签用于讨论平面设计的适配方向，实际摆放需要结合个人照片与尺寸。',
  briefTitle: '适合与纹身师讨论的起始说明',
  tipsTitle: '一起确认这些细节',
  relatedTitle: '继续探索',
  nextTitle: '把参考变成下一步',
  generatorsTitle: '探索主题设计工具',
  detailEyebrow: '精选设计概念',
  detailImageNote: '这是一张用于与纹身师讨论和改编的平面概念图。',
  promptTitle: '复用这段提示词',
  promptLabel: '编辑你的设计说明',
  promptDescription:
    '可以调整主图、尺寸或朝向，再打开设计工作台。此操作仅发送文字，图库图片不会自动附加。',
  generate: '创建新设计概念',
  generating: '正在打开工作台……',
  copyPrompt: '复制提示词',
  copied: '提示词已复制',
  copyError: '可以直接选中提示词文字，手动复制。',
  storageError: '浏览器暂时无法保存设计说明，请检查浏览器存储后重试。',
  stylesTitle: '探索相关风格',
  placementsTitle: '部位适配方向',
  topicsTitle: '相关主题',
  themeLink: '打开主题生成器',
  tryOn: '在自己的照片上尝试摆放',
  stencil: '制作转印草稿',
  ideaTool: '整理个人设计说明',
  fontTool: '探索纹身文字设计',
  imageTool: '从参考图片开始设计',
};

export type DiscoveryCopy = typeof en;
export const discoveryCopy: Record<TattooLocale, DiscoveryCopy> = { en, zh };

export const discoveryIndexes = {
  ideas: {
    title: l(
      'Tattoo ideas to shape your next design',
      '寻找适合你的纹身设计灵感'
    ),
    description: l(
      'Explore curated tattoo concepts by subject, style and placement. Compare real artwork, read design notes and reuse a starting prompt.',
      '按主题、风格与部位探索精选纹身概念，比较真实图稿、阅读设计说明，并复用提示词整理自己的方案。'
    ),
    intro: l(
      'Start with an image that catches your eye, then compare the style and the space it needs. Each example includes a design explanation and an editable prompt so you can describe your own direction more clearly.',
      '先选一张让你停下来的图，再比较它的风格与所需空间。每个示例都附有设计说明和可编辑提示词，方便你逐步描述自己的方向。'
    ),
  },
  styles: {
    title: l(
      'Tattoo styles, compared through actual concepts',
      '用实际图稿比较纹身风格'
    ),
    description: l(
      'Explore six tattoo styles through fine line, blackwork, watercolor, floral, geometric and lettering concepts with practical design notes.',
      '通过细线、黑工、水彩、花卉、几何与文字概念，比较六种纹身视觉方向及设计沟通要点。'
    ),
    intro: l(
      'Style changes the way a motif reads: line density, solid black, soft color or a precise geometric frame. These six collections show the differences through actual artwork and useful questions for your artist.',
      '风格影响一个图案的阅读方式：线条疏密、大块黑色、柔和色彩或准确的几何框架，都能改变整体感觉。六个专题通过实际图稿与具体设计问题，帮助你比较这些差别。'
    ),
  },
  placements: {
    title: l(
      'Tattoo placement ideas for your design brief',
      '为设计说明选择合适的纹身部位'
    ),
    description: l(
      'Explore forearm, wrist, finger and shoulder design adaptations. Compare shape, orientation and detail before trying a photo placement.',
      '探索前臂、手腕、手指与肩部的图案适配，先比较轮廓、方向与细节，再用照片尝试摆放。'
    ),
    intro: l(
      'Choose a body area, then look at how a motif could change to fit it. These collections use flat concepts to discuss direction, scale and simplification. The photo placement tool helps you explore position after choosing a design.',
      '先确定一个身体区域，再比较图案需要怎样调整。部位专题使用平面概念讨论方向、尺度与简化方式；选好设计后，可以继续用照片摆放工具探索位置。'
    ),
  },
};

export const discoveryGeneratorLinks = [
  {
    href: '/butterfly-tattoo-generator',
    label: l('Butterflies and transformation', '蝴蝶与变化主题'),
  },
  {
    href: '/couple-tattoo-generator',
    label: l('Complementary and matching designs', '呼应与成对图案'),
  },
  {
    href: '/kaiser-tattoo-generator',
    label: l('Blue rose and thorn compositions', '蓝玫瑰与荆棘构图'),
  },
  {
    href: '/poison-tree-tattoo-generator',
    label: l('Trees, roots and dark botanicals', '树形、树根与暗色植物'),
  },
  {
    href: '/angel-numbers-tattoo-generator',
    label: l('Personal numbers and symbols', '个人数字与符号'),
  },
  {
    href: '/fear-god-tattoo-generator',
    label: l('Faith lettering and symbols', '信仰文字与符号'),
  },
  {
    href: '/throat-tattoo-for-men-generator',
    label: l('Symmetric neck-oriented concepts', '对称颈部构图'),
  },
  {
    href: '/womb-tattoo-generator',
    label: l('Lower abdomen concept layouts', '下腹部概念布局'),
  },
  {
    href: '/ghost-face-tattoo-generator',
    label: l('Ghost Face horror concepts', 'Ghost Face 恐怖主题'),
  },
  {
    href: '/joker-tattoo-generator',
    label: l('Joker character concepts', 'Joker 角色主题'),
  },
];
