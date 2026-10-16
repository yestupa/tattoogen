import { localized as l, type TattooCollection } from './types';

export const tattooStyles: TattooCollection[] = [
  {
    slug: 'fine-line',
    label: l('Fine line', '细线'),
    title: l(
      'Fine line tattoo ideas with room to breathe',
      '留白清晰的细线纹身灵感'
    ),
    description: l(
      'Compare fine line butterflies, botanicals and tree concepts. Explore spacing, detail and a practical brief for your artist.',
      '比较细线蝴蝶、植物与树形设计，了解留白、细节取舍和适合带给纹身师讨论的设计说明。'
    ),
    intro: l(
      'Fine line concepts depend on a clear silhouette and deliberate empty space. Compare the butterfly wing veins, open botanical sprigs and tree branches below. These are flat design references; the smallest lines may need simplifying for your chosen size.',
      '细线方案需要清楚的轮廓与有意识的留白。下面的蝴蝶翅脉、植物叶枝和裸树分枝展示了不同的线条密度。这些都是平面设计参考，确定实际尺寸后，细小线条往往需要重新取舍。'
    ),
    brief: l(
      'Ask for one fine line focal motif, open internal spacing and a clear outside contour. Specify the placement and approximate size, then ask which interior lines should be removed in the final redraw.',
      '说明一个主图案、清楚外轮廓与宽松内部留白，补充部位及大致尺寸，再请纹身师判断哪些细线应在重画时删去。'
    ),
    tips: [
      l(
        'Compare the design at its intended physical size before choosing tiny details.',
        '先按接近实际的尺寸查看图案，再决定是否保留细小纹理。'
      ),
      l(
        'Keep the spaces between veins, leaves and branches readable.',
        '让翅脉、叶片与树枝之间保留能清楚分辨的空隙。'
      ),
      l(
        'Bring both a sparse version and a detailed version to your artist.',
        '同时准备简洁版与细节版，方便与纹身师具体比较。'
      ),
    ],
    exampleIds: [
      'fine-line-butterfly',
      'paired-botanical-branches',
      'fine-line-bare-tree',
      'floral-butterflies',
      'paired-outline-hearts',
    ],
    relatedPaths: [
      '/tattoo-placements/wrist',
      '/tattoo-placements/forearm',
      '/butterfly-tattoo-generator',
    ],
    keyword: 'fine line tattoo',
  },
  {
    slug: 'blackwork',
    label: l('Blackwork', '黑工'),
    title: l(
      'Blackwork tattoo ideas built around contrast',
      '以黑白对比构图的黑工纹身灵感'
    ),
    description: l(
      'Explore bold butterfly wings, eagle silhouettes and dark ornamental concepts with clear negative space.',
      '探索粗黑蝴蝶翅膀、展翼鹰与深色装饰图案，比较大块黑色与留白的关系。'
    ),
    intro: l(
      'Blackwork makes the shape of the uninked areas especially important. Compare the open wing cells of the butterfly, feather gaps of the eagle and wider leaf spaces of the lotus ornament. Each uses a different balance of solid black and breathing room.',
      '黑工图案中，未填黑的区域同样决定造型。蝴蝶翅室的留白、鹰羽之间的空隙和莲花叶饰的开口展示了不同思路，可以据此判断自己偏好的黑色分量与阅读距离。'
    ),
    brief: l(
      'Describe the silhouette first, then identify the solid black areas and the gaps that must stay open. Request a simplified small-size version alongside the full composition.',
      '先描述外轮廓，再指出希望填黑的区域与必须保留的空隙，并请求同时提供简化小尺寸版本与完整构图。'
    ),
    tips: [
      l(
        'Look at the silhouette from a distance before comparing texture.',
        '先拉远查看整体轮廓，再比较纹理与排线。'
      ),
      l(
        'Avoid squeezing several dark motifs into a narrow strip.',
        '窄长空间内尽量减少同时出现的大块深色图案。'
      ),
      l(
        'Discuss line weight and open gaps with an artist who works in blackwork.',
        '与擅长黑工的纹身师具体讨论线条粗细和留白宽度。'
      ),
    ],
    exampleIds: [
      'blackwork-butterfly',
      'blackwork-eagle',
      'ornamental-lotus',
      'fear-god-blackletter',
      'etched-bare-tree',
    ],
    relatedPaths: [
      '/tattoo-placements/shoulder',
      '/tattoo-styles/geometric',
      '/throat-tattoo-for-men-generator',
    ],
    keyword: 'blackwork tattoo',
  },
  {
    slug: 'watercolor',
    label: l('Watercolor', '水彩'),
    title: l(
      'Watercolor tattoo ideas from pale washes to blue splashes',
      '从淡彩晕染到蓝色飞溅的水彩纹身灵感'
    ),
    description: l(
      'Compare lilac butterflies and blue rose concepts with light washes or controlled splashes, plus notes for an artist brief.',
      '比较淡紫蝴蝶、浅蓝玫瑰与飞溅色块，梳理水彩范围、线条结构和设计沟通要点。'
    ),
    intro: l(
      'These concepts use watercolor in three ways: pale color over fine outlines, color concentrated in butterfly wings, and looser splashes around a defined rose. The images are color studies, so discuss workable outlines and healed examples with your tattoo artist.',
      '这里用三种方式展示水彩思路：细轮廓上的淡彩、集中在蝴蝶翅膀的色块，以及围绕玫瑰扩散的飞溅。图片用于比较配色与构图，实际方案需要结合纹身师的线条处理和愈合作品来讨论。'
    ),
    brief: l(
      'Choose a limited palette, state where the wash can spread, and name the part that must remain sharply defined. Request a version with less color so you can compare the underlying shape.',
      '选择有限的配色，说明晕染可以扩散到哪里，以及哪个主体必须保持清晰，并准备减淡色彩的版本来比较基础轮廓。'
    ),
    tips: [
      l(
        'Choose between a soft wash and a splash before mixing both.',
        '先确定偏好柔和晕染还是飞溅色块，再考虑是否组合。'
      ),
      l(
        'Keep a readable structure underneath the color study.',
        '让配色方案下方仍有清楚可读的基本结构。'
      ),
      l(
        'Ask to see healed color work when choosing an artist.',
        '挑选纹身师时，可以查看其已经愈合的彩色作品。'
      ),
    ],
    exampleIds: [
      'watercolor-butterfly-tree',
      'fine-line-blue-rose',
      'watercolor-blue-rose',
    ],
    relatedPaths: [
      '/tattoo-ideas/rose',
      '/tattoo-styles/floral',
      '/kaiser-tattoo-generator',
    ],
    keyword: 'watercolor tattoo',
  },
  {
    slug: 'floral',
    label: l('Floral', '花卉'),
    title: l(
      'Floral tattoo ideas with different shapes and rhythms',
      '比较花形与枝叶节奏的花卉纹身灵感'
    ),
    description: l(
      'Browse roses, leafy sprigs, lotus ornament and butterfly florals. Compare bloom scale, stems and negative space.',
      '浏览玫瑰、叶枝、莲花饰纹与蝴蝶花枝，比较花朵尺度、枝茎方向和留白方式。'
    ),
    intro: l(
      'A broad rose, a light sprig and a sweeping lotus ornament ask for different amounts of space. Compare the main flower shape before choosing a species or adding more blooms. Stems and leaves can guide a design along a limb or around a curve.',
      '宽阔玫瑰、轻巧叶枝与舒展莲花需要的空间各不相同。可以先比较主花轮廓，再选择花种或增加花朵。枝茎与叶片也能引导图案沿手臂延伸，或顺着肩部曲线展开。'
    ),
    brief: l(
      'Name the focal flower, decide whether the stem is visible, and describe a direction for growth. Keep supporting leaves secondary and leave space around the main bloom.',
      '明确主花、是否保留花茎以及生长方向，让辅助叶片保持次要位置，并在主花四周留出足够空间。'
    ),
    tips: [
      l(
        'Choose the main bloom before arranging smaller filler flowers.',
        '先确定主花，再安排周围的小花与填充元素。'
      ),
      l(
        'Compare a round bouquet with an open diagonal branch.',
        '可以把圆形花束与开放的斜向花枝放在一起比较。'
      ),
      l(
        'Separate overlapping petals and dark leaves in the final redraw.',
        '最终重画时，需要分清重叠花瓣与深色叶片的边界。'
      ),
    ],
    exampleIds: [
      'shaded-rose',
      'floral-butterflies',
      'paired-botanical-branches',
      'ornamental-lotus',
      'blue-rose-thorns',
      'rose-888',
    ],
    relatedPaths: [
      '/tattoo-ideas/rose',
      '/tattoo-placements/shoulder',
      '/tattoo-styles/watercolor',
    ],
    keyword: 'floral tattoo',
  },
  {
    slug: 'geometric',
    label: l('Geometric', '几何'),
    title: l(
      'Geometric tattoo ideas using circles and symmetry',
      '围绕圆形与对称展开的几何纹身灵感'
    ),
    description: l(
      'Compare a symmetric pendant, circular landscape pair and sun-and-moon guides. Plan alignment, spacing and placement.',
      '比较对称垂坠饰纹、圆框山海与日月框架，讨论中轴、间距和部位适配。'
    ),
    intro: l(
      'Geometry can organize a figurative motif without filling the whole design with polygons. The pendant uses a central axis, the landscapes use circles, and the sun-and-moon pair uses shared guides. Compare how each framework changes the space around its subject.',
      '几何结构可以组织具象图案。垂坠饰纹依靠中轴，山海图案借助圆框，日月组合使用相互呼应的框架。这些例子展示了不同结构如何影响主体周围的留白与视觉重心。'
    ),
    brief: l(
      'Select one framework: an axis, a circle or a mirrored pair. Describe what it contains, which lines must align, and how much space should separate ornament from the subject.',
      '选择中轴、圆形或镜像组合中的一个结构，说明其中的主体、必须对齐的线条，以及装饰与主图之间需要保留的空隙。'
    ),
    tips: [
      l(
        'Check symmetry at the final orientation, not only on a rotated screen.',
        '在最终方向检查对称关系，屏幕旋转后的感觉不能代替实际布局。'
      ),
      l(
        'Leave room between a circular frame and the motif inside it.',
        '圆框与内部图案之间需要保留足够的可读空间。'
      ),
      l(
        'Ask the artist to adapt straight guides to the body area.',
        '请纹身师根据部位曲面调整直线与辅助框架。'
      ),
    ],
    exampleIds: [
      'geometric-neck-ornament',
      'mountain-and-wave',
      'sun-and-moon-pair',
    ],
    relatedPaths: [
      '/tattoo-ideas/sun-and-moon',
      '/tattoo-placements/shoulder',
      '/couple-tattoo-generator',
    ],
    keyword: 'geometric tattoo',
  },
  {
    slug: 'lettering',
    label: l('Lettering', '文字'),
    title: l(
      'Tattoo lettering ideas for words and personal numbers',
      '适合短句与个人数字的文字纹身灵感'
    ),
    description: l(
      'Compare blackletter, script, narrow serif and number concepts. Explore hierarchy, spacing and exact text before drawing.',
      '比较哥特、连笔、窄身衬线与数字构图，在绘制前明确文字内容、阅读层次和字距。'
    ),
    intro: l(
      'The same short phrase looks very different in blackletter, flowing script and narrow serif capitals. Number designs add another choice: should lettering lead, or should the surrounding symbol lead? These examples compare composition; confirm every character yourself before tattooing.',
      '同一句短语用哥特、连笔和窄身衬线呈现时，占位与气质差别很大。数字图案还需要决定由文字还是周围符号主导。这里的示例用于比较构图，实际纹身前仍需逐字核对内容。'
    ),
    brief: l(
      'Write the exact text, including case and punctuation. Specify one or two lines, the reading direction and a restrained amount of ornament. Ask for a plain lettering version before adding symbols.',
      '写清完整文字、大小写与标点，指定单行或双行、阅读方向和装饰程度，再从纯字样版本开始比较符号的加入。'
    ),
    tips: [
      l(
        'Review spelling, dates and numerals separately from the visual style.',
        '把拼写、日期和数字的核对与字体风格选择分开进行。'
      ),
      l(
        'Give loops and letter counters enough open space.',
        '让连笔回环与字母内部空隙保留足够空间。'
      ),
      l(
        'Use a font preview as a starting reference for a custom redraw.',
        '将字体预览作为定制重画的起点，继续讨论实际笔画。'
      ),
    ],
    exampleIds: [
      'fear-god-blackletter',
      'fear-god-script',
      'fear-god-minimal',
      'stellar-1111',
      'crescent-333',
      'rose-888',
    ],
    relatedPaths: [
      '/tattoo-placements/forearm',
      '/tattoo-placements/wrist',
      '/fear-god-tattoo-generator',
    ],
    keyword: 'tattoo lettering',
  },
];

export const tattooPlacements: TattooCollection[] = [
  {
    slug: 'forearm',
    label: l('Forearm', '前臂'),
    title: l(
      'Forearm tattoo ideas for vertical and open layouts',
      '适合纵向与留白构图的前臂纹身灵感'
    ),
    description: l(
      'Explore tree, rose, snake and fine line motifs as forearm design starting points, with direction and size planning tips.',
      '用树形、玫瑰、蛇和细线图案探索前臂设计，比较方向、尺寸与细节布局。'
    ),
    intro: l(
      'A forearm concept can follow the length of the arm or sit as a compact focal piece. Trees, stems and snakes make the direction easy to compare. The artwork below is flat: its placement tags describe possible adaptations, not actual on-skin previews.',
      '前臂图案可以沿手臂纵向延伸，也能保留为紧凑的独立主图。树干、花茎与蛇形便于比较方向。下面都是平面稿，部位标签表示可讨论的适配方向，实际效果需要结合个人手臂尺寸。'
    ),
    brief: l(
      'Choose inner or outer forearm, give an approximate length, and state which way the motif should face when your arm rests. Ask the artist to check the composition while the arm turns.',
      '说明内侧或外侧前臂、大致长度和手臂自然下垂时的朝向，再请纹身师检查手臂转动时图案的构图变化。'
    ),
    tips: [
      l(
        'Mark the available area before adding a long stem or roots.',
        '添加长花茎或树根前，先确认前臂可用的范围。'
      ),
      l(
        'Check how the focal point sits between wrist and elbow.',
        '检查主图重心在手腕与手肘之间的位置。'
      ),
      l(
        'Compare a long layout with one compact alternative.',
        '同时比较长条构图与一个紧凑版本，更容易确定偏好。'
      ),
    ],
    exampleIds: [
      'fine-line-bare-tree',
      'blue-rose-thorns',
      'engraved-snake',
      'fine-line-butterfly',
      'fear-god-script',
    ],
    relatedPaths: [
      '/tattoo-styles/fine-line',
      '/tattoo-ideas/rose',
      '/poison-tree-tattoo-generator',
    ],
    keyword: 'forearm tattoo ideas',
  },
  {
    slug: 'wrist',
    label: l('Wrist', '手腕'),
    title: l(
      'Wrist tattoo ideas with simple, readable motifs',
      '主图简洁清楚的手腕纹身灵感'
    ),
    description: l(
      'Compare outline hearts, small branches, celestial motifs and short lettering for wrist adaptations.',
      '比较轮廓爱心、短叶枝、天体图案与简短文字，探索适合手腕的简化方向。'
    ),
    intro: l(
      'Wrist concepts benefit from choosing one clear motif before adding ornament. These hearts, branches and celestial studies show different starting points. They are flat design references; a tattoo artist should redraw the details to fit the available wrist area.',
      '手腕方案可以从一个清楚的主图开始，再决定是否添加装饰。爱心、叶枝和天体稿提供了不同方向。这些平面参考需要由纹身师结合手腕实际空间重画，保留哪些细节也应随尺寸调整。'
    ),
    brief: l(
      'Describe the side of the wrist, the reading direction and one focal motif. Request an uncluttered version first, then compare a small accent rather than adding several at once.',
      '说明手腕的具体一侧、阅读方向与一个主图案，先准备简洁版本，再逐个比较小点缀对构图的影响。'
    ),
    tips: [
      l(
        'Compare the motif with your wrist relaxed and bent.',
        '比较手腕自然放松与弯曲时主图所在的位置。'
      ),
      l(
        'Keep lettering and tiny ornaments from competing for space.',
        '文字与细小饰纹都需要空间，可以先确定优先保留哪一项。'
      ),
      l(
        'Try a rough photo placement before discussing the final redraw.',
        '先用照片做粗略摆放，再讨论最终重画方案。'
      ),
    ],
    exampleIds: [
      'paired-outline-hearts',
      'paired-botanical-branches',
      'sun-and-moon-pair',
      'fear-god-minimal',
      'crescent-333',
    ],
    relatedPaths: [
      '/tattoo-styles/fine-line',
      '/tattoo-styles/lettering',
      '/couple-tattoo-generator',
    ],
    keyword: 'wrist tattoo ideas',
  },
  {
    slug: 'finger',
    label: l('Finger', '手指'),
    title: l(
      'Finger tattoo ideas to simplify with your artist',
      '适合与纹身师一起简化的手指纹身灵感'
    ),
    description: l(
      'Explore hearts, a short leaf sprig and numeral fragments as starting motifs for a simplified finger design.',
      '以爱心、短叶枝和数字片段作为起点，讨论手指图案的取舍与简化。'
    ),
    intro: l(
      'Finger designs have very little space for loops, leaves or lettering. The three flat references below are source motifs for simplification: one heart from the pair, a few leaves from a sprig, or a short number without its outer stars. They are not finished finger-scale previews.',
      '手指留给回环、叶片与文字的空间很有限。下面三张平面稿用于提取主图：成对爱心中的一个、叶枝中的少量叶片，或删去外围星饰的短数字。它们需要进一步简化与重画，尚未按手指实际尺寸完成适配。'
    ),
    brief: l(
      'Choose a single small motif and the exact finger area. Ask the artist to remove secondary elements, review a size-matched sketch, and explain their approach to this placement.',
      '确定一个小主图与具体手指位置，请纹身师删去次要元素，按实际尺寸查看草图，并说明他们对这一部位的处理方式。'
    ),
    tips: [
      l(
        'Use a single heart rather than shrinking the full pair.',
        '从成对爱心中提取一个主图，再调整线条与留白。'
      ),
      l(
        'Reduce a leafy branch to only a few clearly separated leaves.',
        '叶枝适配时可以只保留少量彼此分开的叶片。'
      ),
      l(
        'Discuss the artist’s healed finger work before finalizing detail.',
        '确定细节前，可以查看纹身师已经愈合的手指作品。'
      ),
    ],
    exampleIds: [
      'paired-outline-hearts',
      'paired-botanical-branches',
      'stellar-1111',
    ],
    relatedPaths: [
      '/tattoo-placements/wrist',
      '/tattoo-styles/fine-line',
      '/tattoo-styles/lettering',
    ],
    keyword: 'finger tattoo ideas',
  },
  {
    slug: 'shoulder',
    label: l('Shoulder', '肩部'),
    title: l(
      'Shoulder tattoo ideas for rounded and sweeping designs',
      '适合圆弧与舒展布局的肩部纹身灵感'
    ),
    description: l(
      'Compare rose blooms, lotus ornament, butterfly wings and eagle silhouettes for a shoulder adaptation.',
      '比较玫瑰花形、莲花饰纹、蝴蝶翅膀与展翼轮廓，探索肩部构图适配。'
    ),
    intro: l(
      'A shoulder concept can center on the cap or sweep toward the upper arm. Round flowers and wide wings show these alternatives clearly. The images are flat flash references; a final shoulder layout needs to be checked around the body’s curve and in different arm positions.',
      '肩部主图可以围绕肩峰集中，也能向上臂方向延展。圆形花朵与宽幅翅膀展示了两种不同占位。这些都是平面稿，最终方案需要沿肩部曲面摆放，并检查不同手臂姿势下的变化。'
    ),
    brief: l(
      'State whether the motif centers on the shoulder cap or extends down the arm. Identify the focal point, then ask for a redraw that keeps the outer silhouette readable around the curve.',
      '说明主图是围绕肩峰还是向上臂延伸，明确视觉重心，再请纹身师根据肩部曲面重画外轮廓。'
    ),
    tips: [
      l(
        'Compare a round bloom with a longer diagonal composition.',
        '可以把圆形花朵与更长的斜向构图一起比较。'
      ),
      l(
        'Check whether a wide wing becomes hidden around the curve.',
        '宽幅翅膀沿曲面展开时，需要检查两侧是否被遮住。'
      ),
      l(
        'Leave room for future connections if you plan a larger piece.',
        '如果计划以后扩展成更大作品，可以提前讨论连接空间。'
      ),
    ],
    exampleIds: [
      'shaded-rose',
      'ornamental-lotus',
      'blackwork-butterfly',
      'blackwork-eagle',
      'floral-butterflies',
    ],
    relatedPaths: [
      '/tattoo-styles/floral',
      '/tattoo-styles/blackwork',
      '/tattoo-ideas/rose',
    ],
    keyword: 'shoulder tattoo ideas',
  },
];

export const tattooTopics: TattooCollection[] = [
  {
    slug: 'rose',
    label: l('Rose', '玫瑰'),
    title: l(
      'Rose tattoo ideas in shaded, blue and watercolor designs',
      '明暗、蓝色与水彩玫瑰纹身灵感'
    ),
    description: l(
      'Compare six rose tattoo concepts: shaded petals, blue thorns, a crown, pale wash, watercolor splashes and a number pairing.',
      '比较明暗花瓣、蓝色荆棘、冠饰、淡彩、水彩飞溅与数字组合六种玫瑰构图。'
    ),
    intro: l(
      'Start with the bloom: broad shaded petals feel very different from a pale blue flower on a fine stem. Then compare what surrounds it, from dark thorns to a crown or personal number. These six concepts help separate flower shape, color and ornament before you write a brief.',
      '可以从花朵本身开始选择：宽阔明暗花瓣与细茎上的淡蓝小花，占位和气质很不同。再比较深色荆棘、冠饰或个人数字。六张概念稿方便分别判断花形、配色与装饰，逐步形成设计说明。'
    ),
    brief: l(
      'Choose one rose bloom, a color approach and either a visible stem or a compact flower. Add at most one supporting idea, such as a number or crown, and explain why it matters to you.',
      '确定一朵主玫瑰、配色方式与是否保留花茎，再考虑一个数字或冠饰等辅助元素，并说明它与你的联系。'
    ),
    tips: [
      l(
        'Compare petal structure before choosing the darkest color.',
        '先比较花瓣结构，再决定是否使用浓重颜色。'
      ),
      l(
        'Let the stem establish direction instead of adding extra flowers.',
        '可以用花茎建立方向，再判断是否需要更多花朵。'
      ),
      l(
        'Decide whether the rose or the lettering leads the composition.',
        '玫瑰与文字同时出现时，需要明确视觉主次。'
      ),
    ],
    exampleIds: [
      'shaded-rose',
      'blue-rose-thorns',
      'blue-rose-crown',
      'fine-line-blue-rose',
      'watercolor-blue-rose',
      'rose-888',
    ],
    relatedPaths: [
      '/tattoo-styles/floral',
      '/tattoo-styles/watercolor',
      '/kaiser-tattoo-generator',
    ],
    keyword: 'rose tattoo ideas',
  },
  {
    slug: 'sun-and-moon',
    label: l('Sun, moon and celestial companions', '日月与天体陪衬'),
    title: l(
      'Sun and moon tattoo ideas with celestial companions',
      '日月纹身与天体陪衬灵感'
    ),
    description: l(
      'Explore one paired sun-and-moon design, plus separately captioned crescent-and-number and star-and-number companion concepts.',
      '查看一组成对日月设计，以及分别标明的弯月数字和星芒数字陪衬方案，比较主体与饰纹的关系。'
    ),
    intro: l(
      'This collection starts with one paired sun-and-moon design. The other two examples are celestial companions: 333 beneath a crescent, and 11:11 with a star. They help compare numeral and orbit accents; they are not additional sun-and-moon pairs. Use the couple generator for new paired variations.',
      '本页从一组成对太阳与弯月设计出发，另外两张是天体陪衬参考：弯月下的 333，以及星芒环绕的 11:11。它们用于比较数字与轨道点饰，图注会分别说明内容。需要新的成对日月变化时，可以继续使用情侣纹身生成器。'
    ),
    brief: l(
      'State whether you want a paired sun and moon or one combined piece. Use matching line weights and choose only a few stars or dots. If including numbers, provide their exact characters and keep the celestial focal point clear.',
      '说明希望做成对日月还是单个组合图案，统一线条粗细，再挑选少量星点。如需数字，应给出准确字符，并保留清楚的天体主图。'
    ),
    tips: [
      l(
        'Compare the sun and moon separately as well as together.',
        '既要一起比较太阳与月亮，也要分别查看各自轮廓。'
      ),
      l(
        'Keep orbit dots secondary to the main celestial shape.',
        '轨道点列可以保持次要位置，让主天体更醒目。'
      ),
      l(
        'Use the number companions only if their personal meaning fits.',
        '数字陪衬是否加入，可以根据它与你的个人联系来决定。'
      ),
    ],
    exampleIds: ['sun-and-moon-pair', 'crescent-333', 'stellar-1111'],
    relatedPaths: [
      '/tattoo-styles/geometric',
      '/tattoo-placements/wrist',
      '/couple-tattoo-generator',
      '/angel-numbers-tattoo-generator',
    ],
    keyword: 'sun and moon tattoo',
  },
  {
    slug: 'memorial',
    label: l('Memorial adaptations', '纪念主题适配'),
    title: l(
      'Memorial tattoo ideas to make personal with your artist',
      '与纹身师一起赋予个人含义的纪念纹身灵感'
    ),
    description: l(
      'Explore tree, butterfly, swallow and rose motifs as starting points for a personal remembrance design and a thoughtful artist brief.',
      '用树形、蝴蝶、燕子与玫瑰作为个人纪念设计的起点，整理含义、文字与构图的沟通要点。'
    ),
    intro: l(
      'A remembrance design can begin with a motif linked to a real memory: a tree, flower or bird. These are existing concept artworks for personal adaptation, without memorial names or dates already on them. Their meaning comes from your connection, not a fixed symbolism assigned by this gallery.',
      '纪念设计可以从与真实记忆有关的树、花或鸟开始。下面是可用于个人改编的概念图，图中没有预先加入纪念姓名或日期。图案含义来自你的经历与联系，可以据此与纹身师共同讨论。'
    ),
    brief: l(
      'Describe one memory and one motif connected to it. Choose whether a name, date or handwriting is essential, verify the exact text, and ask for a layout that keeps the image readable without forcing every detail into one piece.',
      '描述一段记忆与一个相关图案，再判断姓名、日期或手写字是否必不可少，逐字核对文字，并请纹身师保留清楚的主图布局。'
    ),
    tips: [
      l(
        'Choose a personal reference before looking up generic symbol meanings.',
        '可以先找与你有关的参考，再决定是否参考常见象征含义。'
      ),
      l(
        'Check names and dates independently before any final stencil.',
        '最终转印草稿确定前，需要独立核对姓名与日期。'
      ),
      l(
        'Bring separate images and text so the artist can test different arrangements.',
        '把图案与文字分别准备，方便纹身师尝试不同排列。'
      ),
    ],
    exampleIds: [
      'butterfly-tree',
      'fine-line-bare-tree',
      'etched-bare-tree',
      'paired-swallows',
      'shaded-rose',
    ],
    relatedPaths: [
      '/tattoo-styles/fine-line',
      '/tattoo-ideas/rose',
      '/poison-tree-tattoo-generator',
      '/butterfly-tattoo-generator',
    ],
    keyword: 'memorial tattoo ideas',
  },
];
