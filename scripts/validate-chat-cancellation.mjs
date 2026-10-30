import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const start = source.indexOf('async function sendMessage(');
const end = source.indexOf('async function testConnection(', start);

for (const scenario of [
    { name: 'before first delta', text: '', prior: [] },
    { name: 'attachments before first delta', text: '', prior: [], attachments: [{ id: 'file-1', kind: 'text', name: 'test.txt' }] },
    { name: 'existing history', text: '', prior: [{ id: 'old', role: 'assistant', content: 'previous' }] },
    { name: 'partial response', text: 'partial', prior: [] },
    { name: 'normal completion', text: 'complete', prior: [], complete: true }
]) {
    const prior = structuredClone(scenario.prior);
    const conversation = { title: 'New', history: prior, draft: 'question', draftAttachments: scenario.attachments || [], systemPrompt: '', parentConversationId: '' };
    const state = { busy: false, composerAttachments: scenario.attachments || [], multimodalStatus: 'supported' };
    const elements = { messageInput: { value: 'question', focus() {} }, systemPrompt: { value: 'system' } };
    let persisted;
    let rendered = 0;
    let counter = 0;
    const noop = () => {};
    const context = vm.createContext({
        state, elements, isCostLimitReached: () => false, validateConfiguration: noop,
        activeConversation: () => conversation,
        createStoredMessage: (role, content, attachments = []) => ({ id: String(++counter), role, content, attachments }),
        requestMessages: (message) => [...conversation.history, message], hydrateRequestMessages: async (messages) => messages,
        addMessage: () => ({ row: { classList: { remove: noop } } }),
        createStreamingMarkdownRenderer: () => ({ update: noop, finish: noop, cancel: noop }),
        renderComposerAttachments: noop, setBusy: (busy) => { state.busy = busy; },
        executeRequest: async (_messages, { onDelta }) => {
            if (scenario.text) onDelta(scenario.text);
            if (scenario.complete) return { text: scenario.text, usage: {}, duration: 1 };
            const error = new Error('cancelled'); error.name = 'AbortError'; throw error;
        },
        deriveConversationTitle: (text) => text,
        persistConversations: () => { persisted = JSON.parse(JSON.stringify(conversation)); },
        renderConversationTabs: noop, renderActiveConversation: () => { rendered++; },
        applyUsage: noop, setConnectionState: noop, showToast: noop
    });
    vm.runInContext(source.slice(start, end), context);
    await vm.runInContext('sendMessage({ preventDefault() {} })', context);
    assert.ok(persisted, `${scenario.name}: must persist`);
    assert.deepEqual(persisted.history.slice(0, prior.length), prior);
    const added = persisted.history.slice(prior.length);
    assert.equal(added.length, scenario.text ? 2 : 1, scenario.name);
    assert.equal(added[0].role, 'user');
    assert.equal(added[0].content, 'question');
    assert.deepEqual(added[0].attachments, scenario.attachments || []);
    if (scenario.text) assert.equal(added[1].content, scenario.text);
    assert.equal(persisted.systemPrompt, 'system');
    assert.equal(persisted.draft, '');
    assert.deepEqual(persisted.draftAttachments, []);
    assert.equal(state.busy, false);
    assert.equal(rendered, 1);
    console.log(`PASS ${scenario.name}: persisted messages, attachment references, cleared draft and unlocked UI`);
}
