import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Run against tests/mock-server.mjs in a fresh browser context. All model
// responses below are controlled fixtures; no real API or credentials are used.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
const outputDirectory = process.env.TEST_OUTPUT_DIR || '/tmp/ai-shakedown-chat-scroll';
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
});
const results = [];

try {
    for (const mobile of [false, true]) {
        const name = mobile ? 'touch' : 'desktop';
        const context = await browser.newContext({
            viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
            isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block'
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(baseUrl => {
            localStorage.setItem('ai-shakedown-console.help-intro.v1', '1');
            localStorage.setItem('ai-shakedown-console.settings.v1', JSON.stringify({
                provider: 'custom', protocol: 'openai', baseUrl: `${baseUrl}/mock/v1`,
                chatPath: '/chat/completions', authMode: 'none', model: 'scroll-fixture',
                stream: true, proxy: false
            }));
            const originalFetch = window.fetch.bind(window);
            window.fetch = (input, options = {}) => {
                if (!String(input).includes('/mock/v1/chat/completions')) return originalFetch(input, options);
                const encoder = new TextEncoder();
                return Promise.resolve(new Response(new ReadableStream({
                    start(controller) {
                        const send = text => controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
                        window.scrollFixture = {
                            send,
                            finish() { controller.enqueue(encoder.encode('data: [DONE]\n\n')); controller.close(); },
                            fail() { controller.enqueue(encoder.encode('event: error\ndata: {"error":{"message":"Simulated stream failure"}}\n\n')); controller.close(); }
                        };
                        options.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')), { once: true });
                    }
                }), { headers: { 'Content-Type': 'text/event-stream' } }));
            };
        }, baseUrl);
        await page.goto(`${baseUrl}/?no-sw=1`);
        if (await page.locator('body').evaluate(el => el.classList.contains('sidebar-settings'))) {
            await page.locator('#settings-toggle').click();
        }

        const settled = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const metrics = () => page.locator('#chat-window').evaluate(el => ({ top: el.scrollTop, gap: el.scrollHeight - el.clientHeight - el.scrollTop }));
        const atBottom = async label => assert.ok(Math.abs((await metrics()).gap) <= 2, `${name}: ${label}`);
        const stable = async (top, label) => assert.ok(Math.abs((await metrics()).top - top) <= 2, `${name}: ${label}; expected ${top}, got ${(await metrics()).top}`);
        const chunk = async text => { await page.evaluate(text => window.scrollFixture.send(text), text); await settled(); };
        const begin = async () => {
            await page.locator('#message-input').fill('请生成用于滚动回归的长回答');
            await page.locator('#send-button').click();
            await page.waitForFunction(() => Boolean(window.scrollFixture));
            await chunk('## 流式回答\n\n' + '用于验证阅读位置的段落。\n\n'.repeat(70));
        };
        const finish = async method => {
            if (method === 'abort') await page.locator('#stop-request').click();
            else await page.evaluate(method => window.scrollFixture[method](), method);
            await page.waitForFunction(() => document.querySelector('#send-button').disabled === false);
            await settled();
            await page.evaluate(() => { window.scrollFixture = null; });
        };
        const scrollUp = async () => {
            // Keep tokens arriving during the gesture, so a passing drag also
            // proves rendering does not cancel or overpower native scrolling.
            await page.evaluate(() => {
                window.scrollFixture.timer = setInterval(() => window.scrollFixture.send('滑动期间仍在生成。\n\n'), 60);
            });
            const box = await page.locator('#chat-window').boundingBox();
            if (mobile) {
                const cdp = await context.newCDPSession(page);
                const x = Math.round(box.x + box.width / 2);
                const y = Math.round(box.y + box.height / 3);
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
                for (let offset = 30; offset <= 180; offset += 30) {
                    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + offset }] });
                    await page.waitForTimeout(30);
                }
                await page.waitForTimeout(160);
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                await cdp.detach();
            } else {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.wheel(0, -350);
            }
            await page.waitForTimeout(250);
            await page.evaluate(() => clearInterval(window.scrollFixture.timer));
            await settled();
            assert.ok((await metrics()).gap > 30, `${name}: native input must scroll away from bottom`);
            return (await metrics()).top;
        };

        await begin();
        await atBottom('large initial chunk follows');
        await chunk('追加内容。\n\n'.repeat(4));
        await atBottom('continues following at bottom');
        let top = await scrollUp();
        await chunk('用户正在向上阅读。\n\n'.repeat(12));
        await stable(top, 'native upward scroll survives next chunk');
        // A small step away from the bottom must also disable following.
        await page.locator('#chat-window').evaluate(el => { el.scrollTop = el.scrollHeight - el.clientHeight - 4; });
        top = (await metrics()).top;
        await chunk('小幅滚动后仍保留阅读位置。\n\n');
        await stable(top, 'small upward scroll survives next chunk');
        await page.locator('#chat-window').evaluate(el => { el.scrollTop = el.scrollHeight; });
        await chunk('回到底部后恢复跟随。\n\n'.repeat(3));
        await atBottom('returning to bottom resumes following');
        await scrollUp();
        await page.locator('#chat-window').evaluate(el => { el.scrollTop = 180; });
        top = (await metrics()).top;
        await finish('finish');
        await stable(top, 'success rerender preserves reading position');
        await page.screenshot({ path: `${outputDirectory}/${name}-completed.png` });
        results.push(`${name}: follow, native scroll, small scroll, resume, completion PASS`);

        await begin();
        await atBottom('new message returns to bottom');
        top = await scrollUp();
        await chunk('停止前追加的内容。\n\n');
        await stable(top, 'scroll remains paused before stopping');
        await finish('abort');
        await stable(top, 'stop rerender preserves reading position');
        results.push(`${name}: new submission, partial abort PASS`);

        await begin();
        await page.locator('#chat-window').evaluate(el => { el.scrollTop = 120; });
        top = (await metrics()).top;
        await finish('fail');
        await stable(top, 'error rerender preserves earlier history position');
        if (mobile) await page.keyboard.press('Escape');
        else await page.locator('#settings-toggle').click();
        results.push(`${name}: stream failure PASS`);

        await begin();
        await finish('finish');
        await atBottom('success stays at bottom when following');
        assert.deepEqual(errors, [], `${name}: browser errors`);
        results.push(`${name}: completion while following, no page errors PASS`);
        await context.close();
    }
    console.log(results.join('\n'));
    console.log(`Screenshots: ${outputDirectory}`);
} finally {
    await browser.close();
}
