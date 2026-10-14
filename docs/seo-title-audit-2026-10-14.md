# 页面标题检查与优化

检查日期：2026 年 10 月 14 日。结论：本地标题验收完成，尚未部署。

检查覆盖 32 个中英文公开页面，以及 36 类非营销路由的中英文样本，共 72 次 noindex 检查。线上站点地图的 30 个页面均已读取，另核对两个博客列表页。当前没有可逐篇审核的已发布文章页面。

关键词依据实际页面主题和现有功能确定，未使用搜索量或 Search Console 点击率数据。标题的点击吸引力按主题清晰程度、具体设计风格、真实用途与重复情况评估，效果需要发布后观察。

## 本次修改

- 进一步优化 11 个搜索标题：英文 Womb Tattoo 页、蝴蝶与天使数字及 Joker 页的中英文版本，以及四个法律页面。
- Womb Tattoo 页明确下腹部位置；蝴蝶页突出细线、水彩与蝴蝶树；天使数字页写明 111 至 11:11；Joker 页突出面具与扑克牌。这些元素均存在于页面内容。
- 价格页和博客页的四个可见主标题补全主题。价格页使用较宽行距，改善中文长标题在手机上的换行显示。
- 法律页面的搜索与分享标题通过 envConfigs.app_name 附加站点名，正文主标题保留简洁文案。
- 联系页补齐 Twitter 标题与描述，统一搜索、Open Graph 和 Twitter 标题。
- 更新既有元数据测试，覆盖法律页站点名及联系页分享标题。

其他已符合页面用途的标题继续沿用工作区现有版本。原有提交 efdebac 保留，本次修改尚未提交、推送或部署。

## 验证证据

| 检查                              | 实际结果                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| pnpm.cmd test                     | 67 个测试文件、522 项测试通过                                                            |
| 最终行距调整后的相关 Vitest 检查  | 4 个文件、105 项测试通过                                                                 |
| TypeScript tsc --noEmit           | 通过                                                                                     |
| 最终 Vite 生产构建                | 通过，生成 .output/nitro.json                                                            |
| 六个修改文件的 Prettier 检查      | 通过                                                                                     |
| git diff --check 与独立差异复核   | 通过，改动集中在标题、分享元数据、行距及对应测试                                         |
| 技能 audit_page.py 原始 HTML 检查 | 32 个公开页面均有独立标题、描述、单一 H1 与同语言 canonical；72 个非营销样本均有 noindex |
| 完整生产构建浏览器检查            | 32 个公开页面均为 HTTP 200；HTML 与 DOM 标题一致，Open Graph 与 Twitter 标题一致         |
| 响应式检查                        | 1440 与 390 像素宽度共 12 个状态通过；最终价格页四个状态另行复测                         |
| 控制台与网络                      | 32 页检查无控制台错误、无 HTTP 错误、无失败请求                                          |
| 站内跳转                          | 从中文法律页点击博客链接后，URL 与标题正确切换到中文博客                                 |

完整构建仍提示部分代码块大于 500 kB，属于已有体积提醒。

## 逐页结果

下表记录本地生产构建实际输出。状态仅表示本次标题及相关元数据核验；Google 实际展示标题、收录和排名尚未验证。

### 英文页面

| 路径                             | 页面主题                          | 收录意图             | 最终标题                                                         | 描述                                                                                                                                                                                      | canonical                                                         | 状态       |
| -------------------------------- | --------------------------------- | -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------- |
| /                                | AI 纹身生成器与定制设计           | index                | AI Tattoo Generator &#124; Create Custom Tattoo Designs          | Describe the meaning, style, and placement. Your AI tattoo artist will shape the idea, generate a concept, and refine it with you.                                                        | https://bestaitattoogenerator.com/                                | 已验证通过 |
| /pricing                         | AI 纹身生成器价格、套餐与积分     | index                | AI Tattoo Generator Pricing &#124; Plans & Credits               | Auto-renews for credits. Cancel anytime.                                                                                                                                                  | https://bestaitattoogenerator.com/pricing                         | 已验证通过 |
| /womb-tattoo-generator           | Womb Tattoo、下腹部对称设计       | index                | Womb Tattoo Generator &#124; Symmetrical Lower-Abdomen Designs   | Explore five womb tattoo design styles, compare lower-abdomen placement ideas, and create a personal symmetrical tattoo concept with our AI generator.                                    | https://bestaitattoogenerator.com/womb-tattoo-generator           | 已验证通过 |
| /fear-god-tattoo-generator       | Fear God 文字纹身、哥特与手写字体 | index                | Fear God Tattoo Generator &#124; Blackletter & Script Designs    | Explore five Fear God tattoo design styles, compare lettering and forearm placement, then create a personal faith-inspired tattoo concept with our AI generator.                          | https://bestaitattoogenerator.com/fear-god-tattoo-generator       | 已验证通过 |
| /kaiser-tattoo-generator         | Kaiser 纹身、蓝玫瑰与荆棘         | index                | Kaiser Tattoo Generator &#124; Blue Rose & Thorn Designs         | Explore Kaiser tattoo design ideas inspired by Michael Kaiser's blue rose, thorns and crown. Compare five styles and create your own fan-inspired concept with AI.                        | https://bestaitattoogenerator.com/kaiser-tattoo-generator         | 已验证通过 |
| /poison-tree-tattoo-generator    | Poison Tree 纹身、树根与红苹果    | index                | Poison Tree Tattoo Generator &#124; Roots & Red Apple Designs    | Explore poison tree tattoo designs with bare branches, exposed roots and a red apple. Compare five styles and use our AI generator to create your own tattoo concept.                     | https://bestaitattoogenerator.com/poison-tree-tattoo-generator    | 已验证通过 |
| /butterfly-tattoo-generator      | 蝴蝶纹身、细线、水彩与蝴蝶树      | index                | Butterfly Tattoo Generator &#124; Fine-Line & Watercolor Designs | Explore butterfly tattoo design ideas in five styles, from fine-line wings to butterfly trees. Compare examples and create your own tattoo concept with our AI generator.                 | https://bestaitattoogenerator.com/butterfly-tattoo-generator      | 已验证通过 |
| /ghost-face-tattoo-generator     | Ghost Face 纹身、暗黑面具         | index                | Ghost Face Tattoo Generator &#124; 5 Dark Mask Designs           | Explore five ghost face tattoo design styles, from fine-line masks to blackwork and crimson accents. Compare examples and create your own tattoo concept with our AI generator.           | https://bestaitattoogenerator.com/ghost-face-tattoo-generator     | 已验证通过 |
| /throat-tattoo-for-men-generator | 男士喉部纹身、颈部正面设计        | index                | Throat Tattoo Designs for Men &#124; AI Generator                | Explore five throat tattoo designs for men, from ornamental dotwork and blackwork wings to roses, snakes and fine-line geometry. Compare examples and create a front-neck tattoo concept. | https://bestaitattoogenerator.com/throat-tattoo-for-men-generator | 已验证通过 |
| /couple-tattoo-generator         | 情侣纹身、成对与互补设计          | index                | Couple Tattoo Generator &#124; Matching Tattoo Designs           | Explore five couple tattoo design pairs, from matching hearts to sun and moon. Compare motifs, save a reference, and create a personalized pair with AI.                                  | https://bestaitattoogenerator.com/couple-tattoo-generator         | 已验证通过 |
| /angel-numbers-tattoo-generator  | 天使数字纹身、111 至 11:11        | index                | Angel Numbers Tattoo Generator &#124; 111 to 11:11 Designs       | Explore eight angel number tattoo designs, from 111 to 11:11. Preview and save AI-created flash, then create a personal number tattoo concept with our AI generator.                      | https://bestaitattoogenerator.com/angel-numbers-tattoo-generator  | 已验证通过 |
| /joker-tattoo-generator          | Joker 纹身、小丑面具与扑克牌      | index                | Joker Tattoo Generator &#124; Jester Masks & Playing Cards       | Explore eight original Joker tattoo designs, from jester masks and playing cards to blackwork and color. Preview, save and create your own concept with AI.                               | https://bestaitattoogenerator.com/joker-tattoo-generator          | 已验证通过 |
| /blog                            | 纹身设计博客与使用指南            | 按已发布文章状态决定 | Tattoo Design Blog &#124; Guides & Updates                       | Product updates, guides, and engineering notes from the team.                                                                                                                             | https://bestaitattoogenerator.com/blog                            | 已验证通过 |
| /contact                         | 账号、付款与纹身生成支持          | index                | Contact & Support &#124; Tattoo Generator                        | Send a support ticket about your account, payment, privacy, or AI tattoo generation.                                                                                                      | https://bestaitattoogenerator.com/contact                         | 已验证通过 |
| /privacy-policy                  | 站点隐私政策                      | index                | Privacy Policy &#124; Tattoo Generator                           | How Tattoo Generator handles account, creative, usage, payment, and support data.                                                                                                         | https://bestaitattoogenerator.com/privacy-policy                  | 已验证通过 |
| /terms-of-service                | 站点服务条款                      | index                | Terms of Service &#124; Tattoo Generator                         | Terms for using Tattoo Generator, AI design features, Credits, and paid plans.                                                                                                            | https://bestaitattoogenerator.com/terms-of-service                | 已验证通过 |

### 中文页面

| 路径                                | 页面主题                          | 收录意图             | 最终标题                                   | 描述                                                                                                                               | canonical                                                            | 状态       |
| ----------------------------------- | --------------------------------- | -------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- |
| /zh                                 | AI 纹身生成器与定制设计           | index                | AI 纹身生成器｜创作专属纹身设计            | 说出寓意、风格和位置，AI 纹身设计师会完善构思、生成方案，并陪你继续修改。                                                          | https://bestaitattoogenerator.com/zh                                 | 已验证通过 |
| /zh/pricing                         | AI 纹身生成器价格、套餐与积分     | index                | AI 纹身生成器价格｜套餐与积分              | 自动续订获取积分，随时可取消。                                                                                                     | https://bestaitattoogenerator.com/zh/pricing                         | 已验证通过 |
| /zh/womb-tattoo-generator           | Womb Tattoo、下腹部对称设计       | index                | Womb Tattoo 设计生成器｜下腹部对称纹身灵感 | 探索五种 Womb Tattoo 设计风格，比较下腹部纹身的位置与比例，再用 AI 生成属于自己的对称纹身构想。                                    | https://bestaitattoogenerator.com/zh/womb-tattoo-generator           | 已验证通过 |
| /zh/fear-god-tattoo-generator       | Fear God 文字纹身、哥特与手写字体 | index                | Fear God 纹身生成器｜哥特字体与信念符号    | 探索五种 Fear God Tattoo 字体与符号设计，比较前臂位置和排版，再用 AI 生成自己的信念文字纹身构想。                                  | https://bestaitattoogenerator.com/zh/fear-god-tattoo-generator       | 已验证通过 |
| /zh/kaiser-tattoo-generator         | Kaiser 纹身、蓝玫瑰与荆棘         | index                | Kaiser 纹身生成器｜蓝玫瑰与荆棘设计        | 探索以 Michael Kaiser 蓝玫瑰、荆棘与皇冠为灵感的 Kaiser Tattoo 设计。比较五种风格，再用 AI 生成属于你的角色主题纹身构想。          | https://bestaitattoogenerator.com/zh/kaiser-tattoo-generator         | 已验证通过 |
| /zh/poison-tree-tattoo-generator    | Poison Tree 纹身、树根与红苹果    | index                | Poison Tree 纹身生成器｜枯树与红苹果设计   | 探索 Poison Tree Tattoo 纹身设计：比较枯树枝干、外露根系、红苹果等五种风格，并用 AI 生成属于你的毒树纹身构想。                     | https://bestaitattoogenerator.com/zh/poison-tree-tattoo-generator    | 已验证通过 |
| /zh/butterfly-tattoo-generator      | 蝴蝶纹身、细线、水彩与蝴蝶树      | index                | 蝴蝶纹身生成器｜细线、水彩与蝴蝶树设计     | 探索五种蝴蝶纹身设计：蝴蝶树、极简细线、黑工、花枝双蝶与柔和水彩。比较手稿示例，再用 AI 生成属于你的纹身构想。                     | https://bestaitattoogenerator.com/zh/butterfly-tattoo-generator      | 已验证通过 |
| /zh/ghost-face-tattoo-generator     | Ghost Face 纹身、暗黑面具         | index                | Ghost Face 纹身生成器｜5 种暗黑面具设计    | 探索五种 Ghost Face 纹身设计方向：经典黑灰、极简细线、厚重黑工、手绘素描与红黑撞色。比较示例，并用 AI 生成自己的幽灵面具纹身概念。 | https://bestaitattoogenerator.com/zh/ghost-face-tattoo-generator     | 已验证通过 |
| /zh/throat-tattoo-for-men-generator | 男士喉部纹身、颈部正面设计        | index                | 男士喉部纹身设计｜AI 生成器与 5 种风格     | 探索五种男士喉部纹身设计：对称装饰、黑工展翼、黑灰玫瑰、流线蛇纹与极简几何。比较颈部正面的构图与留白，再生成自己的纹身概念。       | https://bestaitattoogenerator.com/zh/throat-tattoo-for-men-generator | 已验证通过 |
| /zh/couple-tattoo-generator         | 情侣纹身、成对与互补设计          | index                | 情侣纹身生成器｜成对与互补纹身设计         | 探索五组成对情侣纹身设计，从相同心形到日月主题。比较两幅图案、保存参考图，再用 AI 情侣纹身生成器创作属于你们的组合。               | https://bestaitattoogenerator.com/zh/couple-tattoo-generator         | 已验证通过 |
| /zh/angel-numbers-tattoo-generator  | 天使数字纹身、111 至 11:11        | index                | 天使数字纹身生成器｜111 至 11:11 图案设计  | 探索 111 到 11:11 的八款天使数字纹身设计，比较字形与装饰、保存 AI 创作的手稿，再用生成器创作有个人意义的数字纹身。                 | https://bestaitattoogenerator.com/zh/angel-numbers-tattoo-generator  | 已验证通过 |
| /zh/joker-tattoo-generator          | Joker 纹身、小丑面具与扑克牌      | index                | Joker 纹身生成器｜小丑面具与扑克牌设计     | 探索八款原创 Joker 纹身设计：小丑面具、扑克牌、坏笑符号、菱形黑工与绿紫帽饰。预览并保存 AI 手稿，再创作自己的纹身概念。            | https://bestaitattoogenerator.com/zh/joker-tattoo-generator          | 已验证通过 |
| /zh/blog                            | 纹身设计博客与使用指南            | 按已发布文章状态决定 | 纹身设计博客｜创作指南与产品动态           | 来自团队的产品动态、使用指南与工程笔记。                                                                                           | https://bestaitattoogenerator.com/zh/blog                            | 已验证通过 |
| /zh/contact                         | 账号、付款与纹身生成支持          | index                | 联系与支持｜Tattoo Generator               | 提交有关账号、付款、隐私或 AI 纹身生成的支持工单。                                                                                 | https://bestaitattoogenerator.com/zh/contact                         | 已验证通过 |
| /zh/privacy-policy                  | 站点隐私政策                      | index                | 隐私政策 &#124; Tattoo Generator           | Tattoo Generator 如何处理账户、创作、用量、付款和支持数据。                                                                        | https://bestaitattoogenerator.com/zh/privacy-policy                  | 已验证通过 |
| /zh/terms-of-service                | 站点服务条款                      | index                | 服务条款 &#124; Tattoo Generator           | 使用 Tattoo Generator、AI 设计功能、Credit 和付费方案时适用的条款。                                                                | https://bestaitattoogenerator.com/zh/terms-of-service                | 已验证通过 |

## 环境差异与后续核验

- 线上仍使用旧版本，发布后需重新检查网站地图所列页面及中英文博客页的最终标题。
- 本地文章数据读取返回 known=false，沿用现有降级逻辑，两个本地博客页没有 noindex。技能脚本因此给出两项 P1 提醒。源码中的空博客 noindex 与 sitemap 排除逻辑已有测试覆盖；线上两个空博客页本次均观测到 noindex, follow。本次标题修改没有改变该收录逻辑。
- 线上中文首页曾有一次响应返回英文标题与首页 canonical；随后连续三次独立请求均返回中文。最终本地生产构建的原始 HTML 与浏览器检查均为中文。发布后需复查中文首页的语言与 canonical。
- 线上对比中的一次重复批量请求发生读取超时；首次完整读取的 32 页快照已保留。本地生产构建的 104 次 HTML 检查独立完成。
- 动态文章页面的标题由文章标题和站点名生成。当前没有实际文章可逐篇检查；发布文章后还需要按文章内容审核关键词与点击吸引力。
- 本次未执行部署、Search Console 提交、Google 实际收录验证或点击率实验。

## 复核材料

本地临时证据位于 .playwright-cli 文件夹，其中包含 seo-titles-http.json、seo-titles-browser-final.json、seo-pricing-layout-final.json，以及中英文手机截图和博客桌面截图。该文件夹由项目既有规则忽略。

源码改动：messages/en.json、messages/zh.json、src/routes/pricing.tsx、src/routes/contact.tsx、src/routes/(pages)/-static-page.tsx、src/lib/i18n-message-parity.test.ts。
