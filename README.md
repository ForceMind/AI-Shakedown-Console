# AI Shakedown Console

一个无需构建步骤的多协议 AI API 调试页面，用于验证 API Key、模型名称、网关地址和流式响应。既可浏览器直连，也可通过 Cloudflare Pages Worker 同域转发，解决上游未开放 CORS 时的访问问题。

线上版本：[ai-shakedown-console.pages.dev](https://ai-shakedown-console.pages.dev/) · 当前版本：`v16` · Worker：`proxy-6`

## 功能概览

- 支持 OpenAI Compatible、Anthropic Messages 和 Google Gemini 三类协议。
- 支持流式响应、安全 Markdown 渲染、请求检查、Token 与费用统计。
- 支持配置库、提示词库、多对话页签，以及对话历史和连接配置的本地恢复。
- 支持从本地 Codex、Gemini CLI、Claude Code 及通用 JSON / JSONL 记录导入历史对话。
- 支持复用本机已经登录的 Codex、Antigravity、Gemini CLI、Claude Code 和 OpenCode：网页自动识别 macOS、Windows 或 Linux，下载对应启动脚本后即可检测工具、读取模型并直接对话。启动脚本会优先使用系统 Node.js，并自动回退到 Codex 桌面版自带的 Node 运行时。
- 内置 [agency-agents-zh](https://github.com/jnMetaCode/agency-agents-zh) 的 268 个中文专家角色，可按部门筛选、搜索、预览并应用到当前对话。
- 支持读取模型列表、模型强弱排序和 OpenAI `reasoning_effort` 思考强度。
- 支持浏览器直连与 Cloudflare Pages Worker 同域代理，并限制代理上游白名单。
- 无构建步骤，图标、Markdown 解析器和 HTML 清洗器均随站点自托管。

AI 回复支持 GitHub Flavored Markdown，包括标题、列表、引用、链接、表格、行内代码和代码块。解析后的 HTML 会在显示前清洗；流式生成期间保持纯文本，完成或停止后再渲染 Markdown。

## 协议和预设

- OpenAI Compatible：OpenAI、DeepSeek、阿里云百炼/千问、火山引擎/豆包、腾讯混元、百度千帆/ERNIE、Moonshot/Kimi、智谱 GLM、SiliconFlow、OpenRouter、Groq、xAI、Mistral、Together AI、Perplexity、NVIDIA NIM、Fireworks AI、Cohere、Azure OpenAI、Ollama 和 LM Studio。
- Anthropic Messages：Anthropic 原生 `/v1/messages` 协议。
- Google Gemini：Gemini `generateContent` 和 SSE `streamGenerateContent` 协议。
- 本机 AI 工具：Codex App Server，以及 Antigravity、Gemini CLI、Claude Code、OpenCode 的本地 CLI 桥接协议。
- 自定义/自建站：可编辑 Base URL、请求路径、认证方式、自定义请求头和附加请求参数。

OpenAI Compatible 和本机 Codex 支持思考强度。默认“自动”不会发送该字段，也可选择 `none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max` 或 `ultra`；其他本地 CLI 使用各自的默认推理设置。

思考强度下拉菜单位于左侧连接配置的模型选择器正下方。页面右下角显示当前前端版本；`/api/status` 同时返回 `appVersion` 和 Worker 版本。HTML 入口使用 `no-store`，避免新部署后继续显示旧页面。Bootstrap Icons 及其字体保存在站点本地，不依赖第三方 CDN。

预设的模型名称只是初始值，并按能力从强到弱排列。使用“读取”按钮请求模型列表后，服务端返回的模型会按能力标记、参数规模和版本号降序显示；选择“自定义模型…”可继续手动填写任意模型 ID。

## 配置库、提示词和多对话

- 配置库：填写名称后保存当前服务商、协议、地址、认证、API Key、模型、生成参数和费用设置；选择已保存配置后可加载、覆盖保存或删除。“新建”会退出当前选择，以便另存一份配置。
- 提示词库：填写提示词名称和 System 内容后保存；选择提示词后可加载到当前对话、覆盖保存或删除。
- 多对话：点击“新对话”打开新的对话页签。每个页签分别保存消息历史和 System 提示词，可随时切换或关闭；首次请求成功后，页签名称会自动取自用户消息。
- 本地记录：点击对话标签栏的“导入记录”，可选择单个/多个文件或整个目录。Codex 通常位于 `~/.codex/sessions/`，Gemini CLI 位于 `~/.gemini/tmp/*/chats/`，Claude Code 位于 `~/.claude/projects/`。导入后会生成独立对话页签，可用当前模型继续对话。
- 本机 AI 工具：在“服务商预设”选择 Codex、Antigravity、Gemini CLI、Claude Code 或 OpenCode 的“本机登录”预设，页面会自动选择当前操作系统的启动脚本。下载后按页面给出的命令运行并保持终端开启，脚本会检查对应 CLI 是否可运行，启动本地桥接，再用带工具标识和随机配对令牌的地址重新打开页面。之后可点击“检测连接”和“读取”模型，无需向网页填写或复制 CLI 登录凭据。
- 连续对话：Codex 通过 App Server 保持线程；Antigravity 官方 `agy -p` 以及其他 CLI 的无头模式按单次调用运行，桥接会重放当前网页对话以维持上下文。选择较长的对话时会增加每次调用的输入量。
- 智能体角色库：点击输入区上方的“角色库”，可按部门筛选或搜索 268 个中文专家角色。选择角色后可预览完整定义，并一键替换当前对话的 System Prompt；角色标记随对话单独保存，手动修改或加载自定义提示词后自动解除。
- 刷新恢复：当前配置、配置库、提示词库、对话页签、消息历史和当前激活页签都会自动恢复。

以上数据只保存在当前站点的浏览器存储中，不会同步到其他浏览器或设备。

## 运行

项目是纯静态站点。由于使用 ES Module，建议通过 HTTP 服务访问：

```bash
python3 -m http.server 4173
```

或使用 macOS 自带 Ruby：

```bash
ruby -run -e httpd . -p 4173 -b 127.0.0.1
```

然后打开 `http://localhost:4173/`。

普通静态服务器不会执行 `_worker.js`。“使用同域代理”只在 Cloudflare Pages 部署中可用；本地静态服务应关闭该开关。

## Cloudflare Pages 部署

发布目录根部需要包含：

```text
index.html
script.js
style.css
_worker.js
vendor/marked.min.js
vendor/purify.min.js
vendor/bootstrap-icons/bootstrap-icons.min.css
vendor/bootstrap-icons/fonts/bootstrap-icons.woff2
vendor/bootstrap-icons/fonts/bootstrap-icons.woff
vendor/bootstrap-icons/LICENSE
vendor/marked.LICENSE.md
vendor/purify.LICENSE
agents/index.json
agents/content/**/*.md
agents/LICENSE.agency-agents-zh
assets/favicon.svg
```

可将以上文件按原目录结构压缩为 ZIP 后通过 Pages Direct Upload 创建生产部署。`_worker.js` 使用高级模式：`/api/proxy` 负责转发 API 请求，其他路径由 `env.ASSETS` 返回静态文件。

在项目根目录生成 `v16` 部署包：

```bash
zip -r AI-Shakedown-Console-cf-pages-worker-v16.zip \
  index.html script.js style.css _worker.js vendor agents assets
```

### 发布完成定义

每次完成用户可见功能或版本变更时，必须在交付前同时完成：

1. 同步 `README.md`、`_worker.js`、`index.html` 及静态资源查询参数中的版本号。
2. 执行 JavaScript 语法检查和 `git diff --check`。
3. 在项目根目录生成 `AI-Shakedown-Console-cf-pages-worker-v<version>.zip`。
4. 检查 ZIP 内容、文件大小和版本标识后再报告完成。

该规则同时写入项目根目录的 `AGENTS.md`，作为 Codex 每次进入仓库时的必读指引。

在 Pages 项目的“设置 → 变量和密钥”中，为生产环境配置普通文本变量：

```text
ALLOWED_UPSTREAMS=https://api.openai.com,https://api.anthropic.com,https://your-gateway.example.com:8443
```

值为英文逗号分隔的上游 Origin 白名单。Base URL 仍由页面填写并通过 `X-Upstream-URL` 传给 Worker；白名单只用于阻止部署变成任意开放代理。环境变量必须在部署前保存，修改后需要创建新的生产部署。

部署后可访问 `/api/status` 检查 Worker 状态。正常响应示例：

```json
{
  "appVersion": "v16",
  "workerVersion": "proxy-6",
  "allowedUpstreamsConfigured": true,
  "assetsBindingConfigured": true
}
```

部署完成后：

1. 打开线上页面，确认右下角显示 `v16`。
2. 访问 [`/api/status`](https://ai-shakedown-console.pages.dev/api/status)，确认 `appVersion` 为 `v16`、`workerVersion` 为 `proxy-6`。
3. 若浏览器仍显示旧入口，可访问 [`/?v=16`](https://ai-shakedown-console.pages.dev/?v=16) 绕过旧书签或中间缓存后再刷新。

### 浏览器缓存兼容

- `v16` 继续使用原有的 `ai-shakedown-console.settings.v1`、`profiles.v1`、`prompts.v1` 和 `conversations.v1` 存储键，升级部署不会清空原连接、API Key、提示词和对话。本地 AI 工具的配对令牌只保存在当前标签页的 `sessionStorage` 中。
- HTML 入口由 Worker 返回 `no-store`，CSS、脚本、图标和本地桥接资源使用 `v16` 查询参数，避免新旧界面资源混用。
- 角色索引使用 `no-cache`，角色正文 URL 附带上游 commit 标识；更新角色库后不会继续命中旧正文。

## 更新智能体角色库

角色库以静态资源随站点发布，运行时不会访问 GitHub。更新上游仓库后，执行：

```bash
node scripts/import-agency-agents.mjs /path/to/agency-agents-zh agents
```

导入器会读取带有 `name` 和 `description` frontmatter 的角色文件，生成轻量索引、按需加载的角色正文，并复制上游 MIT 许可。若要记录确切上游版本，可在运行时设置 `AGENCY_AGENTS_REVISION` 为对应 commit SHA。

## 自建站配置

1. 选择“自定义 / 自建站”。
2. 选择服务端实际支持的协议。
3. 填写 Base URL、请求路径、模型 ID 和认证方式。
4. 上游未开放 CORS 且页面部署在 Cloudflare Pages 时，开启“使用同域代理”。
5. 若网关需要额外请求头或参数，在“高级连接设置”中以 JSON 对象填写。

路径支持 `{model}` 占位符。Gemini 路径还支持 `{action}`，页面会根据流式开关替换为 `generateContent` 或 `streamGenerateContent?alt=sse`。

## 安全和网络边界

- 当前连接配置、命名配置、提示词、对话历史、生成参数、已读取模型和 API Key 会保存在当前站点的 `localStorage` 中，刷新或重启浏览器后自动恢复，直到用户点击“清除全部本地数据”或清除站点数据。
- 持久化 API Key 会增加同源脚本、浏览器扩展和 XSS 读取密钥的风险。只应在可信部署和个人设备上使用，不要在共享设备中保存生产密钥。
- 对话和提示词也可能包含敏感业务信息；共享设备上使用完毕后应点击“清除全部本地数据”。
- 直连模式要求上游允许页面所在 Origin 的 CORS 请求。HTTPS 页面不能直连 HTTP 服务；本地 HTTP 页面调试 Ollama/LM Studio 时也需要正确的 CORS 配置。
- 同域代理模式会把浏览器中保存的 API Key 转发给白名单内的上游，但不会写入 Worker 配置或项目文件。
- `ALLOWED_UPSTREAMS` 必须保持最小范围。不要移除白名单校验并将 Worker 发布为任意目标代理。
- AWS Bedrock、Google Vertex AI 等需要 SigV4/OAuth 交互式签名的平台不适合直接在浏览器中保管长期凭据，应通过自建的 OpenAI-compatible 网关接入。
- 本地启动脚本不会读取、上传或显示各 CLI 的认证文件；登录状态和令牌刷新仍由本机 CLI 负责。桥接只监听 `127.0.0.1`，校验下载时生成的随机 Bearer 令牌和网页 Origin。页面配对令牌不写入持久化配置。
- Codex 以 `readOnly` 沙盒和 `never` 审批策略启动；Gemini 使用 `plan` 审批模式；Claude Code 禁用内置与 MCP 工具并启用安全/计划模式；OpenCode 注入 `permission: deny` 的运行时配置。Antigravity 目前没有已文档化的等价禁用工具参数，因此桥接在独立临时工作目录中运行 `agy -p`，同时加入纯对话安全指令；它仍应视为 Beta，不要用来处理不可信提示词或敏感本地环境。
- 本地桥接依赖 Node.js 18+ 和所选 CLI。关闭脚本所在终端后立即停止；升级 CLI 后如有兼容变化，应重新下载最新版脚本。实现依据见 [Codex App Server](https://developers.openai.com/codex/app-server/)、[Antigravity CLI](https://codelabs.developers.google.com/antigravity-cli-hands-on)、[Gemini CLI 无头模式](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md)、[Claude Code CLI](https://code.claude.com/docs/en/cli-usage) 和 [OpenCode CLI](https://opencode.ai/docs/cli/) 官方文档。

## 桌面应用路线图

桌面封装列为网页本地桥接稳定后的后续计划，不包含在 `v16` 中：

1. 使用 Tauri 优先、Electron 作为兼容备选，将当前静态页面封装为 macOS、Windows 和 Linux 桌面应用。
2. 由桌面主进程直接管理 Codex App Server、Antigravity、Gemini CLI、Claude Code 和 OpenCode 等本地进程，取消“先下载再运行脚本”的步骤。
3. 使用系统钥匙串保存应用自身的非 Codex 密钥；Codex 登录仍交由官方 CLI/凭据存储管理。
4. 增加自动更新、签名与公证、崩溃日志、本地进程生命周期管理，以及可审计的权限确认界面。
5. 桌面版继续复用当前网页 UI 和配置数据结构，并提供从浏览器版导入配置与对话的迁移入口。

## 调试信息

“请求检查器”会显示脱敏后的 URL 和请求头、完整请求体、响应体和最近的 SSE 事件。Token 和费用只在 API 返回 usage 时累计；价格需按当前服务商手动填写。

“检查连接”只会请求配置的模型列表接口，不会向模型发送测试消息。部分服务（例如没有标准模型列表路径的 Azure OpenAI 配置）无法执行这种只读检查，此时应直接发送实际消息验证。

## 第三方依赖

依赖均以固定版本保存在 `vendor/`，页面运行时不会从第三方 CDN 加载资源。

| 依赖 | 版本 | 许可证 | 用途 |
| --- | --- | --- | --- |
| [Marked](https://marked.js.org/) | 15.0.12 | MIT | Markdown 解析 |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.2.6 | Apache-2.0 OR MPL-2.0 | HTML 清洗 |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 1.11.3 | MIT | 界面图标 |
| [agency-agents-zh](https://github.com/jnMetaCode/agency-agents-zh) | 1.2.7 | MIT | 268 个中文智能体角色定义 |

完整许可文本见 `vendor/marked.LICENSE.md`、`vendor/purify.LICENSE`、`vendor/bootstrap-icons/LICENSE` 和 `agents/LICENSE.agency-agents-zh`。项目自身使用 [MIT License](LICENSE)。
