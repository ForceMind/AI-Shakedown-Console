import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const BRIDGE_VERSION = 'v16';
const HOST = '127.0.0.1';
const PORT = Number(process.env.AI_SHAKEDOWN_BRIDGE_PORT || 4510);
const TOKEN = process.env.AI_SHAKEDOWN_BRIDGE_TOKEN || '';
const ALLOWED_ORIGIN = process.env.AI_SHAKEDOWN_ALLOWED_ORIGIN || '';
const RETURN_URL = process.env.AI_SHAKEDOWN_RETURN_URL || '';
const LOCAL_PROVIDER = process.env.AI_SHAKEDOWN_LOCAL_PROVIDER || 'codex';
const LOCAL_TOOLS = {
    codex: { label: 'Codex', command: 'codex' },
    antigravity: { label: 'Antigravity', command: 'agy' },
    gemini: { label: 'Gemini CLI', command: 'gemini' },
    claude: { label: 'Claude Code', command: 'claude' },
    opencode: { label: 'OpenCode', command: 'opencode' }
};
const LOCAL_TOOL = LOCAL_TOOLS[LOCAL_PROVIDER];
const LOCAL_CLI_BIN = process.env.AI_SHAKEDOWN_LOCAL_CLI_BIN
    || `${LOCAL_TOOL?.command || LOCAL_PROVIDER}${process.platform === 'win32' ? '.exe' : ''}`;
const WORKDIR = path.join(os.tmpdir(), 'ai-shakedown-local-ai-workspace');
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_PROMPT_CHARS = 120_000;
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;
const RPC_TIMEOUT_MS = 30_000;
const CLI_TIMEOUT_MS = 10 * 60 * 1000;

if (!LOCAL_TOOL) throw new Error(`不支持的本地 AI 工具：${LOCAL_PROVIDER}`);
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
            this.child = spawnLocal(LOCAL_CLI_BIN, ['app-server'], {
                cwd: WORKDIR,
                stdio: ['pipe', 'pipe', 'pipe']
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

const rpc = LOCAL_PROVIDER === 'codex' ? new CodexRpc() : null;
const conversationThreads = new Map();

function escapeWindowsCommand(value) {
    return String(value).replace(/([()\][%!^"`<>&|;, *?])/g, '^$1');
}

function escapeWindowsArgument(value, doubleEscapeMetaChars) {
    let escaped = String(value).replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');
    escaped = escaped.replace(/(?=(\\+?)?)\1$/, '$1$1');
    escaped = `"${escaped}"`;
    escaped = escaped.replace(/([()\][%!^"`<>&|;, *?])/g, '^$1');
    if (doubleEscapeMetaChars) escaped = escaped.replace(/([()\][%!^"`<>&|;, *?])/g, '^$1');
    return escaped;
}

function spawnLocal(command, args, options = {}) {
    if (process.platform !== 'win32' || !/\.(cmd|bat)$/i.test(command)) {
        return spawn(command, args, { windowsHide: true, shell: false, ...options });
    }
    const doubleEscapeMetaChars = /node_modules[\\/]\.bin[\\/][^\\/]+\.cmd$/i.test(command);
    const commandLine = [
        escapeWindowsCommand(path.normalize(command)),
        ...args.map((argument) => escapeWindowsArgument(argument, doubleEscapeMetaChars))
    ].join(' ');
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `"${commandLine}"`], {
        windowsHide: true,
        windowsVerbatimArguments: true,
        shell: false,
        ...options
    });
}

function stripAnsi(value) {
    return String(value || '').replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:[\dA-PR-TZcf-nq-uy=><~]))|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g, '');
}

function conciseProcessError(stderr, stdout, code) {
    const detail = stripAnsi(stderr || stdout).trim().slice(0, 1200);
    return `${LOCAL_TOOL.label} 调用失败（退出码 ${code ?? '未知'}）${detail ? `：${detail}` : ''}`;
}

function runProcess(args, { input = '', timeoutMs = CLI_TIMEOUT_MS, env = {} } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawnLocal(LOCAL_CLI_BIN, args, {
            cwd: WORKDIR,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, ...env }
        });
        const stdout = [];
        const stderr = [];
        let outputSize = 0;
        let settled = false;
        const finish = (error, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(result);
        };
        const collect = (target) => (chunk) => {
            outputSize += chunk.length;
            if (outputSize > MAX_OUTPUT_BYTES) {
                child.kill('SIGTERM');
                finish(new Error(`${LOCAL_TOOL.label} 输出超过 16 MiB 限制`));
                return;
            }
            target.push(chunk);
        };
        child.stdout.on('data', collect(stdout));
        child.stderr.on('data', collect(stderr));
        child.once('error', (error) => finish(error));
        child.once('exit', (code) => {
            const result = {
                stdout: Buffer.concat(stdout).toString('utf8'),
                stderr: Buffer.concat(stderr).toString('utf8'),
                code
            };
            if (code === 0) finish(null, result);
            else finish(new Error(conciseProcessError(result.stderr, result.stdout, code)));
        });
        const timer = setTimeout(() => {
            child.kill('SIGTERM');
            finish(new Error(`${LOCAL_TOOL.label} 调用超时`));
        }, timeoutMs);
        if (input) child.stdin.end(input);
        else child.stdin.end();
    });
}

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
    const safety = [
        '通过网页以纯对话方式回答。',
        '不要调用任何工具，不要读取或修改本地文件，不要执行命令、联网搜索或产生外部副作用。',
        '如果请求必须依赖这些操作，请直接说明网页本地桥接已禁用该能力。'
    ].join('');
    if (!includeHistory) {
        return [safety, system ? `用户设置的对话指令：\n${system}` : '', `用户消息：\n${latestUser}`].filter(Boolean).join('\n\n');
    }
    const transcript = valid.filter((item) => item.role !== 'system').map((item) => {
        const label = item.role === 'assistant' ? '助手' : '用户';
        return `${label}：\n${item.content}`;
    }).join('\n\n');
    return [safety, system ? `用户设置的对话指令：\n${system}` : '', `以下是需要继续的对话：\n\n${transcript}`].filter(Boolean).join('\n\n');
}

function checkedPrompt(messages, includeHistory) {
    const prompt = promptFromMessages(messages, includeHistory);
    if (!prompt.trim()) throw new Error('消息内容为空');
    if (prompt.length > MAX_PROMPT_CHARS) throw new Error('当前对话过长，请新建对话后重试');
    return prompt;
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

    const input = checkedPrompt(messages, isNewThread);
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
        const timeout = setTimeout(() => finish(new Error('Codex 生成超时')), CLI_TIMEOUT_MS);
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

function parseJson(text, label) {
    try { return JSON.parse(stripAnsi(text).trim()); }
    catch (_) { throw new Error(`${label} 未返回可识别的 JSON`); }
}

function extractOpenCodeText(text) {
    const fragments = [];
    for (const line of stripAnsi(text).split(/\r?\n/).filter(Boolean)) {
        let event;
        try { event = JSON.parse(line); } catch (_) { continue; }
        const part = event.part || event.data?.part || event.message?.part;
        const candidate = part?.text || (event.type === 'text' ? event.text : '') || event.data?.text;
        if (typeof candidate === 'string' && candidate) fragments.push(candidate);
    }
    return fragments.join('') || stripAnsi(text).trim();
}

async function runCliTurn({ model, messages }) {
    const prompt = checkedPrompt(messages, true);
    const selectedModel = model && model !== 'auto' ? model : '';
    let result;
    if (LOCAL_PROVIDER === 'antigravity') {
        result = await runProcess(['-p', prompt, ...(selectedModel ? ['--model', selectedModel] : [])]);
        return { text: stripAnsi(result.stdout).trim(), threadId: null };
    }
    if (LOCAL_PROVIDER === 'gemini') {
        result = await runProcess([
            '-p', prompt,
            '--output-format', 'json',
            '--approval-mode', 'plan',
            ...(selectedModel ? ['--model', selectedModel] : [])
        ]);
        const payload = parseJson(result.stdout, LOCAL_TOOL.label);
        if (payload.error) throw new Error(payload.error.message || `${LOCAL_TOOL.label} 返回错误`);
        return { text: String(payload.response || '').trim(), threadId: null };
    }
    if (LOCAL_PROVIDER === 'claude') {
        result = await runProcess([
            '-p', prompt,
            '--output-format', 'json',
            '--tools', '',
            '--disallowedTools', 'mcp__*',
            '--strict-mcp-config',
            '--safe-mode',
            '--permission-mode', 'plan',
            ...(selectedModel ? ['--model', selectedModel] : [])
        ]);
        const payload = parseJson(result.stdout, LOCAL_TOOL.label);
        return { text: String(payload.result || '').trim(), threadId: null };
    }
    if (LOCAL_PROVIDER === 'opencode') {
        result = await runProcess([
            'run', '--format', 'json',
            ...(selectedModel ? ['--model', selectedModel] : []),
            prompt
        ], {
            env: {
                OPENCODE_CONFIG_CONTENT: JSON.stringify({
                    permission: 'deny',
                    share: 'disabled',
                    autoupdate: false
                })
            }
        });
        return { text: extractOpenCodeText(result.stdout), threadId: null };
    }
    throw new Error(`尚未实现 ${LOCAL_TOOL.label} 对话适配`);
}

function ensureText(result) {
    if (!result.text) throw new Error(`${LOCAL_TOOL.label} 没有返回文本内容`);
    return result;
}

function openAiDelta(text) {
    return JSON.stringify({
        id: `${LOCAL_PROVIDER}-local`,
        object: 'chat.completion.chunk',
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }]
    });
}

async function handleChat(request, response) {
    const body = await readJsonBody(request);
    const conversationKey = String(request.headers['x-ai-shakedown-conversation'] || 'default').slice(0, 160);
    const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : undefined;
    const effort = typeof body.reasoning_effort === 'string' && body.reasoning_effort ? body.reasoning_effort : undefined;
    const run = LOCAL_PROVIDER === 'codex'
        ? (onDelta) => runCodexTurn({ conversationKey, model, effort, messages: body.messages, onDelta })
        : () => runCliTurn({ model, messages: body.messages });
    if (body.stream !== false) {
        response.writeHead(200, {
            ...corsHeaders(),
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        const result = ensureText(await run((delta) => response.write(`data: ${openAiDelta(delta)}\n\n`)));
        if (LOCAL_PROVIDER !== 'codex') response.write(`data: ${openAiDelta(result.text)}\n\n`);
        response.write(`data: ${JSON.stringify({
            id: `${LOCAL_PROVIDER}-local`,
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            local_thread_id: result.threadId
        })}\n\n`);
        response.end('data: [DONE]\n\n');
        return;
    }
    const result = ensureText(await run());
    sendJson(response, 200, {
        id: `${LOCAL_PROVIDER}-local`,
        object: 'chat.completion',
        choices: [{ index: 0, message: { role: 'assistant', content: result.text }, finish_reason: 'stop' }],
        local_thread_id: result.threadId
    });
}

function modelListPayload(models) {
    const data = [...new Set(models.filter(Boolean))].map((id) => ({ id, object: 'model' }));
    return { object: 'list', data };
}

function modelsFromLines(text, preserveSpaces = false) {
    return stripAnsi(text).split(/\r?\n/).map((line) => line.trim().replace(/^[*•-]\s+/, '')).filter((line) => (
        line && !/^(available|models?|name|[-=]+)(\s|$)/i.test(line)
    )).map((line) => preserveSpaces ? line : line.split(/\s+/)[0]).filter((value) => (
        preserveSpaces ? value.length <= 160 : /^[\w./:@+-]+$/.test(value)
    ));
}

async function localStatus() {
    if (LOCAL_PROVIDER === 'codex') {
        const result = await rpc.request('account/read', { refreshToken: false });
        const account = result?.account ? {
            type: result.account.type,
            planType: result.account.planType || null
        } : null;
        return {
            ok: true,
            bridgeVersion: BRIDGE_VERSION,
            provider: LOCAL_PROVIDER,
            label: LOCAL_TOOL.label,
            account,
            requiresOpenaiAuth: Boolean(result?.requiresOpenaiAuth)
        };
    }
    const result = await runProcess(['--version'], { timeoutMs: 20_000 });
    const version = stripAnsi(result.stdout || result.stderr).trim().split(/\r?\n/)[0].slice(0, 160);
    return {
        ok: true,
        bridgeVersion: BRIDGE_VERSION,
        provider: LOCAL_PROVIDER,
        label: LOCAL_TOOL.label,
        version,
        account: { type: LOCAL_PROVIDER }
    };
}

async function localModels() {
    if (LOCAL_PROVIDER === 'codex') {
        const result = await rpc.request('model/list', { limit: 100, includeHidden: false });
        const data = (result?.data || []).map((item) => ({
            id: item.model || item.id,
            object: 'model',
            display_name: item.displayName,
            default_reasoning_effort: item.defaultReasoningEffort,
            supported_reasoning_efforts: item.supportedReasoningEfforts || []
        })).filter((item) => item.id);
        return { object: 'list', data };
    }
    if (LOCAL_PROVIDER === 'antigravity') {
        const result = await runProcess(['models'], { timeoutMs: 30_000 });
        return modelListPayload(['auto', ...modelsFromLines(result.stdout, true)]);
    }
    if (LOCAL_PROVIDER === 'opencode') {
        const result = await runProcess(['models'], { timeoutMs: 30_000 });
        return modelListPayload(['auto', ...modelsFromLines(result.stdout)]);
    }
    if (LOCAL_PROVIDER === 'claude') return modelListPayload(['opus', 'sonnet', 'haiku', 'fable']);
    return modelListPayload(['auto']);
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
            return sendJson(response, 200, await localStatus());
        }
        if (request.method === 'GET' && url.pathname === '/v1/models') {
            return sendJson(response, 200, await localModels());
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
    await mkdir(WORKDIR, { recursive: true });
    if (rpc) {
        await rpc.start();
        const account = await rpc.request('account/read', { refreshToken: false });
        if (account?.requiresOpenaiAuth && !account?.account) throw new Error('Codex 尚未登录，请先运行 codex login');
    } else {
        await runProcess(['--version'], { timeoutMs: 20_000 });
    }
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(PORT, HOST, resolve);
    });
    console.log(`AI Shakedown Console 本地 ${LOCAL_TOOL.label} 桥接已启动：http://${HOST}:${PORT}`);
    console.log('请保持此终端窗口开启；按 Ctrl+C 停止。');
    if (RETURN_URL) openBrowser(`${RETURN_URL}#local_bridge=${LOCAL_PROVIDER}.${PORT}.${TOKEN}`);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        server.close();
        rpc?.stop();
        process.exit(0);
    });
}

main().catch((error) => {
    console.error(`启动失败：${error.message}`);
    rpc?.stop();
    process.exit(1);
});
