# Android APK 使用与构建

v33-r2 默认打开 `https://ai-chat.xincreates.com/?source=android&shell=v33-r2`。包名和固定签名不变，versionCode 为 34，可覆盖安装固定签名线的旧版；无需卸载或清除应用数据。旧 Pages 地址的数据仍保存在原 WebView Origin，未删除、未自动合并到新域名。

## 安装与更新

从网页设置中的“Android APK”下载，或使用 [`AI-Shakedown-Console-v33-debug.apk`](../assets/AI-Shakedown-Console-v33-debug.apk)。这是侧载 Debug APK，不是 Play 商店发布包。

网页的“发现内容更新 → 立即刷新”更新的是网页/PWA，不会修改已安装 APK 的内置地址。默认域名与原生备份菜单需要覆盖安装此 APK 后才生效。

v33-r2 APK 的 SHA-256：

```text
885b1d3f4f894ce9506f44a99813998bd1481cf98752557e2dfb0579e441b034
```

固定签名证书 SHA-256：

```text
09:DF:BD:43:4D:09:74:0A:B6:39:C3:0E:B9:87:03:D0:96:5B:8F:D6:C1:8D:F2:5A:03:66:30:78:67:56:D6:2A
```

构建要求保留 `.android-signing/debug.keystore`；缺失时停止构建，不生成替代密钥。更早的一次性签名 APK 不属于固定签名升级线，必须先保全数据，不能直接按当前覆盖安装承诺处理。

## 旧地址数据与迁移

两个 HTTPS Origin 的存储互相隔离。新域名暂时没有旧聊天，不等于旧记录被删除。

1. 在 APK 顶部打开“站点与备份 → 查看旧地址数据”，确认后访问原 `ai-shakedown-console.pages.dev` 的 WebView 数据。
2. 停止生成后，使用同一菜单的“保存完整备份”，在 Android 系统文件保存器中选择位置。不要使用旧 WebView 对 Blob 下载的不完整支持来迁移。
3. 选择“打开正式域名”，进入网页“连接设置 → 完整备份与恢复 → 导入备份”，选择刚保存的 JSON。
4. 检查聊天、分支、草稿和附件。导入只追加并防止重复，不清除旧 Origin，也不覆盖新域名已有对话。

完整备份不加密，包含聊天与引用的附件、System、草稿和当前智能体元数据；不含 API Key、连接配置、配对令牌、CLI 认证或自定义智能体库。密钥与连接配置仍需在新域名重新填写。浏览器、PWA 与 APK 的存储也互不共享。

备份仅在用户选定系统文档后，向当前受信任 Origin 建立一次性消息端口，按 UTF-8 字节分块写入，最大 512 MiB。失败、超时或页面切换会关闭端口与输出流；未完成文件不能用于导入，旧数据不受影响。不会向网页暴露 Java 对象、任意路径访问或通用原生命令。

如果旧页面尚未更新，先用菜单重新加载；若保存超时，先确认网页已获得 v33-r2，再重试。新旧站点地址都精确限定为 HTTPS、标准端口与可信主机。

## 更新失败与重试

刷新前保存并核对草稿及附件引用；生成或备份处理中不刷新。另一窗口已改变会话时，更新、站点切换和导出会阻止旧快照覆盖，需先复制未保存草稿并重新打开页面；这不等于实现了所有并发编辑的自动合并。

缓存读写异常不会丢弃可用网络页面；刷新网络失败或返回错误时优先保留完好的缓存外壳。APK 的“重新加载”使用最后一个可信站点的明确刷新地址，可从错误页重试，也可通过原生菜单访问旧数据；不清理 WebView 数据、不忽略 SSL 错误。

`net::ERR_FAILED` 是通用导航失败，本次已修复并回归更新链路中的可复现缺口，不能据此断言所有设备、网络和 WebView 版本的同名错误均已消除。

## 安全与验证范围

- 仅申请 `INTERNET`，不增加相机、麦克风、定位或广泛存储权限；附件由系统文件选择器提供，备份由系统文档保存器提供。
- 应用内仅接受正式域名和保留的旧 Pages HTTPS Origin，其他 HTTP(S) 链接交给系统浏览器；本机 CLI 桥接仍只支持桌面。
- 明文 HTTP、混合内容、第三方 Cookie、网页弹窗和网页权限请求保持禁止；证书错误停止加载。
- Android 15+ 继续处理系统栏与刘海 Insets，键盘使用 `adjustResize`。
- 构建、Lint、签名和 ZIP 对齐已检查；浏览器已回归更新、排版、图片与跨 Origin 数据迁移。消息端口的浏览器测试使用测试端点模拟原生握手；Android 真机覆盖升级、系统文档保存器、软键盘和触摸手势仍需单独验收。

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
