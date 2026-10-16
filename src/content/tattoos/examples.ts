import { localized as l, type TattooExample } from './types';

/** Public concept artwork already used on this site. No customer uploads. */
export const tattooExamples: TattooExample[] = [
  {
    id: 'fine-line-butterfly',
    image: '/imgs/butterfly/fine-line.webp',
    width: 825,
    height: 1100,
    title: l('Fine line butterfly', '细线蝴蝶'),
    description: l(
      'An open-wing butterfly with delicate wing veins and plenty of unfilled space. The quiet outline is a starting point for a forearm or shoulder concept; ask an artist which small veins to remove at your chosen size.',
      '展开双翼的蝴蝶以细线勾出翅脉，大面积留白让轮廓更清楚。这张平面稿适合讨论前臂或肩部构图；确定尺寸后，可以请纹身师删减过密的小翅脉。'
    ),
    prompt:
      'Create an original fine line butterfly tattoo concept with open symmetrical wings, sparse wing veins and generous negative space. Adapt the detail for a medium forearm design. Flat artwork on a plain light background; no skin mockup, text or watermark.',
    styles: ['fine-line'],
    placements: ['forearm', 'wrist', 'shoulder'],
    topics: [],
    generatorPath: '/butterfly-tattoo-generator',
  },
  {
    id: 'blackwork-butterfly',
    image: '/imgs/butterfly/blackwork.webp',
    width: 825,
    height: 1100,
    title: l('Blackwork butterfly with open spots', '留白斑点黑工蝴蝶'),
    description: l(
      'Dense black wing borders surround pale cells and small open spots. The contrast carries the design from a distance. Keep the pale areas generous in a smaller adaptation so the wing pattern stays distinct.',
      '粗黑翼缘包围浅色翅室与留白斑点，远看也有鲜明轮廓。缩小图案时，需要保留足够宽的浅色区域，再由纹身师判断斑点数量与线条间距。'
    ),
    prompt:
      'Design an original blackwork butterfly with bold outer wings, pale open cells and a restrained dotted border. Strong silhouette and generous negative space for a shoulder concept. Flat flash on a light background, no text or watermark.',
    styles: ['blackwork'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/butterfly-tattoo-generator',
  },
  {
    id: 'butterfly-tree',
    image: '/imgs/butterfly/butterfly-tree.webp',
    width: 825,
    height: 1100,
    title: l('Butterflies growing from a tree', '树枝间的蝴蝶'),
    description: l(
      'Fine branches rise from exposed roots and end in scattered butterflies. The tall composition can guide a forearm concept or a personal remembrance adaptation. Add names or dates only after the main layout is settled.',
      '细枝从裸露树根向上舒展，蝴蝶散落在枝梢间。纵向构图适合用于前臂方案，也可以作为个人纪念图案的起点；姓名和日期应在主图布局确定后再安排。'
    ),
    prompt:
      'Draw an original fine line tattoo concept of a slender rooted tree with butterflies among the upper branches. Keep the trunk readable and leave calm space around the roots. Vertical forearm composition on plain paper, no lettering or skin mockup.',
    styles: ['fine-line'],
    placements: ['forearm', 'shoulder'],
    topics: ['memorial'],
    generatorPath: '/butterfly-tattoo-generator',
  },
  {
    id: 'floral-butterflies',
    image: '/imgs/butterfly/floral.webp',
    width: 825,
    height: 1100,
    title: l('Butterflies and flowering branches', '蝴蝶与花枝'),
    description: l(
      'Two butterflies sit along a loose diagonal of flowers, leaves and buds. The gaps between elements matter as much as the detail. Rotate the branch with your artist when adapting it to a shoulder curve or forearm.',
      '两只蝴蝶沿花朵、叶片与花苞组成的斜线分布。元素之间的留白让细节更易阅读，讨论肩部或前臂方案时，可以先旋转花枝方向，再决定花瓣细节。'
    ),
    prompt:
      'Create original botanical tattoo flash with two butterflies, small open flowers, buds and airy leaves along a gentle diagonal. Fine black lines, sparse shading and open gaps between flowers. Flat shoulder concept on a light background, no text.',
    styles: ['fine-line', 'floral'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/butterfly-tattoo-generator',
  },
  {
    id: 'watercolor-butterfly-tree',
    image: '/imgs/butterfly/watercolor.webp',
    width: 825,
    height: 1100,
    title: l('Tree with lilac watercolor butterflies', '淡紫水彩蝴蝶树'),
    description: l(
      'A lightly drawn tree supports butterflies washed with lilac and pink. The color stays around the wings while the trunk supplies structure. Compare the amount of color, then discuss outlines and healed color examples with an artist.',
      '轻描的树干托起淡紫和粉色蝴蝶，色彩集中在翅膀上，树枝负责支撑整体结构。可以先比较自己喜欢的上色范围，再与纹身师讨论轮廓处理及其愈合后的彩色作品。'
    ),
    prompt:
      'Design a tattoo concept with a slender rooted tree and butterflies carrying restrained lilac and pink watercolor washes. Keep readable black line structure under the color. Airy vertical flat layout on a plain light background; no lettering or watermark.',
    styles: ['watercolor', 'fine-line'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/butterfly-tattoo-generator',
  },
  {
    id: 'blackwork-eagle',
    image: '/imgs/throat/blackwork-wings.webp',
    width: 1100,
    height: 1100,
    title: l('Eagle with spread blackwork wings', '展翼黑工鹰'),
    description: l(
      'A front-facing eagle spreads layered black feathers into a broad V. It is an eagle with a compact body and symmetrical wings. A shoulder adaptation needs the wing spread redrawn around the space rather than simply shrinking the artwork.',
      '正面的鹰展开层层黑色羽翼，形成宽阔的 V 形。紧凑的身体与对称翅膀构成主体；用于肩部时，需要按可用空间重画展翼比例，直接缩小会挤压羽毛间距。'
    ),
    prompt:
      'Create original blackwork eagle tattoo flash with spread wings, a compact front-facing body and layered feather groups separated by clear negative space. Wide balanced silhouette on a light background. An eagle, no flames, text or skin mockup.',
    styles: ['blackwork'],
    placements: ['shoulder'],
    topics: [],
    generatorPath: '/throat-tattoo-for-men-generator',
  },
  {
    id: 'geometric-neck-ornament',
    image: '/imgs/throat/geometric.webp',
    width: 1100,
    height: 1100,
    title: l('Geometric pendant ornament', '几何垂坠饰纹'),
    description: l(
      'Fine arcs, a central diamond and a taper of dots build a symmetrical ornament. The source is a flat neck-oriented concept. For another placement, preserve the central axis and redraw the outer arcs to follow that area.',
      '细弧线、中央菱形和渐细点列组成对称饰纹。这是一张面向颈部构图的平面概念稿；适配其他部位时，应保留中轴，并重画外侧弧线以贴合空间。'
    ),
    prompt:
      'Draw an original geometric tattoo ornament with a slender central diamond, mirrored curved linework and a small taper of dots. Exact visual symmetry and open spacing. Adapt as a flat shoulder concept on a light background, no text or skin.',
    styles: ['geometric', 'fine-line'],
    placements: ['shoulder', 'forearm'],
    topics: [],
    generatorPath: '/throat-tattoo-for-men-generator',
  },
  {
    id: 'ornamental-lotus',
    image: '/imgs/throat/ornamental.webp',
    width: 1100,
    height: 1100,
    title: l('Lotus ornament with sweeping leaves', '莲花与舒展叶饰'),
    description: l(
      'Layered pointed petals rise above dark leaves and hanging dots. The wide silhouette has a strong center. For a shoulder adaptation, compare the full mirrored spread with the option of isolating the central lotus.',
      '层叠尖瓣向上展开，深色叶饰与垂坠点纹位于两侧和下方。宽幅轮廓有清楚的中心，讨论肩部适配时，可以比较完整对称构图与单独莲花两种方向。'
    ),
    prompt:
      'Create an original black and gray lotus tattoo ornament with layered pointed petals, sweeping mirrored leaves and sparse hanging dot accents. Preserve open gaps between dark areas. Flat flash on a plain light background; no text or skin preview.',
    styles: ['blackwork', 'floral'],
    placements: ['shoulder'],
    topics: [],
    generatorPath: '/throat-tattoo-for-men-generator',
  },
  {
    id: 'shaded-rose',
    image: '/imgs/throat/rose.webp',
    width: 1100,
    height: 1100,
    title: l('Shaded rose with dark leaves', '深叶衬托的明暗玫瑰'),
    description: l(
      'A broad rose uses soft petal shading against darker serrated leaves. The petal center needs room to remain legible. As a remembrance adaptation, the flower can carry personal meaning without adding literal names to every petal.',
      '宽阔的玫瑰花朵以柔和花瓣明暗对比深色锯齿叶。花心需要足够空间才能保留层次；作为纪念主题的改编方向，也可以用花朵本身表达个人含义。'
    ),
    prompt:
      'Design an original black and gray rose tattoo concept with one open bloom, softly shaded petals and a small group of darker serrated leaves. Readable petal center, no cramped detail. Flat shoulder flash on a light background, no lettering.',
    styles: ['floral'],
    placements: ['shoulder', 'forearm'],
    topics: ['rose', 'memorial'],
    generatorPath: '/throat-tattoo-for-men-generator',
  },
  {
    id: 'engraved-snake',
    image: '/imgs/throat/snake.webp',
    width: 1100,
    height: 1100,
    title: l('Engraved snake in an S curve', 'S 形版画感蛇纹'),
    description: l(
      'An upright snake turns through a loose S curve with fine scale texture. The contour supplies the movement. For a long forearm layout, resolve the head and tail positions before spending time on individual scales.',
      '向上的蛇身沿舒展的 S 形转折，表面带有细密鳞片纹理。外轮廓决定动态，讨论长条前臂方案时，可以先确定蛇头与尾尖位置，再处理鳞片细节。'
    ),
    prompt:
      'Create original black line tattoo flash of a slender snake in a loose upright S curve, restrained engraved scale texture and a clear head silhouette. Vertical forearm concept with space around the tail on a plain light background; no text.',
    styles: ['fine-line'],
    placements: ['forearm'],
    topics: [],
    generatorPath: '/throat-tattoo-for-men-generator',
  },
  {
    id: 'paired-botanical-branches',
    image: '/imgs/couple/botanical.webp',
    width: 1100,
    height: 1100,
    title: l('Paired leafy branches', '成对叶枝'),
    description: l(
      'Two curved sprigs face inward with softly shaded leaves. They can be a pair or independent botanical motifs. A wrist concept may retain a short branch; a finger adaptation needs only a few simplified leaves.',
      '两支弯曲叶枝相向排列，叶片用浅淡明暗塑形。可以作为一对图案，也可以各自独立使用；手腕方案可保留短枝，手指适配则需要简化为少量叶片。'
    ),
    prompt:
      'Draw two original complementary botanical sprigs with inward curves, a small number of readable leaves and light black shading. Related without being identical. Flat wrist tattoo concepts on plain paper, no names or watermark.',
    styles: ['fine-line', 'floral'],
    placements: ['wrist', 'finger', 'forearm'],
    topics: [],
    generatorPath: '/couple-tattoo-generator',
  },
  {
    id: 'paired-outline-hearts',
    image: '/imgs/couple/matching-hearts.webp',
    width: 1100,
    height: 1100,
    title: l('Paired continuous-line hearts', '成对连续线条爱心'),
    description: l(
      'Two hearts use a flowing line with a small loop at the bottom. Their simplicity helps compare subtle differences between matching pieces. For fingers, choose a single simplified outline and open the space around the loop.',
      '两个爱心由流畅线条勾成，底部各有一个小回环。简洁的结构适合讨论成对图案的细微差别；适配手指时，可以保留单个轮廓，并扩大底部回环的空隙。'
    ),
    prompt:
      'Create a pair of original continuous-line heart tattoo concepts with a small open loop at the base, clean curves and generous empty space. Show both independently on a plain light background. Minimal wrist-scale designs, no lettering or skin mockup.',
    styles: ['fine-line'],
    placements: ['wrist', 'finger'],
    topics: [],
    generatorPath: '/couple-tattoo-generator',
  },
  {
    id: 'mountain-and-wave',
    image: '/imgs/couple/mountain-wave.webp',
    width: 1100,
    height: 1100,
    title: l('Mountain and wave inside circles', '圆框山峰与海浪'),
    description: l(
      'Separate circular frames hold a mountain range and a breaking wave. The circles give the pair a shared visual language. At a smaller size, keep the detailed wave and its circular border from crowding each other.',
      '两个独立圆框分别容纳山脉与翻涌海浪。相同圆形让这对图案保持联系，内部景物各有性格；缩小时，应检查浪花细节与圆框之间是否仍有清楚间距。'
    ),
    prompt:
      'Design two complementary circular tattoo concepts: a restrained mountain range in one and a breaking ocean wave in the other. Fine black linework, balanced circular frames and readable negative space. Flat light background, no text or skin.',
    styles: ['geometric', 'fine-line'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/couple-tattoo-generator',
  },
  {
    id: 'sun-and-moon-pair',
    image: '/imgs/couple/sun-moon.webp',
    width: 1100,
    height: 1100,
    title: l('Paired sun and crescent moon', '成对太阳与弯月'),
    description: l(
      'A radiating sun and crescent moon occupy separate circular guides with small stars. This is the paired sun-and-moon example in the celestial collection. Each half can remain independent while sharing line weight and dot spacing.',
      '放射状太阳与弯月各占一个圆形框架，周围点缀小星。这是日月专题中的成对太阳与月亮示例，两部分可以独立保留，同时统一线条粗细和点列间距。'
    ),
    prompt:
      'Create an original pair of celestial tattoo concepts: a radiating sun and a crescent moon in separate fine circular guides. Consistent thin black lines, sparse stars and calm negative space. Flat wrist concepts on a light background, no text.',
    styles: ['fine-line', 'geometric'],
    placements: ['wrist', 'forearm', 'shoulder'],
    topics: ['sun-and-moon'],
    generatorPath: '/couple-tattoo-generator',
  },
  {
    id: 'paired-swallows',
    image: '/imgs/couple/swallows.webp',
    width: 1100,
    height: 1100,
    title: l('Two swallows in flight', '相向飞行的燕子'),
    description: l(
      'Two swallows turn toward each other with spread wings and lightly shaded feathers. They can anchor a paired design or personal remembrance adaptation. Keep the bird silhouette clear before adding banners or initials.',
      '两只燕子展开翅膀相向飞行，羽毛带有浅淡排线。独立鸟形可用于成对方案，也能发展为个人纪念图案；添加飘带或首字母之前，应先保留清楚的鸟形轮廓。'
    ),
    prompt:
      'Draw an original pair of swallows flying toward each other with open wings and restrained black engraved shading. Readable wing and tail shapes, generous space between birds. Flat tattoo flash on plain light paper, no banners or text.',
    styles: ['fine-line'],
    placements: ['shoulder', 'forearm'],
    topics: ['memorial'],
    generatorPath: '/couple-tattoo-generator',
  },
  {
    id: 'fear-god-blackletter',
    image: '/imgs/fear-god/blackletter.jpg',
    width: 1086,
    height: 1448,
    title: l('Fear God in blackletter', 'Fear God 哥特字体'),
    description: l(
      'Heavy blackletter stacks Fear God between small flourishes. Letter counters and stroke spacing need attention at the intended size. Use the lettering tool to explore your own short text before an artist draws the final letters.',
      '厚重哥特字体将 Fear God 分为上下两行，配有少量卷叶装饰。实际尺寸下需要检查字腔与笔画间距，可以先用字体工具探索自己的短句，再请纹身师绘制最终字形。'
    ),
    prompt:
      'Create original tattoo lettering for the exact text Fear God in two stacked lines of bold blackletter with restrained flourishes. Open letter counters, correct spelling and a readable silhouette. Black ink on plain light paper, no skin mockup.',
    styles: ['lettering', 'blackwork'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/fear-god-tattoo-generator',
  },
  {
    id: 'fear-god-cross',
    image: '/imgs/fear-god/cross.jpg',
    width: 1086,
    height: 1448,
    title: l('Cross, leafy wreath and Fear God', '十字架、叶环与 Fear God'),
    description: l(
      'A decorated cross sits above small lettering and two rising leafy stems. The symbol and phrase form separate reading levels. For this faith-specific concept, choose the elements that matter personally and remove competing decoration.',
      '装饰十字架位于小字上方，两侧叶枝向上包围。十字架与短句形成两层阅读顺序，讨论这一信仰主题时，可以先确定个人在意的符号或文字，再删减分散注意力的装饰。'
    ),
    prompt:
      'Design an original faith tattoo concept combining a decorated cross, two restrained leafy stems and the exact words Fear God below. Clear symbol and text hierarchy, readable spacing, black and gray flat artwork on light paper.',
    styles: ['lettering', 'floral'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/fear-god-tattoo-generator',
  },
  {
    id: 'fear-god-minimal',
    image: '/imgs/fear-god/minimal.jpg',
    width: 1086,
    height: 1448,
    title: l('Minimal serif Fear God lettering', '简洁衬线 Fear God 字样'),
    description: l(
      'Narrow serif capitals sit on one line above a small cross. With little decoration, spelling and spacing become the main decisions. Review a paper-size wrist version with your artist before choosing the final letter height.',
      '窄身衬线大写字母排成一行，下方是小十字架。装饰很少，拼写与字距因此格外醒目；讨论手腕版本时，需要按实际纸张尺寸检查整句宽度与字高。'
    ),
    prompt:
      'Create original minimalist tattoo lettering for the exact words FEAR GOD in slender readable serif capitals, with one tiny cross centered underneath. Generous spacing and no distressed texture. Flat black artwork on a plain light background.',
    styles: ['lettering', 'fine-line'],
    placements: ['wrist', 'forearm'],
    topics: [],
    generatorPath: '/fear-god-tattoo-generator',
  },
  {
    id: 'fear-god-script',
    image: '/imgs/fear-god/script.jpg',
    width: 1086,
    height: 1448,
    title: l('Flowing Fear God script', '连笔 Fear God 书法'),
    description: l(
      'Sweeping capitals and long entry strokes connect two lines of script. The flourishes change the footprint of this short phrase. Compare a restrained version before deciding how far the capital loops should extend.',
      '舒展的大写字母与长起笔连接两行连笔书法，卷曲笔画明显扩大了短句的占位。可以先比较简化版本，再决定大写字母回环延伸到什么程度。'
    ),
    prompt:
      'Draw original tattoo calligraphy for the exact words Fear God over two balanced lines. Flowing script with separated loops and restrained swashes. Prioritize correct spelling and legibility, black ink on plain light paper, no skin.',
    styles: ['lettering'],
    placements: ['forearm', 'shoulder'],
    topics: [],
    generatorPath: '/fear-god-tattoo-generator',
  },
  {
    id: 'blue-rose-thorns',
    image: '/imgs/kaiser/blue-rose.jpg',
    width: 1086,
    height: 1448,
    title: l('Blue rose and dark thorn stem', '蓝玫瑰与深色荆棘茎'),
    description: l(
      'A saturated blue bloom sits above a long dark thorn stem. Color stays in the flower while the stem creates a vertical route. Compare the lighter blue rose to decide how much black you want around the petals.',
      '浓蓝花朵位于修长深色花茎上方，尖刺沿茎分布。颜色集中在玫瑰，花茎拉出纵向动势；与浅色版本对照，可以更直观地确定花瓣周围黑色的分量。'
    ),
    prompt:
      'Design an original tattoo concept with a rich blue rose above a dark twisting thorn stem. Separate the flower from black leaves and thorns with clear negative spaces. Vertical forearm flash on plain light paper, no text or watermark.',
    styles: ['floral', 'blackwork'],
    placements: ['forearm', 'shoulder'],
    topics: ['rose'],
    generatorPath: '/kaiser-tattoo-generator',
  },
  {
    id: 'blue-rose-crown',
    image: '/imgs/kaiser/crown.jpg',
    width: 1086,
    height: 1448,
    title: l('Blue rose above an ornamental crown', '冠饰上方的蓝玫瑰'),
    description: l(
      'A blue flower rises through curved thorns above a dark crown. This is the most ornamented rose variant here. Its crown openings and thorn gaps need space; simplify secondary elements before reducing the composition.',
      '蓝色花朵穿过弯曲荆棘，位于深色冠饰上方。这一版玫瑰的装饰较多，冠饰孔隙与荆棘间距都需要空间；缩小前，应优先删减次要装饰。'
    ),
    prompt:
      'Create an original blue rose tattoo above a restrained ornamental crown connected by curved thorn branches. Keep crown openings clear and separate blue petals from black ornament. Flat balanced flash on a light background, no text.',
    styles: ['floral', 'blackwork'],
    placements: ['forearm', 'shoulder'],
    topics: ['rose'],
    generatorPath: '/kaiser-tattoo-generator',
  },
  {
    id: 'fine-line-blue-rose',
    image: '/imgs/kaiser/fine-line.jpg',
    width: 1086,
    height: 1448,
    title: l('Fine stem rose with a pale blue wash', '淡蓝晕染的细茎玫瑰'),
    description: l(
      'A pale blue rose connects to a fine stem with a tiny crown and pendant below. The light wash is softer than the dense blue variants. A small adaptation should remove pendant detail before compressing the bloom.',
      '小朵淡蓝玫瑰连接纤细花茎，下方带有小冠饰与垂坠饰件。花瓣轻薄晕染提供了更柔和的配色方向；缩小适配时，应先去掉下方饰件，再检查花心细节。'
    ),
    prompt:
      'Draw an original slender rose tattoo with a pale blue watercolor wash over fine black petal outlines, an open stem and sparse small ornament. Airy vertical composition on plain light paper. Readable bloom, no lettering or skin mockup.',
    styles: ['fine-line', 'floral', 'watercolor'],
    placements: ['forearm', 'wrist'],
    topics: ['rose'],
    generatorPath: '/kaiser-tattoo-generator',
  },
  {
    id: 'watercolor-blue-rose',
    image: '/imgs/kaiser/watercolor.jpg',
    width: 1086,
    height: 1448,
    title: l('Blue rose with watercolor splashes', '蓝色水彩飞溅玫瑰'),
    description: l(
      'Loose blue splashes surround a structured rose and dark tapering stem. Compare the defined bloom against the diffuse color. Discuss the final color boundary and healed-work examples with an artist who works in color.',
      '松散蓝色飞溅围绕结构清楚的玫瑰与渐细深色花茎。明确花形与扩散色块形成对比，可据此讨论颜色边界，并向擅长彩色作品的纹身师查看愈合效果。'
    ),
    prompt:
      'Design an original blue rose tattoo with readable petal structure, restrained watercolor splashes and a slim dark stem. Controlled splash area and a clean outside silhouette. Flat forearm concept on a light background, no text or watermark.',
    styles: ['watercolor', 'floral'],
    placements: ['forearm', 'shoulder'],
    topics: ['rose'],
    generatorPath: '/kaiser-tattoo-generator',
  },
  {
    id: 'fine-line-bare-tree',
    image: '/imgs/poison-tree/fine-line.webp',
    width: 825,
    height: 1100,
    title: l('Bare tree with fine roots', '细根裸枝树'),
    description: l(
      'A slender trunk divides into open bare branches above fine exposed roots. Empty spaces make the structure readable. It can start a personal family or remembrance concept, with meaning chosen by the person wearing it.',
      '纤细树干向上分出裸枝，向下延伸细根，留白让枝杈结构更清楚。它可以发展为家庭或纪念图案，具体含义应由佩戴者自己的经历来决定。'
    ),
    prompt:
      'Create an original fine line bare tree tattoo with a slender trunk, open branch structure and a few readable exposed roots. Calm vertical composition and generous negative space on plain light paper, no apples, lettering or skin mockup.',
    styles: ['fine-line'],
    placements: ['forearm', 'shoulder'],
    topics: ['memorial'],
    generatorPath: '/poison-tree-tattoo-generator',
  },
  {
    id: 'etched-bare-tree',
    image: '/imgs/poison-tree/etching.webp',
    width: 825,
    height: 1100,
    title: l('Bare tree in an etched texture', '蚀刻质感裸枝树'),
    description: l(
      'A heavier twisted trunk and short etched strokes give this tree texture. Compare it with the sparse fine line version. Preserve the broad branch divisions first; the smallest marks can be reduced during an artist redraw.',
      '较粗的扭转树干与短排线带来蚀刻感，适合与稀疏细线版本对照。重画时，可以先保留主要分枝关系，再按尺寸减少细碎纹理。'
    ),
    prompt:
      'Draw an original bare tree tattoo in a black etched illustration style with a twisting trunk, clear major branches and restrained bark hatching. Avoid crowded tiny twigs. Vertical flat flash on a light background, no lettering or skin.',
    styles: ['blackwork'],
    placements: ['forearm', 'shoulder'],
    topics: ['memorial'],
    generatorPath: '/poison-tree-tattoo-generator',
  },
  {
    id: 'stellar-1111',
    image: '/imgs/angel-numbers/1111.webp',
    width: 1100,
    height: 1100,
    title: l('11:11 with a star and dotted orbit', '星芒与点轨环绕的 11:11'),
    description: l(
      'Tall 11:11 numerals sit under a four-point star inside dotted ornament. This is a star-and-number companion with no sun-and-moon pair. For fingers, isolate a short numeral group and remove the outer ornament.',
      '修长的 11:11 数字位于四角星下方，外侧有点列天体饰纹。这张图是星芒与数字组合，可作为日月主题的陪衬参考；手指适配需要抽出短数字并删去外圈装饰。'
    ),
    prompt:
      'Create original tattoo lettering for the exact numerals 11:11 with a four-point star above and a sparse dotted orbit. Fine black ornament and clear numeral spacing. Flat wrist-scale concept on plain light paper, no skin or watermark.',
    styles: ['lettering', 'fine-line'],
    placements: ['wrist', 'finger', 'forearm'],
    topics: ['sun-and-moon'],
    generatorPath: '/angel-numbers-tattoo-generator',
  },
  {
    id: 'crescent-333',
    image: '/imgs/angel-numbers/333.webp',
    width: 1100,
    height: 1100,
    title: l('333 beneath a crescent moon', '弯月下的 333'),
    description: l(
      'Three serif numerals sit below a crescent moon and small stars. This moon-and-number companion has no sun in the artwork. Choose whether the numerals or crescent lead before changing its scale or adding another symbol.',
      '三个衬线数字位于弯月下方，周围散布小星。它是月亮与数字的陪衬示例，图中没有太阳；调整大小或增加其他天体之前，可以先决定由数字还是弯月主导视觉。'
    ),
    prompt:
      'Design original tattoo lettering for the exact numerals 333 with a single crescent moon above and a few small stars. Open spacing around the numerals and restrained black linework. Flat wrist concept on light paper, no sun, skin or watermark.',
    styles: ['lettering', 'fine-line'],
    placements: ['wrist', 'forearm'],
    topics: ['sun-and-moon'],
    generatorPath: '/angel-numbers-tattoo-generator',
  },
  {
    id: 'rose-888',
    image: '/imgs/angel-numbers/888.webp',
    width: 1100,
    height: 1100,
    title: l('888 above a rose sprig', '玫瑰枝上方的 888'),
    description: l(
      'Large serif 888 numerals sit above a small rose and two leafy sprigs. The flower is secondary to the numbers. Compare rose-only compositions to decide whether a personal number should lead or remain a small accent.',
      '较大的衬线 888 数字位于小玫瑰与两侧叶枝上方，花朵作为次要元素。可以与纯玫瑰构图对照，决定个人数字应主导画面，还是只保留为小点缀。'
    ),
    prompt:
      'Create original tattoo lettering for the exact numerals 888 above a small black line rose with two short leafy sprigs. Separate numerals from the flower with open space and restrained shading. Flat artwork on plain light paper, no skin or watermark.',
    styles: ['lettering', 'floral'],
    placements: ['forearm', 'shoulder'],
    topics: ['rose'],
    generatorPath: '/angel-numbers-tattoo-generator',
  },
];
