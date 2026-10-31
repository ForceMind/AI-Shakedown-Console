import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'assets/service-worker.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/manifest.webmanifest'), 'utf8'));
assert.match(source, /const APP_VERSION = 'v32'/);
assert.match(fs.readFileSync(path.join(root, '_worker.js'), 'utf8'), /const APP_VERSION = 'v32'/);
assert.match(fs.readFileSync(path.join(root, 'assets/local-codex-bridge.mjs'), 'utf8'), /const BRIDGE_VERSION = 'v32'/);
assert.match(serviceWorker, /shell-v32-r4/);
assert.match(serviceWorker, /runtime-v32-r4/);
for (const asset of ['script.js?v=32-r3', 'style.css?v=32-r4', 'assets/manifest.webmanifest?v=32']) {
    assert.ok(html.includes(asset) && serviceWorker.includes(asset), `Mismatched precache URL: ${asset}`);
}
assert.ok(manifest.icons.every((icon) => icon.src.endsWith('?v=32')));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const [, id] of source.matchAll(/\$\('([^']+)'\)/g)) {
    assert.ok(ids.includes(id), `Missing control: ${id}`);
}
for (const [, target] of html.matchAll(/aria-controls="([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing aria-controls target: ${target}`);
}

class Classes {
    values = new Set();
    add(...names) { names.forEach((name) => this.values.add(name)); }
    remove(...names) { names.forEach((name) => this.values.delete(name)); }
    contains(name) { return this.values.has(name); }
    toggle(name, force = !this.contains(name)) {
        if (force) this.add(name);
        else this.remove(name);
        return force;
    }
}

let mobile = false;
const document = { body: { classList: new Classes() }, activeElement: null };
const node = () => ({
    classList: new Classes(), attributes: {}, inert: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    contains(target) { return target === this; },
    focus() { document.activeElement = this; }
});
const elements = Object.fromEntries([
    'workspaceSidebar', 'drawerOverlay', 'settingsToggle', 'settingsToggleLabel',
    'settingsToggleIcon', 'sidebarSettingsButton', 'sidebarConversationsButton',
    'conversationSidebarToggle'
].map((name) => [name, node()]));
const context = vm.createContext({ document, elements, window: { matchMedia: () => ({ matches: mobile }) } });
const sidebarStart = source.indexOf('function syncConversationSidebarMode()');
const sidebarEnd = source.indexOf('function restoreConversations()', sidebarStart);
const layoutStart = source.indexOf('function isMobileWorkspace()');
const layoutEnd = source.indexOf('\ntry {\n    initialize();', layoutStart);
assert.ok(sidebarStart > 0 && sidebarEnd > sidebarStart && layoutEnd > layoutStart);
vm.runInContext(source.slice(sidebarStart, sidebarEnd) + source.slice(layoutStart, layoutEnd), context);
const run = (name) => vm.runInContext(`${name}()`, context);
const has = (name) => document.body.classList.contains(name);
const expanded = () => elements.conversationSidebarToggle.attributes['aria-expanded'];

run('initializeWorkspaceLayout');
assert.ok(has('sidebar-conversations') && !has('sidebar-settings'));
assert.equal(expanded(), 'true');
assert.equal(elements.workspaceSidebar.inert, false);
assert.equal(elements.drawerOverlay.classList.contains('is-open'), false);

run('collapseWorkspaceSidebar');
assert.ok(has('sidebar-collapsed'));
assert.equal(expanded(), 'false');
assert.equal(elements.workspaceSidebar.inert, true);
assert.equal(document.activeElement, elements.conversationSidebarToggle);
run('openSettings');
assert.ok(has('sidebar-settings') && !has('sidebar-collapsed'));
assert.equal(run('settingsAreVisible'), true);
assert.equal(elements.workspaceSidebar.inert, false);
run('toggleSettings');
assert.ok(has('sidebar-conversations') && !has('sidebar-settings'));
run('toggleConversationSidebar');
assert.equal(expanded(), 'false');
run('toggleConversationSidebar');
assert.equal(expanded(), 'true');

mobile = true;
run('initializeWorkspaceLayout');
assert.equal(expanded(), 'false', 'mobile must start with the drawer closed');
assert.equal(elements.workspaceSidebar.inert, true);
run('openConversationSidebar');
assert.equal(expanded(), 'true');
assert.equal(elements.drawerOverlay.classList.contains('is-open'), true);
run('openSettings');
assert.equal(run('settingsAreVisible'), true);
run('closeSettings');
assert.equal(expanded(), 'false');
assert.equal(elements.drawerOverlay.classList.contains('is-open'), false);
run('openConversationSidebar');
document.activeElement = elements.workspaceSidebar;
run('closeWorkspaceSidebar');
assert.equal(document.activeElement, elements.conversationSidebarToggle);
assert.equal(elements.workspaceSidebar.attributes['aria-hidden'], 'true');

// Crossing a breakpoint re-evaluates visibility and the backdrop; it does not
// read or write conversations, drafts, attachments, or layout preference keys.
mobile = false;
run('syncWorkspaceMode');
assert.equal(expanded(), 'true');
assert.equal(elements.workspaceSidebar.inert, false);
assert.equal(elements.drawerOverlay.classList.contains('is-open'), false);
mobile = true;
run('syncWorkspaceMode');
assert.equal(expanded(), 'false');
assert.equal(elements.workspaceSidebar.inert, true);

// Preserve v31 reading-position behavior during streaming and final rerenders.
elements.chatWindow = { scrollTop: 100, scrollHeight: 1000, clientHeight: 400 };
const scrollStart = source.indexOf('function captureChatScrollPosition()');
vm.runInContext(source.slice(scrollStart, layoutStart), context);
let position = run('captureChatScrollPosition');
elements.chatWindow.scrollHeight += 200;
context.savedPosition = position;
vm.runInContext('restoreChatScrollPosition(savedPosition)', context);
assert.equal(elements.chatWindow.scrollTop, 100);
elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight - elements.chatWindow.clientHeight;
position = run('captureChatScrollPosition');
assert.equal(position.atBottom, true);
elements.chatWindow.scrollHeight += 200;
context.savedPosition = position;
vm.runInContext('restoreChatScrollPosition(savedPosition)', context);
assert.equal(elements.chatWindow.scrollTop, elements.chatWindow.scrollHeight);

console.log('Chat layout validation passed: control references, desktop/mobile sidebar states, breakpoint changes, focus and inert state, streaming scroll preservation. No browser rendered.');
