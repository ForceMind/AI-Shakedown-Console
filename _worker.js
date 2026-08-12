const PROXY_PATH = '/api/proxy';
const STATUS_PATH = '/api/status';
const WORKER_VERSION = 'proxy-6';
const APP_VERSION = 'v14';
const MAX_REQUEST_BYTES = 2 * 1024 * 1024;

const BLOCKED_REQUEST_HEADERS = new Set([
    'connection',
    'cookie',
    'host',
    'origin',
    'referer',
    'transfer-encoding',
    'upgrade',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-proxy-query-key',
    'x-upstream-url'
]);

const BLOCKED_RESPONSE_HEADERS = new Set([
    'connection',
    'content-length',
    'content-encoding',
    'transfer-encoding',
    'access-control-allow-origin',
    'access-control-allow-credentials'
]);

function jsonResponse(payload, status) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

function configuredOrigins(env) {
    return new Set(
        String(env.ALLOWED_UPSTREAMS || '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
            .map((value) => {
                const candidate = value.includes('://') ? value : `https://${value}`;
                return new URL(candidate).origin;
            })
    );
}

function validateUpstream(request, env) {
    const rawUrl = request.headers.get('X-Upstream-URL');
    if (!rawUrl) throw new Error('缺少 X-Upstream-URL 请求头');

    const target = new URL(rawUrl);
    if (target.protocol !== 'https:') throw new Error('代理仅允许 HTTPS 上游');
    if (target.username || target.password) throw new Error('上游 URL 不得包含用户名或密码');
    if (target.searchParams.has('key')) throw new Error('Query API Key 必须通过专用请求头传递');

    const allowed = configuredOrigins(env);
    if (!allowed.size) throw new Error('尚未配置 ALLOWED_UPSTREAMS');
    if (!allowed.has(target.origin)) throw new Error(`不允许访问上游 ${target.origin}`);

    const queryKey = request.headers.get('X-Proxy-Query-Key');
    if (queryKey) target.searchParams.set('key', queryKey);
    return target;
}

function upstreamHeaders(request) {
    const headers = new Headers();
    for (const [name, value] of request.headers) {
        const lowerName = name.toLowerCase();
        if (BLOCKED_REQUEST_HEADERS.has(lowerName)) continue;
        if (lowerName.startsWith('cf-') || lowerName.startsWith('sec-')) continue;
        headers.set(name, value);
    }
    return headers;
}

function clientHeaders(upstreamResponse) {
    const headers = new Headers();
    for (const [name, value] of upstreamResponse.headers) {
        if (!BLOCKED_RESPONSE_HEADERS.has(name.toLowerCase())) headers.set(name, value);
    }
    headers.set('Cache-Control', 'no-store');
    return headers;
}

async function proxyRequest(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (!['GET', 'POST'].includes(request.method)) {
        return jsonResponse({ error: '代理仅允许 GET 和 POST 请求' }, 405);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
        return jsonResponse({ error: '请求体超过 2 MiB 限制' }, 413);
    }

    let target;
    try {
        target = validateUpstream(request, env);
    } catch (error) {
        return jsonResponse({ error: error.message }, 400);
    }

    try {
        const upstreamResponse = await fetch(target, {
            method: request.method,
            headers: upstreamHeaders(request),
            body: request.method === 'GET' ? undefined : request.body,
            redirect: 'manual'
        });

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: clientHeaders(upstreamResponse)
        });
    } catch (_) {
        return jsonResponse({ error: 'Worker 无法连接上游服务' }, 502);
    }
}

async function assetResponse(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const acceptsHtml = request.headers.get('Accept')?.includes('text/html');
    const isDocument = url.pathname === '/' || url.pathname.endsWith('.html') || acceptsHtml;
    const isAgentIndex = url.pathname === '/agents/index.json';
    const isAgentContent = url.pathname.startsWith('/agents/content/');
    if (!isDocument && !isAgentIndex && !isAgentContent) return response;

    const headers = new Headers(response.headers);
    if (isDocument) {
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('X-App-Version', APP_VERSION);
    } else if (isAgentIndex) {
        headers.set('Cache-Control', 'no-cache, must-revalidate');
    } else {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === STATUS_PATH) {
            return jsonResponse({
                appVersion: APP_VERSION,
                workerVersion: WORKER_VERSION,
                allowedUpstreamsConfigured: Boolean(env.ALLOWED_UPSTREAMS),
                assetsBindingConfigured: Boolean(env.ASSETS)
            }, 200);
        }
        if (url.pathname === PROXY_PATH) return proxyRequest(request, env);
        return assetResponse(request, env);
    }
};
