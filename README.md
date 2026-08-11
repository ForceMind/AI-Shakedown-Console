# AI Shakedown Console

一个无需构建步骤的多协议 AI API 调试页面，用于验证 API Key、模型名称、网关地址和流式响应。既可浏览器直连，也可通过 Cloudflare Pages Worker 同域转发，解决上游未开放 CORS 时的访问问题。

## 协议和预设

- OpenAI Compatible：OpenAI、DeepSeek、阿里云百炼/千问、火山引擎/豆包、腾讯混元、百度千帆/ERNIE、Moonshot/Kimi、智谱 GLM、SiliconFlow、OpenRouter、Groq、xAI、Mistral、Together AI、Perplexity、NVIDIA NIM、Fireworks AI、Cohere、Azure OpenAI、Ollama 和 LM Studio。
- Anthropic Messages：Anthropic 原生 `/v1/messages` 协议。
- Google Gemini：Gemini `generateContent` 和 SSE `streamGenerateContent` 协议。
- 自定义/自建站：可编辑 Base URL、请求路径、认证方式、自定义请求头和附加请求参数。

预设的模型名称只是初始值。使用“读取”按钮请求模型列表后，服务端返回的模型会显示在标准下拉框中；选择“自定义模型…”可继续手动填写任意模型 ID。

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
```

可将这四个文件压缩为 ZIP 后通过 Pages Direct Upload 创建生产部署。`_worker.js` 使用高级模式：`/api/proxy` 负责转发 API 请求，其他路径由 `env.ASSETS` 返回静态文件。

在 Pages 项目的“设置 → 变量和密钥”中，为生产环境配置普通文本变量：

```text
ALLOWED_UPSTREAMS=https://api.openai.com,https://api.anthropic.com,https://your-gateway.example.com:8443
```

值为英文逗号分隔的上游 Origin 白名单。Base URL 仍由页面填写并通过 `X-Upstream-URL` 传给 Worker；白名单只用于阻止部署变成任意开放代理。环境变量必须在部署前保存，修改后需要创建新的生产部署。

部署后可访问 `/api/status` 检查 Worker 状态。正常响应示例：

```json
{
  "workerVersion": "proxy-2",
  "allowedUpstreamsConfigured": true,
  "assetsBindingConfigured": true
}
```

## 自建站配置

1. 选择“自定义 / 自建站”。
2. 选择服务端实际支持的协议。
3. 填写 Base URL、请求路径、模型 ID 和认证方式。
4. 上游未开放 CORS 且页面部署在 Cloudflare Pages 时，开启“使用同域代理”。
5. 若网关需要额外请求头或参数，在“高级连接设置”中以 JSON 对象填写。

路径支持 `{model}` 占位符。Gemini 路径还支持 `{action}`，页面会根据流式开关替换为 `generateContent` 或 `streamGenerateContent?alt=sse`。

## 安全和网络边界

- API Key 只保存在当前页面内存中，不会写入 `localStorage`。请勿在不可信的部署页面中填写生产密钥。
- 直连模式要求上游允许页面所在 Origin 的 CORS 请求。HTTPS 页面不能直连 HTTP 服务；本地 HTTP 页面调试 Ollama/LM Studio 时也需要正确的 CORS 配置。
- 同域代理模式会把用户输入的 API Key 临时转发给白名单内的上游，但不会写入 Worker 配置、浏览器存储或项目文件。请勿在不可信部署中填写生产密钥。
- `ALLOWED_UPSTREAMS` 必须保持最小范围。不要移除白名单校验并将 Worker 发布为任意目标代理。
- AWS Bedrock、Google Vertex AI 等需要 SigV4/OAuth 交互式签名的平台不适合直接在浏览器中保管长期凭据，应通过自建的 OpenAI-compatible 网关接入。

## 调试信息

“请求检查器”会显示脱敏后的 URL 和请求头、完整请求体、响应体和最近的 SSE 事件。Token 和费用只在 API 返回 usage 时累计；价格需按当前服务商手动填写。
