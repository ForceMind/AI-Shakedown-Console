# Android 壳应用

本目录包含 AI Shakedown Console 的最小 Android WebView 壳。它不复制网页业务逻辑，而是固定加载：

```text
https://ai-shakedown-console.pages.dev/?source=android
```

## 能力与边界

- 支持 Android 7.0（API 24）及以上；
- 使用 Android System WebView，启用 JavaScript、DOM Storage 和站点数据库；
- 通过系统文件选择器上传附件，不申请存储、相机、麦克风或定位权限；
- 只在应用内打开正式站点 Origin，其他 HTTP(S) 链接交给系统浏览器；
- 禁止明文 HTTP、混合内容、第三方 Cookie、网页弹窗和网页权限请求；
- SSL 验证失败时直接停止，不提供绕过入口；
- Android 15+ 对状态栏、刘海、横屏切口和底部导航栏应用动态安全区，软键盘使用 `adjustResize`；
- Android WebView 的站点数据与 Chrome/PWA 相互独立，不会自动继承 API Key、配置或对话；
- 本机 CLI 桥接仅支持桌面端，Android APK 不提供本机 Codex/Claude/Gemini CLI 连接；
- 这是便于侧载测试的简单 APK，不是带长期发布签名的 Play 商店包。

## 本地构建

需要 JDK 17、Android SDK Platform 35、Build Tools 35.0.0 和 Gradle 8.9。首次初始化后可运行：

```bash
cd android
./gradlew assembleDebug
cd ..
```

输出：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

连接启用 USB 调试的手机后安装：

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

本工作区会把本地 Debug 密钥保存在被 Git 忽略的 `.android-signing/debug.keystore`，后续构建优先复用它以支持覆盖安装。首次改用该密钥时，已安装的旧签名 APK 仍需卸载一次；卸载会删除 APK 内独立保存的配置与对话。密钥不得提交，迁移构建机器时应通过安全渠道单独备份。
