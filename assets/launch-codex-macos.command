#!/bin/bash
set -euo pipefail

BRIDGE_URL="__BRIDGE_URL__"
RETURN_URL="__RETURN_URL__"
BRIDGE_TOKEN="__BRIDGE_TOKEN__"
BRIDGE_PORT="__BRIDGE_PORT__"
LOCAL_PROVIDER="__LOCAL_PROVIDER__"
CLI_COMMAND="__CLI_COMMAND__"
CLI_LABEL="__CLI_LABEL__"

fail() {
  echo ""
  echo "启动失败：$1"
  echo "按回车键关闭窗口。"
  read -r
  exit 1
}

command -v node >/dev/null 2>&1 || fail "没有找到 Node.js，请先安装 Node.js 18 或更高版本。"
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 版本过低，需要 18 或更高版本。"
LOCAL_CLI_BIN="$(command -v "$CLI_COMMAND" || true)"
[ -n "$LOCAL_CLI_BIN" ] || fail "没有找到 $CLI_LABEL，请先安装并完成登录。"
if [ "$LOCAL_PROVIDER" = "codex" ]; then
  "$LOCAL_CLI_BIN" login status >/dev/null 2>&1 || fail "Codex 尚未登录，请先在终端运行 codex login。"
else
  "$LOCAL_CLI_BIN" --version >/dev/null 2>&1 || fail "$CLI_LABEL 无法运行，请先单独启动它并完成登录。"
fi
command -v curl >/dev/null 2>&1 || fail "没有找到 curl。"

BRIDGE_TEMP="$(mktemp -t ai-shakedown-local-ai-bridge)"
BRIDGE_FILE="${BRIDGE_TEMP}.mjs"
mv "$BRIDGE_TEMP" "$BRIDGE_FILE"
trap 'rm -f "$BRIDGE_FILE"' EXIT
curl -fsSL "$BRIDGE_URL" -o "$BRIDGE_FILE" || fail "无法下载本地桥接程序。"

echo "正在启动 AI Shakedown Console 本地 $CLI_LABEL 连接……"
AI_SHAKEDOWN_BRIDGE_TOKEN="$BRIDGE_TOKEN" \
AI_SHAKEDOWN_BRIDGE_PORT="$BRIDGE_PORT" \
AI_SHAKEDOWN_ALLOWED_ORIGIN="$(printf '%s' "$RETURN_URL" | sed -E 's#^(https?://[^/]+).*$#\1#')" \
AI_SHAKEDOWN_RETURN_URL="$RETURN_URL" \
AI_SHAKEDOWN_LOCAL_PROVIDER="$LOCAL_PROVIDER" \
AI_SHAKEDOWN_LOCAL_CLI_BIN="$LOCAL_CLI_BIN" \
node "$BRIDGE_FILE"
