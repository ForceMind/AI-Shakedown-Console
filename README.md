# AI Shakedown Console

一个无需构建步骤的多协议 AI API 调试页面，用于验证 API Key、模型名称、网关地址和流式响应。既可浏览器直连，也可通过 Cloudflare Pages Worker 同域转发，解决上游未开放 CORS 时的访问问题。

线上版本：[ai-shakedown-console.pages.dev](https://ai-shakedown-console.pages.dev/) · 当前版本：`v23` · Worker：`proxy-6`

## 功能概览

- 支持 OpenAI Compatible、Anthropic Messages 和 Google Gemini 三类协议。
- 支持流式响应、安全 Markdown 渲染、请求检查、Token 与费用统计。
- 支持配置库、分为“内置 / 自定义”的智能体库、多对话页签，以及对话历史和连接配置的本地恢复；原提示词库内容会自动作为自定义智能体继续使用。
- 支持从本地 Codex、Gemini CLI、Claude Code 及通用 JSON / JSONL 记录导入历史对话。
- 支持复用本机已经登录的 Codex、Antigravity、Gemini CLI、Claude Code 和 OpenCode：网页自动识别 macOS、Windows 或 Linux，下载对应自检启动脚本后即可检测工具、读取模型并直接对话。启动器会检查 Node.js、CLI 和登录状态，停止同工具旧桥接；端口冲突时自动寻找空闲端口，并优先复用系统或 Codex 桌面版自带的 Node 运行时。桥接成功后转入后台，终端可以关闭，并可从网页设置中停止。
- 内置完整网页帮助：首次访问识别桌面或触摸环境并显示一次发送/换行说明；关闭后可通过消息输入框右上角的 `?` 随时重新打开。macOS 下载启动脚本后还会立即弹出运行教程，主动说明权限、文件名和隐私安全放行方法。
- 连接成功后自动进入专注聊天：隐藏连接配置与请求检查器，只保留聊天需要的内容；对话超过 4 个后自动固定为左侧列表，并在以后打开时保持。点击页头“设置”会在同一个左侧区域切换到连接、参数、用量与请求检查器，聊天区同步收缩。连接或请求失败时会自动返回设置并展开检查器。
- 内置 [agency-agents-zh](https://github.com/jnMetaCode/agency-agents-zh) 的 268 个中文专家角色，可按部门筛选、搜索、预览并应用到当前对话。
- 支持读取模型列表、模型强弱排序和 OpenAI `reasoning_effort` 思考强度。
- 支持浏览器直连与 Cloudflare Pages Worker 同域代理，并限制代理上游白名单。
- 支持 PWA 安装：Chrome、Edge 等支持的浏览器会在设置中显示安装入口；安装后使用独立窗口运行，离线仍可打开应用外壳和查看当前浏览器保存的配置、智能体与对话。远程模型调用仍需要网络，本机桥接需在同一台设备运行。
- 无构建步骤，图标、Markdown 解析器和 HTML 清洗器均随站点自托管。

AI 回复支持 GitHub Flavored Markdown，包括标题、列表、引用、链接、表格、行内代码和代码块。解析后的 HTML 会在显示前清洗；流式生成期间保持纯文本，完成或停止后再渲染 Markdown。

## 网页帮助与快捷键

首次在当前站点打开 `v23` 时，页面会识别操作系统和输入方式，自动显示一次使用帮助。关闭后不会反复弹出；消息输入框右上角始终保留一个小型 `?` 按钮，可重新查看快捷键、开始对话、对话与智能体、PWA 安装、连接排查以及数据隐私说明。

桌面键盘快捷键：

- macOS：`⌘ + Enter` 发送；`Shift + Enter` 换行。
- Windows / Linux：`Ctrl + Enter` 发送；`Shift + Enter` 换行。
- 普通 `Enter` 也会保留换行，适合输入多段提示词。
- 输入法正在组词时不会触发快捷发送；页面同时跟踪组合输入状态并兼容 macOS Safari 的 `keyCode 229`，避免中文候选词确认被误判成发送快捷键。

触摸设备会显示“点击发送按钮”和系统键盘的 `Return / Enter` 换行提示；连接外接键盘后仍可使用对应系统的组合键发送。首次帮助状态保存在 `ai-shakedown-console.help-intro.v1`，点击“清除全部本地数据”或清除站点数据后会再次显示。

## 专注聊天工作流

页面把连接准备和日常聊天分成两个自动切换的状态：

1. 首次进入或更换服务商时，左侧设置面板保持显示，用于配置连接、模型、生成参数和费用。
2. 点击“检查连接”或本机工具的“检测连接”。连接成功后，设置面板会自动收起，聊天区扩展到整个工作区。
3. 专注聊天状态只保留当前服务与模型、对话、智能体、System 内容、消息输入和发送操作。对话数达到 5 个时会自动转入左侧列表，并保存这个布局偏好；以后即使关闭部分对话也保持左侧列表。
4. 需要调整连接或查看底层请求时，点击页头“设置”。桌面端会在同一左侧区域由“对话”切换为“设置”，聊天区自动收窄；移动端会打开同一左侧抽屉。点击左侧顶部的“对话 / 设置”可随时切换。
5. 请求检查器已经合并到设置底部，可按需展开查看请求、响应、流式事件、HTTP 状态和耗时。
6. 连接或实际请求失败时，页面会自动返回设置并展开请求检查器；修复后重新检测或发送成功，即可再次进入专注聊天。

设置面板顶部的关闭按钮和页头“聊天”按钮都可以手动返回专注聊天，即使尚未检测连接也可以先收起设置。

## 协议和预设

- OpenAI Compatible：OpenAI、DeepSeek、阿里云百炼/千问、火山引擎/豆包、腾讯混元、百度千帆/ERNIE、Moonshot/Kimi、智谱 GLM、SiliconFlow、OpenRouter、Groq、xAI、Mistral、Together AI、Perplexity、NVIDIA NIM、Fireworks AI、Cohere、Azure OpenAI、Ollama 和 LM Studio。
- Anthropic Messages：Anthropic 原生 `/v1/messages` 协议。
- Google Gemini：Gemini `generateContent` 和 SSE `streamGenerateContent` 协议。
- 本机 AI 工具：Codex App Server，以及 Antigravity、Gemini CLI、Claude Code、OpenCode 的本地 CLI 桥接协议。
- 自定义/自建站：可编辑 Base URL、请求路径、认证方式、自定义请求头和附加请求参数。

OpenAI Compatible 和本机 Codex 支持思考强度。默认“自动”不会发送该字段，也可选择 `none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max` 或 `ultra`；其他本地 CLI 使用各自的默认推理设置。

思考强度下拉菜单位于左侧连接配置的模型选择器正下方。页面左上角副标题下方以极小文字显示当前前端版本，不会遮挡任何操作；`/api/status` 同时返回 `appVersion` 和 Worker 版本。HTML 入口使用 `no-store`，避免新部署后继续显示旧页面。Bootstrap Icons 及其字体保存在站点本地，不依赖第三方 CDN。

预设的模型名称只是初始值，并按能力从强到弱排列。使用“读取”按钮请求模型列表后，服务端返回的模型会按能力标记、参数规模和版本号降序显示；选择“自定义模型…”可继续手动填写任意模型 ID。

## 配置库、智能体和多对话

- 配置库：填写名称后保存当前服务商、协议、地址、认证、API Key、模型、生成参数和费用设置；选择已保存配置后可加载、覆盖保存或删除。“新建”会退出当前选择，以便另存一份配置。
- 智能体库：分为“内置智能体”和“自定义智能体”。内置区提供 268 个中文专家角色；自定义区可新建、编辑、保存、删除自己的 System 智能体，并应用到当前对话。原 `prompts.v1` 提示词库会自动显示在自定义区，无需手工迁移。
- 多对话：点击“新对话”打开新的对话页签。每个对话分别保存消息历史、System 和当前智能体，可随时切换或关闭；首次请求成功后，名称会自动取自用户消息。前 4 个使用顶部页签，从第 5 个开始自动转入左侧列表并持久保持，页面也会向用户说明这一规则。
- 本地记录：点击对话标签栏的“导入记录”，可选择单个/多个文件或整个目录。Codex 通常位于 `~/.codex/sessions/`，Gemini CLI 位于 `~/.gemini/tmp/*/chats/`，Claude Code 位于 `~/.claude/projects/`。导入后会生成独立对话页签，可用当前模型继续对话。
- 本机 AI 工具：在“服务商预设”选择 Codex、Antigravity、Gemini CLI、Claude Code 或 OpenCode 的“本机登录”预设，页面会自动选择当前操作系统的启动脚本。下载后按页面给出的命令运行，脚本会检查对应 CLI 是否可运行，将本地桥接转入后台，再用带工具标识和随机配对令牌的地址重新打开页面。显示成功后即可关闭终端；之后可点击“检测连接”和“读取”模型，无需向网页填写或复制 CLI 登录凭据。
- 连续对话：Codex 通过 App Server 保持线程；Antigravity 官方 `agy -p` 以及其他 CLI 的无头模式按单次调用运行，桥接会重放当前网页对话以维持上下文。选择较长的对话时会增加每次调用的输入量。
- 智能体库：点击输入区上方的“智能体库”进入统一界面。内置角色可筛选、搜索和预览；自定义智能体可直接编辑并保存。应用后会替换当前对话的 System Prompt，智能体标记随对话单独保存。
- 刷新恢复：当前配置、配置库、自定义智能体、对话、消息历史、当前激活项以及超过 4 个对话后的左侧布局都会自动恢复。

以上数据只保存在当前站点的浏览器存储中，不会同步到其他浏览器或设备。

## PWA 安装与离线能力

- 安装：使用 Chrome、Edge 或其他支持安装提示的浏览器访问 HTTPS 线上站点，打开“设置”，点击“安装为桌面应用”。若浏览器没有显示按钮，可使用地址栏或浏览器菜单中的“安装应用 / 添加到主屏幕”。Safari 可通过“文件 → 添加到程序坞”或 iPhone/iPad 分享菜单的“添加到主屏幕”。
- 独立运行：安装完成后可从 macOS 程序坞、Windows 开始菜单或移动设备主屏幕启动，不需要先打开普通浏览器标签页。
- 离线范围：页面框架、图标、Markdown 组件、智能体目录以及曾经打开过的静态角色内容会缓存。浏览器 `localStorage` 中保存的配置、自定义智能体和对话仍可查看与编辑。
- 网络边界：PWA 不会把远程模型变成本地模型。OpenAI、Anthropic、Gemini 和其他远程 API 仍需联网；本机 Codex 等桥接仅能在运行桥接的同一台电脑使用。
- 更新：每次发布使用新的缓存版本。已安装应用检测到新版本时会显示“立即刷新”，确认后切换到新资源；原有本地配置和对话不会被清空。

## 项目状态与可选后续

`v23` 在网页版本收尾里程碑上修复了中文输入法组合事件，并将版本标识移到左上角副标题下方；现有多协议连接、本机登录工具、对话导入、多对话、内置/自定义智能体、完整帮助、后台桥接、PWA 安装和离线能力保持不变。当前没有阻塞合并或正常使用的必需功能。

若以后重新启动开发，优先级较高但不属于当前收尾范围的增强包括：加密的整站数据导出/导入、可选的跨设备同步、Playwright 端到端回归测试，以及由 Tauri 管理本机桥接的原生桌面版。这些功能都可以在不改变现有浏览器数据结构的前提下增量实现。

## 本机桥接环境与 macOS 教程

启动器会先完成环境自检，不会静默安装或修改系统软件：

- Node.js：需要 18 或更高版本。macOS 和 Linux 会依次查找系统 `PATH`、Codex 桌面版自带运行时和常见安装目录；Windows 也会检查 Codex 自带运行时。使用 Codex 桌面版且运行时可用时，无需另外安装 Node.js。
- 本地 CLI：需要提前安装所选工具并完成登录。Codex 可按照 [OpenAI 官方 Codex CLI 教程](https://developers.openai.com/codex/cli/)安装；macOS/Linux 官方安装命令为 `curl -fsSL https://chatgpt.com/codex/install.sh | sh`，首次运行 `codex` 时完成登录。
- 下载工具：macOS/Linux 需要系统自带的 `curl`；Windows 使用 PowerShell 的 `Invoke-WebRequest`。

macOS 从下载到连接：

1. 在“服务商预设”选择所需的“本机登录”工具，系统选择 `macOS`。
2. 点击“下载自检启动脚本”。文件名固定且不含网页版本号，例如 Codex 始终为 `ai-shakedown-codex-macos.command`。新版可以直接覆盖旧下载；如果浏览器自动增加 `(1)`，可把实际文件拖入终端运行。下载开始后，页面会自动弹出专用的 macOS 运行教程。
3. 在弹窗中点击“复制运行命令”，打开“终端”，按 `⌘ + V` 粘贴，再按 `Enter` 执行：

   ```bash
   bash "$HOME/Downloads/ai-shakedown-codex-macos.command"
   ```

   不要直接双击 `.command` 文件。通过 `bash` 读取脚本不依赖可执行权限，因此不会触发“没有正确的访问权限”，也不需要 `chmod +x`。如果浏览器为重复下载的文件增加了 `(1)`、空格或其他后缀，可在终端输入 `bash `，把刚下载的文件拖进终端，再按回车。
4. 如果 macOS 弹出“终端想要访问下载文件夹”，选择允许。若此前拒绝，可到“系统设置 → 隐私与安全性 → 文件与文件夹 → 终端”开启“下载”访问；不需要开启完整磁盘访问。
5. 自检通过后脚本会把仅监听 `127.0.0.1` 的桥接放到后台，并用实际端口重新打开网页。看到“现在可以关闭终端”后即可关闭窗口；回到页面点击“检测连接”或“读取”模型。

停止、更新和端口处理：

- 正常停止：打开网页“设置”，在当前本机工具卡片中点击“停止后台连接”。终端不需要保持打开。
- 下载更新：直接下载并运行新版脚本。启动器会通过状态文件停止同一工具的旧桥接，也会清理没有状态文件的旧版 AI Shakedown 桥接，避免网页继续连接内存中的旧代码。
- 端口冲突：网页会预选一个本地端口。若该端口被其他程序占用，启动器不会结束无关程序，而是在 100 个候选端口内寻找下一个空闲端口，并将实际端口随配对地址传回网页。
- 自动停止失败：先在网页点击“停止后台连接”，再运行新脚本。启动器不会对无法确认归属的进程执行强制结束。
- 浏览器下载出现 `(1)`：优先删除旧下载后重新下载，恢复固定文件名；也可在终端输入 `bash `，把刚下载的实际文件拖入终端再按回车。
- 日志与状态：macOS/Linux 位于 `~/.cache/ai-shakedown-console/`，Windows 位于 `%LOCALAPPDATA%\AI-Shakedown-Console\`。每个工具分别保存 `.log`、`.pid` 和桥接程序，便于更新、停止与排查；其中不保存 CLI 登录凭据。

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
assets/manifest.webmanifest
assets/service-worker.js
assets/icon-192.png
assets/icon-512.png
assets/icon-maskable-512.png
assets/apple-touch-icon.png
```

可将以上文件按原目录结构压缩为 ZIP 后通过 Pages Direct Upload 创建生产部署。`_worker.js` 使用高级模式：`/api/proxy` 负责转发 API 请求，其他路径由 `env.ASSETS` 返回静态文件。

在项目根目录生成 `v23` 部署包：

```bash
zip -r AI-Shakedown-Console-cf-pages-worker-v23.zip \
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
  "appVersion": "v23",
  "workerVersion": "proxy-6",
  "allowedUpstreamsConfigured": true,
  "assetsBindingConfigured": true
}
```

部署完成后：

1. 打开线上页面，确认左上角副标题下方显示 `v23`，且输入区与操作按钮不再被版本号遮挡。
2. 在消息输入框中用中文输入法完成候选词选择，确认可以正常输入，再使用 `⌘ + Enter` 或 `Ctrl + Enter` 发送。
3. 访问 [`/api/status`](https://ai-shakedown-console.pages.dev/api/status)，确认 `appVersion` 为 `v23`、`workerVersion` 为 `proxy-6`。
4. 若浏览器仍显示旧入口，可访问 [`/?v=23`](https://ai-shakedown-console.pages.dev/?v=23) 绕过旧书签或中间缓存后再刷新。

### 浏览器缓存兼容

- `v23` 继续使用原有的 `ai-shakedown-console.settings.v1`、`profiles.v1`、`prompts.v1` 和 `conversations.v1` 存储键，升级部署不会清空原连接、API Key、自定义智能体和对话；`prompts.v1` 中的旧提示词会直接显示在自定义智能体区。左侧对话布局另存于 `ai-shakedown-console.conversation-sidebar.v1`。本地 AI 工具的配对令牌只保存在当前标签页的 `sessionStorage` 中。
- HTML、PWA manifest 和 Service Worker 由 Worker 返回 `no-cache` / `no-store` 更新策略；CSS、脚本、图标和本地桥接资源使用 `v23` 查询参数，Service Worker 使用 `shell-v23` 与 `runtime-v23` 缓存名，避免新旧界面资源混用。
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

- 当前连接配置、命名配置、自定义智能体、对话历史、生成参数、已读取模型和 API Key 会保存在当前站点的 `localStorage` 中，刷新或重启浏览器后自动恢复，直到用户点击“清除全部本地数据”或清除站点数据。
- 持久化 API Key 会增加同源脚本、浏览器扩展和 XSS 读取密钥的风险。只应在可信部署和个人设备上使用，不要在共享设备中保存生产密钥。
- 对话和自定义智能体也可能包含敏感业务信息；共享设备上使用完毕后应点击“清除全部本地数据”。
- 直连模式要求上游允许页面所在 Origin 的 CORS 请求。HTTPS 页面不能直连 HTTP 服务；本地 HTTP 页面调试 Ollama/LM Studio 时也需要正确的 CORS 配置。
- 同域代理模式会把浏览器中保存的 API Key 转发给白名单内的上游，但不会写入 Worker 配置或项目文件。
- `ALLOWED_UPSTREAMS` 必须保持最小范围。不要移除白名单校验并将 Worker 发布为任意目标代理。
- AWS Bedrock、Google Vertex AI 等需要 SigV4/OAuth 交互式签名的平台不适合直接在浏览器中保管长期凭据，应通过自建的 OpenAI-compatible 网关接入。
- 本地启动脚本不会读取、上传或显示各 CLI 的认证文件；登录状态和令牌刷新仍由本机 CLI 负责。桥接只监听 `127.0.0.1`，校验下载时生成的随机 Bearer 令牌和网页 Origin。页面配对令牌不写入持久化配置。
- Codex 以 `read-only` 沙盒和 `never` 审批策略启动；Gemini 使用 `plan` 审批模式；Claude Code 禁用内置与 MCP 工具并启用安全/计划模式；OpenCode 注入 `permission: deny` 的运行时配置。Antigravity 目前没有已文档化的等价禁用工具参数，因此桥接在独立临时工作目录中运行 `agy -p`，同时加入纯对话安全指令；它仍应视为 Beta，不要用来处理不可信提示词或敏感本地环境。
- 本地桥接依赖 Node.js 18+ 和所选 CLI。启动器将桥接程序、日志、进程号、实际端口和版本写入当前用户的状态目录，用于后台运行、排查以及安全停止同工具旧桥接；不保存 CLI 登录凭据。启动成功后关闭终端不会停止桥接，可从网页发送带随机令牌的 `/shutdown` 请求正常停止。升级 CLI 后如有兼容变化，应重新下载并运行最新版脚本。实现依据见 [Codex CLI](https://developers.openai.com/codex/cli/)、[Codex App Server](https://developers.openai.com/codex/app-server/)、[Antigravity CLI](https://codelabs.developers.google.com/antigravity-cli-hands-on)、[Gemini CLI 无头模式](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md)、[Claude Code CLI](https://code.claude.com/docs/en/cli-usage) 和 [OpenCode CLI](https://opencode.ai/docs/cli/) 官方文档。

## 桌面应用路线图

原生桌面封装列为 PWA 之后的可选后续计划，不包含在 `v23` 中。当前 PWA 已覆盖安装、独立窗口和离线打开，但原生封装仍可提供更深的本地进程管理：

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
