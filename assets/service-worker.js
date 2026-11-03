const CACHE_PREFIX = 'ai-shakedown-console-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v33-r2`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v33-r2`;
const APP_SHELL = [
    '/',
    '/index.html',
    '/style.css?v=33-r2',
    '/script.js?v=33-r2',
    '/assets/manifest.webmanifest?v=33-r2',
    '/assets/favicon.svg?v=33-r2',
    '/assets/apple-touch-icon.png?v=33-r2',
    '/assets/icon-192.png?v=33-r2',
    '/assets/icon-512.png?v=33-r2',
    '/assets/icon-maskable-512.png?v=33-r2',
    '/assets/AI-Shakedown-Console-v33-debug.apk?v=33-r2',
    '/vendor/bootstrap-icons/bootstrap-icons.min.css?v=1.11.3',
    '/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
    '/vendor/bootstrap-icons/fonts/bootstrap-icons.woff',
    '/vendor/marked.min.js?v=15.0.12',
    '/vendor/purify.min.js?v=3.2.6',
    '/vendor/pdf.min.mjs?v=5.4.296',
    '/vendor/pdf.worker.min.mjs?v=5.4.296',
    '/agents/index.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(Promise.all([
        caches.keys().then((keys) => Promise.all(keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)))),
        self.clients.claim()
    ]));
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

function cacheable(response) {
    return response?.ok && ['basic', 'cors'].includes(response.type);
}

async function shellResponse() {
    try {
        const cache = await caches.open(SHELL_CACHE);
        return await cache.match('/index.html') || await cache.match('/');
    } catch (_) { return null; }
}

function navigationResponse(response) {
    // Navigation requests use manual redirects. Do not replay a fetched
    // redirected Response from CacheStorage as a navigation response.
    if (!response?.redirected) return response;
    return new Response(response.body, {
        status: response.status, statusText: response.statusText, headers: response.headers
    });
}

async function staleWhileRevalidateNavigation(request, event) {
    const refresh = fetch(request).then(async (response) => {
        if (cacheable(response) && response.headers.get('Content-Type')?.includes('text/html')) {
            const clean = navigationResponse(response);
            try {
                const cache = await caches.open(SHELL_CACHE);
                await cache.put('/index.html', clean.clone());
                await cache.put('/', clean.clone());
            } catch (_) { /* A cache write must not discard a working response. */ }
            return clean;
        }
        return response;
    }).catch(() => null);
    event.waitUntil(refresh);
    const cached = await shellResponse();
    if (cached && !new URL(request.url).searchParams.has('refresh')) return navigationResponse(cached);
    const response = await refresh;
    if (response?.ok && response.headers.get('Content-Type')?.includes('text/html')) return navigationResponse(response);
    return navigationResponse(cached || await shellResponse() || response)
        || new Response('离线：应用外壳尚未缓存。请连接网络后重试；聊天数据未被清除。', {
            status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
}

async function cacheFirst(request) {
    let cached;
    try { cached = await caches.match(request); } catch (_) { /* Network fallback. */ }
    if (cached) return cached;
    const response = await fetch(request);
    if (cacheable(response)) {
        try {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, response.clone());
        } catch (_) { /* Never fail a fetched script/style because storage failed. */ }
    }
    return response;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
    if (request.mode === 'navigate' && ['/', '/index.html'].includes(url.pathname)) {
        event.respondWith(staleWhileRevalidateNavigation(request, event));
        return;
    }
    event.respondWith(cacheFirst(request));
});
