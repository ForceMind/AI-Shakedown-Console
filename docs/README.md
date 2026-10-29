# AI Shakedown Console 文档中心

这里按“你现在要完成什么”组织文档，不需要从头读到尾。

## 选择入口

| 目标 | 推荐文档 |
| --- | --- |
| 第一次打开页面并发送消息 | [使用指南](./USER_GUIDE.md#第一次连接) |
| 编辑 System、复制、搜索、导出消息或使用附件 | [使用指南：System 提示词](./USER_GUIDE.md#system-提示词) |
| 把全部对话和附件迁移到另一台电脑 | [使用指南：完整备份与跨设备恢复](./USER_GUIDE.md#完整备份与跨设备恢复) |
| 使用本机登录的 Codex、Gemini 等工具 | [本机 AI 指南](./LOCAL_AI.md) |
| 把应用安装到 Android 手机 | [Android APK](./ANDROID.md) |
| `.command` 没权限、Node 未找到或端口冲突 | [故障排查](./TROUBLESHOOTING.md) |
| 安装 PWA 或理解离线范围 | [使用指南：PWA](./USER_GUIDE.md#安装-pwa) |
| iPhone 点输入框放大或底部小横条遮挡 | [故障排查：iPhone 显示](./TROUBLESHOOTING.md#iphone-输入框自动放大或底部小横条遮挡) |
| Edge PWA 输入拼音但没有候选窗 | [故障排查：Edge PWA 中文输入](./TROUBLESHOOTING.md#edge-pwa-输入拼音但没有候选窗) |
| Safari Web App 无法检测本机 Codex | [故障排查：页面无法访问 127.0.0.1](./TROUBLESHOOTING.md#页面无法访问-127001) |
| 部署到 Cloudflare Pages | [部署与发布](./DEPLOYMENT.md) |
| 理解代码、数据流和安全设计 | [架构说明](./ARCHITECTURE.md) |
| 查看 v32 UI 范围与验收状态 | [UI 改版记录](./UI-REDESIGN.md) |
| 提交修改 | [贡献指南](../CONTRIBUTING.md) |
| 查看版本变化 | [版本记录](../CHANGELOG.md) |
| 了解凭据和本机权限边界 | [安全策略](../SECURITY.md) |

## 角色视角

### 普通用户

建议依次阅读：

1. [使用指南](./USER_GUIDE.md)
2. 如需安装手机壳应用，阅读 [Android APK](./ANDROID.md)
3. 如需复用本机登录，再读 [本机 AI 指南](./LOCAL_AI.md)
4. 出现错误时按提示前往 [故障排查](./TROUBLESHOOTING.md)

### 部署者

建议依次阅读：

1. [安全策略](../SECURITY.md)
2. [部署与发布](./DEPLOYMENT.md)
3. [架构说明](./ARCHITECTURE.md)

### 维护者

建议依次阅读：

1. [架构说明](./ARCHITECTURE.md)
2. [贡献指南](../CONTRIBUTING.md)
3. [部署与发布：发布清单](./DEPLOYMENT.md#正式发布清单)
4. [版本记录](../CHANGELOG.md)

## 文档约定

- 命令默认在项目根目录运行，除非文中另有说明。
- 当前分支网页/PWA 候选为 `v32`，Android 壳与 APK 保持 `v31`；`main` / `dev` 为 v31 基线，`proxy-6` 表示 Worker 接口版本。
- 页面显示文字以当前发布版为准；文档中的目录和按钮名称与中文版界面一致。
- 本机桥接统称“本机 AI”，实际支持 Codex、Antigravity、Gemini CLI、Claude Code 和 OpenCode。

[返回项目首页](../README.md)
