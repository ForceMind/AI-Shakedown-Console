# 本机 AI 连接指南

本机 AI 功能用于复用已经在当前电脑登录的 CLI。网页不会读取或上传 CLI 的认证文件，而是下载一个可检查的启动脚本，在 `127.0.0.1` 启动受限桥接。

支持：Codex、Antigravity、Gemini CLI、Claude Code 和 OpenCode。

浏览器要求：线上 HTTPS 部署的本机桥接使用 Edge 或 Chrome。Safari/WebKit 当前会阻止 HTTPS 页面访问 `http://127.0.0.1`；Safari Web App 可继续使用云端 API，但不能检测本机桥接。

## 开始前

需要满足：

1. 所选 CLI 已安装并完成登录。
2. Node.js 18 或更高版本可用，或者电脑上安装的 Codex 桌面版包含可复用运行时。
3. macOS/Linux 有系统自带的 `curl`；Windows 有 PowerShell 的 `Invoke-WebRequest`。

启动器会先自检，不会静默安装 Node.js、CLI 或修改登录信息。

## 标准流程

1. 在页面“服务商预设”选择所需工具的“本机登录”。
2. 确认页面识别的系统；必要时手动切换 macOS、Windows 或 Linux。
3. 点击“下载自检启动脚本”。文件名固定，不包含网页版本号。
4. 按当前系统的命令运行脚本。
5. 等待脚本检查 Node、CLI、登录状态和端口，并显示后台启动成功。
6. 保持原 Edge/Chrome 页面或 PWA 打开；它会自动发现桥接并连接，不再弹出重复窗口。若应用原本已关闭，脚本才会尝试唤起已安装应用。
7. 需要时点击“读取”模型；“检测连接”仍可用于手动复查。
8. 显示连接成功后可以关闭终端；桥接已在后台运行。

## Codex 最近任务与网页对话

本机 Codex 通过官方 App Server 维持当前网页对话的连续线程，但默认创建 `ephemeral` 临时任务：

- 网页中的对话仍正常保存在当前站点；
- 临时任务不会落盘，因此不会出现在 Codex 的最近任务列表；
- 关闭或重启桥接后，网页仍保留消息，但下一次请求会创建新的临时 App Server 线程并带入网页历史。

如果确实希望同一对话也出现在 Codex 中，可在本机 Codex 设置卡片主动打开“同时保存到 Codex”。开关改变后，下一条消息会使用与原模式分开的线程，避免把之前的临时任务意外转为可见任务。已经出现在 Codex 最近列表中的旧网页任务不会被本项目自动删除，需要在 Codex 中自行整理。

如果已安装的 Codex CLI 不支持 `ephemeral` 参数，桥接会停止这次请求并提示升级；它不会为了兼容而静默创建可见任务。参数语义见 [Codex App Server 官方文档](https://developers.openai.com/codex/app-server/)。

## macOS

以 Codex 为例，下载文件名为：

```text
ai-shakedown-codex-macos.command
```

打开“终端”，复制并执行：

```bash
bash "$HOME/Downloads/ai-shakedown-codex-macos.command"
```

请使用 `bash` 命令运行，不要直接双击文件。这样不依赖可执行权限，也不需要先执行 `chmod +x`。

如果当前页面是 Safari 或 Safari“添加到程序坞”生成的 Web App，请先复制站点网址并在 Edge/Chrome 普通标签页打开，再从那个标签页下载脚本。Safari 的 WebKit 传输限制无法靠重新运行脚本或允许本地网络权限解除。

如果浏览器给重复下载的文件增加了 `(1)`、空格或其他后缀：

1. 在终端输入 `bash` 和一个空格；
2. 把实际下载的文件拖进终端；
3. 按 `Enter`。

### macOS 权限提示

- “终端想要访问下载文件夹”：选择允许。
- 之前拒绝：打开“系统设置 → 隐私与安全性 → 文件与文件夹 → 终端”，开启“下载”访问。
- 不需要开启完整磁盘访问。
- 如果确实要双击：先为文件增加可执行权限，再在访达右键选择“打开”；推荐方式仍是上面的 `bash` 命令。

## Windows

以 Codex 为例，下载文件名为：

```text
ai-shakedown-codex-windows.ps1
```

打开 PowerShell，执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$HOME\Downloads\ai-shakedown-codex-windows.ps1"
```

`ExecutionPolicy Bypass` 只作用于这一次 PowerShell 进程，不会永久更改系统执行策略。

如果文件名被浏览器改动，可在 PowerShell 输入 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File `，再把实际文件拖入窗口并按回车。

## Linux

以 Codex 为例，下载文件名为：

```text
ai-shakedown-codex-linux.sh
```

打开终端，执行：

```bash
bash "$HOME/Downloads/ai-shakedown-codex-linux.sh"
```

如果下载目录不是 `~/Downloads`，把命令中的路径改为实际路径，或在 `bash ` 后把文件拖进终端。

## 其他工具的文件名

只需替换工具名称：

| 工具 | 文件名中的名称 |
| --- | --- |
| Codex | `codex` |
| Antigravity | `antigravity` |
| Gemini CLI | `gemini` |
| Claude Code | `claude` |
| OpenCode | `opencode` |

例如 Gemini CLI 的 macOS 文件名是 `ai-shakedown-gemini-macos.command`。

## 后台运行与停止

启动成功后，终端可以关闭。桥接进程继续在后台运行，只监听本机回环地址。

正常停止方式：

1. 打开网页“设置”。
2. 选择当前本机工具。
3. 点击“停止后台连接”。

页面会向桥接发送带随机令牌的 `/shutdown` 请求，并清除当前标签页的配对信息。

## 下载新版

直接重新下载并运行即可：

- 文件名不包含版本号，新下载可覆盖旧文件。
- 启动器会读取 PID 状态并停止同一工具旧桥接。
- 它还会尝试识别并清理没有状态文件的旧版 AI Shakedown 桥接。
- 不会停止无法确认归属的其他 Node 进程。
- 新桥接会重新下载与当前网页版本匹配的代码。

如果自动停止失败，先在网页点击“停止后台连接”，再运行新脚本。

## 端口处理

页面先随机选择 4510 附近的端口。启动器发现端口被占用时：

1. 不会结束占用端口的无关服务；
2. 会继续检查后续端口；
3. 最多尝试 100 个候选端口；
4. 当前页面使用随机令牌在这 100 个候选端口内自动发现实际桥接。

因此通常不需要手动改端口，也不会打开重复网页。只有没有任何原页面完成连接时，桥接才会唤起已安装应用，并通过配对参数传递实际端口。若连续 100 个端口都不可用，请先关闭不需要的本地服务再重试。

## 状态与日志

| 系统 | 目录 |
| --- | --- |
| macOS / Linux | `~/.cache/ai-shakedown-console/` |
| Windows | `%LOCALAPPDATA%\AI-Shakedown-Console\` |

每个工具分别保存桥接程序、日志和 PID，用于后台运行、更新和安全停止。目录中不保存 CLI 登录凭据。

常用文件包括：

- `<tool>.log`：桥接标准输出；
- `<tool>.error.log`：Windows 错误输出；
- `<tool>.pid`：后台进程号；
- `ai-shakedown-local-ai-bridge-<tool>.mjs`：当前桥接程序。

## 安全边界

- 只监听 `127.0.0.1`，不会对局域网公开。
- 每次下载生成新的高强度随机 Bearer 令牌。
- 桥接同时校验网页 Origin 和随机令牌。
- 配对令牌只保存在当前标签页 `sessionStorage`。
- CLI 认证由对应官方工具管理，网页与启动器不读取认证文件。
- Codex 默认创建不落盘的临时任务，只有用户主动打开“同时保存到 Codex”才写入最近任务。
- Codex、Gemini、Claude Code 和 OpenCode 使用各自可用的只读、计划或禁用工具模式。
- Antigravity 缺少等价的已文档化禁用工具参数，应视为 Beta，不要用于不可信提示词或敏感本地环境。

完整威胁边界见 [安全策略](../SECURITY.md)。

## 工具安装入口

- [Codex CLI](https://developers.openai.com/codex/cli/)
- [Codex App Server](https://developers.openai.com/codex/app-server/)
- [Antigravity CLI](https://codelabs.developers.google.com/antigravity-cli-hands-on)
- [Gemini CLI 无头模式](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/headless.md)
- [Claude Code CLI](https://code.claude.com/docs/en/cli-usage)
- [OpenCode CLI](https://opencode.ai/docs/cli/)

## 遇到问题

前往 [故障排查：本机桥接](./TROUBLESHOOTING.md#本机桥接与启动器)。

[返回文档中心](./README.md) · [返回项目首页](../README.md)
