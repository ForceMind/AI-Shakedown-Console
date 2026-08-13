import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.TEST_PORT || 4173);
const requestRecords = [];

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function sendJson(response, status, payload) {
    response.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    response.end(JSON.stringify(payload));
}

function hasOpenAiImage(messages) {
    return (messages || []).some((message) => Array.isArray(message.content)
        && message.content.some((part) => part?.type === 'image_url'));
}

function hasAnthropicImage(messages) {
    return (messages || []).some((message) => Array.isArray(message.content)
        && message.content.some((part) => part?.type === 'image'));
}

function hasGeminiImage(contents) {
    return (contents || []).some((content) => (content.parts || []).some((part) => part?.inlineData));
}

function responseText(body) {
    const source = JSON.stringify(body);
    if (source.includes('仅回复 OK')) return 'OK';
    if (source.includes('继续完成')) return '这是继续生成的内容。';
    return '## 测试回答\n\n已收到消息。\n\n```js\nconsole.log("safe");\n```';
}

function sendOpenAi(response, body) {
    const text = responseText(body);
    if (body.stream) {
        response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
        response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
        response.end('data: [DONE]\n\n');
        return;
    }
    sendJson(response, 200, { choices: [{ message: { role: 'assistant', content: text } }], usage: { prompt_tokens: 8, completion_tokens: 10 } });
}

function sendAnthropic(response, body) {
    const text = responseText(body);
    if (body.stream) {
        response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
        response.write(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`);
        response.end(`event: message_stop\ndata: ${JSON.stringify({ type: 'message_stop' })}\n\n`);
        return;
    }
    sendJson(response, 200, { content: [{ type: 'text', text }], usage: { input_tokens: 8, output_tokens: 10 } });
}

function sendGemini(response, body, stream) {
    const payload = { candidates: [{ content: { role: 'model', parts: [{ text: responseText(body) }] } }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 10 } };
    if (stream) {
        response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
        response.end(`data: ${JSON.stringify(payload)}\n\n`);
        return;
    }
    sendJson(response, 200, payload);
}

async function readBody(request) {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function handleApi(request, response, url) {
    if (request.method === 'OPTIONS') {
        response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
        response.end();
        return true;
    }
    if (request.method === 'GET' && /\/models$/.test(url.pathname)) {
        sendJson(response, 200, { data: [{ id: 'vision-model' }, { id: 'text-model' }, { id: 'error-model' }] });
        return true;
    }
    if (request.method === 'GET' && url.pathname === '/mock/assertions') {
        sendJson(response, 200, { requests: requestRecords });
        return true;
    }
    if (request.method !== 'POST') return false;
    const body = await readBody(request);
    const textOnly = body.model === 'text-model'
        || url.searchParams.get('model') === 'text-model'
        || url.pathname.includes('/models/text-model:');
    if (/\/chat\/completions$/.test(url.pathname)) {
        requestRecords.push({ protocol: 'openai', model: body.model, image: hasOpenAiImage(body.messages), stream: Boolean(body.stream), sampleText: JSON.stringify(body).includes('sample-notes.md') });
        if (body.model === 'error-model' && !JSON.stringify(body).includes('仅回复 OK')) {
            sendJson(response, 500, { error: { message: 'Deliberate retry test failure.' } });
            return true;
        }
        if (textOnly && hasOpenAiImage(body.messages)) {
            sendJson(response, 400, { error: { message: 'This model does not support image_url or multimodal input.' } });
        } else sendOpenAi(response, body);
        return true;
    }
    if (/\/v1\/messages$/.test(url.pathname)) {
        requestRecords.push({ protocol: 'anthropic', model: body.model, image: hasAnthropicImage(body.messages), stream: Boolean(body.stream), sampleText: JSON.stringify(body).includes('sample-notes.md') });
        if (body.model === 'error-model' && !JSON.stringify(body).includes('仅回复 OK')) {
            sendJson(response, 500, { error: { message: 'Deliberate retry test failure.' } });
            return true;
        }
        if (textOnly && hasAnthropicImage(body.messages)) {
            sendJson(response, 400, { error: { message: 'Image content type is unsupported by this model.' } });
        } else sendAnthropic(response, body);
        return true;
    }
    if (/:(?:streamGenerateContent|generateContent)$/.test(url.pathname)) {
        const geminiModel = url.pathname.match(/\/models\/([^/:]+):/)?.[1] || '';
        requestRecords.push({ protocol: 'gemini', model: geminiModel, image: hasGeminiImage(body.contents), stream: /:streamGenerateContent$/.test(url.pathname), sampleText: JSON.stringify(body).includes('sample-notes.md') });
        if (geminiModel === 'error-model' && !JSON.stringify(body).includes('仅回复 OK')) {
            sendJson(response, 500, { error: { message: 'Deliberate retry test failure.' } });
            return true;
        }
        if (textOnly && hasGeminiImage(body.contents)) {
            sendJson(response, 400, { error: { message: 'inlineData image input is unsupported by this model.' } });
        } else sendGemini(response, body, /:streamGenerateContent$/.test(url.pathname));
        return true;
    }
    return false;
}

async function serveStatic(response, url) {
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^\/+/, '');
    const path = normalize(join(root, relative));
    if (!path.startsWith(root)) {
        response.writeHead(403).end('Forbidden');
        return;
    }
    try {
        const info = await stat(path);
        if (!info.isFile()) throw new Error('Not a file');
        response.writeHead(200, {
            'Content-Type': mimeTypes[extname(path)] || 'application/octet-stream',
            'Service-Worker-Allowed': '/',
            'Cache-Control': 'no-store'
        });
        response.end(await readFile(path));
    } catch (_) {
        response.writeHead(404).end('Not found');
    }
}

createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    try {
        if (url.pathname.startsWith('/mock/')) {
            if (await handleApi(request, response, url)) return;
        }
        await serveStatic(response, url);
    } catch (error) {
        sendJson(response, 500, { error: { message: error.message } });
    }
}).listen(port, '127.0.0.1', () => {
    process.stdout.write(`mock server ready http://127.0.0.1:${port}\n`);
});
