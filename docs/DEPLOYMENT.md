# 部署与发布

项目是无构建步骤的静态站点，并使用 Cloudflare Pages Advanced Mode `_worker.js` 提供同域代理和静态资源响应头。

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 4173
```

或在 macOS 使用系统 Ruby：

```bash
ruby -run -e httpd . -p 4173 -b 127.0.0.1
```

打开 `http://localhost:4173/`。

普通静态服务器不会运行 `_worker.js`，所以：

- 本地预览时关闭“使用同域代理”；
- `/api/status` 和 `/api/proxy` 只在 Cloudflare Pages 环境中可用；
- localhost 可注册 PWA，但普通服务器可能没有为根作用域提供 `Service-Worker-Allowed` 响应头。

## Cloudflare Pages 部署内容

部署包必须只包含以下站点输入及其目录内容：

```text
index.html
script.js
style.css
_worker.js
vendor/
agents/
assets/
```

其中：

- `vendor/` 包含自托管前端库、字体和许可证，包括 PDF.js 主模块、Worker 和 Apache-2.0 许可文本；
- `agents/` 包含角色索引、正文和上游许可证；
- `assets/` 包含 PWA manifest、Service Worker、图标、本机桥接与三系统启动器。

README、`docs/`、开发脚本和旧 ZIP 不属于站点部署包。

## 环境变量

在 Cloudflare Pages 项目的“设置 → 变量和密钥”中，为生产环境添加普通文本变量：

```text
ALLOWED_UPSTREAMS=https://api.openai.com,https://api.anthropic.com,https://your-gateway.example.com:8443
```

规则：

- 多个 Origin 使用英文逗号分隔；
- 可以省略 `https://`，但明确写出协议更易审计；
- 只填写 Origin，不填写路径；
- 非默认端口必须写出；
- 修改变量后需要创建新部署才能生效；
- 保持最小白名单，不要允许不受信任的上游。

Worker 只允许 HTTPS 上游、GET/POST 方法和不超过 20 MiB 的请求体，并拒绝 URL 内嵌用户名、密码或直接携带 `key` 查询参数。20 MiB 用于容纳单条最多 12 MiB 图片附件经过 base64 后的完整 JSON；Worker 会读取并复核实际字节数。

## 手动创建发布包

正式 `v27` 包：

```bash
zip -r AI-Shakedown-Console-cf-pages-worker-v27.zip \
  index.html script.js style.css _worker.js vendor agents assets
```

上传 ZIP 到 Cloudflare Pages Direct Upload。`_worker.js` 使用 Advanced Mode：

- `/api/status` 返回网页、Worker 和环境状态；
- `/api/proxy` 校验白名单后转发请求；
- 其他路径通过 `env.ASSETS` 返回静态文件。

## 版本同步规则

每个用户可见版本都必须同步以下位置：

| 位置 | 内容 |
| --- | --- |
| `README.md` / `CHANGELOG.md` / 文档 | 当前版本与发布说明 |
| `index.html` | 左上角版本号和静态资源查询参数 |
| `script.js` | `APP_VERSION` |
| `_worker.js` | `APP_VERSION` |
| `assets/local-codex-bridge.mjs` | `BRIDGE_VERSION` |
| `assets/manifest.webmanifest` | PWA 图标查询参数 |
| `assets/service-worker.js` | shell/runtime 缓存名和预缓存查询参数 |

只改其中一处会导致页面、PWA 或本机启动器继续使用旧资源。

若发布候选仍显示为同一个 `v27`，不要改公开版本号或 ZIP 名称；应把 Service Worker 的 shell/runtime 缓存修订从 `v27-rN` 增加到新的 `rN`，同时保持预缓存资源查询参数与 `index.html` 一致。注册必须保留 `updateViaCache: "none"`，否则已安装 PWA 可能继续使用 HTTP 缓存中的旧 Service Worker 脚本。

## 正式发布清单

### 1. 代码与版本

- [ ] 工作区只包含本次修改。
- [ ] 所有版本位置已同步。
- [ ] README、详细文档和 CHANGELOG 已更新。
- [ ] 旧浏览器存储键保持兼容，或已写明迁移策略。

### 2. 语法与格式

```bash
node --check script.js
node --check _worker.js
node --check assets/service-worker.js
node --check assets/local-codex-bridge.mjs
node --check scripts/import-agency-agents.mjs
node --check scripts/task-agent-presets.mjs
node --check scripts/build-task-agent-presets.mjs
node --check scripts/validate-agent-catalog.mjs
node scripts/validate-agent-catalog.mjs agents
bash -n assets/launch-codex-macos.command
bash -n assets/launch-codex-linux.sh
git diff --check
```

Windows 启动器应在可用的 PowerShell 环境中执行解析检查。

### 3. PWA

- [ ] `assets/manifest.webmanifest` 是有效 JSON。
- [ ] 192、512、maskable 512 和 Apple 180 图标尺寸正确。
- [ ] Service Worker 缓存名与版本一致。
- [ ] 预缓存 URL 查询参数与 `index.html` 一致。
- [ ] 新 Service Worker 能删除旧的 `ai-shakedown-console-*` 缓存。
- [ ] 已安装 PWA 能发现同版本内部缓存修订并显示“发现内容更新”。

### 4. 聊天与多模态回归

- [ ] OpenAI Compatible、Anthropic 和 Gemini 的图片能力探测都发送正确协议结构。
- [ ] 支持图片的模型显示附件按钮，不支持或未知的配置不显示。
- [ ] 图片、文本和 PDF 可选择、刷新恢复并发送；请求检查器不显示图片 base64。
- [ ] 消息复制、编辑分支、搜索、选择、重试、继续和重新生成正常。
- [ ] System 只显示状态，编辑弹窗的保存、取消、`Esc` 与刷新恢复正常。
- [ ] 智能体库显示 388 个内置角色，健康/Linux/macOS/Windows 等事务型预设可搜索、预览和应用；聊天区 `×` 与角色库“取消当前智能体”均能恢复普通对话且保留历史消息。
- [ ] “导出全部”包含全部对话和 IndexedDB 附件；在独立 Origin 导入后，System、智能体标记、草稿、分支和附件均恢复，同一文件二次导入不重复。
- [ ] 本机 Codex 默认发起 `thread/start` 时为 `ephemeral: true`；打开“同时保存到 Codex”后为 `false`，切换模式会创建不同线程。
- [ ] 630×980 PWA 尺寸和桌面宽度下，输入区与聊天面板底部间隙均为 `0`；显示搜索/多选工具条后仍贴底。

仓库内 `tests/mock-server.mjs` 提供无真实凭据的三协议回归上游；使用 `?no-sw=1` 打开本地页面可避免旧 Service Worker 干扰当前源文件测试。该参数仅用于本地回归，不改变正式 PWA 行为。

### 5. 发布包

```bash
unzip -t AI-Shakedown-Console-cf-pages-worker-v27.zip
zipinfo -1 AI-Shakedown-Console-cf-pages-worker-v27.zip
shasum -a 256 AI-Shakedown-Console-cf-pages-worker-v27.zip
```

- [ ] ZIP 顶层只有 `_worker.js`、`index.html`、`script.js`、`style.css`、`vendor/`、`agents/`、`assets/`。
- [ ] ZIP 文件数与这些源目录文件数一致。
- [ ] 从 ZIP 内读取 `index.html` 和 Service Worker，确认版本正确。
- [ ] 不删除历史发布包，除非维护者明确要求。

### 6. GitHub

- [ ] 在独立分支提交明确范围的修改。
- [ ] 推送分支并创建 PR。
- [ ] PR 描述包含变更、原因、影响和验证结果。
- [ ] 确认 PR 可合并后合并到 `main`。
- [ ] 本地 `main` 快进同步到 `origin/main`，工作区保持干净。

所有会访问 GitHub 的 `gh` 或远端 Git 命令应直接在允许网络访问的环境执行，不要先在隔离沙盒内试探认证或网络。

## 部署后检查

1. 打开线上页面，确认左上角显示 `v27`。
2. 用中文输入法完成候选词选择，确认输入正常。
3. 检查远程 API 直连或同域代理。
4. 检查一个本机 AI 启动器能下载且文件名不包含版本号。
5. 模拟 Safari 用户代理时，本机工具显示 WebKit 回环限制，下载与检测按钮禁用；Edge/Chrome 路径保持可用。
6. 打开 `/api/status`，预期结构：

   ```json
   {
     "appVersion": "v27",
     "workerVersion": "proxy-6",
     "allowedUpstreamsConfigured": true,
     "assetsBindingConfigured": true
   }
   ```

6. 已安装 PWA 时确认出现更新提示，刷新后仍保留配置与对话。
7. 若入口仍使用旧资源，访问 `/?refresh=27` 后刷新。

## 缓存策略

- HTML：`no-cache, no-store, must-revalidate`；
- manifest 与 Service Worker：`no-cache, must-revalidate`；
- 智能体索引：`no-cache, must-revalidate`；
- 智能体正文和其他带版本静态资源：长期 immutable 缓存；
- PWA：版本化 shell/runtime 缓存，激活时删除旧项目缓存。

原有浏览器存储键在 `v27` 保持兼容，升级不会主动清空连接、API Key、自定义智能体或对话。新增的项目预设与智能体取消入口沿用原有 `systemPrompt` / `activeAgent` 结构，不需要数据迁移；System 编辑弹窗、完整备份、附件数据库、多模态能力缓存和 Codex 保存开关均按原有规则保留。

## 更新智能体库

只重建项目自带的 120 个事务型预设：

```bash
node scripts/build-task-agent-presets.mjs agents
```

准备好上游 `agency-agents-zh` 本地目录后，可重建 268 个上游角色并自动重新合并项目预设：

```bash
node scripts/import-agency-agents.mjs /path/to/agency-agents-zh agents
```

如需记录确切上游提交：

```bash
AGENCY_AGENTS_REVISION=<commit-sha> \
  node scripts/import-agency-agents.mjs /path/to/agency-agents-zh agents
```

导入或生成后确认 `agents/index.json` 总数为 388、`sources` 分别为 268 和 120、所有正文路径存在，并检查 `agents/LICENSE.agency-agents-zh`，再执行完整发布清单。不要直接编辑生成的 `agents/content/task-presets/*.md`；应修改 `scripts/task-agent-presets.mjs` 后重建。

[返回文档中心](./README.md) · [贡献指南](../CONTRIBUTING.md) · [返回项目首页](../README.md)
