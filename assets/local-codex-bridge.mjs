import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';

const BRIDGE_VERSION = 'v14';
const HOST = '127.0.0.1';
const PORT = Number(process.env.AI_SHAKEDOWN_BRIDGE_PORT || 4510);
const TOKEN = process.env.AI_SHAKEDOWN_BRIDGE_TOKEN || '';
const ALLOWED_ORIGIN = process.env.AI_SHAKEDOWN_ALLOWED_ORIGIN || '';
const RETURN_URL = process.env.AI_SHAKEDOWN_RETURN_URL || '';
const CODEX_BIN = process.env.AI_SHAKEDOWN_CODEX_BIN || (process.platform === 'win32' ? 'codex.exe' : 'codex');
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const RPC_TIMEOUT_MS = 30_000;

if (!TOKEN || TOKEN.length < 32) throw new Error('缺少安全的本地桥接令牌');
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) throw new Error('本地桥接端口无效');

class CodexRpc {
    constructor() {
        this.sequence = 0;
        this.pending = new Map();
        this.listeners = new Set();
        this.child = null;
        this.ready = null;
    }

    start() {
        if (this.ready) return this.ready;
        this.ready = new Promise((resolve, reject) => {
            const workdir = path.join(os.tmpdir(), 'ai-shakedown-codex-workspace');
            this.child = spawn(CODEX_BIN, ['app-server'], {
                cwd: workdir,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: process.platform === 'win32' && /\.(cmd|bat)$/i.test(CODEX_BIN),
                windowsHide: true
            });
            this.child.once('error', reject);
            this.child.once('exit', (code, signal) => {
                const error = new Error(`Codex App Server 已退出（${signal || code || 0}）`);
                for (const pending of this.pending.values()) pending.reject(error);
                this.pending.clear();
                if (code && code !== 0) process.exitCode = code;
            });
            this.child.stderr.pipe(process.stderr);
            const lines = readline.createInterface({ input: this.child.stdout });
            lines.on('line', (line) => this.handleLine(line));
            this.request('initialize', {
                clientInfo: {
                    name: 'ai_shakedown_console',
                    title: 'AI Shakedown Console',
                    version: BRIDGE_VERSION
                }
            }).then(() => {
                this.notify('initialized', {});
                resolve();
            }, reject);
        });
        return this.ready;
    }

    handleLine(line) {
        let message;
        try { message = JSON.parse(line); } catch (_) { return; }
        if (message.id !== undefined && this.pending.has(message.id)) {
            const pending = this.pending.get(message.id);
            this.pending.delete(message.id);
            clearTimeout(pending.timer);
            if (message.error) pending.reject(new Error(message.error.message || 'Codex JSON-RPC 请求失败'));
            else pending.resolve(message.result);
            return;
        }
        if (message.id !== undefined && message.method) {
            if (/requestApproval$/.test(message.method)) {
                this.write({ id: message.id, result: { decision: 'decline' } });
            } else {
                this.write({ id: message.id, error: { code: -32601, message: '本地网页桥接不支持此交互请求' } });
            }
            return;
        }
        if (message.method) {
            for (const listener of this.listeners) listener(message.method, message.params || {});
        }
    }

    write(message) {
        if (!this.child?.stdin?.writable) throw new Error('Codex App Server 尚未运行');
        this.child.stdin.write(`${JSON.stringify(message)}\n`);
    }

    request(method, params = {}, timeoutMs = RPC_TIMEOUT_MS) {
        const id = ++this.sequence;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error(`Codex 请求超时：${method}`));
            }, timeoutMs);
            this.pending.set(id, { resolve, reject, timer });
            try { this.write({ method, id, params }); } catch (error) {
                clearTimeout(timer);
                this.pending.delete(id);
                reject(error);
            }
        });
    }

    notify(method, params = {}) {
        this.write({ method, params });
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    stop() {
        if (!this.child || this.child.killed) return;
        this.child.kill('SIGTERM');
    }
}

const rpc = new CodexRpc();
const conversationThreads = new Map();

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-AI-Shakedown-Conversation',
        'Access-Control-Allow-Private-Network': 'true',
        'Cache-Control': 'no-store',
        'Vary': 'Origin'
    };
}

function sendJson(response, status, payload) {
    response.writeHead(status, { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function authorized(request) {
    return request.headers.authorization === `Bearer ${TOKEN}`;
}

function allowedOrigin(request) {
    const origin = request.headers.origin;
    return !origin || !ALLOWED_ORIGIN || origin === ALLOWED_ORIGIN;
}

async function readJsonBody(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) throw new Error('请求体超过 2 MiB 限制');
        chunks.push(chunk);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    return text ? JSON.parse(text) : {};
}

function promptFromMessages(messages, includeHistory) {
    const valid = Array.isArray(messages) ? messages.filter((item) => (
        item && ['system', 'user', 'assistant'].includes(item.role) && typeof item.content === 'string'
    )) : [];
    const system = valid.filter((item) => item.role === 'system').map((item) => item.content.trim()).filter(Boolean).join('\n\n');
    const latestUser = [...valid].reverse().find((item) => item.role === 'user')?.content || '';
    const safety = '通过网页以纯对话方式回答。不要修改本地文件，也不要执行会产生副作用的命令。';
    if (!includeHistory) {
        return [safety, system ? `用户设置的对话指令：\n${system}` : '', `用户消息：\n${latestUser}`].filter(Boolean).join('\n\n');
    }
    const transcript = valid.filter((item) => item.role !== 'system').map((item) => {
        const label = item.role === 'assistant' ? '助手' : '用户';
        return `${label}：\n${item.content}`;
    }).join('\n\n');
    return [safety, system ? `用户设置的对话指令：\n${system}` : '', `以下是需要继续的对话：\n\n${transcript}`].filter(Boolean).join('\n\n');
}

function appendDelta(current, authoritative) {
    if (!authoritative || authoritative === current) return '';
    if (authoritative.startsWith(current)) return authoritative.slice(current.length);
    return current ? '' : authoritative;
}

async function runCodexTurn({ conversationKey, model, effort, messages, onDelta }) {
    await rpc.start();
    let threadId = conversationThreads.get(conversationKey);
    const isNewThread = !threadId;
    if (!threadId) {
        const started = await rpc.request('thread/start', {
            model,
            approvalPolicy: 'never',
            sandbox: 'readOnly',
            serviceName: 'ai_shakedown_console'
        });
        threadId = started?.thread?.id;
        if (!threadId) throw new Error('Codex 未返回 thread id');
        conversationThreads.set(conversationKey, threadId);
    }

    const input = promptFromMessages(messages, isNewThread);
    if (!input.trim()) throw new Error('消息内容为空');
    let output = '';
    let finalText = '';
    let turnId = '';

    return await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error) => {
            if (settled) return;
            settled = true;
            unsubscribe();
            clearTimeout(timeout);
            if (error) reject(error);
            else resolve({ text: finalText || output, threadId, turnId });
        };
        const unsubscribe = rpc.subscribe((method, params) => {
            if (params.threadId && params.threadId !== threadId) return;
            if (turnId && params.turnId && params.turnId !== turnId) return;
            if (method === 'item/agentMessage/delta') {
                const delta = typeof params.delta === 'string' ? params.delta : '';
                if (delta) {
                    output += delta;
                    onDelta?.(delta);
                }
            } else if (method === 'item/completed' && params.item?.type === 'agentMessage') {
                if (!params.item.phase || params.item.phase === 'final_answer') finalText = params.item.text || finalText;
            } else if (method === 'error') {
                finish(new Error(params.error?.message || 'Codex 生成失败'));
            } else if (method === 'turn/completed') {
                const status = params.turn?.status;
                if (status === 'failed') finish(new Error(params.turn?.error?.message || 'Codex 生成失败'));
                else {
                    const suffix = appendDelta(output, finalText);
                    if (suffix) {
                        output += suffix;
                        onDelta?.(suffix);
                    }
                    finish();
                }
            }
        });
        const timeout = setTimeout(() => finish(new Error('Codex 生成超时')), 10 * 60 * 1000);
        rpc.request('turn/start', {
            threadId,
            input: [{ type: 'text', text: input }],
            model,
            ...(effort ? { effort } : {})
        }).then((result) => {
            turnId = result?.turn?.id || '';
        }, finish);
    });
}

function openAiDelta(text) {
    return JSON.stringify({
        id: 'codex-local',
        object: 'chat.completion.chunk',
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }]
    });
}

async function handleChat(request, response) {
    const body = await readJsonBody(request);
    const conversationKey = String(request.headers['x-ai-shakedown-conversation'] || 'default').slice(0, 160);
    const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined;
    const effort = typeof body.reasoning_effort === 'string' && body.reasoning_effort ? body.reasoning_effort : undefined;
    if (body.stream !== false) {
        response.writeHead(200, {
            ...corsHeaders(),
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        const result = await runCodexTurn({
            conversationKey,
            model,
            effort,
            messages: body.messages,
            onDelta: (delta) => response.write(`data: ${openAiDelta(delta)}\n\n`)
        });
        response.write(`data: ${JSON.stringify({
            id: 'codex-local',
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            codex_thread_id: result.threadId
        })}\n\n`);
        response.end('data: [DONE]\n\n');
        return;
    }
    const result = await runCodexTurn({ conversationKey, model, effort, messages: body.messages });
    sendJson(response, 200, {
        id: 'codex-local',
        object: 'chat.completion',
        choices: [{ index: 0, message: { role: 'assistant', content: result.text }, finish_reason: 'stop' }],
        codex_thread_id: result.threadId
    });
}

const server = http.createServer(async (request, response) => {
    try {
        if (!allowedOrigin(request)) return sendJson(response, 403, { error: '不允许的网页来源' });
        if (request.method === 'OPTIONS') {
            response.writeHead(204, corsHeaders());
            response.end();
            return;
        }
        if (!authorized(request)) return sendJson(response, 401, { error: '本地桥接令牌无效，请重新下载启动脚本' });
        const url = new URL(request.url, `http://${HOST}:${PORT}`);
        if (request.method === 'GET' && url.pathname === '/status') {
            const result = await rpc.request('account/read', { refreshToken: false });
            const account = result?.account ? {
                type: result.account.type,
                planType: result.account.planType || null
            } : null;
            return sendJson(response, 200, {
                ok: true,
                bridgeVersion: BRIDGE_VERSION,
                account,
                requiresOpenaiAuth: Boolean(result?.requiresOpenaiAuth)
            });
        }
        if (request.method === 'GET' && url.pathname === '/v1/models') {
            const result = await rpc.request('model/list', { limit: 100, includeHidden: false });
            const data = (result?.data || []).map((item) => ({
                id: item.model || item.id,
                object: 'model',
                display_name: item.displayName,
                default_reasoning_effort: item.defaultReasoningEffort,
                supported_reasoning_efforts: item.supportedReasoningEfforts || []
            })).filter((item) => item.id);
            return sendJson(response, 200, { object: 'list', data });
        }
        if (request.method === 'POST' && url.pathname === '/v1/chat/completions') {
            await handleChat(request, response);
            return;
        }
        sendJson(response, 404, { error: '未找到本地桥接接口' });
    } catch (error) {
        if (!response.headersSent) sendJson(response, 500, { error: error.message || '本地桥接失败' });
        else if (!response.writableEnded) {
            response.write(`event: error\ndata: ${JSON.stringify({ error: { message: error.message || '本地桥接失败' } })}\n\n`);
            response.end('data: [DONE]\n\n');
        }
    }
});

function openBrowser(url) {
    if (!url) return;
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd.exe' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

async function main() {
    await import('node:fs/promises').then(({ mkdir }) => mkdir(path.join(os.tmpdir(), 'ai-shakedown-codex-workspace'), { recursive: true }));
    await rpc.start();
    const account = await rpc.request('account/read', { refreshToken: false });
    if (account?.requiresOpenaiAuth && !account?.account) throw new Error('Codex 尚未登录，请先运行 codex login');
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(PORT, HOST, resolve);
    });
    console.log(`AI Shakedown Console 本地 Codex 桥接已启动：http://${HOST}:${PORT}`);
    console.log('请保持此终端窗口开启；按 Ctrl+C 停止。');
    openBrowser(`${RETURN_URL}#codex_bridge=${PORT}.${TOKEN}`);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        server.close();
        rpc.stop();
        process.exit(0);
    });
}

main().catch((error) => {
    console.error(`启动失败：${error.message}`);
    rpc.stop();
    process.exit(1);
});
