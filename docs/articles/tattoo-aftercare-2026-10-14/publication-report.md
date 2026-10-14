# 纹身后护理双语文章发布验收

中英文文章均已写入正式后台文章库并发布。发布时间为北京时间 2026 年 10 月 14 日 16:57:07。后台采用一条文章记录、两种语言版本，后续可在文章管理中搜索 tattoo-aftercare。

## 发布页面

| 语言 | 页面                                                       | 最终页面标题                                                       | 状态       |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| 英文 | https://bestaitattoogenerator.com/blog/tattoo-aftercare    | Tattoo Aftercare: How to Care for a New Tattoo \| Tattoo Generator | 已验证通过 |
| 中文 | https://bestaitattoogenerator.com/zh/blog/tattoo-aftercare | 纹身后护理指南：清洗、保湿与感染警示 \| Tattoo Generator           | 已验证通过 |

英文 description：Learn how to clean, moisturize and protect a new tattoo, handle dressings, and recognize warning signs that need medical care.

中文 description：纹身后怎么护理？了解敷贴拆除、温和清洗、保湿、洗澡与运动安排，分清恢复期常见变化和需要及时就医的感染警示。

两页均使用各自语言的正式 URL 作为 canonical，并提供 en、zh 与 x-default 的对应文章链接。SEO 标题、description 和可见 H1 与成稿一致，未重复输出正文 H1 或编辑元数据。

## 内容与发布核验

- 文章包括敷料区分、清洗步骤、适度保湿、洗澡与活动安排、避晒、恢复期变化和就医警示。
- 使用美国皮肤病学会、Mayo Clinic、Cleveland Clinic、NHS、FDA 及公共卫生部门资料；厂商说明仅用于对应敷贴，工作室经验明确限定为其自身流程。研究与参考资料见 editorial-brief.md 和文章末尾。
- 没有虚构医生身份、临床审校、病例、搜索量、治疗效果或排名承诺。
- 使用已有 Cloudflare 管理权限导入正式 CMS 数据，先保存草稿并逐字核对，再发布两种语言。没有创建登录会话、修改管理员权限或执行数据库结构迁移。
- 数据库回读确认一条文章、两条翻译，三条记录均为 published。英文及中文正文 SHA-256 与最终成稿完全一致。
- 线上两页 GET 均为 200，未跳转；原始 HTML 全部正文与最终 Markdown 渲染文字逐字一致。
- 英文和中文博客列表均提供文章入口，两个列表现均可被索引。
- sitemap 共 34 个 URL，包含两个博客列表与两篇文章，文章语言链接互相对应。robots 规则未阻止 Googlebot 访问这些 URL。

英文 CMS 正文 SHA-256：e0fa5d088f0a09333426b9bd7158f77b534cb55558be1d8620a0e98b1d3a6ea4

中文 CMS 正文 SHA-256：a223b1e445e9d3f4867e9973958d42b142063feadfc8158d3ebc433f81b5b128

## 显示修正与部署

真实浏览器验收发现文章模板的标题行距为字体大小的 0.98 倍，手机上中文标题换行后文字重叠。已把 src/routes/blog/$slug.tsx 的标题行距改为 leading-tight，实测行距为字体大小的 1.25 倍。

通过项目 cf:deploy 脚本完成构建和 Cloudflare Worker 部署，版本为 8e0e1029-efe9-4164-a650-3709f17a65cf。此次应用代码改动仅涉及这一处标题样式。

| 维度       | 本次检查范围                                   | 结果与边界                                                                        |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| 响应式     | 中英文文章，390、768、1440 像素                | 无水平溢出，标题可完整显示；手机截图已人工查看                                    |
| 主题       | 上述页面与尺寸，明暗主题                       | 共 12 组状态通过                                                                  |
| SEO        | 文章与两个博客列表、正式 HTML、sitemap、robots | 标题、描述、canonical、hreflang、正文和入站链接通过；Google 实际收录未核验        |
| 资源与性能 | 浏览器资源加载、生产构建                       | 无失败请求；构建通过；保留既有大 chunk 提示，未运行 Lighthouse 或真实用户性能检测 |
| 安全       | 新文章文件、CMS 导入内容、标题样式差异         | 工作区扫描通过；人工检查无密钥、原始 HTML、脚本链接或权限改动                     |

另实测两种尺寸下共 4 次博客列表点击进入文章、4 次中英文互相切换，均保持正确文章路径。浏览器验收期间控制台错误为 0，失败网络请求为 0。

## 自动检查与已知限制

- pnpm.cmd run cf:deploy：成功，客户端与服务端构建完成并上线。
- Vitest：68 个文件、524 项测试全部通过。与文章发布直接相关的 20 项测试也单独通过。
- Prettier：文章文件与修改的模板格式检查通过。
- SEO HTML 审计脚本：两种语言均无 P0、P1、P2 发现；HTTP、浏览器和 sitemap 检查另行执行，未把静态脚本结果当作完整上线证明。
- TypeScript 全项目检查未通过。在本次模板行距修改之前运行的检查已经失败；关闭增量缓存重查仍有 248 条诊断，涉及既有模块和依赖类型导出，例如 data-table、auth 与 pricing。本次未修改这些模块。构建、全部测试与正式文章页面检查均通过。
- 12 个独立参考链接中，直接 HTTP 检查有 10 个返回 200；Ink Society 返回 429，FDA 在本机 Python 环境出现证书链错误。这两份资料均已通过网页检索工具读取，没有关闭 TLS 校验。
- 未登录管理员网页执行可视化编辑操作；发布记录和双语内容通过已授权的数据库管理渠道核验，后台仍使用原有身份验证。
- 未进行 Search Console URL Inspection、排名或点击率测量，也未声称文章经过医疗专业人士审校。

可复核的结构化结果保存在 publication-verification.json。cms-payload.json 是两种语言均为 published 的内容备份，已经移除文件中的编辑注释与 H1，适合与后台字段核对。原始完整 Markdown 成稿分别为 tattoo-aftercare.en.md 和 tattoo-aftercare.zh.md。
