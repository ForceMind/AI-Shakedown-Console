# 贡献指南

感谢改进 AI Shakedown Console。项目强调可审计、无构建部署、向后兼容和最小权限；请让每次修改都保持这个特点。

## 开始前

1. 阅读 [架构说明](./docs/ARCHITECTURE.md)。
2. 涉及凭据、代理、本机桥接或 Markdown 时阅读 [安全策略](./SECURITY.md)。
3. 检查现有 Issue/PR，避免重复工作。
4. 从最新 `main` 创建范围明确的分支。

## 项目原则

- 保持原生 HTML/CSS/JavaScript，不为小功能引入构建链。
- 运行时依赖必须固定版本并自托管在 `vendor/`。
- 新服务商优先使用现有三类协议，不复制整套请求逻辑。
- 不在客户端、Worker 或仓库中硬编码凭据。
- 本机能力必须默认最小权限，并明确不可消除的风险。
- 现有浏览器存储结构应向后兼容。
- 界面中文文案应简洁、可执行，与文档中的名称一致。
- 桌面和移动端都要保持键盘、触摸和可访问性行为。

## 修改入口

| 需求 | 主要文件 |
| --- | --- |
| 页面结构 | `index.html` |
| 视觉与响应式布局 | `style.css` |
| 协议、状态和交互 | `script.js` |
| Cloudflare 代理/缓存头 | `_worker.js` |
| 本机 CLI 适配 | `assets/local-codex-bridge.mjs` |
| 启动器 | `assets/launch-codex-*` |
| PWA | `assets/manifest.webmanifest`、`assets/service-worker.js` |
| 附件与 PDF | `script.js`、`vendor/pdf*.mjs`、`vendor/pdfjs.LICENSE` |
| 浏览器回归模拟服务 | `tests/mock-server.mjs`、`tests/fixtures/` |
| 智能体目录 | `agents/`、`scripts/import-agency-agents.mjs` |
| 用户与维护文档 | `README.md`、`docs/`、`CHANGELOG.md` |

## 本地检查

通过 HTTP 服务器打开项目，不要直接使用 `file://`：

```bash
python3 -m http.server 4173
```

基础检查：

```bash
node --check script.js
node --check _worker.js
node --check assets/service-worker.js
node --check assets/local-codex-bridge.mjs
node --check scripts/import-agency-agents.mjs
bash -n assets/launch-codex-macos.command
bash -n assets/launch-codex-linux.sh
git diff --check
```

根据改动范围手动验证：

- 远程 API 直连、流式和非流式回复；
- Cloudflare 同域代理与白名单拒绝；
- 中文输入法、发送快捷键和普通换行；
- 对话、配置、自定义智能体刷新恢复；
- 消息编辑分支、复制、选择、搜索、删除撤销、重试、继续和重新生成；
- OpenAI/Anthropic/Gemini 图片请求映射，支持/不支持模型的附件按钮显隐；
- 图片、文本和 PDF 附件选择、刷新恢复、发送与 IndexedDB 清理；
- 完整备份在独立 Origin 追加恢复全部对话、System、草稿、分支、智能体标记和附件，重复导入不生成副本；
- 第 5 个对话触发左侧列表；
- PWA 安装、更新提示和离线外壳；
- 三系统启动器的解析、错误提示和固定文件名；
- 本机桥接的 status/models/chat/shutdown，以及 Codex 默认 `ephemeral: true`、主动保存时为 `false`。
- Safari 用户代理下，本机工具应显示 WebKit 回环连接限制，下载和检测按钮应禁用；Edge/Chrome 路径仍应正常下载、自动发现并连接。

## 文档规范

- README 保持产品入口和快速导航，不重新堆回全部细节。
- 操作步骤写到对应 `docs/` 主题文档，并从文档中心链接。
- 用户可见变化写入 `CHANGELOG.md`。
- 按钮、菜单和错误信息使用界面中的真实名称。
- 命令必须可复制，路径或文件名变化时同步所有平台示例。
- 安全限制与已知风险不可只写在代码注释中。

## 版本与发布

用户可见修改通常需要新版本和 Cloudflare Pages ZIP；若维护者明确要求保持版本号，同一候选版必须更新内部 PWA 缓存修订并重新生成 ZIP。版本必须同步：

- README、CHANGELOG 和相关文档；
- `index.html` 版本文字与资源查询参数；
- `script.js`、`_worker.js`、本机桥接；
- manifest 图标查询参数；
- Service Worker 缓存名与预缓存 URL。

完整清单见 [部署与发布](./docs/DEPLOYMENT.md#正式发布清单)。发布包必须精确包含：

```text
index.html script.js style.css _worker.js vendor/ agents/ assets/
```

旧 ZIP 不应删除，除非维护者明确要求。

## Git 与 PR

- 每个 PR 只处理一个清晰目标。
- 不要混入无关格式化或用户本地改动。
- Commit 标题使用简短祈使或发布描述。
- PR 正文说明：改了什么、为什么、用户/维护者影响、根因（修复类）和验证结果。
- 远端 Git/`gh` 命令需要网络，应直接在允许网络访问的环境运行，不要先在隔离沙盒内试探认证或 DNS。
- 合并前确认版本、文档、测试和 ZIP 一致。

## 智能体上游

智能体目录由 268 个 `agency-agents-zh` 上游角色和 120 个项目事务型预设组成。项目预设应修改 `scripts/task-agent-presets.mjs`，然后运行：

```bash
node scripts/build-task-agent-presets.mjs agents
```

更新 `agency-agents-zh` 时使用导入脚本，不要手工批量复制角色文件；导入结束后会自动重新合并项目预设：

```bash
AGENCY_AGENTS_REVISION=<commit-sha> \
  node scripts/import-agency-agents.mjs /path/to/agency-agents-zh agents
```

保留上游许可证并在 README 的第三方组件表中同步版本。提交前运行 `node scripts/validate-agent-catalog.mjs agents`，确认目录总数为 388、项目预设为 120、正文路径完整，并回归“应用到当前对话”和两个取消入口。健康类预设不得诊断或调整处方；法律、财务和危险系统操作必须保留专业复核、备份、确认与回滚边界。

## 安全贡献

不要通过公开 PR 提交未披露漏洞的完整利用细节。请按照 [SECURITY.md](./SECURITY.md) 报告。

[返回文档中心](./docs/README.md) · [返回项目首页](./README.md)
