import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const functions = [
    'normalizeAttachmentMetadata', 'normalizeStoredMessage', 'decodeBackupBase64',
    'deserializeBackupAttachment', 'conversationAttachmentIds', 'remapBackupAttachments',
    'normalizeBackupAgent', 'backupSourceConversationId', 'importedBackupConversation',
    'importConversationBackup'
].map((name) => {
    const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
    assert.ok(start >= 0, name);
    const next = source.slice(start + 1).search(/^(?:async )?function /m);
    return source.slice(start, next < 0 ? undefined : start + 1 + next);
}).join('\n');

const attachment = { id: 'original-file', name: 'test.txt', type: 'text/plain', size: 4, kind: 'text' };
const message = (id, content) => ({ id, role: 'user', content, attachments: [attachment] });
const conversations = [
    { id: 'parent', title: 'Parent', history: [message('copied', 'keep'), message('parent-point', 'original')] },
    { id: 'edited', title: 'Edited', parentConversationId: 'parent', branchAtMessageId: 'parent-point', history: [message('copied', 'keep'), message('edited-point', 'edited')], systemPrompt: 'retained system', activeAgent: { id: 'test-agent', name: 'Test agent' }, draft: 'retained draft', draftAttachments: [attachment] },
    { id: 'nested', title: 'Nested', parentConversationId: 'edited', branchAtMessageId: 'edited-point', history: [message('nested-message', 'nested')] },
    { id: 'shared', title: 'Shared ID', parentConversationId: 'parent', branchAtMessageId: 'copied', history: [message('copied', 'keep')] },
    { id: 'legacy', title: 'Legacy', parentConversationId: 'missing', branchAtMessageId: 'legacy-point', history: [message('legacy-point', 'legacy')] }
];

function setup(order, failure = '') {
    let sequence = 0;
    let persisted;
    const notices = [];
    const existing = { id: 'existing', history: [message('existing-message', 'do not alter')], draft: 'existing draft' };
    const records = new Map([['original-file', { data: 'existing attachment' }]]);
    const state = { busy: false, chatBackupBusy: false, conversations: [existing], activeConversationId: existing.id };
    const backup = {
        format: 'ai-shakedown-console-chat-backup', formatVersion: 1, backupId: 'branch-backup',
        activeConversationId: 'nested', conversations: order.map((i) => structuredClone(conversations[i])),
        attachments: [{ ...attachment, encoding: failure === 'attachment' ? 'invalid' : 'utf-8', data: 'test' }]
    };
    const text = JSON.stringify(backup);
    const file = { name: 'branches.json', size: text.length, text: async () => text };
    const context = vm.createContext({
        Blob, ArrayBuffer, Uint8Array, Map, Set, Date,
        CHAT_BACKUP_FORMAT: backup.format, CHAT_BACKUP_FORMAT_VERSION: 1,
        MAX_CHAT_BACKUP_FILE_BYTES: 512 * 1024 * 1024, MAX_IMAGE_ATTACHMENT_BYTES: 5 * 1024 * 1024,
        MAX_EXTRACTED_ATTACHMENT_CHARS: 500000, MAX_TEXT_ATTACHMENT_BYTES: 1024 * 1024,
        state, elements: { chatBackupFile: { files: [file], value: 'selected' } },
        createId: (kind) => `${kind}-new-${++sequence}`,
        setChatBackupBusy: (busy) => { state.chatBackupBusy = busy; },
        putAttachmentRecord: async (record) => records.set(record.id, record),
        deleteAttachmentRecord: async (id) => records.delete(id),
        persistConversations: () => {
            if (failure === 'persistence') return false;
            persisted = JSON.parse(JSON.stringify(state));
            return true;
        },
        renderConversationTabs() {}, renderActiveConversation() {}, syncConversationSidebarMode() {}, closeSettings() {},
        showToast: (text, error) => notices.push({ text, error })
    });
    vm.runInContext(functions, context);
    return { state, records, existing, notices, saved: () => persisted, run: () => vm.runInContext('importConversationBackup()', context) };
}

for (const order of [[0, 1, 2, 3, 4], [2, 3, 4, 1, 0]]) {
    const env = setup(order);
    await env.run();
    assert.equal(env.state.conversations.length, 6);
    assert.equal(env.state.conversations[0], env.existing);
    const find = (title) => env.state.conversations.find((item) => item.title === title);
    const parent = find('Parent'), edited = find('Edited'), nested = find('Nested'), shared = find('Shared ID');
    assert.equal(edited.parentConversationId, parent.id);
    assert.equal(edited.branchAtMessageId, parent.history[1].id, 'edited-away point must resolve in parent');
    assert.equal(nested.parentConversationId, edited.id);
    assert.equal(nested.branchAtMessageId, edited.history[1].id, 'nested point must resolve in immediate parent');
    assert.notEqual(shared.history[0].id, parent.history[0].id);
    assert.equal(shared.branchAtMessageId, parent.history[0].id, 'parent map must win over copied ID in branch');
    assert.equal(find('Legacy').branchAtMessageId, find('Legacy').history[0].id, 'preserve legacy local reference fallback');
    assert.equal(edited.draft, 'retained draft');
    assert.equal(edited.systemPrompt, 'retained system');
    assert.equal(edited.activeAgent.name, 'Test agent');
    assert.equal(edited.draftAttachments[0].id, edited.history[0].attachments[0].id);
    assert.equal(env.records.get(edited.draftAttachments[0].id).data, 'test');
    assert.equal(env.records.get('original-file').data, 'existing attachment');
    assert.equal(env.state.activeConversationId, nested.id);
    assert.equal(env.saved().conversations.find((item) => item.title === 'Edited').branchAtMessageId, parent.history[1].id);
    const ids = env.state.conversations.flatMap((item) => item.history.map((m) => m.id));
    assert.equal(new Set(ids).size, ids.length, 'messages must get distinct IDs across conversations');
    const snapshot = JSON.stringify(env.state.conversations);
    await env.run();
    assert.equal(JSON.stringify(env.state.conversations), snapshot);
    assert.equal(env.records.size, 2);
    assert.ok(env.notices.at(-1).text.includes('已经导入过'));
    console.log(`PASS ${order[0] === 0 ? 'parent-first' : 'child-first'}: edited, nested and copied IDs; legacy fallback; drafts/agent/attachments; duplicate import`);
}
for (const failure of ['persistence', 'attachment']) {
    const env = setup([2, 1, 0], failure);
    await env.run();
    assert.equal(env.state.conversations.length, 1);
    assert.equal(env.state.conversations[0], env.existing);
    assert.equal(env.state.activeConversationId, 'existing');
    assert.equal(env.records.size, 1);
    assert.equal(env.records.get('original-file').data, 'existing attachment');
    assert.ok(env.notices.at(-1).error);
    assert.equal(env.state.chatBackupBusy, false);
    console.log(`PASS ${failure}: restore previous state and preserve existing attachments`);
}
console.log('Backup branch regression passed using actual import code in Node VM; browser Origins and real IndexedDB are not exercised.');
