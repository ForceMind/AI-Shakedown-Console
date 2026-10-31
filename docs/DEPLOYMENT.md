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

`v32` UI 候选包（本轮只打包，不部署）：

```bash
zip -r AI-Shakedown-Console-cf-pages-worker-v32.zip \
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

若发布候选仍显示为同一个 `v32`，不要改公开版本号或 ZIP 名称；应把 Service Worker 的 shell/runtime 缓存修订从 `v32-rN` 增加到新的 `rN`，同时保持预缓存资源查询参数与 `index.html` 一致。注册必须保留 `updateViaCache: "none"`，否则已安装 PWA 可能继续使用 HTTP 缓存中的旧 Service Worker 脚本。

当前 `ui-chatgpt` 网页候选为 `v32`：Service Worker shell/runtime 缓存和样式查询参数使用 v32-r4，脚本继续使用 v32-r3，manifest 与图标保持 v32。保留 v31 的流式阅读位置修复；APK 原生版本和下载/预缓存 URL 保持 `AI-Shakedown-Console-v31-debug.apk?v=31-r1`。本轮只生成 ZIP 并推送分支，不部署，不重建 APK。

## Android APK 构建

Android 壳位于 `android/`，要求 JDK 17、Android SDK Platform 35 和 Build Tools 35.0.0。发布构建还必须存在被 Git 忽略的固定密钥 `.android-signing/debug.keystore`；缺失时构建会直接失败，必须从安全备份恢复，禁止生成另一把密钥后继续发布。Gradle Wrapper 已锁定到 8.9 并校验发行包 SHA-256：

```bash
cd android
./gradlew lintDebug assembleDebug
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk \
  AI-Shakedown-Console-v31-debug.apk
cp android/app/build/outputs/apk/debug/app-debug.apk \
  assets/AI-Shakedown-Console-v31-debug.apk
```

验证命令：

```bash
node scripts/validate-android-project.mjs
node scripts/validate-worker-assets.mjs
node scripts/validate-chat-layout.mjs
node scripts/validate-chat-compat.mjs
node scripts/validate-chat-cancellation.mjs
aapt dump badging AI-Shakedown-Console-v31-debug.apk
zipalign -c -v 4 AI-Shakedown-Console-v31-debug.apk
apksigner verify --verbose --print-certs AI-Shakedown-Console-v31-debug.apk
shasum -a 256 AI-Shakedown-Console-v31-debug.apk
```

`apksigner` 输出的签名证书 SHA-256 必须为：

```text
09:DF:BD:43:4D:09:74:0A:B6:39:C3:0E:B9:87:03:D0:96:5B:8F:D6:C1:8D:F2:5A:03:66:30:78:67:56:D6:2A
```

根目录 APK 是独立构建产物；同一字节内容会复制到 `assets/AI-Shakedown-Console-v31-debug.apk`，随 Cloudflare Pages ZIP 发布供网页下载。Debug 包只用于侧载测试；长期分发必须另行建立受保护的发布签名流程，签名私钥和密码不得进入仓库、ZIP 或 APK。

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
node scripts/validate-windows-launcher.mjs
node scripts/validate-generation-parameters.mjs
node scripts/validate-android-project.mjs
node scripts/validate-worker-assets.mjs
bash -n assets/launch-codex-macos.command
bash -n assets/launch-codex-linux.sh
git diff --check
```

Windows 校验脚本会确认前端下载 `.cmd`、包装层保持 ASCII 且低于 `cmd.exe` 单行限制、marker 后明文载荷可无损提取、临时 `.ps1` 带 UTF-8 BOM、所有占位符已替换且清理路径存在。正式候选还应在 Windows PowerShell 5.1 和 PowerShell 7 中执行解析检查，并至少从一个非默认、含空格和中文的下载目录双击实测。

### 3. PWA

- [ ] `assets/manifest.webmanifest` 是有效 JSON。
- [ ] 192、512、maskable 512 和 Apple 180 图标尺寸正确。
- [ ] Service Worker 缓存名与版本一致。
- [ ] v32 预缓存包含 `AI-Shakedown-Console-v31-debug.apk`，网页设置区下载链接与 APK 文件名、版本和 SHA-256 一致。
- [ ] Worker 对 APK 返回 `application/vnd.android.package-archive`、附件文件名、`nosniff` 和不可变缓存，不因导航请求带 `Accept: text/html` 而按网页处理。
- [ ] 预缓存 URL 查询参数与 `index.html` 一致。
- [ ] 新 Service Worker 能删除旧的 `ai-shakedown-console-*` 缓存。
- [ ] 已安装 PWA 能发现同版本内部缓存修订并显示“发现内容更新”。
- [ ] PWA/Android warm launch 先显示已缓存 shell，后台刷新 HTML；没有 shell 且断网时显示既有错误页/重试。

### 3A. Android APK

- [ ] `lintDebug` 与 `assembleDebug` 通过，且静态校验只允许 `INTERNET` 权限、HTTPS 正式 Origin 和系统文件选择器。
- [ ] APK 包名为 `com.forcemind.aishakedownconsole`，版本为 v31，最低 API 24、目标 API 35。
- [ ] Android 15+ 状态栏/刘海/横屏切口/手势导航安全区正确，Android 7–14 不出现双重 padding，软键盘不会覆盖输入区。
- [ ] IME 弹出时 WebView 可视视口收缩并保持当前输入框可见，关闭键盘后无 ghost padding；原生 Insets listener 不返回 `CONSUMED`。
- [ ] APK 通过 ZIP 对齐与签名验证，不包含 API Key、配对令牌、签名私钥或 `local.properties`。
- [ ] APK 证书 SHA-256 与项目固定指纹一致；密钥缺失时停止发布，不生成替代密钥。
- [ ] 真机验证首次加载、返回键、附件选择、外部链接、离线错误/重试和独立站点存储。

### 4. 聊天与多模态回归

- [ ] OpenAI Compatible、Anthropic 和 Gemini 的图片能力探测都发送正确协议结构。
- [ ] Temperature、Top P、Top K、Max Tokens 各自关闭后不出现在普通请求或多模态探测请求中，重新开启后恢复已保存数值。
- [ ] 支持图片的模型显示附件按钮，不支持或未知的配置不显示。
- [ ] 图片、文本和 PDF 可选择、刷新恢复并发送；请求检查器不显示图片 base64。
- [ ] 消息复制、编辑分支、搜索、选择、重试、继续和重新生成正常。
- [ ] System 只显示状态，编辑弹窗的保存、取消、`Esc` 与刷新恢复正常。
- [ ] 智能体库显示 388 个内置角色，健康/Linux/macOS/Windows 等事务型预设可搜索、预览和应用；聊天区 `×` 与角色库“取消当前智能体”均能恢复普通对话且保留历史消息。
- [ ] “导出全部”包含全部对话和 IndexedDB 附件；在独立 Origin 导入后，System、智能体标记、草稿、分支和附件均恢复，同一文件二次导入不重复。
- [ ] 本机 Codex 默认发起 `thread/start` 时为 `ephemeral: true`；打开“同时保存到 Codex”后为 `false`，切换模式会创建不同线程。
- [ ] 630×980 PWA 尺寸和桌面宽度下，输入区与聊天面板底部间隙均为 `0`；显示搜索/多选工具条后仍贴底。
- [ ] 打开 `http://127.0.0.1:4173/tests/mobile-layout.html`，7 个布局场景全部通过；该页只测试隔离的真实页面/CSS，不运行应用脚本或读取存储。
- [ ] 运行 `node scripts/validate-pwa-cache.mjs`，确认缓存 shell 立即返回、刷新由 `waitUntil` 执行、首次联网写入 shell、无缓存断网返回 503。
- [ ] iPhone Safari 与主屏幕应用实机验证首次聚焦聊天/System/设置输入框不自动放大；键盘开合后输入区正常，横竖屏下标题、发送区、侧栏、弹窗和提示消息避开系统安全区，手动缩放仍可用。

仓库内 `tests/mock-server.mjs` 提供无真实凭据的三协议回归上游；使用 `?no-sw=1` 打开本地页面可避免旧 Service Worker 干扰当前源文件测试。该参数仅用于本地回归，不改变正式 PWA 行为。

### 5. 发布包

```bash
unzip -t AI-Shakedown-Console-cf-pages-worker-v32.zip
zipinfo -1 AI-Shakedown-Console-cf-pages-worker-v32.zip
shasum -a 256 AI-Shakedown-Console-cf-pages-worker-v32.zip
```

- [ ] ZIP 顶层只有 `_worker.js`、`index.html`、`script.js`、`style.css`、`vendor/`、`agents/`、`assets/`，且 `assets/` 内包含已验证的 Android APK。
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

1. 打开线上页面，确认侧栏底部显示 `v32`。
2. 用中文输入法完成候选词选择，确认输入正常。
3. 检查远程 API 直连或同域代理。
4. 检查一个本机 AI 启动器能下载且文件名不包含版本号。
5. 模拟 Safari 用户代理时，本机工具显示 WebKit 回环限制，下载与检测按钮禁用；Edge/Chrome 路径保持可用。
6. 打开 `/api/status`，预期结构：

   ```json
   {
     "appVersion": "v32",
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

原有浏览器存储键在 `v32` 保持兼容，升级不会主动清空连接、API Key、自定义智能体或对话。Android APK 使用独立 WebView 存储，不会自动读取浏览器/PWA 数据；通过“导出全部 / 导入备份”迁移对话和附件，API Key 与连接配置仍需在 APK 中重新填写。Windows 桥接状态、生成参数开关、附件数据库和 Codex 保存开关无需迁移。

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
