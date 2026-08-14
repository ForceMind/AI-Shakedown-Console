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
