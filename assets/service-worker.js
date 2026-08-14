const CACHE_PREFIX = 'ai-shakedown-console-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-v26-r3`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v26-r3`;
const APP_SHELL = [
    '/',
    '/index.html',
    '/style.css?v=26',
    '/script.js?v=26',
    '/assets/manifest.webmanifest?v=26',
    '/assets/favicon.svg?v=26',
    '/assets/apple-touch-icon.png?v=26',
    '/assets/icon-192.png?v=26',
    '/assets/icon-512.png?v=26',
    '/assets/icon-maskable-512.png?v=26',
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

async function networkFirstNavigation(request) {
    try {
        return await fetch(request);
    } catch (_) {
        return await caches.match('/index.html') || await caches.match('/');
    }
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
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(request));
        return;
    }
    event.respondWith(cacheFirst(request));
});
