const CACHE_PREFIX = 'ai-shakedown-console-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v32`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v32`;
const APP_SHELL = [
    '/',
    '/index.html',
    '/style.css?v=32',
    '/script.js?v=32',
    '/assets/manifest.webmanifest?v=32',
    '/assets/favicon.svg?v=32',
    '/assets/apple-touch-icon.png?v=32',
    '/assets/icon-192.png?v=32',
    '/assets/icon-512.png?v=32',
    '/assets/icon-maskable-512.png?v=32',
    '/assets/AI-Shakedown-Console-v31-debug.apk?v=31-r1',
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

async function staleWhileRevalidateNavigation(request, event) {
    // A cached shell makes a warm/cold launch render immediately. The network
    // request still runs under waitUntil so a newer HTML shell is ready next time.
    const refresh = fetch(request).then(async (response) => {
        if (cacheable(response) && response.headers.get('Content-Type')?.includes('text/html')) {
            try {
                const cache = await caches.open(SHELL_CACHE);
                await cache.put('/index.html', response.clone());
                await cache.put('/', response.clone());
            } catch (_) { /* Cache storage failure must not discard a working network response. */ }
        }
        return response;
    }).catch(() => null);
    event.waitUntil(refresh);
    const cached = await caches.match('/index.html') || await caches.match('/');
    if (cached && !new URL(request.url).searchParams.has('refresh')) return cached;
    return await refresh || cached || await caches.match('/index.html') || await caches.match('/')
        || new Response('离线：应用外壳尚未缓存。', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (cacheable(response)) {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
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
