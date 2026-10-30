import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'assets/service-worker.js'), 'utf8');
const listeners = {};
const cacheStores = new Map();
let fetchImpl;

class FakeResponse {
    constructor(body, { status = 200, type = 'basic', contentType = 'text/html' } = {}) {
        this.body = body;
        this.status = status;
        this.ok = status >= 200 && status < 300;
        this.type = type;
        this.headers = new Headers({ 'Content-Type': contentType });
    }

    clone() {
        return new FakeResponse(this.body, { status: this.status, type: this.type, contentType: this.headers.get('Content-Type') });
    }
}

function cacheFor(name) {
    if (!cacheStores.has(name)) {
        const values = new Map();
        cacheStores.set(name, {
            async match(key) { return values.get(cacheKey(key)) || undefined; },
            async put(key, response) { values.set(cacheKey(key), response); },
            values
        });
    }
    return cacheStores.get(name);
}

function cacheKey(key) {
    const url = new URL(typeof key === 'string' ? key : key.url, 'https://app.test');
    return url.pathname + url.search;
}

const context = vm.createContext({
    URL,
    Promise,
    Response: FakeResponse,
    console,
    fetch: (...args) => fetchImpl(...args),
    self: {
        location: { origin: 'https://app.test' },
        addEventListener(type, listener) { listeners[type] = listener; },
        skipWaiting() {}
    },
    caches: {
        async open(name) { return cacheFor(name); },
        async match(key) {
            for (const cache of cacheStores.values()) {
                const response = await cache.match(key);
                if (response) return response;
            }
            return undefined;
        },
        async keys() { return [...cacheStores.keys()]; },
        async delete(name) { return cacheStores.delete(name); }
    }
});
vm.runInContext(source, context, { filename: 'assets/service-worker.js' });

const navigationListener = listeners.fetch;
assert.equal(typeof navigationListener, 'function');
const request = { method: 'GET', mode: 'navigate', url: 'https://app.test/?source=android' };

async function runNavigation(fetchValue, navigationRequest = request) {
    fetchImpl = () => fetchValue;
    let responsePromise;
    const event = {
        request: navigationRequest,
        waitUntil(promise) { this.background = promise; },
        respondWith(promise) { responsePromise = promise; }
    };
    navigationListener(event);
    assert.ok(responsePromise, 'navigation did not provide a response promise');
    let timer;
    try {
        const response = await Promise.race([
            responsePromise,
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('navigation did not resolve within 1s')), 1000); })
        ]);
        return { event, response };
    } finally {
        clearTimeout(timer);
    }
}

// A warm launch returns the shell before the network refresh completes.
cacheStores.clear();
const shell = cacheFor('ai-shakedown-console-shell-v32-r3');
await shell.put('/index.html', new FakeResponse('cached-shell'));
let resolveNetwork;
const refresh = new Promise(resolve => { resolveNetwork = resolve; });
const warm = await runNavigation(refresh);
assert.equal(warm.response.body, 'cached-shell');
assert.ok(warm.event.background, 'warm navigation did not schedule background refresh');
resolveNetwork(new FakeResponse('new-shell'));
await warm.event.background;
assert.equal((await shell.match('/index.html')).body, 'new-shell');
assert.equal((await shell.match('/')).body, 'new-shell');

// A first launch without a shell waits for the network; a failure becomes a
// normal 503 response so Android can show its existing retry/error panel.
cacheStores.clear();
const cold = await runNavigation(Promise.resolve(new FakeResponse('first-shell')));
assert.equal(cold.response.body, 'first-shell');
assert.equal((await cacheFor('ai-shakedown-console-shell-v32-r3').match('/index.html')).body, 'first-shell');

cacheStores.clear();
const offline = await runNavigation(Promise.reject(new Error('offline')));
assert.equal(offline.response.status, 503);
assert.match(offline.response.body, /尚未缓存/);

// Network errors and HTTP errors never replace a working shell.
const activeShell = cacheFor('ai-shakedown-console-shell-v32-r3');
await activeShell.put('/index.html', new FakeResponse('working-shell'));
const offlineWarm = await runNavigation(Promise.reject(new Error('offline')));
assert.equal(offlineWarm.response.body, 'working-shell');
await offlineWarm.event.background;
const unavailable = await runNavigation(Promise.resolve(new FakeResponse('unavailable', { status: 503 })));
await unavailable.event.background;
assert.equal((await activeShell.match('/index.html')).body, 'working-shell');

// Explicit refresh bypasses the stale shell without throwing away offline fallback.
const manual = await runNavigation(Promise.resolve(new FakeResponse('manual-refresh')), { ...request, url: 'https://app.test/?refresh=31' });
assert.equal(manual.response.body, 'manual-refresh');
const manualOffline = await runNavigation(Promise.reject(new Error('offline')), { ...request, url: 'https://app.test/?refresh=31' });
assert.equal(manualOffline.response.body, 'manual-refresh');

// Non-HTML navigation responses must not poison the shell cache.
const nonHtml = await runNavigation(Promise.resolve(new FakeResponse('not-html', { contentType: 'text/plain' })));
await nonHtml.event.background;
assert.equal((await activeShell.match('/index.html')).body, 'manual-refresh');

// APK downloads and other paths must never receive the home page shell.
const apk = await runNavigation(Promise.resolve(new FakeResponse('apk-binary', { contentType: 'application/vnd.android.package-archive' })), {
    ...request, url: 'https://app.test/assets/AI-Shakedown-Console-v31-debug.apk?v=31-r1'
});
assert.equal(apk.response.body, 'apk-binary');
assert.equal(apk.response.headers.get('Content-Type'), 'application/vnd.android.package-archive');

// Cache quota/write failures must not turn a successful first launch into a 503.
cacheStores.clear();
cacheFor('ai-shakedown-console-shell-v32-r3').put = async () => { throw new Error('quota'); };
const quota = await runNavigation(Promise.resolve(new FakeResponse('network-without-cache')));
assert.equal(quota.response.body, 'network-without-cache');

console.log('PWA cache validation passed: warm/cold/offline launches, background refresh, manual refresh, HTTP/content errors, APK navigation and cache-write failure.');
