# AI Shakedown Console

一个无需构建步骤的多协议 AI API 调试页面，用于验证 API Key、模型名称、网关地址和流式响应。既可浏览器直连，也可通过 Cloudflare Pages Worker 同域转发，解决上游未开放 CORS 时的访问问题。

线上版本：[ai-shakedown-console.pages.dev](https://ai-shakedown-console.pages.dev/) · 当前版本：`v9` · Worker：`proxy-4`

## 功能概览

- 支持 OpenAI Compatible、Anthropic Messages 和 Google Gemini 三类协议。
- 支持流式响应、安全 Markdown 渲染、请求检查、Token 与费用统计。
- 支持配置库、提示词库、多对话页签，以及对话历史和连接配置的本地恢复。
- 支持读取模型列表、模型强弱排序和 OpenAI `reasoning_effort` 思考强度。
- 支持浏览器直连与 Cloudflare Pages Worker 同域代理，并限制代理上游白名单。
- 无构建步骤，图标、Markdown 解析器和 HTML 清洗器均随站点自托管。

AI 回复支持 GitHub Flavored Markdown，包括标题、列表、引用、链接、表格、行内代码和代码块。解析后的 HTML 会在显示前清洗；流式生成期间保持纯文本，完成或停止后再渲染 Markdown。

## 协议和预设

- OpenAI Compatible：OpenAI、DeepSeek、阿里云百炼/千问、火山引擎/豆包、腾讯混元、百度千帆/ERNIE、Moonshot/Kimi、智谱 GLM、SiliconFlow、OpenRouter、Groq、xAI、Mistral、Together AI、Perplexity、NVIDIA NIM、Fireworks AI、Cohere、Azure OpenAI、Ollama 和 LM Studio。
- Anthropic Messages：Anthropic 原生 `/v1/messages` 协议。
- Google Gemini：Gemini `generateContent` 和 SSE `streamGenerateContent` 协议。
- 自定义/自建站：可编辑 Base URL、请求路径、认证方式、自定义请求头和附加请求参数。

OpenAI Compatible 协议支持 `reasoning_effort` 思考强度。默认“自动”不会发送该字段，也可选择 `none`、`minimal`、`low`、`medium`、`high`、`xhigh` 或 `max`；具体模型可能只支持其中一部分。

思考强度下拉菜单位于左侧连接配置的模型选择器正下方。页面右下角显示当前前端版本；`/api/status` 同时返回 `appVersion` 和 Worker 版本。HTML 入口使用 `no-store`，避免新部署后继续显示旧页面。Bootstrap Icons 及其字体保存在站点本地，不依赖第三方 CDN。

预设的模型名称只是初始值，并按能力从强到弱排列。使用“读取”按钮请求模型列表后，服务端返回的模型会按能力标记、参数规模和版本号降序显示；选择“自定义模型…”可继续手动填写任意模型 ID。

## 配置库、提示词和多对话

- 配置库：填写名称后保存当前服务商、协议、地址、认证、API Key、模型、生成参数和费用设置；选择已保存配置后可加载、覆盖保存或删除。“新建”会退出当前选择，以便另存一份配置。
- 提示词库：填写提示词名称和 System 内容后保存；选择提示词后可加载到当前对话、覆盖保存或删除。
- 多对话：点击“新对话”打开新的对话页签。每个页签分别保存消息历史和 System 提示词，可随时切换或关闭；首次请求成功后，页签名称会自动取自用户消息。
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
assets/favicon.svg
```

可将以上文件按原目录结构压缩为 ZIP 后通过 Pages Direct Upload 创建生产部署。`_worker.js` 使用高级模式：`/api/proxy` 负责转发 API 请求，其他路径由 `env.ASSETS` 返回静态文件。

在项目根目录生成 `v9` 部署包：

```bash
zip -r AI-Shakedown-Console-cf-pages-worker-v9.zip \
  index.html script.js style.css _worker.js vendor assets
```

在 Pages 项目的“设置 → 变量和密钥”中，为生产环境配置普通文本变量：

```text
ALLOWED_UPSTREAMS=https://api.openai.com,https://api.anthropic.com,https://your-gateway.example.com:8443
```

值为英文逗号分隔的上游 Origin 白名单。Base URL 仍由页面填写并通过 `X-Upstream-URL` 传给 Worker；白名单只用于阻止部署变成任意开放代理。环境变量必须在部署前保存，修改后需要创建新的生产部署。

部署后可访问 `/api/status` 检查 Worker 状态。正常响应示例：

```json
{
  "appVersion": "v9",
  "workerVersion": "proxy-4",
  "allowedUpstreamsConfigured": true,
  "assetsBindingConfigured": true
}
```

部署完成后：

1. 打开线上页面，确认右下角显示 `v9`。
2. 访问 [`/api/status`](https://ai-shakedown-console.pages.dev/api/status)，确认 `appVersion` 为 `v9`、`workerVersion` 为 `proxy-4`。
3. 若浏览器仍显示旧入口，可访问 [`/?v=9`](https://ai-shakedown-console.pages.dev/?v=9) 绕过旧书签或中间缓存后再刷新。

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

完整许可文本见 `vendor/marked.LICENSE.md`、`vendor/purify.LICENSE` 和 `vendor/bootstrap-icons/LICENSE`。项目自身使用 [MIT License](LICENSE)。
