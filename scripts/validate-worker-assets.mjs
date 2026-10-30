import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerSource = fs.readFileSync(path.join(root, '_worker.js'), 'utf8');
const workerModule = await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`);
const worker = workerModule.default;

const env = {
    ASSETS: {
        async fetch(request) {
            const url = new URL(request.url);
            if (url.pathname === '/') {
                return new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
            if (url.pathname.endsWith('.apk')) {
                return new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]));
            }
            return new Response('asset', { headers: { 'X-Passthrough': 'yes' } });
        }
    }
};

const apkRequest = new Request(
    'https://example.test/assets/AI-Shakedown-Console-v31-debug.apk?v=31-r1',
    { headers: { Accept: 'text/html,application/xhtml+xml' } }
);
const apkResponse = await worker.fetch(apkRequest, env);
assert.equal(apkResponse.status, 200);
assert.equal(apkResponse.headers.get('Content-Type'), 'application/vnd.android.package-archive');
assert.equal(apkResponse.headers.get('Content-Disposition'), 'attachment; filename="AI-Shakedown-Console-v31-debug.apk"');
assert.equal(apkResponse.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
assert.equal(apkResponse.headers.get('X-Content-Type-Options'), 'nosniff');
assert.deepEqual([...new Uint8Array(await apkResponse.arrayBuffer())], [0x50, 0x4b, 0x03, 0x04]);

const documentResponse = await worker.fetch(new Request('https://example.test/'), env);
assert.equal(documentResponse.headers.get('Content-Type'), 'text/html; charset=utf-8');
assert.equal(documentResponse.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate');
assert.equal(documentResponse.headers.get('X-App-Version'), 'v32');

const passthroughResponse = await worker.fetch(new Request('https://example.test/assets/icon-192.png'), env);
assert.equal(passthroughResponse.headers.get('X-Passthrough'), 'yes');
assert.equal(passthroughResponse.headers.get('Content-Disposition'), null);

const serviceWorker = fs.readFileSync(path.join(root, 'assets', 'service-worker.js'), 'utf8');
assert.match(serviceWorker, /shell-v32-r3/);
assert.match(serviceWorker, /runtime-v32-r3/);
assert.match(serviceWorker, /cache\.put\('\/index\.html', response\.clone\(\)\)/);

console.log('Worker asset header validation passed.');
