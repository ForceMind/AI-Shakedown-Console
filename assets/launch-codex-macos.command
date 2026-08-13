#!/bin/bash
set -euo pipefail

BRIDGE_URL="__BRIDGE_URL__"
RETURN_URL="__RETURN_URL__"
BRIDGE_TOKEN="__BRIDGE_TOKEN__"
BRIDGE_PORT="__BRIDGE_PORT__"
LAUNCHER_VERSION="__APP_VERSION__"
LOCAL_PROVIDER="__LOCAL_PROVIDER__"
CLI_COMMAND="__CLI_COMMAND__"
CLI_LABEL="__CLI_LABEL__"
STATE_DIR="${AI_SHAKEDOWN_STATE_DIR:-$HOME/.cache/ai-shakedown-console}"
PID_FILE="$STATE_DIR/${LOCAL_PROVIDER}.pid"
BRIDGE_FILE="$STATE_DIR/ai-shakedown-local-ai-bridge-${LOCAL_PROVIDER}.mjs"
BRIDGE_DOWNLOAD="$STATE_DIR/ai-shakedown-local-ai-bridge-${LOCAL_PROVIDER}.download"
LOG_FILE="$STATE_DIR/${LOCAL_PROVIDER}.log"
BRIDGE_PID=""

fail() {
  echo ""
  echo "启动失败：$1"
  echo "按回车键关闭窗口。"
  read -r
  exit 1
}

is_owned_bridge_pid() {
  local candidate_pid="$1"
  local command_line
  [[ "$candidate_pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$candidate_pid" >/dev/null 2>&1 || return 1
  command_line="$(ps -p "$candidate_pid" -o command= 2>/dev/null || true)"
  case "$command_line" in
    *ai-shakedown-local-ai-bridge*.mjs*|*AI-Shakedown-Console*/assets/local-codex-bridge.mjs*) return 0 ;;
    *) return 1 ;;
  esac
}

stop_owned_bridge() {
  local candidate_pid="$1"
  local attempt=0
  is_owned_bridge_pid "$candidate_pid" || return 0
  echo "正在停止旧版 AI Shakedown 本地桥接（PID ${candidate_pid}）……"
  kill "$candidate_pid" >/dev/null 2>&1 || return 1
  while kill -0 "$candidate_pid" >/dev/null 2>&1 && [ "$attempt" -lt 30 ]; do
    sleep 0.1
    attempt=$((attempt + 1))
  done
  ! kill -0 "$candidate_pid" >/dev/null 2>&1
}

is_registered_bridge_pid() {
  local candidate_pid="$1"
  local state_file registered_pid
  for state_file in "$STATE_DIR"/*.pid; do
    [ -f "$state_file" ] || continue
    registered_pid="$(sed -n '1p' "$state_file" 2>/dev/null || true)"
    [ "$registered_pid" = "$candidate_pid" ] && return 0
  done
  return 1
}

stop_previous_bridges() {
  local old_pid=""
  if [ -f "$PID_FILE" ]; then
    old_pid="$(sed -n '1p' "$PID_FILE" 2>/dev/null || true)"
    stop_owned_bridge "$old_pid" || fail "无法停止旧桥接（PID ${old_pid}）。请在网页点击“停止后台连接”后重试。"
    rm -f "$PID_FILE"
  fi

  if command -v pgrep >/dev/null 2>&1; then
    for old_pid in $(pgrep -f 'ai-shakedown-local-ai-bridge.*\.mjs|AI-Shakedown-Console.*/assets/local-codex-bridge\.mjs' 2>/dev/null || true); do
      [ "$old_pid" = "$$" ] && continue
      is_registered_bridge_pid "$old_pid" && continue
      stop_owned_bridge "$old_pid" || fail "无法停止旧版桥接（PID ${old_pid}）。请在网页点击“停止后台连接”后重试。"
    done
  fi
}

port_available() {
  "$NODE_BIN" -e '
    const net = require("node:net");
    const server = net.createServer();
    server.unref();
    server.once("error", () => process.exit(1));
    server.listen({ host: "127.0.0.1", port: Number(process.argv[1]), exclusive: true }, () => {
      server.close(() => process.exit(0));
    });
  ' "$1" >/dev/null 2>&1
}

choose_available_port() {
  local requested_port="$BRIDGE_PORT"
  local candidate_port="$BRIDGE_PORT"
  local attempt=0
  while [ "$attempt" -lt 100 ]; do
    if port_available "$candidate_port"; then
      BRIDGE_PORT="$candidate_port"
      if [ "$BRIDGE_PORT" != "$requested_port" ]; then
        echo "端口 ${requested_port} 已被其他服务占用，已自动改用 ${BRIDGE_PORT}。"
      fi
      return
    fi
    candidate_port=$((candidate_port + 1))
    [ "$candidate_port" -le 65535 ] || candidate_port=4510
    attempt=$((attempt + 1))
  done
  fail "连续检查 100 个端口仍未找到空闲端口。请关闭不需要的本地服务后重试。"
}

cleanup_download() {
  rm -f "$BRIDGE_DOWNLOAD"
}

trap cleanup_download EXIT INT TERM

NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  for NODE_CANDIDATE in \
    "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node"; do
    if [ -x "$NODE_CANDIDATE" ]; then
      NODE_BIN="$NODE_CANDIDATE"
      break
    fi
  done
fi
[ -n "$NODE_BIN" ] || fail "没有找到 Node.js 18+。已检查系统 PATH 和 Codex 自带运行时；请访问 https://nodejs.org/zh-cn/download 安装后重试。"
NODE_MAJOR="$("$NODE_BIN" -p 'Number(process.versions.node.split(".")[0])')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 版本过低，需要 18 或更高版本。"
LOCAL_CLI_BIN="$(command -v "$CLI_COMMAND" || true)"
if [ -z "$LOCAL_CLI_BIN" ]; then
  for CLI_CANDIDATE in \
    "$HOME/.local/bin/$CLI_COMMAND" \
    "$HOME/.npm-global/bin/$CLI_COMMAND" \
    "$HOME/Library/pnpm/$CLI_COMMAND" \
    "/opt/homebrew/bin/$CLI_COMMAND" \
    "/usr/local/bin/$CLI_COMMAND"; do
    if [ -x "$CLI_CANDIDATE" ]; then
      LOCAL_CLI_BIN="$CLI_CANDIDATE"
      break
    fi
  done
fi
if [ -z "$LOCAL_CLI_BIN" ] && [ "$LOCAL_PROVIDER" = "codex" ]; then
  fail "没有找到 Codex CLI。安装说明：https://developers.openai.com/codex/cli/；安装后运行 codex 完成登录。"
fi
[ -n "$LOCAL_CLI_BIN" ] || fail "没有找到 ${CLI_LABEL}，请先按该工具的官方说明安装并完成登录。"
if [ "$LOCAL_PROVIDER" = "codex" ]; then
  "$LOCAL_CLI_BIN" login status >/dev/null 2>&1 || fail "Codex 尚未登录，请先在终端运行 codex login。"
else
  "$LOCAL_CLI_BIN" --version >/dev/null 2>&1 || fail "${CLI_LABEL} 无法运行，请先单独启动它并完成登录。"
fi
command -v curl >/dev/null 2>&1 || fail "没有找到 curl。"

mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR" 2>/dev/null || true

curl -fsSL "$BRIDGE_URL" -o "$BRIDGE_DOWNLOAD" || fail "无法下载本地桥接程序。"

stop_previous_bridges
mv "$BRIDGE_DOWNLOAD" "$BRIDGE_FILE"
chmod 600 "$BRIDGE_FILE" 2>/dev/null || true
choose_available_port

echo "正在启动 AI Shakedown Console ${LAUNCHER_VERSION} 本地 ${CLI_LABEL} 连接……"
: > "$LOG_FILE"
nohup env \
  AI_SHAKEDOWN_BRIDGE_TOKEN="$BRIDGE_TOKEN" \
  AI_SHAKEDOWN_BRIDGE_PORT="$BRIDGE_PORT" \
  AI_SHAKEDOWN_ALLOWED_ORIGIN="$(printf '%s' "$RETURN_URL" | sed -E 's#^(https?://[^/]+).*$#\1#')" \
  AI_SHAKEDOWN_RETURN_URL="$RETURN_URL" \
  AI_SHAKEDOWN_LOCAL_PROVIDER="$LOCAL_PROVIDER" \
  AI_SHAKEDOWN_LOCAL_CLI_BIN="$LOCAL_CLI_BIN" \
  "$NODE_BIN" "$BRIDGE_FILE" >>"$LOG_FILE" 2>&1 </dev/null &
BRIDGE_PID=$!
sleep 1
if ! kill -0 "$BRIDGE_PID" >/dev/null 2>&1; then
  fail "后台桥接启动后立即退出。日志位置：${LOG_FILE}"
fi
printf '%s\n%s\n%s\n' "$BRIDGE_PID" "$BRIDGE_PORT" "$LAUNCHER_VERSION" > "$PID_FILE"
chmod 600 "$PID_FILE" 2>/dev/null || true
trap - EXIT INT TERM
echo ""
echo "本地 ${CLI_LABEL} 桥接已在后台启动（PID ${BRIDGE_PID}，端口 ${BRIDGE_PORT}）。"
echo "现在可以关闭终端。停止连接请回到网页设置，点击“停止后台连接”。"
echo "日志位置：${LOG_FILE}"
