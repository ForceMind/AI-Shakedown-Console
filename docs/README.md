# AI Shakedown Console 文档中心

这里按“你现在要完成什么”组织文档，不需要从头读到尾。

## 选择入口

| 目标 | 推荐文档 |
| --- | --- |
| 第一次打开页面并发送消息 | [使用指南](./USER_GUIDE.md#第一次连接) |
| 编辑 System、复制、搜索、导出消息或使用附件 | [使用指南：System 提示词](./USER_GUIDE.md#system-提示词) |
| 把全部对话和附件迁移到另一台电脑 | [使用指南：完整备份与跨设备恢复](./USER_GUIDE.md#完整备份与跨设备恢复) |
| 使用本机登录的 Codex、Gemini 等工具 | [本机 AI 指南](./LOCAL_AI.md) |
| `.command` 没权限、Node 未找到或端口冲突 | [故障排查](./TROUBLESHOOTING.md) |
| 安装 PWA 或理解离线范围 | [使用指南：PWA](./USER_GUIDE.md#安装-pwa) |
| Edge PWA 输入拼音但没有候选窗 | [故障排查：Edge PWA 中文输入](./TROUBLESHOOTING.md#edge-pwa-输入拼音但没有候选窗) |
| 部署到 Cloudflare Pages | [部署与发布](./DEPLOYMENT.md) |
| 理解代码、数据流和安全设计 | [架构说明](./ARCHITECTURE.md) |
| 提交修改 | [贡献指南](../CONTRIBUTING.md) |
| 查看版本变化 | [版本记录](../CHANGELOG.md) |
| 了解凭据和本机权限边界 | [安全策略](../SECURITY.md) |

## 角色视角

### 普通用户

建议依次阅读：

1. [使用指南](./USER_GUIDE.md)
2. 如需复用本机登录，再读 [本机 AI 指南](./LOCAL_AI.md)
3. 出现错误时按提示前往 [故障排查](./TROUBLESHOOTING.md)

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
- `v26` 表示网页与 PWA 资源版本；`proxy-6` 表示 Worker 接口版本，两者独立。
- 页面显示文字以当前发布版为准；文档中的目录和按钮名称与中文版界面一致。
- 本机桥接统称“本机 AI”，实际支持 Codex、Antigravity、Gemini CLI、Claude Code 和 OpenCode。

[返回项目首页](../README.md)
