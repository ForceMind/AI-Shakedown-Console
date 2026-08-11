const PROVIDERS = [
    {
        id: 'openai', name: 'OpenAI', protocol: 'openai', baseUrl: 'https://api.openai.com/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'gpt-4.1-mini',
        models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini']
    },
    {
        id: 'anthropic', name: 'Anthropic', protocol: 'anthropic', baseUrl: 'https://api.anthropic.com',
        chatPath: '/v1/messages', modelsPath: '/v1/models', auth: 'x-api-key', model: 'claude-sonnet-4-20250514',
        models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-20241022']
    },
    {
        id: 'gemini', name: 'Google Gemini', protocol: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com',
        chatPath: '/v1beta/models/{model}:{action}', modelsPath: '/v1beta/models', auth: 'query', model: 'gemini-2.5-flash',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash']
    },
    {
        id: 'deepseek', name: 'DeepSeek', protocol: 'openai', baseUrl: 'https://api.deepseek.com',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner']
    },
    {
        id: 'qwen', name: '阿里云百炼 / 千问', protocol: 'openai', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'qwen-plus',
        models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long']
    },
    {
        id: 'doubao', name: '火山引擎 / 豆包', protocol: 'openai', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'YOUR-ENDPOINT-ID', models: []
    },
    {
        id: 'hunyuan', name: '腾讯混元', protocol: 'openai', baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'hunyuan-turbos-latest',
        models: ['hunyuan-turbos-latest', 'hunyuan-turbo-latest']
    },
    {
        id: 'qianfan', name: '百度千帆 / ERNIE', protocol: 'openai', baseUrl: 'https://qianfan.baidubce.com/v2',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'ernie-4.0-8k-latest',
        models: ['ernie-4.0-8k-latest', 'ernie-speed-128k']
    },
    {
        id: 'moonshot', name: 'Moonshot / Kimi', protocol: 'openai', baseUrl: 'https://api.moonshot.cn/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'moonshot-v1-8k',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
    },
    {
        id: 'zhipu', name: '智谱 GLM', protocol: 'openai', baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'glm-4-flash',
        models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash']
    },
    {
        id: 'siliconflow', name: '硅基流动 SiliconFlow', protocol: 'openai', baseUrl: 'https://api.siliconflow.cn/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'deepseek-ai/DeepSeek-V3',
        models: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-72B-Instruct']
    },
    {
        id: 'openrouter', name: 'OpenRouter', protocol: 'openai', baseUrl: 'https://openrouter.ai/api/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'openai/gpt-4o-mini',
        models: ['openai/gpt-4o-mini', 'anthropic/claude-sonnet-4', 'google/gemini-2.5-flash']
    },
    {
        id: 'groq', name: 'Groq', protocol: 'openai', baseUrl: 'https://api.groq.com/openai/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'llama-3.3-70b-versatile',
        models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b']
    },
    {
        id: 'xai', name: 'xAI', protocol: 'openai', baseUrl: 'https://api.x.ai/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'grok-3-mini',
        models: ['grok-3', 'grok-3-mini']
    },
    {
        id: 'mistral', name: 'Mistral AI', protocol: 'openai', baseUrl: 'https://api.mistral.ai/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'mistral-small-latest',
        models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest']
    },
    {
        id: 'together', name: 'Together AI', protocol: 'openai', baseUrl: 'https://api.together.xyz/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo']
    },
    {
        id: 'perplexity', name: 'Perplexity', protocol: 'openai', baseUrl: 'https://api.perplexity.ai',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'sonar',
        models: ['sonar', 'sonar-pro', 'sonar-reasoning-pro']
    },
    {
        id: 'nvidia', name: 'NVIDIA NIM', protocol: 'openai', baseUrl: 'https://integrate.api.nvidia.com/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'meta/llama-3.3-70b-instruct',
        models: ['meta/llama-3.3-70b-instruct', 'deepseek-ai/deepseek-r1']
    },
    {
        id: 'fireworks', name: 'Fireworks AI', protocol: 'openai', baseUrl: 'https://api.fireworks.ai/inference/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
        models: ['accounts/fireworks/models/llama-v3p3-70b-instruct']
    },
    {
        id: 'cohere', name: 'Cohere Compatibility', protocol: 'openai', baseUrl: 'https://api.cohere.ai/compatibility/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'command-r-plus',
        models: ['command-r-plus', 'command-r']
    },
    {
        id: 'azure', name: 'Azure OpenAI', protocol: 'openai', baseUrl: 'https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT',
        chatPath: '/chat/completions?api-version=2024-10-21', modelsPath: '', auth: 'api-key', model: 'YOUR-DEPLOYMENT',
        models: []
    },
    {
        id: 'ollama', name: 'Ollama（本地）', protocol: 'openai', baseUrl: 'http://localhost:11434/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'none', model: 'llama3.2',
        models: ['llama3.2', 'qwen2.5', 'deepseek-r1']
    },
    {
        id: 'lmstudio', name: 'LM Studio（本地）', protocol: 'openai', baseUrl: 'http://localhost:1234/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'none', model: 'local-model', models: []
    },
    {
        id: 'custom', name: '自定义 / 自建站', protocol: 'openai', baseUrl: 'http://localhost:8000/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'model-name', models: []
    }
];

const $ = (id) => document.getElementById(id);

const elements = {
    provider: $('provider-select'), protocol: $('protocol-select'), baseUrl: $('base-url'), chatPath: $('chat-path'),
    modelsPath: $('models-path'), apiKey: $('api-key'), authMode: $('auth-mode'), model: $('model-input'),
    proxy: $('proxy-toggle'), modelSelect: $('model-select'),
    customHeaders: $('custom-headers'), extraBody: $('extra-body'),
    endpointPreview: $('endpoint-preview'), stream: $('stream-toggle'), temperature: $('temperature'),
    topP: $('top-p'), topK: $('top-k'), maxTokens: $('max-tokens'), systemPrompt: $('system-prompt'),
    messageForm: $('message-form'), messageInput: $('message-input'), sendButton: $('send-button'),
    testButton: $('test-connection'), loadModelsButton: $('load-models'), stopButton: $('stop-request'),
    chatWindow: $('chat-window'), emptyState: $('empty-state'), emptyEndpoint: $('empty-endpoint'),
    activeModelTitle: $('active-model-title'), connectionState: $('connection-state'),
    connectionStateText: $('connection-state-text'), latencyText: $('latency-text'), inspector: $('inspector-content'),
    httpStatus: $('http-status'), duration: $('request-duration'), requestProtocol: $('request-protocol'),
    inputTokens: $('total-input-tokens'), outputTokens: $('total-output-tokens'), totalRequests: $('total-requests'),
    totalCost: $('total-cost'), inputPrice: $('input-price'), outputPrice: $('output-price'), costLimit: $('cost-limit'),
    settingsPanel: $('settings-panel'), drawerOverlay: $('drawer-overlay'), toastRegion: $('toast-region')
};

const state = {
    history: [],
    controller: null,
    busy: false,
    totals: { input: 0, output: 0, requests: 0, cost: 0 },
    inspector: { request: '尚无请求', response: '尚无响应', events: '尚无流式事件' },
    inspectorTab: 'request'
};

class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function initialize() {
    for (const provider of PROVIDERS) {
        const option = document.createElement('option');
        option.value = provider.id;
        option.textContent = provider.name;
        elements.provider.appendChild(option);
    }
    bindEvents();
    applyProvider(PROVIDERS[0]);
    updateUsageDisplay();
}

function bindEvents() {
    elements.provider.addEventListener('change', () => {
        const provider = PROVIDERS.find((item) => item.id === elements.provider.value);
        if (provider) applyProvider(provider);
    });

    elements.protocol.addEventListener('change', () => {
        const defaults = {
            openai: { path: '/chat/completions', models: '/models', auth: 'bearer' },
            anthropic: { path: '/v1/messages', models: '/v1/models', auth: 'x-api-key' },
            gemini: { path: '/v1beta/models/{model}:{action}', models: '/v1beta/models', auth: 'query' }
        }[elements.protocol.value];
        elements.chatPath.value = defaults.path;
        elements.modelsPath.value = defaults.models;
        elements.authMode.value = defaults.auth;
        updateEndpointPreview();
    });

    [elements.baseUrl, elements.chatPath, elements.model, elements.stream, elements.proxy].forEach((element) => {
        element.addEventListener('input', updateEndpointPreview);
        element.addEventListener('change', updateEndpointPreview);
    });

    elements.model.addEventListener('input', updateActiveModel);
    elements.modelSelect.addEventListener('change', handleModelSelection);
    elements.messageForm.addEventListener('submit', sendMessage);
    elements.testButton.addEventListener('click', testConnection);
    elements.loadModelsButton.addEventListener('click', loadModels);
    elements.stopButton.addEventListener('click', () => state.controller?.abort());
    $('clear-chat').addEventListener('click', clearChat);
    $('reset-stats').addEventListener('click', resetStats);
    $('copy-inspector').addEventListener('click', copyInspector);
    $('key-visibility').addEventListener('click', toggleKeyVisibility);

    document.querySelectorAll('[data-inspector-tab]').forEach((button) => {
        button.addEventListener('click', () => setInspectorTab(button.dataset.inspectorTab));
    });

    [elements.inputPrice, elements.outputPrice, elements.costLimit].forEach((element) => {
        element.addEventListener('input', () => {
            recalculateCost();
            updateUsageDisplay();
            syncControls();
        });
    });

    elements.messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            elements.messageForm.requestSubmit();
        }
    });

    $('settings-toggle').addEventListener('click', openSettings);
    $('settings-close').addEventListener('click', closeSettings);
    elements.drawerOverlay.addEventListener('click', closeSettings);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSettings();
    });
}

function applyProvider(provider) {
    elements.protocol.value = provider.protocol;
    elements.baseUrl.value = provider.baseUrl;
    elements.chatPath.value = provider.chatPath;
    elements.modelsPath.value = provider.modelsPath;
    elements.authMode.value = provider.auth;
    elements.model.value = provider.model;
    elements.customHeaders.value = '';
    elements.extraBody.value = '';
    populateModels(provider.models, provider.model);
    updateEndpointPreview();
    updateActiveModel();
    setConnectionState('idle', '尚未测试', '');
}

function populateModels(models, selectedModel = elements.model.value.trim()) {
    const uniqueModels = [...new Set(models.filter(Boolean))];
    elements.modelSelect.replaceChildren();
    for (const model of uniqueModels) {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        elements.modelSelect.appendChild(option);
    }

    const customOption = document.createElement('option');
    customOption.value = '__custom__';
    customOption.textContent = '自定义模型…';
    elements.modelSelect.appendChild(customOption);

    if (selectedModel && uniqueModels.includes(selectedModel)) {
        elements.modelSelect.value = selectedModel;
        elements.model.value = selectedModel;
        elements.model.hidden = true;
    } else {
        elements.modelSelect.value = '__custom__';
        elements.model.value = selectedModel;
        elements.model.hidden = false;
    }
    updateActiveModel();
}

function handleModelSelection() {
    const selected = elements.modelSelect.value;
    if (selected === '__custom__') {
        elements.model.hidden = false;
        elements.model.focus();
    } else {
        elements.model.value = selected;
        elements.model.hidden = true;
    }
    updateEndpointPreview();
}

function buildUrl(path, stream = elements.stream.checked, includeQueryKey = true) {
    const baseUrl = elements.baseUrl.value.trim().replace(/\/+$/, '');
    if (!baseUrl) throw new Error('请填写 Base URL');
    let resolvedPath = path.trim();
    const model = elements.model.value.trim();
    const action = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
    resolvedPath = resolvedPath.replaceAll('{model}', encodeURIComponent(model)).replaceAll('{action}', action);
    const candidate = /^https?:\/\//i.test(resolvedPath)
        ? resolvedPath
        : `${baseUrl}${resolvedPath.startsWith('/') ? '' : '/'}${resolvedPath}`;
    const url = new URL(candidate);
    if (includeQueryKey && elements.authMode.value === 'query' && elements.apiKey.value.trim()) {
        url.searchParams.set('key', elements.apiKey.value.trim());
    }
    return url.toString();
}

function prepareRequest(path, stream = elements.stream.checked) {
    const useProxy = elements.proxy.checked;
    const upstreamUrl = buildUrl(path, stream, !useProxy);
    const headers = buildHeaders();

    if (!useProxy) return { url: upstreamUrl, upstreamUrl, headers };
    if (!/^https?:$/i.test(window.location.protocol)) {
        throw new Error('同域代理需要通过本地服务器或 Cloudflare Pages 打开网页');
    }

    headers['X-Upstream-URL'] = upstreamUrl;
    if (elements.authMode.value === 'query' && elements.apiKey.value.trim()) {
        headers['X-Proxy-Query-Key'] = elements.apiKey.value.trim();
    }
    return {
        url: new URL('/api/proxy', window.location.origin).toString(),
        upstreamUrl,
        headers
    };
}

function updateEndpointPreview() {
    try {
        const url = buildUrl(elements.chatPath.value, elements.stream.checked, true);
        const masked = new URL(url);
        if (masked.searchParams.has('key')) masked.searchParams.set('key', '***');
        elements.endpointPreview.textContent = elements.proxy.checked
            ? `${window.location.origin}/api/proxy → ${masked}`
            : masked.toString();
        elements.emptyEndpoint.textContent = masked.origin;
    } catch (error) {
        elements.endpointPreview.textContent = error.message;
    }
    updateActiveModel();
}

function updateActiveModel() {
    elements.activeModelTitle.textContent = elements.model.value.trim() || '未选择模型';
}

function parseJsonObject(value, fieldName) {
    if (!value.trim()) return {};
    let parsed;
    try {
        parsed = JSON.parse(value);
    } catch (error) {
        throw new Error(`${fieldName} JSON 格式错误：${error.message}`);
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error(`${fieldName} 必须是 JSON 对象`);
    }
    return parsed;
}

function buildHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = elements.apiKey.value.trim();
    const mode = elements.authMode.value;
    if (key && mode === 'bearer') headers.Authorization = `Bearer ${key}`;
    if (key && mode === 'x-api-key') headers['x-api-key'] = key;
    if (key && mode === 'api-key') headers['api-key'] = key;
    if (elements.protocol.value === 'anthropic') {
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }
    return { ...headers, ...parseJsonObject(elements.customHeaders.value, '自定义请求头') };
}

function numberValue(element) {
    if (element.value.trim() === '') return undefined;
    const value = Number(element.value);
    return Number.isFinite(value) ? value : undefined;
}

function buildRequestBody(messages, stream, overrides = {}) {
    const protocol = elements.protocol.value;
    const model = elements.model.value.trim();
    const temperature = numberValue(elements.temperature);
    const topP = numberValue(elements.topP);
    const topK = numberValue(elements.topK);
    const maxTokens = overrides.maxTokens ?? numberValue(elements.maxTokens) ?? 1024;
    const extra = parseJsonObject(elements.extraBody.value, '附加请求参数');

    if (protocol === 'anthropic') {
        const system = messages.find((message) => message.role === 'system')?.content;
        return {
            model,
            messages: messages.filter((message) => message.role !== 'system'),
            ...(system ? { system } : {}),
            max_tokens: maxTokens,
            ...(temperature !== undefined ? { temperature } : {}),
            ...(topP !== undefined ? { top_p: topP } : {}),
            ...(topK !== undefined ? { top_k: topK } : {}),
            stream,
            ...extra
        };
    }

    if (protocol === 'gemini') {
        const system = messages.find((message) => message.role === 'system')?.content;
        const contents = messages.filter((message) => message.role !== 'system').map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
        }));
        return {
            contents,
            ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
            generationConfig: {
                maxOutputTokens: maxTokens,
                ...(temperature !== undefined ? { temperature } : {}),
                ...(topP !== undefined ? { topP } : {}),
                ...(topK !== undefined ? { topK } : {})
            },
            ...extra
        };
    }

    return {
        model,
        messages,
        ...(temperature !== undefined ? { temperature } : {}),
        ...(topP !== undefined ? { top_p: topP } : {}),
        ...(topK !== undefined ? { top_k: topK } : {}),
        max_tokens: maxTokens,
        stream,
        ...extra
    };
}

function validateConfiguration() {
    if (!elements.baseUrl.value.trim()) throw new Error('请填写 Base URL');
    if (!elements.chatPath.value.trim()) throw new Error('请填写请求路径');
    if (!elements.model.value.trim()) throw new Error('请填写模型名称');
    if (elements.authMode.value !== 'none' && !elements.apiKey.value.trim()) throw new Error('请填写 API Key');
    buildUrl(elements.chatPath.value);
    buildHeaders();
    parseJsonObject(elements.extraBody.value, '附加请求参数');
}

function requestMessages(userText) {
    const system = elements.systemPrompt.value.trim();
    return [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...state.history,
        { role: 'user', content: userText }
    ];
}

function maskedHeaders(headers) {
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [
        key,
        /authorization|api-key|proxy-query-key/i.test(key) ? '***' : value
    ]));
}

function maskedUrl(value) {
    const url = new URL(value);
    if (url.searchParams.has('key')) url.searchParams.set('key', '***');
    return url.toString();
}

function prettyJson(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    return text.length > 50000 ? `${text.slice(0, 50000)}\n\n... 内容已截断` : text;
}

function getErrorMessage(payload, fallback) {
    if (!payload) return fallback;
    if (typeof payload === 'string') return payload.slice(0, 500);
    return payload.error?.message || payload.error?.detail || payload.message || payload.detail || fallback;
}

async function executeRequest(messages, { stream, maxTokens, onDelta } = {}) {
    const useStream = stream ?? elements.stream.checked;
    const { url, upstreamUrl, headers } = prepareRequest(elements.chatPath.value, useStream);
    const body = buildRequestBody(messages, useStream, { maxTokens });
    state.inspector.request = prettyJson({
        method: 'POST',
        url: maskedUrl(url),
        ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
        headers: maskedHeaders(headers),
        body
    });
    state.inspector.events = useStream ? '等待流式事件...' : '本次为非流式请求';
    renderInspector();
    elements.requestProtocol.textContent = elements.protocol.value;

    state.controller = new AbortController();
    syncControls();
    const startedAt = performance.now();
    let response;
    try {
        response = await fetch(url, {
            method: 'POST', headers, body: JSON.stringify(body), signal: state.controller.signal
        });
        elements.httpStatus.textContent = String(response.status);

        if (!response.ok) {
            const raw = await response.text();
            let payload = raw;
            try { payload = JSON.parse(raw); } catch (_) { /* Keep plain text response. */ }
            state.inspector.response = prettyJson(payload || `HTTP ${response.status}`);
            renderInspector();
            throw new ApiError(getErrorMessage(payload, `HTTP ${response.status} ${response.statusText}`), response.status);
        }

        let result;
        if (useStream) {
            result = await readEventStream(response, onDelta);
            state.inspector.response = prettyJson({ text: result.text, usage: result.usage });
        } else {
            const raw = await response.text();
            let payload;
            try {
                payload = JSON.parse(raw);
            } catch (_) {
                throw new ApiError(`服务端未返回 JSON：${raw.slice(0, 300)}`, response.status);
            }
            state.inspector.response = prettyJson(payload);
            result = normalizeResponse(payload, elements.protocol.value);
            if (onDelta && result.text) onDelta(result.text, true);
        }
        renderInspector();
        return { ...result, status: response.status, duration: Math.round(performance.now() - startedAt) };
    } finally {
        elements.duration.textContent = `${Math.round(performance.now() - startedAt)} ms`;
        state.controller = null;
    }
}

async function readEventStream(response, onDelta) {
    if (!response.body) throw new ApiError('浏览器无法读取响应流', response.status);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let usage = {};
    const eventLog = [];
    let reachedDone = false;

    const processBlock = (block) => {
        const lines = block.split(/\r?\n/);
        let eventName = '';
        const dataLines = [];
        for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
        }
        if (!dataLines.length) return;
        const rawData = dataLines.join('\n');
        eventLog.push(`${eventName ? `event: ${eventName}\n` : ''}data: ${rawData}`);
        if (rawData === '[DONE]') {
            reachedDone = true;
            return;
        }
        let payload;
        try {
            payload = JSON.parse(rawData);
        } catch (error) {
            eventLog.push(`parse-error: ${error.message}`);
            return;
        }
        const chunk = normalizeStreamChunk(payload, elements.protocol.value, eventName);
        if (chunk.text) {
            fullText += chunk.text;
            if (onDelta) onDelta(fullText, false);
        }
        usage = mergeUsage(usage, chunk.usage);
    };

    while (!reachedDone) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || '';
        for (const block of blocks) processBlock(block);
        state.inspector.events = eventLog.slice(-80).join('\n\n') || '等待流式事件...';
        if (state.inspectorTab === 'events') renderInspector();
        if (done) break;
    }
    if (buffer.trim()) processBlock(buffer);
    if (reachedDone) await reader.cancel().catch(() => {});
    state.inspector.events = eventLog.slice(-80).join('\n\n') || '流已结束，未收到 SSE data 事件';
    return { text: fullText, usage };
}

function normalizeStreamChunk(payload, protocol, eventName) {
    if (protocol === 'anthropic') {
        const text = payload.delta?.text || '';
        if (eventName === 'error' || payload.type === 'error') {
            throw new ApiError(getErrorMessage(payload, 'Anthropic 流式请求失败'));
        }
        return {
            text,
            usage: {
                input: payload.message?.usage?.input_tokens,
                output: payload.usage?.output_tokens
            }
        };
    }
    if (protocol === 'gemini') {
        return {
            text: extractGeminiText(payload),
            usage: {
                input: payload.usageMetadata?.promptTokenCount,
                output: payload.usageMetadata?.candidatesTokenCount
            }
        };
    }
    const content = payload.choices?.[0]?.delta?.content;
    const text = typeof content === 'string'
        ? content
        : Array.isArray(content) ? content.map((part) => part.text || '').join('') : '';
    return {
        text,
        usage: {
            input: payload.usage?.prompt_tokens,
            output: payload.usage?.completion_tokens
        }
    };
}

function normalizeResponse(payload, protocol) {
    if (protocol === 'anthropic') {
        return {
            text: (payload.content || []).map((part) => part.text || '').join(''),
            usage: { input: payload.usage?.input_tokens, output: payload.usage?.output_tokens }
        };
    }
    if (protocol === 'gemini') {
        return {
            text: extractGeminiText(payload),
            usage: {
                input: payload.usageMetadata?.promptTokenCount,
                output: payload.usageMetadata?.candidatesTokenCount
            }
        };
    }
    const content = payload.choices?.[0]?.message?.content;
    return {
        text: typeof content === 'string'
            ? content
            : Array.isArray(content) ? content.map((part) => part.text || '').join('') : '',
        usage: { input: payload.usage?.prompt_tokens, output: payload.usage?.completion_tokens }
    };
}

function extractGeminiText(payload) {
    return (payload.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
}

function mergeUsage(current, incoming = {}) {
    return {
        input: incoming.input ?? current.input,
        output: incoming.output ?? current.output
    };
}

async function sendMessage(event) {
    event.preventDefault();
    const userText = elements.messageInput.value.trim();
    if (!userText || state.busy || isCostLimitReached()) return;

    try {
        validateConfiguration();
    } catch (error) {
        showToast(error.message, true);
        return;
    }

    const priorHistory = [...state.history];
    const messages = requestMessages(userText);
    addMessage('user', userText);
    const assistant = addMessage('assistant', '', true);
    elements.messageInput.value = '';
    let assistantText = '';
    setBusy(true);

    try {
        const result = await executeRequest(messages, {
            onDelta: (text) => {
                assistantText = text;
                assistant.content.textContent = text;
                scrollChatToBottom();
            }
        });
        assistantText = result.text || '';
        assistant.content.textContent = assistantText || '（响应为空）';
        assistant.row.classList.remove('pending');
        state.history = [...priorHistory, { role: 'user', content: userText }, { role: 'assistant', content: assistantText }];
        applyUsage(result.usage);
        setConnectionState('success', '请求成功', `${result.duration} ms`);
    } catch (error) {
        assistant.row.classList.remove('pending');
        if (error.name === 'AbortError') {
            assistant.content.textContent = assistantText || '已停止生成';
            if (assistantText) {
                state.history = [...priorHistory, { role: 'user', content: userText }, { role: 'assistant', content: assistantText }];
            }
            showToast('已停止生成');
        } else {
            const message = describeError(error);
            assistant.row.classList.add('error');
            assistant.content.textContent = message;
            setConnectionState('error', '请求失败', '');
            showToast(message, true);
        }
    } finally {
        setBusy(false);
        elements.messageInput.focus();
    }
}

async function testConnection() {
    if (state.busy || isCostLimitReached()) return;
    try {
        validateConfiguration();
    } catch (error) {
        showToast(error.message, true);
        return;
    }
    setBusy(true);
    setConnectionState('idle', '测试中', '');
    try {
        const messages = [{ role: 'user', content: 'Reply with exactly: OK' }];
        const result = await executeRequest(messages, { stream: false, maxTokens: 8 });
        applyUsage(result.usage);
        setConnectionState('success', '连接正常', `${result.duration} ms`);
        showToast(`连接成功 · ${result.duration} ms`);
    } catch (error) {
        const message = describeError(error);
        setConnectionState('error', '连接失败', '');
        showToast(message, true);
    } finally {
        setBusy(false);
    }
}

async function loadModels() {
    if (state.busy) return;
    const path = elements.modelsPath.value.trim();
    if (!path) {
        showToast('当前配置没有模型列表路径', true);
        return;
    }
    try {
        if (elements.authMode.value !== 'none' && !elements.apiKey.value.trim()) throw new Error('请填写 API Key');
        setBusy(true);
        const { url, upstreamUrl, headers } = prepareRequest(path, false);
        delete headers['Content-Type'];
        state.inspector.request = prettyJson({
            method: 'GET',
            url: maskedUrl(url),
            ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
            headers: maskedHeaders(headers)
        });
        renderInspector();
        const startedAt = performance.now();
        state.controller = new AbortController();
        syncControls();
        const response = await fetch(url, { headers, signal: state.controller.signal });
        const raw = await response.text();
        let payload;
        try { payload = JSON.parse(raw); } catch (_) { payload = raw; }
        elements.httpStatus.textContent = String(response.status);
        elements.duration.textContent = `${Math.round(performance.now() - startedAt)} ms`;
        state.inspector.response = prettyJson(payload);
        renderInspector();
        if (!response.ok) throw new ApiError(getErrorMessage(payload, `HTTP ${response.status}`), response.status);
        const models = extractModels(payload);
        if (!models.length) throw new Error('响应中未找到模型列表');
        populateModels(models);
        showToast(`已读取 ${models.length} 个模型`);
    } catch (error) {
        if (error.name !== 'AbortError') showToast(describeError(error), true);
    } finally {
        state.controller = null;
        setBusy(false);
    }
}

function extractModels(payload) {
    const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.models) ? payload.models : [];
    return list.map((item) => {
        const id = typeof item === 'string' ? item : item.id || item.name || '';
        return id.replace(/^models\//, '');
    }).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function describeError(error) {
    if (error.name === 'AbortError') return '请求已取消';
    if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) {
        return '无法连接服务。请检查 URL、CORS、HTTPS/HTTP 混合内容以及自建服务是否已启动。';
    }
    return error.message || '未知错误';
}

function addMessage(role, text, pending = false) {
    elements.emptyState?.remove();
    const row = document.createElement('div');
    row.className = `message-row ${role}${pending ? ' pending' : ''}`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : role === 'error' ? '!' : 'AI';
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    row.append(avatar, content);
    elements.chatWindow.appendChild(row);
    scrollChatToBottom();
    return { row, content };
}

function clearChat() {
    if (state.busy) state.controller?.abort();
    state.history = [];
    elements.chatWindow.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.id = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-icon';
    const iconElement = document.createElement('i');
    iconElement.className = 'bi bi-terminal';
    icon.appendChild(iconElement);
    const title = document.createElement('strong');
    title.textContent = '控制台已就绪';
    const endpoint = document.createElement('span');
    endpoint.id = 'empty-endpoint';
    endpoint.textContent = safeOrigin();
    empty.append(icon, title, endpoint);
    elements.chatWindow.appendChild(empty);
    elements.emptyState = empty;
    elements.emptyEndpoint = endpoint;
}

function safeOrigin() {
    try { return new URL(elements.baseUrl.value).origin; } catch (_) { return '选择服务商与模型后开始测试'; }
}

function applyUsage(usage = {}) {
    const input = Number(usage.input);
    const output = Number(usage.output);
    if (Number.isFinite(input)) state.totals.input += input;
    if (Number.isFinite(output)) state.totals.output += output;
    state.totals.requests += 1;
    recalculateCost();
    updateUsageDisplay();
    syncControls();
    if (isCostLimitReached()) showToast('已达到本次会话的费用上限', true);
}

function recalculateCost() {
    const inputPrice = Number(elements.inputPrice.value) || 0;
    const outputPrice = Number(elements.outputPrice.value) || 0;
    state.totals.cost = (state.totals.input * inputPrice + state.totals.output * outputPrice) / 1_000_000;
}

function updateUsageDisplay() {
    elements.inputTokens.textContent = state.totals.input.toLocaleString();
    elements.outputTokens.textContent = state.totals.output.toLocaleString();
    elements.totalRequests.textContent = state.totals.requests.toLocaleString();
    elements.totalCost.textContent = `¥ ${state.totals.cost.toFixed(4)}`;
}

function resetStats() {
    state.totals = { input: 0, output: 0, requests: 0, cost: 0 };
    updateUsageDisplay();
    syncControls();
}

function isCostLimitReached() {
    const limit = Number(elements.costLimit.value);
    return Number.isFinite(limit) && limit > 0 && state.totals.cost >= limit;
}

function setBusy(busy) {
    state.busy = busy;
    syncControls();
}

function syncControls() {
    const locked = isCostLimitReached();
    elements.sendButton.disabled = state.busy || locked;
    elements.testButton.disabled = state.busy || locked;
    elements.loadModelsButton.disabled = state.busy;
    elements.stopButton.disabled = !state.busy || !state.controller;
    elements.messageInput.disabled = state.busy || locked;
    elements.sendButton.querySelector('span').textContent = locked ? '已达上限' : state.busy ? '请求中' : '发送';
}

function setConnectionState(status, text, latency) {
    elements.connectionState.dataset.state = status;
    elements.connectionStateText.textContent = text;
    elements.latencyText.textContent = latency;
}

function setInspectorTab(tab) {
    state.inspectorTab = tab;
    document.querySelectorAll('[data-inspector-tab]').forEach((button) => {
        const active = button.dataset.inspectorTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
    });
    renderInspector();
}

function renderInspector() {
    elements.inspector.textContent = state.inspector[state.inspectorTab];
}

async function copyInspector() {
    try {
        await navigator.clipboard.writeText(state.inspector[state.inspectorTab]);
        showToast('已复制检查器内容');
    } catch (_) {
        showToast('复制失败，请手动选择内容', true);
    }
}

function toggleKeyVisibility() {
    const showing = elements.apiKey.type === 'text';
    elements.apiKey.type = showing ? 'password' : 'text';
    const button = $('key-visibility');
    button.setAttribute('aria-label', showing ? '显示 API Key' : '隐藏 API Key');
    button.querySelector('i').className = showing ? 'bi bi-eye' : 'bi bi-eye-slash';
}

function showToast(message, error = false) {
    const toast = document.createElement('div');
    toast.className = `toast${error ? ' error' : ''}`;
    toast.textContent = message;
    elements.toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4500);
}

function scrollChatToBottom() {
    elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function openSettings() {
    elements.settingsPanel.classList.add('is-open');
    elements.drawerOverlay.classList.add('is-open');
}

function closeSettings() {
    elements.settingsPanel.classList.remove('is-open');
    elements.drawerOverlay.classList.remove('is-open');
}

initialize();
