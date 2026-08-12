#!/usr/bin/env bash
set -euo pipefail

BRIDGE_URL="__BRIDGE_URL__"
RETURN_URL="__RETURN_URL__"
BRIDGE_TOKEN="__BRIDGE_TOKEN__"
BRIDGE_PORT="__BRIDGE_PORT__"

fail() {
  echo "启动失败：$1" >&2
  exit 1
}

command -v node >/dev/null 2>&1 || fail "没有找到 Node.js，请先安装 Node.js 18 或更高版本。"
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 版本过低，需要 18 或更高版本。"
CODEX_BIN="$(command -v codex || true)"
[ -n "$CODEX_BIN" ] || fail "没有找到 Codex CLI，请先安装并运行 codex login。"
"$CODEX_BIN" login status >/dev/null 2>&1 || fail "Codex 尚未登录，请先运行 codex login。"
command -v curl >/dev/null 2>&1 || fail "没有找到 curl。"

BRIDGE_FILE="$(mktemp --suffix=.mjs)"
trap 'rm -f "$BRIDGE_FILE"' EXIT
curl -fsSL "$BRIDGE_URL" -o "$BRIDGE_FILE" || fail "无法下载本地桥接程序。"

echo "正在启动 AI Shakedown Console 本地 Codex 连接……"
AI_SHAKEDOWN_BRIDGE_TOKEN="$BRIDGE_TOKEN" \
AI_SHAKEDOWN_BRIDGE_PORT="$BRIDGE_PORT" \
AI_SHAKEDOWN_ALLOWED_ORIGIN="$(printf '%s' "$RETURN_URL" | sed -E 's#^(https?://[^/]+).*$#\1#')" \
AI_SHAKEDOWN_RETURN_URL="$RETURN_URL" \
AI_SHAKEDOWN_CODEX_BIN="$CODEX_BIN" \
node "$BRIDGE_FILE"
