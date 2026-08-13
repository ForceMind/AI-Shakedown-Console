#!/usr/bin/env bash
set -euo pipefail

BRIDGE_URL="__BRIDGE_URL__"
RETURN_URL="__RETURN_URL__"
BRIDGE_TOKEN="__BRIDGE_TOKEN__"
BRIDGE_PORT="__BRIDGE_PORT__"
LOCAL_PROVIDER="__LOCAL_PROVIDER__"
CLI_COMMAND="__CLI_COMMAND__"
CLI_LABEL="__CLI_LABEL__"

fail() {
  echo "启动失败：$1" >&2
  exit 1
}

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  for NODE_CANDIDATE in \
    "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" \
    "/usr/local/bin/node" \
    "/usr/bin/node"; do
    if [ -x "$NODE_CANDIDATE" ]; then
      NODE_BIN="$NODE_CANDIDATE"
      break
    fi
  done
fi
[ -n "$NODE_BIN" ] || fail "没有找到 Node.js。已检查系统 PATH 和 Codex 自带运行时；请安装 Node.js 18 或更高版本。"
NODE_MAJOR="$("$NODE_BIN" -p 'Number(process.versions.node.split(".")[0])')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 版本过低，需要 18 或更高版本。"
LOCAL_CLI_BIN="$(command -v "$CLI_COMMAND" || true)"
if [ -z "$LOCAL_CLI_BIN" ]; then
  for CLI_CANDIDATE in \
    "$HOME/.local/bin/$CLI_COMMAND" \
    "$HOME/.npm-global/bin/$CLI_COMMAND" \
    "$HOME/.local/share/pnpm/$CLI_COMMAND" \
    "/usr/local/bin/$CLI_COMMAND" \
    "/usr/bin/$CLI_COMMAND"; do
    if [ -x "$CLI_CANDIDATE" ]; then
      LOCAL_CLI_BIN="$CLI_CANDIDATE"
      break
    fi
  done
fi
[ -n "$LOCAL_CLI_BIN" ] || fail "没有找到 ${CLI_LABEL}，请先安装并完成登录。"
if [ "$LOCAL_PROVIDER" = "codex" ]; then
  "$LOCAL_CLI_BIN" login status >/dev/null 2>&1 || fail "Codex 尚未登录，请先运行 codex login。"
else
  "$LOCAL_CLI_BIN" --version >/dev/null 2>&1 || fail "${CLI_LABEL} 无法运行，请先单独启动它并完成登录。"
fi
command -v curl >/dev/null 2>&1 || fail "没有找到 curl。"

BRIDGE_FILE="$(mktemp --suffix=.mjs)"
trap 'rm -f "$BRIDGE_FILE"' EXIT
curl -fsSL "$BRIDGE_URL" -o "$BRIDGE_FILE" || fail "无法下载本地桥接程序。"

echo "正在启动 AI Shakedown Console 本地 ${CLI_LABEL} 连接……"
AI_SHAKEDOWN_BRIDGE_TOKEN="$BRIDGE_TOKEN" \
AI_SHAKEDOWN_BRIDGE_PORT="$BRIDGE_PORT" \
AI_SHAKEDOWN_ALLOWED_ORIGIN="$(printf '%s' "$RETURN_URL" | sed -E 's#^(https?://[^/]+).*$#\1#')" \
AI_SHAKEDOWN_RETURN_URL="$RETURN_URL" \
AI_SHAKEDOWN_LOCAL_PROVIDER="$LOCAL_PROVIDER" \
AI_SHAKEDOWN_LOCAL_CLI_BIN="$LOCAL_CLI_BIN" \
"$NODE_BIN" "$BRIDGE_FILE"
