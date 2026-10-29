# 浏览器回归服务

`mock-server.mjs` 同时提供当前静态站点和三个无凭据模拟接口，用于在不调用真实模型的情况下验证：

- OpenAI Compatible、Anthropic Messages、Gemini 的流式与非流式结构；
- `vision-model` 接受图片，`text-model` 明确拒绝图片；
- System 提示词是否映射到三类协议的正确字段；
- `error-model` 的普通消息返回 500，用于验证失败保留和重试；
- `/mock/assertions` 返回本次测试收到的协议、模型、System、图片和附件文字标记。

启动：

```bash
node tests/mock-server.mjs
```

打开 `http://127.0.0.1:4173/?no-sw=1`。`no-sw` 只用于让源文件回归不受旧 PWA 缓存影响。选择“自定义 / 自建站”，Base URL 按协议填写：

| 协议 | Base URL |
| --- | --- |
| OpenAI Compatible | `http://127.0.0.1:4173/mock/v1` |
| Anthropic Messages | `http://127.0.0.1:4173/mock` |
| Gemini | `http://127.0.0.1:4173/mock` |

认证方式选择“无认证”。附件夹具 `fixtures/sample-notes.md` 可验证文本读取和请求映射；图片可使用 `assets/icon-192.png`。PDF 应使用临时生成且包含文字层的小文件，不要把用户文档提交到仓库。

这个服务只监听 `127.0.0.1`，不应部署到公网，也不属于正式发布 ZIP。

## 生成期间滚动回归

启动上述服务后，在另一个终端执行（需要已有 Playwright 与 Chromium）：

```bash
node tests/chat-scroll.mjs
```

可通过 `PLAYWRIGHT_MODULE_PATH` 指定已安装的 `playwright/index.mjs` 绝对路径，通过 `CHROMIUM_PATH` 指定浏览器可执行文件；`TEST_BASE_URL` 默认 `http://127.0.0.1:4173`，`TEST_OUTPUT_DIR` 默认 `/tmp/ai-shakedown-chat-scroll`。

测试打开全新的隔离浏览器上下文，使用模拟 SSE 响应驱动真实页面，不读取已有浏览器数据、不调用真实模型。覆盖大块内容自动跟随、桌面滚轮上滑、Chromium 触摸手势、细微上滑、回到底部恢复跟随、新消息、正常完成、部分回复停止、流式失败和浏览器异常，并保存桌面/窄屏截图。触摸手势是 Chromium 模拟，手机 Safari、PWA 和 Android WebView 仍需真机补验。

## 智能体目录回归

运行以下命令验证 388 个目录项、268/120 来源拆分、正文路径、必备事务型角色、项目正文修订和医疗安全边界：

```bash
node scripts/validate-agent-catalog.mjs agents
```

浏览器回归还应分别搜索并应用“家庭医生信息助手（非诊断）”“Linux 系统专家”“macOS 系统专家”和“Windows 系统专家”，再测试聊天区角色标签的 `×` 和角色库底部“取消当前智能体”。两个入口都必须保留已有消息，只清除当前角色与对应 System。

## Windows 启动器回归

静态组装检查：

```bash
node scripts/validate-windows-launcher.mjs
```

该检查验证 `.cmd` 包装层、前端下载契约、明文 PowerShell 载荷 round-trip、UTF-8 BOM、ASCII 执行区、命令长度、占位符替换、临时文件清理、TLS 1.2 和受控旧进程停止。正式候选仍需在 Windows PowerShell 5.1 与 PowerShell 7 实机运行，覆盖默认/自定义下载目录、空格/中文/`(1)` 文件名、Node/CLI 缺失、非零退出码和成功后的临时文件清理。

## 生成参数开关回归

```bash
node scripts/validate-generation-parameters.mjs
```

该检查直接执行 `script.js` 中的请求体组装函数，确认四个开关关闭时即使输入框仍有数值、内部能力检查传入最大 Token 覆盖值，也不会发送 Temperature、Top P、Top K 或 Max Tokens；重新开启后恢复协议对应字段，Gemini 在全部关闭时不发送空的 `generationConfig`。

## Android APK 回归

```bash
node scripts/validate-android-project.mjs
cd android && ./gradlew lintDebug assembleDebug
```

静态检查确认 APK 只申请联网权限、固定正式 HTTPS Origin、禁止明文/混合内容/第三方 Cookie/网页权限/JavaScript 原生接口，SSL 错误必须取消，系统备份关闭，并包含 5 档启动图标。构建后继续执行 `aapt dump badging`、`zipalign -c`、`apksigner verify` 和敏感字符串扫描；`apksigner` 报告的证书 SHA-256 必须是 `09:DF:BD:43:4D:09:74:0A:B6:39:C3:0E:B9:87:03:D0:96:5B:8F:D6:C1:8D:F2:5A:03:66:30:78:67:56:D6:2A`。

真机测试矩阵：Android 7/当前稳定版至少各一台，覆盖首次联网加载、返回键、横竖屏恢复、状态栏/刘海/底部导航栏 Insets、软键盘 `adjustResize`、焦点输入框自动上移、键盘关闭后无 ghost padding、系统文件选择器多选、外链切出、离线失败页/重试、证书错误拒绝、WebView 数据独立，以及卸载前完整备份提示。Debug 签名不作为应用商店发布验证。

## Worker 静态资源头回归

```bash
node scripts/validate-worker-assets.mjs
```

该检查用带 `Accept: text/html` 的 APK 导航请求验证 Worker 仍返回 Android MIME、附件文件名、不可变缓存和 `nosniff`，同时确保文档和普通静态资源的既有缓存/透传行为不变，并确认 Service Worker 已推进到 v31-r2。下载 URL 为 `v=31-r1`。

## PWA 启动缓存回归

```bash
node scripts/validate-pwa-cache.mjs
```

该检查使用 Service Worker 的最小隔离运行环境验证：已有 shell 时先返回缓存页面、联网刷新通过 `waitUntil` 在后台完成；首次打开等待网络并写入 shell；无缓存且断网时返回 503，让 APK 显示现有错误页和重试按钮。

## iPhone 字号与安全区回归

启动上述服务后打开 `http://127.0.0.1:4173/tests/mobile-layout.html`，应显示 `PASS 7/7`。该页复制当前 HTML、加载真实 CSS，移除所有应用脚本并在不允许脚本的 iframe 中渲染；不读取或修改配置、聊天和凭据。

测试注入四边安全区尺寸，覆盖 390×844、430×932、844×390、740×375、375×667、630×980 和 1280×900。实际测量输入字号、横向溢出、输入区贴底、发送区安全距离、搜索/多选工具条、设置/对话侧栏、全部弹窗与提示消息；同时确认无安全区时不多留白，桌面原字号不变。

这是布局模拟，不是 iOS WebKit 实机测试。发布前还需在 iPhone Safari 和主屏幕应用中验证首次点击输入框、软键盘弹出/收起、横竖屏、后台恢复及手动缩放；不能把桌面浏览器的字号或几何检查当作自动缩放已经实机通过。

## UI 状态检查（无需浏览器）

```bash
node scripts/validate-chat-layout.mjs
node scripts/validate-chat-compat.mjs
```

检查页面 ID 与脚本引用、桌面侧栏开合、手机抽屉、连接设置切换、跨断点状态、隐藏侧栏的 `inert` / 焦点恢复，以及 v31 流式阅读位置保持。使用 Node VM 与控件替身，不渲染页面，不读取浏览器数据，也不调用模型；通过此检查不能视为视觉或浏览器交互验收通过。

`validate-chat-compat.mjs` 另用 Node VM 验证健康/Linux/macOS/Windows 角色搜索、应用和两个取消入口保留历史，并以 App Server RPC stub 核对临时/持久线程的精确载荷、模式隔离及旧 CLI 拒绝 `ephemeral` 时停止请求；不会启动真实 CLI 或调用模型。

v32-r2 已获授权并运行移动布局回归页：7 组场景、547 项检查通过，使用模拟消息覆盖气泡、正文、按钮和贴底布局。实际页面复查桌面/手机视口、提示词弹窗与侧栏抽屉。`chat-scroll.mjs` 本轮未运行，真实设备仍未验收。
