import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const name of ['temperature', 'top-p']) {
    const toggle = html.match(new RegExp(`<input id="${name}-enabled"[^>]*>`))?.[0] || '';
    assert.ok(toggle, `${name} toggle is missing`);
    assert.doesNotMatch(toggle, /\schecked(?:\s|>|=)/, `${name} must default to disabled`);
}
for (const name of ['top-k', 'max-tokens']) {
    assert.match(html, new RegExp(`id="${name}-enabled"[^>]*type="checkbox"[^>]*checked`), `${name} must default to enabled`);
}
assert.match(source, /temperatureEnabled:\s*false/);
assert.match(source, /topPEnabled:\s*false/);
assert.match(source, /topKEnabled:\s*true/);
assert.match(source, /maxTokensEnabled:\s*true/);

const functionSource = (name, nextName) => {
    const start = source.indexOf(`function ${name}(`);
    const end = source.indexOf(`\nfunction ${nextName}(`, start);
    assert.ok(start >= 0 && end > start, `Unable to extract ${name}`);
    return source.slice(start, end);
};

const numberValueSource = functionSource('numberValue', 'generationParameterControls');
const enabledNumberValueSource = functionSource('enabledNumberValue', 'openAiRequestMessage');
const buildRequestBodySource = functionSource('buildRequestBody', 'validateConfiguration');

const elements = {
    protocol: { value: 'openai' },
    model: { value: 'gpt-test' },
    temperature: { value: '0.7' },
    temperatureEnabled: { checked: false },
    topP: { value: '1' },
    topPEnabled: { checked: false },
    topK: { value: '40' },
    topKEnabled: { checked: false },
    maxTokens: { value: '1024' },
    maxTokensEnabled: { checked: false },
    reasoningEffort: { value: '' },
    extraBody: { value: '' }
};

const createBuildRequestBody = new Function(
    'elements',
    'parseJsonObject',
    'openAiRequestMessage',
    'anthropicRequestMessage',
    'geminiRequestParts',
    `${numberValueSource}\n${enabledNumberValueSource}\n${buildRequestBodySource}\nreturn buildRequestBody;`
);
const buildRequestBody = createBuildRequestBody(
    elements,
    () => ({}),
    (message) => message,
    (message) => message,
    (message) => [{ text: message.content }]
);
const messages = [{ role: 'user', content: 'hello' }];

const disabledBody = buildRequestBody(messages, true, { maxTokens: 2 });
assert.deepEqual(disabledBody, { model: 'gpt-test', messages, stream: true });

elements.temperatureEnabled.checked = true;
elements.topPEnabled.checked = true;
elements.topKEnabled.checked = true;
elements.maxTokensEnabled.checked = true;
const enabledBody = buildRequestBody(messages, false);
assert.equal(enabledBody.temperature, 0.7);
assert.equal(enabledBody.top_p, 1);
assert.equal(enabledBody.top_k, 40);
assert.equal(enabledBody.max_tokens, 1024);

elements.protocol.value = 'gemini';
elements.temperatureEnabled.checked = false;
elements.topPEnabled.checked = false;
elements.topKEnabled.checked = false;
elements.maxTokensEnabled.checked = false;
const geminiBody = buildRequestBody(messages, false);
assert.ok(!('generationConfig' in geminiBody), 'Gemini must omit an empty generationConfig');

for (const setting of ['temperatureEnabled', 'topPEnabled', 'topKEnabled', 'maxTokensEnabled']) {
    assert.match(source, new RegExp(`${setting}: elements\\.${setting}\\.checked`), `${setting} must be persisted`);
    assert.match(source, new RegExp(`typeof settings\\[settingName\\] === 'boolean'`), 'legacy settings must default toggles safely');
}

console.log('Generation parameter toggle validation passed.');
