# Tattoo Generator

Tattoo Generator 是一款以对话方式工作的 AI 纹身设计应用。用户可以描述寓意、风格、位置和细节，也可以上传参考图。FastClaw 智能体负责理解需求、生成纹身概念，并根据后续消息持续修改。

生产域名为 https://bestaitattoogenerator.com

项目基于 ShipAny Image Agent 模板，保留了账号、积分、订阅、后台设置、图片库、多语言和 Cloudflare Workers 部署能力。

## 当前版本包含什么

- 纹身专属首页、示例提示词、暖纸色视觉和品牌图标
- 细线、植物、美式传统和文字四类快速灵感
- FastClaw 对话接口，支持流式回复、连续会话和参考图
- 固定智能体 ID，默认连接 FastClaw Cloud
- FastClaw 未配置时继续使用模板原有的本地智能体流程
- 后台 FastClaw 配置与连接测试
- FastClaw 每个生成回合按所选模型扣除积分，请求失败时自动退回
- 英文和中文界面

## 本地启动

下面的命令都在 Windows PowerShell 中执行。

### 第一步：安装依赖

```powershell
pnpm.cmd install
```

### 第二步：准备本地配置

```powershell
Copy-Item .env.example .env.development
```

打开 `.env.development`，至少检查这些项目：

```dotenv
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=Tattoo Generator
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:data/local.db
AUTH_SECRET=请换成一段足够长的随机字符串
CONFIG_ENCRYPTION_KEY=请换成另一段足够长的随机字符串
FASTCLAW_BASE_URL=https://cloud.fastclaw.ai
FASTCLAW_AGENT_ID=agt_1d82e3db42549e69c6ff
FASTCLAW_API_KEY=
```

API Key 建议通过后台保存。后台会把它作为服务端配置处理，浏览器页面无法读取明文。开发阶段也可以把它填入 `.env.development`，该文件已经被 Git 忽略。

### 第三步：创建本地数据库

```powershell
pnpm.cmd db:push
pnpm.cmd rbac:init
```

### 第四步：启动网站

```powershell
pnpm.cmd dev
```

浏览器打开 http://localhost:3000

### 第五步：创建管理员

在网站注册一个账号，然后回到 PowerShell 执行：

```powershell
pnpm.cmd rbac:assign --email=你的邮箱 --role=super_admin
```

重新登录后打开 http://localhost:3000/admin/settings

进入 AI 设置中的 FastClaw，填写：

- Base URL：`https://cloud.fastclaw.ai`
- Agent ID：`agt_1d82e3db42549e69c6ff`
- API Key：填写你的 FastClaw 密钥

点击测试。测试过程会读取可访问的智能体列表，并确认指定智能体存在，不会发起图片生成任务。

## FastClaw 请求流程

1. 用户在首页输入纹身需求，也可以附带参考图。
2. 服务端读取历史对话，并为用户和当前对话生成稳定的会话标识。
3. 服务端根据模型目录扣除本次生成所需积分，不采用浏览器提交的积分数值。
4. 服务端向 `/v1/chat/completions` 发送请求。
5. 请求中包含智能体 ID、消息历史、参考图和纹身设置。
6. FastClaw 通过 SSE 返回流式内容，前端逐段显示。
7. API Key 只在服务端加入 Authorization 请求头。
8. 接口失败或用户取消请求时，系统退回本次扣除的积分。

如果 FastClaw 返回错误，界面会显示经过清理的错误信息，密钥不会进入浏览器响应或日志。

## 验证命令

```powershell
pnpm.cmd test
pnpm.cmd build
```

## 部署到 Cloudflare Workers

### 第一步：复制部署配置

```powershell
Copy-Item wrangler.example.jsonc wrangler.jsonc
```

在 `wrangler.jsonc` 中填入真实的 D1 数据库 ID。模板已经设置了 Worker 名称、生产域名、FastClaw 地址和智能体 ID。

### 第二步：创建并迁移 D1 数据库

```powershell
npx.cmd wrangler login
npx.cmd wrangler d1 create tattoo-generator
pnpm.cmd db:generate
npx.cmd wrangler d1 migrations apply tattoo-generator --remote
```

### 第三步：保存服务端密钥

逐条执行以下命令。Wrangler 会提示你粘贴值，输入内容不会写进仓库。

```powershell
npx.cmd wrangler secret put AUTH_SECRET
npx.cmd wrangler secret put CONFIG_ENCRYPTION_KEY
npx.cmd wrangler secret put FASTCLAW_API_KEY
```

### 第四步：部署

```powershell
pnpm.cmd run cf:deploy
```

部署完成后，在 Cloudflare 中把 `bestaitattoogenerator.com` 绑定到这个 Worker，并在生产站点注册账号、授予 `super_admin` 角色，再检查后台 FastClaw 测试。

## 关键目录

```text
src/modules/agent/fastclaw.ts       FastClaw 请求与流式响应解析
src/modules/agent/service.ts        FastClaw 和模板智能体的流程切换
src/modules/config/settings.ts      后台 FastClaw 设置项
src/components/agent               对话输入、示例和结果界面
messages/en.json                    英文文案
messages/zh.json                    中文文案
public/imgs/generated               首页纹身示例图
wrangler.example.jsonc              Cloudflare 部署配置示例
```

## 安全说明

- 不要把 API Key 写入以 `VITE_` 开头的变量。
- 不要把 `.env.development`、`.env.production` 或 `wrangler.jsonc` 提交到 Git。
- 生产环境使用 Wrangler secret 保存 FastClaw、认证和加密密钥。
- 每次修改 FastClaw 地址或智能体 ID 后，都在后台重新运行连接测试。

## License

Proprietary. See LICENSE.

Built on ShipAny: https://shipany.ai
