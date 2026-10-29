# Android APK 使用与构建

Android APK 是线上 AI Shakedown Console 的轻量 WebView 容器，适合在手机桌面直接启动。网页仍由 Cloudflare Pages 提供，因此网页功能更新不要求每次重新安装 APK；只有原生壳权限、目标网址、Android API 或签名变化时才需要更新 APK。v31-r1 的网页缓存修订可直接随线上页面生效；v31 APK 已包含进度条延迟改动。

## 安装

1. 在 AI Shakedown Console 网页设置区展开默认收起的“Android APK”，点击“下载 APK”；也可直接下载 [`AI-Shakedown-Console-v31-debug.apk`](../assets/AI-Shakedown-Console-v31-debug.apk)。
2. 在系统设置中仅为当前文件管理器或浏览器允许“安装未知应用”。
3. 打开 APK 并确认安装。
4. 首次启动需要联网加载正式站点。

这是 Debug 签名测试包，不适合直接提交到应用商店。本工作区已在被 Git 忽略的 `.android-signing/debug.keystore` 保留本次签名密钥，后续本地构建会继续使用同一签名并可覆盖安装。构建脚本在密钥缺失时会直接失败，不会退回到另一把默认调试密钥；请把该文件单独做安全备份，丢失后无法为已安装应用生成可升级的新 APK。从旧的一次性签名 APK 升级到本次 v30-r5 时仍需先卸载一次。卸载会同时删除 APK WebView 内保存的 API Key、配置、对话和附件引用，操作前先在应用中“导出全部”。

v31 Debug APK 的 SHA-256：

```text
40c4076da5c276b68868cea2a6def8ea384c8796701c88016996733d9de769f6
```

固定签名证书的 SHA-256 指纹：

```text
09:DF:BD:43:4D:09:74:0A:B6:39:C3:0E:B9:87:03:D0:96:5B:8F:D6:C1:8D:F2:5A:03:66:30:78:67:56:D6:2A
```

发布新的覆盖安装包前，必须用 `apksigner verify --verbose --print-certs` 核对该指纹。APK 文件哈希会随代码变化，证书指纹则必须保持不变。

## 手机端数据

APK、Chrome、浏览器 PWA 是三个独立的站点存储环境：

- 不共享 API Key、连接配置、Cookie、对话或附件；
- 可通过网页内“导出全部 / 导入备份”迁移对话和附件；
- 完整备份仍不包含 API Key 或连接配置；
- Android 系统备份对该 APK 已关闭，避免把 WebView 中的凭据和对话自动复制到云备份。

## 网络与安全

- APK 只申请 `INTERNET` 权限；
- 不申请相机、麦克风、定位或广泛存储权限；
- 附件选择通过 Android 系统文件选择器完成；
- 正式站点以外的 HTTP(S) 链接会交给默认浏览器；
- 禁止明文 HTTP 和 HTTPS 页面混合内容，因此 API 或自建网关必须提供 HTTPS，或通过受控的同域 Worker 代理；
- SSL 证书错误不会被忽略；
- APK 未注入 JavaScript 原生桥，不把 Android 系统对象暴露给网页。
- Android 15+ 强制 edge-to-edge 时，原生根容器按 `systemBars + displayCutout` 动态增加四边安全区；已处理类型在传入 WebView 前归零，避免网页再次产生双重安全区。
- Activity 显式使用 `adjustResize`，且 IME Insets 不在原生层消费；软键盘弹出时由 WebView 缩小可视视口并自动滚动到焦点输入框，键盘隐藏后同步恢复。

本机 CLI 桥接不适用于手机：`127.0.0.1` 在 Android 中指手机自身，Windows/macOS/Linux 启动脚本也不能在 APK 中运行。手机端应使用远程 HTTPS API。

## 已知限制

- APK 依赖 Android System WebView；系统 WebView 过旧会影响现代 JavaScript、IndexedDB 或文件选择行为，应通过应用商店更新系统 WebView。
- 系统文件选择器支持附件上传，但 Blob 下载、备份导出和外部文件保存会受具体 Android System WebView 版本影响；如下载没有出现，使用 Chrome 打开线上站点完成导出。
- 当前仅生成侧载用 Debug APK，没有 Play 商店签名、自动更新或 Digital Asset Links。

### 页面进入状态栏或底部导航栏

Android 15 对目标 API 35 应用强制 edge-to-edge。旧 APK 没有处理系统栏 Insets 时，网页标题、状态文字或输入区会与状态栏、刘海、手势条重叠。v31 APK 延续并验证了 v30-r5 的原生安全区处理，同时把 IME Insets 继续交给 WebView 收缩可视视口；必须重新下载并安装新 APK，网页部署本身不能修正旧 APK 的原生窗口布局。

### 点击下载却打开乱码页面

这是服务器响应头错误，不是 APK 内容变成文字。正确响应必须包含：

```text
Content-Type: application/vnd.android.package-archive
Content-Disposition: attachment; filename="AI-Shakedown-Console-v31-debug.apk"
X-Content-Type-Options: nosniff
```

v31-r1 Worker 已强制这些响应头并更新 PWA 缓存。部署后可用 `curl -I` 检查线上 APK；如果仍看到旧头，先确认 Cloudflare 部署内容与 Service Worker 已更新。

## 维护者构建

项目位于 `android/`，版本与网页发布版本同步。构建要求：

- JDK 17；
- Android SDK Platform 35；
- Android Build Tools 35.0.0；
- Gradle Wrapper 8.9；
- Android Gradle Plugin 8.7.3。

```bash
cd android
./gradlew clean assembleDebug
```

发布前至少检查：

1. `node scripts/validate-android-project.mjs` 通过；
2. `lintDebug` 与 `assembleDebug` 通过；
3. `aapt dump badging` 显示正确包名、版本、最低/目标 API；
4. `apksigner verify --verbose --print-certs` 通过；
5. 真机验证首次加载、刷新恢复、返回键、附件选择、外部链接、离线错误和重试；
6. 确认 APK 不含 API Key、配对令牌、签名私钥或用户数据。

源码入口与边界说明见 [`android/README.md`](../android/README.md)，网页/PWA 部署仍按[部署指南](./DEPLOYMENT.md)执行。
