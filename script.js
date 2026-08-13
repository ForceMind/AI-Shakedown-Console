const SETTINGS_STORAGE_KEY = 'ai-shakedown-console.settings.v1';
const PROFILES_STORAGE_KEY = 'ai-shakedown-console.profiles.v1';
const PROMPTS_STORAGE_KEY = 'ai-shakedown-console.prompts.v1';
const CONVERSATIONS_STORAGE_KEY = 'ai-shakedown-console.conversations.v1';
const CUSTOM_MODEL_VALUE = '__custom__';
const AGENT_CATALOG_URL = 'agents/index.json';
const MAX_LOCAL_IMPORT_FILES = 200;
const MAX_LOCAL_IMPORT_FILE_BYTES = 20 * 1024 * 1024;
const MAX_LOCAL_IMPORT_TOTAL_BYTES = 60 * 1024 * 1024;
const APP_VERSION = 'v16';
const LOCAL_CODEX_SESSION_KEY = 'ai-shakedown-console.local-codex.v1';
const LOCAL_CODEX_DEFAULT_PORT = 4510;

const LOCAL_TOOL_PROVIDERS = {
    'codex-local': {
        tool: 'codex', name: 'Codex（本机登录）', title: '本机 Codex', cli: 'Codex CLI',
        protocol: 'codex', model: 'gpt-5.6-terra', models: ['gpt-5.6-terra'],
        description: '复用 Codex CLI 的 ChatGPT 或 API Key 登录，通过官方 App Server 读取模型并连续对话。'
    },
    'antigravity-local': {
        tool: 'antigravity', name: 'Antigravity（本机登录）', title: '本机 Antigravity', cli: 'Antigravity CLI（agy）',
        protocol: 'local-cli', model: 'auto', models: ['auto'],
        description: '复用 Antigravity CLI 的 Google 登录。官方非交互模式是单轮调用，桥接会自动带入当前网页对话。'
    },
    'gemini-cli-local': {
        tool: 'gemini', name: 'Gemini CLI（本机登录）', title: '本机 Gemini CLI', cli: 'Gemini CLI',
        protocol: 'local-cli', model: 'auto', models: ['auto'],
        description: '复用 Gemini CLI 的本机认证，以无头 JSON 模式调用；可继续手动填写 CLI 支持的模型名称。'
    },
    'claude-code-local': {
        tool: 'claude', name: 'Claude Code（本机登录）', title: '本机 Claude Code', cli: 'Claude Code',
        protocol: 'local-cli', model: 'sonnet', models: ['opus', 'sonnet', 'haiku', 'fable'],
        description: '复用 Claude Code 的本机认证，以禁用工具的 print 模式调用，避免网页对话修改本机文件。'
    },
    'opencode-local': {
        tool: 'opencode', name: 'OpenCode（本机登录）', title: '本机 OpenCode', cli: 'OpenCode CLI',
        protocol: 'local-cli', model: 'auto', models: ['auto'],
        description: '复用 OpenCode 已配置的模型供应商认证，以非交互 JSON 模式调用并读取本机模型列表。'
    }
};

const PROVIDERS = [
    {
        id: 'openai', name: 'OpenAI', protocol: 'openai', baseUrl: 'https://api.openai.com/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'gpt-4.1-mini',
        models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini']
    },
    {
        id: 'anthropic', name: 'Anthropic', protocol: 'anthropic', baseUrl: 'https://api.anthropic.com',
        chatPath: '/v1/messages', modelsPath: '/v1/models', auth: 'x-api-key', model: 'claude-sonnet-4-20250514',
        models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022']
    },
    {
        id: 'gemini', name: 'Google Gemini', protocol: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com',
        chatPath: '/v1beta/models/{model}:{action}', modelsPath: '/v1beta/models', auth: 'query', model: 'gemini-2.5-flash',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash']
    },
    {
        id: 'deepseek', name: 'DeepSeek', protocol: 'openai', baseUrl: 'https://api.deepseek.com',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'deepseek-chat',
        models: ['deepseek-reasoner', 'deepseek-chat']
    },
    {
        id: 'qwen', name: '阿里云百炼 / 千问', protocol: 'openai', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'qwen-plus',
        models: ['qwen-max', 'qwen-plus', 'qwen-long', 'qwen-turbo']
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
        models: ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k']
    },
    {
        id: 'zhipu', name: '智谱 GLM', protocol: 'openai', baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'glm-4-flash',
        models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash']
    },
    {
        id: 'siliconflow', name: '硅基流动 SiliconFlow', protocol: 'openai', baseUrl: 'https://api.siliconflow.cn/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'deepseek-ai/DeepSeek-V3',
        models: ['deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct']
    },
    {
        id: 'openrouter', name: 'OpenRouter', protocol: 'openai', baseUrl: 'https://openrouter.ai/api/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'openai/gpt-4o-mini',
        models: ['anthropic/claude-sonnet-4', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini']
    },
    {
        id: 'groq', name: 'Groq', protocol: 'openai', baseUrl: 'https://api.groq.com/openai/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'llama-3.3-70b-versatile',
        models: ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile']
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
        models: ['sonar-reasoning-pro', 'sonar-pro', 'sonar']
    },
    {
        id: 'nvidia', name: 'NVIDIA NIM', protocol: 'openai', baseUrl: 'https://integrate.api.nvidia.com/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'bearer', model: 'meta/llama-3.3-70b-instruct',
        models: ['deepseek-ai/deepseek-r1', 'meta/llama-3.3-70b-instruct']
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
    ...Object.entries(LOCAL_TOOL_PROVIDERS).map(([id, tool]) => ({
        id, name: tool.name, protocol: tool.protocol, baseUrl: `http://127.0.0.1:${LOCAL_CODEX_DEFAULT_PORT}`,
        chatPath: '/v1/chat/completions', modelsPath: '/v1/models', auth: 'none', model: tool.model, models: tool.models
    })),
    {
        id: 'ollama', name: 'Ollama（本地）', protocol: 'openai', baseUrl: 'http://localhost:11434/v1',
        chatPath: '/chat/completions', modelsPath: '/models', auth: 'none', model: 'llama3.2',
        models: ['deepseek-r1', 'qwen2.5', 'llama3.2']
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
    topP: $('top-p'), topK: $('top-k'), maxTokens: $('max-tokens'), reasoningEffort: $('reasoning-effort'),
    systemPrompt: $('system-prompt'),
    messageForm: $('message-form'), messageInput: $('message-input'), sendButton: $('send-button'),
    testButton: $('test-connection'), loadModelsButton: $('load-models'), stopButton: $('stop-request'),
    chatWindow: $('chat-window'), emptyState: $('empty-state'), emptyEndpoint: $('empty-endpoint'),
    activeModelTitle: $('active-model-title'), connectionState: $('connection-state'),
    connectionStateText: $('connection-state-text'), latencyText: $('latency-text'), inspector: $('inspector-content'),
    httpStatus: $('http-status'), duration: $('request-duration'), requestProtocol: $('request-protocol'),
    inputTokens: $('total-input-tokens'), outputTokens: $('total-output-tokens'), totalRequests: $('total-requests'),
    totalCost: $('total-cost'), inputPrice: $('input-price'), outputPrice: $('output-price'), costLimit: $('cost-limit'),
    settingsPanel: $('settings-panel'), drawerOverlay: $('drawer-overlay'), toastRegion: $('toast-region'),
    clearSavedSettings: $('clear-saved-settings'),
    profileSelect: $('profile-select'), profileName: $('profile-name'), profileNew: $('profile-new'),
    profileSave: $('profile-save'), profileLoad: $('profile-load'), profileDelete: $('profile-delete'),
    promptSelect: $('prompt-select'), promptName: $('prompt-name'), promptSave: $('prompt-save'),
    promptLoad: $('prompt-load'), promptDelete: $('prompt-delete'),
    conversationTabs: $('conversation-tabs'), newConversation: $('new-conversation'),
    localSessionImport: $('local-session-import'), localSessionModal: $('local-session-modal'),
    localSessionClose: $('local-session-close'), localSessionFilesButton: $('local-session-files-button'),
    localSessionDirectoryButton: $('local-session-directory-button'), localSessionFiles: $('local-session-files'),
    localSessionDirectory: $('local-session-directory'),
    localCodexSetup: $('local-codex-setup'), localCodexPlatform: $('local-codex-platform'),
    localCodexStatus: $('local-codex-status'), localCodexDownload: $('local-codex-download'),
    localCodexCheck: $('local-codex-check'), localCodexCommand: $('local-codex-command'),
    localToolTitle: $('local-tool-title'), localToolDescription: $('local-tool-description'),
    localToolNote: $('local-tool-note'),
    agentLibraryOpen: $('agent-library-open'), agentLibraryModal: $('agent-library-modal'),
    agentLibraryClose: $('agent-library-close'), agentSearch: $('agent-search'),
    agentDepartment: $('agent-department'), agentList: $('agent-list'), agentCount: $('agent-count'),
    agentResultsCount: $('agent-results-count'), agentDetailEmpty: $('agent-detail-empty'),
    agentDetailContent: $('agent-detail-content'), agentDetailDepartment: $('agent-detail-department'),
    agentDetailName: $('agent-detail-name'), agentDetailDescription: $('agent-detail-description'),
    agentPromptPreview: $('agent-prompt-preview'), agentSourceLink: $('agent-source-link'),
    agentApply: $('agent-apply'), agentLibrarySource: $('agent-library-source'), activeAgent: $('active-agent'),
    contextProvider: $('context-provider'), contextProtocol: $('context-protocol'), contextModel: $('context-model'),
    contextAgent: $('context-agent'), contextAgentItem: $('context-agent-item')
};

const state = {
    profiles: [],
    prompts: [],
    conversations: [],
    activeConversationId: '',
    agentCatalog: null,
    selectedAgentId: '',
    selectedAgentContent: '',
    agentDetailRequest: 0,
    agentReturnFocus: null,
    localSessionReturnFocus: null,
    localCodex: { token: '', port: LOCAL_CODEX_DEFAULT_PORT, platform: 'macos', tool: '' },
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
    restoreLocalCodexPairing();
    for (const provider of PROVIDERS) {
        const option = document.createElement('option');
        option.value = provider.id;
        option.textContent = provider.name;
        elements.provider.appendChild(option);
    }
    bindEvents();
    applyProvider(PROVIDERS[0]);
    restoreSettings();
    restoreProfiles();
    restorePrompts();
    restoreConversations();
    elements.newConversation.addEventListener('click', () => createConversation());
    updateUsageDisplay();
}

function bindEvents() {
    elements.provider.addEventListener('change', () => {
        const provider = PROVIDERS.find((item) => item.id === elements.provider.value);
        if (provider) applyProvider(provider);
    });

    elements.protocol.addEventListener('change', () => {
        if (['codex', 'local-cli'].includes(elements.protocol.value)) {
            const providerId = elements.protocol.value === 'codex' ? 'codex-local' : 'antigravity-local';
            const provider = PROVIDERS.find((item) => item.id === providerId);
            elements.provider.value = provider.id;
            applyProvider(provider);
            persistSettings();
            return;
        }
        const defaults = {
            openai: { path: '/chat/completions', models: '/models', auth: 'bearer' },
            anthropic: { path: '/v1/messages', models: '/v1/models', auth: 'x-api-key' },
            gemini: { path: '/v1beta/models/{model}:{action}', models: '/v1beta/models', auth: 'query' }
        }[elements.protocol.value];
        elements.chatPath.value = defaults.path;
        elements.modelsPath.value = defaults.models;
        elements.authMode.value = defaults.auth;
        syncReasoningControl();
        updateEndpointPreview();
    });

    [elements.baseUrl, elements.chatPath, elements.model, elements.stream, elements.proxy].forEach((element) => {
        element.addEventListener('input', updateEndpointPreview);
        element.addEventListener('change', updateEndpointPreview);
    });

    elements.model.addEventListener('input', updateActiveModel);
    elements.modelSelect.addEventListener('change', handleModelSelection);
    elements.clearSavedSettings.addEventListener('click', clearSavedSettings);
    elements.profileNew.addEventListener('click', startNewProfile);
    elements.profileSave.addEventListener('click', saveProfile);
    elements.profileLoad.addEventListener('click', loadProfile);
    elements.profileDelete.addEventListener('click', deleteProfile);
    elements.profileSelect.addEventListener('change', syncProfileSelection);
    elements.promptSave.addEventListener('click', savePrompt);
    elements.promptLoad.addEventListener('click', loadPrompt);
    elements.promptDelete.addEventListener('click', deletePrompt);
    elements.promptSelect.addEventListener('change', syncPromptSelection);
    elements.agentLibraryOpen.addEventListener('click', openAgentLibrary);
    elements.agentLibraryClose.addEventListener('click', closeAgentLibrary);
    elements.agentSearch.addEventListener('input', renderAgentList);
    elements.agentDepartment.addEventListener('change', renderAgentList);
    elements.agentApply.addEventListener('click', applySelectedAgent);
    elements.activeAgent.addEventListener('click', openActiveAgent);
    elements.agentLibraryModal.addEventListener('click', (event) => {
        if (event.target === elements.agentLibraryModal) closeAgentLibrary();
    });
    elements.localSessionImport.addEventListener('click', openLocalSessionImport);
    elements.localSessionClose.addEventListener('click', closeLocalSessionImport);
    elements.localSessionFilesButton.addEventListener('click', () => elements.localSessionFiles.click());
    elements.localSessionDirectoryButton.addEventListener('click', () => elements.localSessionDirectory.click());
    elements.localSessionFiles.addEventListener('change', handleLocalSessionImport);
    elements.localSessionDirectory.addEventListener('change', handleLocalSessionImport);
    elements.localSessionModal.addEventListener('click', (event) => {
        if (event.target === elements.localSessionModal) closeLocalSessionImport();
    });
    elements.localCodexPlatform.addEventListener('change', () => {
        state.localCodex.platform = elements.localCodexPlatform.value;
        updateLocalCodexCommand();
    });
    elements.localCodexDownload.addEventListener('click', downloadLocalCodexLauncher);
    elements.localCodexCheck.addEventListener('click', testLocalCodexConnection);
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
    const persistentElements = [
        elements.provider, elements.protocol, elements.baseUrl, elements.chatPath, elements.modelsPath,
        elements.apiKey, elements.authMode, elements.model, elements.modelSelect, elements.proxy,
        elements.customHeaders, elements.extraBody, elements.stream, elements.temperature, elements.topP,
        elements.topK, elements.maxTokens, elements.reasoningEffort, elements.systemPrompt,
        elements.inputPrice, elements.outputPrice,
        elements.costLimit
    ];
    persistentElements.forEach((element) => {
        element.addEventListener('input', persistSettings);
        element.addEventListener('change', persistSettings);
    });
    elements.systemPrompt.addEventListener('input', () => {
        const conversation = activeConversation();
        if (!conversation) return;
        conversation.systemPrompt = elements.systemPrompt.value;
        conversation.activeAgent = null;
        renderActiveAgent();
        persistConversations();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!elements.localSessionModal.hidden) closeLocalSessionImport();
        else if (!elements.agentLibraryModal.hidden) closeAgentLibrary();
        else closeSettings();
    });
}

function detectLocalPlatform() {
    const platform = `${navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || ''}`.toLowerCase();
    if (platform.includes('win')) return 'windows';
    if (platform.includes('linux') || platform.includes('x11')) return 'linux';
    return 'macos';
}

function restoreLocalCodexPairing() {
    state.localCodex.platform = detectLocalPlatform();
    let pairing = null;
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const localFragment = hashParams.get('local_bridge');
    const legacyFragment = hashParams.get('codex_bridge');
    if (localFragment || legacyFragment) {
        const parts = (localFragment || legacyFragment).split('.');
        const tool = localFragment ? parts.shift() : 'codex';
        const portText = parts.shift();
        const token = parts.join('.');
        const port = Number(portText);
        const supportedTool = Object.values(LOCAL_TOOL_PROVIDERS).some((item) => item.tool === tool);
        if (supportedTool && token && Number.isInteger(port) && port >= 1024 && port <= 65535) {
            pairing = { token, port, tool };
        }
        const cleanUrl = new URL(window.location.href);
        cleanUrl.hash = '';
        history.replaceState(null, '', `${cleanUrl.pathname}${cleanUrl.search}`);
    }
    if (!pairing) {
        try { pairing = JSON.parse(sessionStorage.getItem(LOCAL_CODEX_SESSION_KEY) || 'null'); } catch (_) { /* Ignore. */ }
    }
    if (pairing && typeof pairing.token === 'string' && Number.isInteger(Number(pairing.port))) {
        state.localCodex.token = pairing.token;
        state.localCodex.port = Number(pairing.port);
        state.localCodex.tool = typeof pairing.tool === 'string' ? pairing.tool : 'codex';
        saveLocalCodexPairing();
    }
    elements.localCodexPlatform.value = state.localCodex.platform;
    updateLocalCodexCommand();
}

function saveLocalCodexPairing() {
    try {
        sessionStorage.setItem(LOCAL_CODEX_SESSION_KEY, JSON.stringify({
            token: state.localCodex.token,
            port: state.localCodex.port,
            tool: state.localCodex.tool
        }));
    } catch (_) { /* Session storage can be unavailable. */ }
}

function setLocalCodexStatus(status, text) {
    elements.localCodexStatus.dataset.state = status;
    elements.localCodexStatus.textContent = text;
}

function updateLocalCodexCommand() {
    const tool = currentLocalTool()?.tool || 'codex';
    const slug = tool === 'antigravity' ? 'antigravity' : tool;
    const commands = {
        macos: `bash ~/Downloads/ai-shakedown-${slug}-macos.command`,
        windows: `powershell -ExecutionPolicy Bypass -File "$HOME\\Downloads\\ai-shakedown-${slug}-windows.ps1"`,
        linux: `bash ~/Downloads/ai-shakedown-${slug}-linux.sh`
    };
    elements.localCodexCommand.textContent = commands[state.localCodex.platform] || commands.macos;
}

function currentLocalTool() {
    return LOCAL_TOOL_PROVIDERS[elements.provider.value] || null;
}

function syncLocalCodexMode(enabled) {
    elements.localCodexSetup.hidden = !enabled;
    const fixedFields = [
        elements.protocol, elements.baseUrl, elements.chatPath, elements.modelsPath,
        elements.apiKey, elements.authMode, elements.proxy, elements.customHeaders, elements.extraBody
    ];
    fixedFields.forEach((element) => { element.disabled = enabled; });
    $('key-visibility').disabled = enabled;
    if (enabled) {
        const tool = currentLocalTool();
        elements.protocol.value = tool.protocol;
        elements.baseUrl.value = `http://127.0.0.1:${state.localCodex.port}`;
        elements.chatPath.value = '/v1/chat/completions';
        elements.modelsPath.value = '/v1/models';
        elements.authMode.value = 'none';
        elements.proxy.checked = false;
        elements.customHeaders.value = '';
        elements.extraBody.value = '';
        elements.localToolTitle.textContent = tool.title;
        elements.localToolDescription.innerHTML = `${tool.description} 启动脚本只监听 <code>127.0.0.1</code>，不会把凭据交给网页。`;
        elements.localToolNote.textContent = `需要本机已安装并登录 ${tool.cli}，以及 Node.js 18 或更高版本。关闭脚本终端即停止本地连接。`;
        const paired = state.localCodex.token && state.localCodex.tool === tool.tool;
        setLocalCodexStatus(paired ? 'idle' : 'error', paired ? '等待检测' : '需要运行脚本');
        updateLocalCodexCommand();
    }
}

function localCodexLauncherSpec(platform) {
    const tool = currentLocalTool()?.tool || 'codex';
    const slug = tool === 'antigravity' ? 'antigravity' : tool;
    return {
        macos: { template: 'assets/launch-codex-macos.command', fileName: `ai-shakedown-${slug}-macos.command` },
        windows: { template: 'assets/launch-codex-windows.ps1', fileName: `ai-shakedown-${slug}-windows.ps1` },
        linux: { template: 'assets/launch-codex-linux.sh', fileName: `ai-shakedown-${slug}-linux.sh` }
    }[platform];
}

function createLocalCodexToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function downloadLocalCodexLauncher() {
    if (state.busy) return;
    const tool = currentLocalTool();
    if (!tool) return;
    const spec = localCodexLauncherSpec(state.localCodex.platform);
    if (!spec) return;
    elements.localCodexDownload.disabled = true;
    try {
        const token = createLocalCodexToken();
        const port = LOCAL_CODEX_DEFAULT_PORT + crypto.getRandomValues(new Uint16Array(1))[0] % 90;
        const templateUrl = new URL(`${spec.template}?v=${APP_VERSION}`, window.location.href);
        const bridgeUrl = new URL(`assets/local-codex-bridge.mjs?v=${APP_VERSION}`, window.location.href);
        const returnUrl = new URL(window.location.href);
        returnUrl.search = '';
        returnUrl.hash = '';
        const response = await fetch(templateUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`启动脚本下载失败（HTTP ${response.status}）`);
        const template = await response.text();
        const launcher = template
            .replaceAll('__BRIDGE_URL__', bridgeUrl.href)
            .replaceAll('__RETURN_URL__', returnUrl.href)
            .replaceAll('__BRIDGE_TOKEN__', token)
            .replaceAll('__BRIDGE_PORT__', String(port))
            .replaceAll('__LOCAL_PROVIDER__', tool.tool)
            .replaceAll('__CLI_COMMAND__', tool.tool === 'antigravity' ? 'agy' : tool.tool)
            .replaceAll('__CLI_LABEL__', tool.cli);
        const blobUrl = URL.createObjectURL(new Blob([launcher], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = spec.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        state.localCodex.token = token;
        state.localCodex.port = port;
        state.localCodex.tool = tool.tool;
        elements.baseUrl.value = `http://127.0.0.1:${port}`;
        saveLocalCodexPairing();
        setLocalCodexStatus('idle', '脚本已下载');
        updateEndpointPreview();
        showToast('启动脚本已下载，运行后页面会自动重新打开并连接');
    } catch (error) {
        setLocalCodexStatus('error', '下载失败');
        showToast(error.message, true);
    } finally {
        elements.localCodexDownload.disabled = state.busy;
    }
}

function localCodexAuthorizationHeaders(contentType = false) {
    const tool = currentLocalTool();
    if (!state.localCodex.token || state.localCodex.tool !== tool?.tool) {
        throw new Error(`请先下载并运行本机 ${tool?.cli || 'AI 工具'} 启动脚本`);
    }
    return {
        Authorization: `Bearer ${state.localCodex.token}`,
        ...(contentType ? { 'Content-Type': 'application/json' } : {})
    };
}

async function testLocalCodexConnection() {
    if (state.busy) return;
    const tool = currentLocalTool();
    setLocalCodexStatus('idle', '检测中');
    setConnectionState('idle', '检查中', '');
    const startedAt = performance.now();
    try {
        const response = await fetch(`http://127.0.0.1:${state.localCodex.port}/status`, {
            headers: localCodexAuthorizationHeaders(),
            cache: 'no-store'
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(getErrorMessage(payload, `HTTP ${response.status}`));
        if (payload.provider !== tool.tool) throw new Error(`当前桥接连接的是 ${payload.label || payload.provider}，请重新下载并运行 ${tool.cli} 脚本`);
        const duration = Math.round(performance.now() - startedAt);
        const account = payload.account || {};
        const accountLabel = account.planType || payload.version || account.type || '已连接';
        setLocalCodexStatus('success', accountLabel);
        setConnectionState('success', `${tool.title}已连接`, `${duration} ms`);
        showToast(`${tool.title}已连接 · ${accountLabel}`);
    } catch (error) {
        setLocalCodexStatus('error', '连接失败');
        setConnectionState('error', '连接失败', '');
        const message = error instanceof TypeError
            ? '未检测到本地桥接。请运行刚下载的脚本，并保持终端窗口开启。'
            : error.message;
        showToast(message, true);
    }
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
    syncLocalCodexMode(Boolean(LOCAL_TOOL_PROVIDERS[provider.id]));
    syncReasoningControl();
    updateEndpointPreview();
    updateActiveModel();
    setConnectionState('idle', '尚未检查', '');
}

function populateModels(models, selectedModel = elements.model.value.trim(), sortByStrength = false) {
    const uniqueModels = [...new Set(models.filter(Boolean))];
    if (sortByStrength) uniqueModels.sort(compareModelsByStrength);
    elements.modelSelect.replaceChildren();
    for (const model of uniqueModels) {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        elements.modelSelect.appendChild(option);
    }

    const customOption = document.createElement('option');
    customOption.value = CUSTOM_MODEL_VALUE;
    customOption.textContent = '自定义模型…';
    elements.modelSelect.appendChild(customOption);

    if (selectedModel && uniqueModels.includes(selectedModel)) {
        elements.modelSelect.value = selectedModel;
        elements.model.value = selectedModel;
        elements.model.hidden = true;
    } else {
        elements.modelSelect.value = CUSTOM_MODEL_VALUE;
        elements.model.value = selectedModel;
        elements.model.hidden = false;
    }
    updateActiveModel();
}

const MODEL_STRENGTH_MARKERS = [
    [/reasoning|reasoner/, 1000],
    [/(^|[-_/])r1($|[-_/])/, 950],
    [/(^|[-_/])opus($|[-_/])/, 900],
    [/(^|[-_/])max($|[-_/])/, 850],
    [/(^|[-_/])pro($|[-_/])/, 800],
    [/(^|[-_/])large($|[-_/])/, 700],
    [/(^|[-_/])sonnet($|[-_/])/, 650],
    [/(^|[-_/])plus($|[-_/])/, 600],
    [/(^|[-_/])medium($|[-_/])/, 200],
    [/(^|[-_/])chat($|[-_/])/, 0],
    [/(^|[-_/])air($|[-_/])/, -100],
    [/(^|[-_/])flash($|[-_/])/, -150],
    [/(^|[-_/])small($|[-_/])/, -250],
    [/(^|[-_/])turbo($|[-_/])/, -300],
    [/(^|[-_/])haiku($|[-_/])/, -300],
    [/(^|[-_/])mini($|[-_/])/, -350],
    [/(^|[-_/])lite($|[-_/])/, -400],
    [/(^|[-_/])speed($|[-_/])/, -450],
    [/(^|[-_/])nano($|[-_/])/, -550],
    [/(^|[-_/])tiny($|[-_/])/, -600]
];

function modelStrength(model) {
    const normalized = model.toLowerCase();
    const marker = MODEL_STRENGTH_MARKERS.find(([pattern]) => pattern.test(normalized));
    const parameterSize = Number(normalized.match(/(?:^|[-_/])(\d+(?:\.\d+)?)b(?:$|[-_/])/i)?.[1] || 0);
    const versions = (normalized.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    return { score: (marker?.[1] || 0) + Math.min(parameterSize * 2, 500), versions };
}

function compareModelsByStrength(left, right) {
    const a = modelStrength(left);
    const b = modelStrength(right);
    if (a.score !== b.score) return b.score - a.score;
    const versionCount = Math.max(a.versions.length, b.versions.length);
    for (let index = 0; index < versionCount; index += 1) {
        const difference = (b.versions[index] || 0) - (a.versions[index] || 0);
        if (difference) return difference;
    }
    return right.localeCompare(left, undefined, { numeric: true, sensitivity: 'base' });
}

function syncReasoningControl() {
    const supported = ['openai', 'codex'].includes(elements.protocol.value);
    elements.reasoningEffort.disabled = !supported;
    elements.reasoningEffort.title = supported
        ? `自动表示不发送${elements.protocol.value === 'codex' ? ' Codex effort' : ' reasoning_effort'}`
        : '当前协议不使用 OpenAI reasoning_effort';
}

function handleModelSelection() {
    const selected = elements.modelSelect.value;
    if (selected === CUSTOM_MODEL_VALUE) {
        elements.model.hidden = false;
        elements.model.focus();
    } else {
        elements.model.value = selected;
        elements.model.hidden = true;
    }
    updateEndpointPreview();
}

function currentModelOptions() {
    return [...elements.modelSelect.options]
        .map((option) => option.value)
        .filter((value) => value && value !== CUSTOM_MODEL_VALUE);
}

function captureSettings() {
    return {
        provider: elements.provider.value,
        protocol: elements.protocol.value,
        baseUrl: elements.baseUrl.value,
        chatPath: elements.chatPath.value,
        modelsPath: elements.modelsPath.value,
        apiKey: elements.apiKey.value,
        authMode: elements.authMode.value,
        model: elements.model.value,
        availableModels: currentModelOptions(),
        proxy: elements.proxy.checked,
        customHeaders: elements.customHeaders.value,
        extraBody: elements.extraBody.value,
        stream: elements.stream.checked,
        temperature: elements.temperature.value,
        topP: elements.topP.value,
        topK: elements.topK.value,
        maxTokens: elements.maxTokens.value,
        reasoningEffort: elements.reasoningEffort.value,
        systemPrompt: elements.systemPrompt.value,
        inputPrice: elements.inputPrice.value,
        outputPrice: elements.outputPrice.value,
        costLimit: elements.costLimit.value
    };
}

function persistSettings() {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(captureSettings()));
    } catch (_) {
        // Storage can be unavailable in private or restricted browser contexts.
    }
}

function restoreSettings() {
    let settings;
    try {
        settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null');
    } catch (_) {
        return;
    }
    if (!settings || typeof settings !== 'object') return;
    applySettings(settings);
}

function applySettings(settings) {
    const provider = PROVIDERS.find((item) => item.id === settings.provider) || PROVIDERS[0];
    elements.provider.value = provider.id;
    applyProvider(provider);

    const textValues = {
        protocol: 'protocol', baseUrl: 'baseUrl', chatPath: 'chatPath', modelsPath: 'modelsPath',
        apiKey: 'apiKey', authMode: 'authMode', customHeaders: 'customHeaders', extraBody: 'extraBody',
        temperature: 'temperature', topP: 'topP', topK: 'topK', maxTokens: 'maxTokens',
        reasoningEffort: 'reasoningEffort',
        systemPrompt: 'systemPrompt', inputPrice: 'inputPrice', outputPrice: 'outputPrice', costLimit: 'costLimit'
    };
    for (const [elementName, settingName] of Object.entries(textValues)) {
        if (typeof settings[settingName] === 'string') elements[elementName].value = settings[settingName];
    }
    if (typeof settings.proxy === 'boolean') elements.proxy.checked = settings.proxy;
    if (typeof settings.stream === 'boolean') elements.stream.checked = settings.stream;

    const selectedModel = typeof settings.model === 'string' ? settings.model : provider.model;
    const availableModels = Array.isArray(settings.availableModels)
        ? settings.availableModels.filter((model) => typeof model === 'string')
        : provider.models;
    elements.model.value = selectedModel;
    populateModels(availableModels, selectedModel, Array.isArray(settings.availableModels));
    syncLocalCodexMode(Boolean(LOCAL_TOOL_PROVIDERS[provider.id]));
    syncReasoningControl();
    updateEndpointPreview();
    updateActiveModel();
    setConnectionState('idle', '尚未检查', '');
}

function clearSavedSettings() {
    try {
        [SETTINGS_STORAGE_KEY, PROFILES_STORAGE_KEY, PROMPTS_STORAGE_KEY, CONVERSATIONS_STORAGE_KEY]
            .forEach((key) => localStorage.removeItem(key));
    } catch (_) { /* Ignore storage restrictions. */ }
    try { sessionStorage.removeItem(LOCAL_CODEX_SESSION_KEY); } catch (_) { /* Ignore storage restrictions. */ }
    state.localCodex.token = '';
    state.localCodex.port = LOCAL_CODEX_DEFAULT_PORT;
    state.localCodex.tool = '';
    state.profiles = [];
    state.prompts = [];
    state.conversations = [];
    state.activeConversationId = '';
    state.selectedAgentId = '';
    state.selectedAgentContent = '';
    elements.provider.value = PROVIDERS[0].id;
    applyProvider(PROVIDERS[0]);
    elements.apiKey.value = '';
    elements.systemPrompt.value = '';
    renderProfileOptions();
    renderPromptOptions();
    createConversation({ silent: true, systemPrompt: '' });
    showToast('已清除配置、提示词、对话和 API Key');
}

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    } catch (_) {
        return [];
    }
}

function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (_) {
        showToast('浏览器无法保存数据，请检查站点存储权限', true);
        return false;
    }
}

function createId(prefix) {
    const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${suffix}`;
}

function restoreProfiles() {
    state.profiles = readStoredArray(PROFILES_STORAGE_KEY).filter((item) => (
        item && typeof item.id === 'string' && typeof item.name === 'string' && item.settings
    ));
    renderProfileOptions();
}

function renderProfileOptions(selectedId = elements.profileSelect.value) {
    elements.profileSelect.replaceChildren(new Option('未选择配置', ''));
    for (const profile of state.profiles) {
        elements.profileSelect.appendChild(new Option(profile.name, profile.id));
    }
    elements.profileSelect.value = state.profiles.some((item) => item.id === selectedId) ? selectedId : '';
    syncProfileSelection();
}

function syncProfileSelection() {
    const profile = state.profiles.find((item) => item.id === elements.profileSelect.value);
    if (profile) elements.profileName.value = profile.name;
    else if (!elements.profileSelect.value) elements.profileName.value = '';
    elements.profileLoad.disabled = !profile;
    elements.profileDelete.disabled = !profile;
}

function startNewProfile() {
    elements.profileSelect.value = '';
    elements.profileName.value = '';
    syncProfileSelection();
    elements.profileName.focus();
}

function saveProfile() {
    const name = elements.profileName.value.trim();
    if (!name) {
        showToast('请先输入配置名称', true);
        elements.profileName.focus();
        return;
    }
    const selectedId = elements.profileSelect.value;
    let profile = state.profiles.find((item) => item.id === selectedId);
    if (profile) {
        profile.name = name;
        profile.settings = captureSettings();
        profile.updatedAt = new Date().toISOString();
    } else {
        profile = { id: createId('profile'), name, settings: captureSettings(), updatedAt: new Date().toISOString() };
        state.profiles.push(profile);
    }
    if (!writeStoredValue(PROFILES_STORAGE_KEY, state.profiles)) return;
    renderProfileOptions(profile.id);
    showToast(`已保存配置“${name}”`);
}

function loadProfile() {
    const profile = state.profiles.find((item) => item.id === elements.profileSelect.value);
    if (!profile) {
        showToast('请先选择配置', true);
        return;
    }
    applySettings(profile.settings);
    const conversation = activeConversation();
    if (conversation) {
        conversation.systemPrompt = elements.systemPrompt.value;
        conversation.activeAgent = null;
    }
    renderActiveAgent();
    persistSettings();
    persistConversations();
    showToast(`已加载配置“${profile.name}”`);
}

function deleteProfile() {
    const profile = state.profiles.find((item) => item.id === elements.profileSelect.value);
    if (!profile) return;
    state.profiles = state.profiles.filter((item) => item.id !== profile.id);
    writeStoredValue(PROFILES_STORAGE_KEY, state.profiles);
    renderProfileOptions();
    elements.profileName.value = '';
    showToast(`已删除配置“${profile.name}”`);
}

function restorePrompts() {
    state.prompts = readStoredArray(PROMPTS_STORAGE_KEY).filter((item) => (
        item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.content === 'string'
    ));
    renderPromptOptions();
}

function renderPromptOptions(selectedId = elements.promptSelect.value) {
    elements.promptSelect.replaceChildren(new Option('自定义提示词库', ''));
    for (const prompt of state.prompts) {
        elements.promptSelect.appendChild(new Option(prompt.name, prompt.id));
    }
    elements.promptSelect.value = state.prompts.some((item) => item.id === selectedId) ? selectedId : '';
    syncPromptSelection();
}

function syncPromptSelection() {
    const prompt = state.prompts.find((item) => item.id === elements.promptSelect.value);
    if (prompt) elements.promptName.value = prompt.name;
    else if (!elements.promptSelect.value) elements.promptName.value = '';
    elements.promptLoad.disabled = !prompt;
    elements.promptDelete.disabled = !prompt;
}

function savePrompt() {
    const name = elements.promptName.value.trim();
    const content = elements.systemPrompt.value.trim();
    if (!name || !content) {
        showToast('请填写提示词名称和 System 内容', true);
        return;
    }
    const selectedId = elements.promptSelect.value;
    let prompt = state.prompts.find((item) => item.id === selectedId);
    if (prompt) {
        prompt.name = name;
        prompt.content = content;
        prompt.updatedAt = new Date().toISOString();
    } else {
        prompt = { id: createId('prompt'), name, content, updatedAt: new Date().toISOString() };
        state.prompts.push(prompt);
    }
    if (!writeStoredValue(PROMPTS_STORAGE_KEY, state.prompts)) return;
    renderPromptOptions(prompt.id);
    showToast(`已保存提示词“${name}”`);
}

function loadPrompt() {
    const prompt = state.prompts.find((item) => item.id === elements.promptSelect.value);
    if (!prompt) return;
    elements.systemPrompt.value = prompt.content;
    const conversation = activeConversation();
    if (conversation) {
        conversation.systemPrompt = prompt.content;
        conversation.activeAgent = null;
    }
    renderActiveAgent();
    persistSettings();
    persistConversations();
    showToast(`已加载提示词“${prompt.name}”`);
}

function deletePrompt() {
    const prompt = state.prompts.find((item) => item.id === elements.promptSelect.value);
    if (!prompt) return;
    state.prompts = state.prompts.filter((item) => item.id !== prompt.id);
    writeStoredValue(PROMPTS_STORAGE_KEY, state.prompts);
    renderPromptOptions();
    elements.promptName.value = '';
    showToast(`已删除提示词“${prompt.name}”`);
}

async function loadAgentCatalog() {
    if (state.agentCatalog) return state.agentCatalog;
    const response = await fetch(AGENT_CATALOG_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`角色索引加载失败（HTTP ${response.status}）`);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.agents)) throw new Error('角色索引格式无效');
    state.agentCatalog = catalog;
    elements.agentCount.textContent = String(catalog.count || catalog.agents.length);
    elements.agentLibrarySource.textContent = `agency-agents-zh ${catalog.version || ''} · ${catalog.license || 'MIT'}`;
    elements.agentDepartment.replaceChildren(new Option('全部部门', ''));
    for (const department of catalog.departments || []) {
        const count = catalog.agents.filter((agent) => agent.department === department.id).length;
        if (count) elements.agentDepartment.appendChild(new Option(`${department.name} (${count})`, department.id));
    }
    return catalog;
}

async function openAgentLibrary() {
    state.agentReturnFocus = document.activeElement;
    elements.agentLibraryModal.hidden = false;
    document.body.classList.add('modal-open');
    elements.agentList.replaceChildren();
    const loading = document.createElement('div');
    loading.className = 'agent-list-empty';
    loading.textContent = '正在加载角色库...';
    elements.agentList.appendChild(loading);
    try {
        await loadAgentCatalog();
        renderAgentList();
        const activeAgentId = activeConversation()?.activeAgent?.id;
        if (activeAgentId && activeAgentId !== state.selectedAgentId) await selectAgent(activeAgentId);
        else if (activeAgentId) {
            renderAgentList();
            elements.agentList.querySelector('.agent-list-item.active')?.scrollIntoView({ block: 'nearest' });
            if (!state.selectedAgentContent) await selectAgent(activeAgentId);
        }
        else elements.agentSearch.focus();
        if (activeAgentId) elements.agentList.querySelector('.agent-list-item.active')?.focus();
    } catch (error) {
        elements.agentList.replaceChildren();
        const failure = document.createElement('div');
        failure.className = 'agent-list-empty';
        failure.textContent = '角色库加载失败';
        elements.agentList.appendChild(failure);
        showToast(error.message, true);
    }
}

function closeAgentLibrary() {
    if (elements.agentLibraryModal.hidden) return;
    elements.agentLibraryModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (state.agentReturnFocus instanceof HTMLElement) state.agentReturnFocus.focus();
    else elements.agentLibraryOpen.focus();
    state.agentReturnFocus = null;
}

function filteredAgents() {
    if (!state.agentCatalog) return [];
    const department = elements.agentDepartment.value;
    const query = elements.agentSearch.value.trim().toLocaleLowerCase('zh-CN');
    return state.agentCatalog.agents.filter((agent) => {
        if (department && agent.department !== department) return false;
        if (!query) return true;
        return [agent.name, agent.description, agent.departmentName, agent.path]
            .some((value) => String(value || '').toLocaleLowerCase('zh-CN').includes(query));
    });
}

function renderAgentList() {
    const agents = filteredAgents();
    elements.agentResultsCount.textContent = `${agents.length} 个角色`;
    elements.agentList.replaceChildren();
    if (!agents.length) {
        const empty = document.createElement('div');
        empty.className = 'agent-list-empty';
        empty.textContent = '没有匹配的角色';
        elements.agentList.appendChild(empty);
        return;
    }

    for (const agent of agents) {
        const button = document.createElement('button');
        button.type = 'button';
        button.role = 'option';
        button.ariaSelected = String(agent.id === state.selectedAgentId);
        button.className = `agent-list-item${agent.id === state.selectedAgentId ? ' active' : ''}`;

        const emoji = document.createElement('span');
        emoji.className = 'agent-list-emoji';
        emoji.textContent = agent.emoji || '●';
        const name = document.createElement('span');
        name.className = 'agent-list-name';
        name.textContent = agent.name;
        const description = document.createElement('span');
        description.className = 'agent-list-description';
        description.textContent = agent.description;
        button.append(emoji, name, description);
        button.addEventListener('click', () => selectAgent(agent.id));
        elements.agentList.appendChild(button);
    }
    elements.agentList.querySelector('.agent-list-item.active')?.scrollIntoView({ block: 'nearest' });
}

async function selectAgent(agentId) {
    const agent = state.agentCatalog?.agents.find((item) => item.id === agentId);
    if (!agent) return;
    state.selectedAgentId = agent.id;
    state.selectedAgentContent = '';
    elements.agentApply.disabled = true;
    elements.agentDetailEmpty.hidden = true;
    elements.agentDetailContent.hidden = false;
    elements.agentDetailDepartment.textContent = agent.departmentName;
    elements.agentDetailName.textContent = `${agent.emoji ? `${agent.emoji} ` : ''}${agent.name}`;
    elements.agentDetailDescription.textContent = agent.description;
    elements.agentSourceLink.href = agent.sourceUrl;
    elements.agentPromptPreview.textContent = '正在加载角色定义...';
    renderAgentList();

    const requestId = ++state.agentDetailRequest;
    try {
        const agentRevision = state.agentCatalog?.revision?.slice(0, 12) || state.agentCatalog?.version || 'current';
        const response = await fetch(`${agent.contentPath}?v=${encodeURIComponent(agentRevision)}`, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`角色定义加载失败（HTTP ${response.status}）`);
        const content = await response.text();
        if (requestId !== state.agentDetailRequest) return;
        state.selectedAgentContent = content.trim();
        renderMarkdown(elements.agentPromptPreview, state.selectedAgentContent);
        elements.agentApply.disabled = false;
    } catch (error) {
        if (requestId !== state.agentDetailRequest) return;
        elements.agentPromptPreview.textContent = error.message;
        showToast(error.message, true);
    }
}

function applySelectedAgent() {
    const agent = state.agentCatalog?.agents.find((item) => item.id === state.selectedAgentId);
    const conversation = activeConversation();
    if (!agent || !state.selectedAgentContent || !conversation) return;
    elements.systemPrompt.value = state.selectedAgentContent;
    conversation.systemPrompt = state.selectedAgentContent;
    conversation.activeAgent = {
        id: agent.id,
        name: agent.name,
        emoji: agent.emoji,
        departmentName: agent.departmentName
    };
    persistSettings();
    persistConversations();
    renderActiveAgent();
    closeAgentLibrary();
    showToast(`已应用智能体“${agent.name}”`);
}

async function openActiveAgent() {
    elements.agentSearch.value = '';
    elements.agentDepartment.value = '';
    await openAgentLibrary();
}

function renderActiveAgent() {
    const agent = activeConversation()?.activeAgent;
    elements.activeAgent.hidden = !agent;
    elements.contextAgentItem.hidden = !agent;
    if (!agent) {
        elements.activeAgent.textContent = '';
        elements.activeAgent.title = '';
        elements.contextAgent.textContent = '未启用';
        return;
    }
    elements.activeAgent.textContent = `${agent.emoji ? `${agent.emoji} ` : ''}${agent.name}`;
    elements.activeAgent.title = `当前角色：${agent.name}，点击查看`;
    elements.contextAgent.textContent = agent.name;
    elements.contextAgent.title = agent.name;
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
    updateRuntimeContext();
}

function updateRuntimeContext() {
    const provider = PROVIDERS.find((item) => item.id === elements.provider.value);
    const protocolLabels = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini', codex: 'Codex Local', 'local-cli': 'Local CLI' };
    elements.contextProvider.textContent = provider?.name || '自定义';
    elements.contextProtocol.textContent = protocolLabels[elements.protocol.value] || elements.protocol.value || '-';
    elements.contextModel.textContent = elements.model.value.trim() || '未选择';
    elements.contextModel.title = elements.contextModel.textContent;
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
    const merged = { ...headers, ...parseJsonObject(elements.customHeaders.value, '自定义请求头') };
    if (currentLocalTool()) {
        Object.assign(merged, localCodexAuthorizationHeaders());
        merged['X-AI-Shakedown-Conversation'] = activeConversation()?.id || 'default';
    }
    return merged;
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
    const reasoningEffort = ['openai', 'codex'].includes(protocol) ? elements.reasoningEffort.value : '';
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
        ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        max_tokens: maxTokens,
        stream,
        ...extra
    };
}

function validateConfiguration() {
    if (currentLocalTool() && (!state.localCodex.token || state.localCodex.tool !== currentLocalTool().tool)) {
        throw new Error(`请先下载并运行本机 ${currentLocalTool().cli} 启动脚本`);
    }
    if (!elements.baseUrl.value.trim()) throw new Error('请填写 Base URL');
    if (!elements.chatPath.value.trim()) throw new Error('请填写请求路径');
    if (!elements.model.value.trim()) throw new Error('请填写模型名称');
    if (elements.authMode.value !== 'none' && !elements.apiKey.value.trim()) throw new Error('请填写 API Key');
    buildUrl(elements.chatPath.value);
    buildHeaders();
    parseJsonObject(elements.extraBody.value, '附加请求参数');
}

function openLocalSessionImport() {
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    state.localSessionReturnFocus = document.activeElement;
    elements.localSessionModal.hidden = false;
    document.body.classList.add('modal-open');
    elements.localSessionFilesButton.focus();
}

function closeLocalSessionImport() {
    if (elements.localSessionModal.hidden) return;
    elements.localSessionModal.hidden = true;
    document.body.classList.remove('modal-open');
    state.localSessionReturnFocus?.focus?.();
}

function localImportText(value) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(localImportText).filter(Boolean).join('');
    if (!value || typeof value !== 'object') return '';
    if (['tool_result', 'tool_use', 'function_call', 'function_response'].includes(value.type)) return '';
    if (typeof value.text === 'string') return value.text;
    if (typeof value.output_text === 'string') return value.output_text;
    if (typeof value.input_text === 'string') return value.input_text;
    if (value.content !== undefined) return localImportText(value.content);
    if (value.parts !== undefined) return localImportText(value.parts);
    if (value.message !== undefined) return localImportText(value.message);
    return '';
}

function appendImportedMessage(history, role, content) {
    const text = localImportText(content).replace(/\r\n/g, '\n').trim();
    if (!text || !['user', 'assistant'].includes(role)) return;
    if (/^<(environment_context|permissions instructions|app-context|skills_instructions)>/i.test(text)) return;
    const previous = history.at(-1);
    if (previous?.role === role) {
        if (previous.content !== text) previous.content += `\n\n${text}`;
        return;
    }
    history.push({ role, content: text });
}

function parseJsonLines(text) {
    const records = [];
    for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        try { records.push(JSON.parse(line)); } catch (_) { /* Ignore partial or non-JSON lines. */ }
    }
    return records;
}

function importedConversation(source, externalId, title, history, createdAt, file) {
    if (!history.some((message) => message.role === 'user')) return null;
    const firstUser = history.find((message) => message.role === 'user')?.content || '本地会话';
    const cleanTitle = typeof title === 'string' && title.trim() ? title.trim() : deriveConversationTitle(firstUser);
    const sourceLabel = { codex: 'Codex', gemini: 'Gemini', claude: 'Claude', generic: '本地' }[source] || '本地';
    const fallbackId = `${file.name}:${file.size}:${file.lastModified}`;
    return {
        id: createId('conversation'),
        title: `${sourceLabel} · ${cleanTitle}`.slice(0, 52),
        systemPrompt: '',
        activeAgent: null,
        history,
        createdAt: typeof createdAt === 'string' && !Number.isNaN(Date.parse(createdAt))
            ? createdAt
            : new Date(file.lastModified || Date.now()).toISOString(),
        importedFrom: {
            source,
            fileName: file.name,
            sourceKey: `${source}:${externalId || fallbackId}`
        }
    };
}

function parseCodexSession(records, file) {
    const isCodex = records.some((record) => (
        record?.type === 'session_meta' ||
        (record?.type === 'event_msg' && ['user_message', 'agent_message'].includes(record?.payload?.type))
    ));
    if (!isCodex) return null;

    const metadata = records.find((record) => record?.type === 'session_meta')?.payload || {};
    const eventHistory = [];
    for (const record of records) {
        if (record?.type !== 'event_msg') continue;
        const payload = record.payload || {};
        if (payload.type === 'user_message') appendImportedMessage(eventHistory, 'user', payload.message);
        if (payload.type === 'agent_message' && payload.phase === 'final_answer') {
            appendImportedMessage(eventHistory, 'assistant', payload.message);
        }
    }

    const history = eventHistory.some((message) => message.role === 'user') ? eventHistory : [];
    if (!history.length) {
        for (const record of records) {
            const payload = record?.type === 'response_item' ? record.payload : null;
            if (payload?.type !== 'message' || !['user', 'assistant'].includes(payload.role)) continue;
            if (payload.role === 'assistant' && payload.phase && payload.phase !== 'final_answer') continue;
            appendImportedMessage(history, payload.role, payload.content);
        }
    }
    return importedConversation(
        'codex',
        metadata.session_id || metadata.id,
        '',
        history,
        metadata.timestamp || records[0]?.timestamp,
        file
    );
}

function applyGeminiRecord(messages, record) {
    if (!record || typeof record !== 'object') return;
    if (typeof record.$rewindTo === 'string') {
        const index = messages.findIndex((message) => message?.id === record.$rewindTo);
        if (index >= 0) messages.splice(index);
        else messages.length = 0;
        return;
    }
    if (Array.isArray(record?.$set?.messages)) {
        messages.splice(0, messages.length, ...record.$set.messages);
        return;
    }
    if (typeof record.id === 'string' && ['user', 'gemini'].includes(record.type)) {
        const index = messages.findIndex((message) => message?.id === record.id);
        if (index >= 0) messages[index] = record;
        else messages.push(record);
    }
}

function parseGeminiSession(records, root, file) {
    const initial = root && !Array.isArray(root) ? root : records.find((record) => (
        typeof record?.sessionId === 'string' && typeof record?.projectHash === 'string'
    ));
    const isGemini = Boolean(initial) || records.some((record) => ['gemini'].includes(record?.type));
    if (!isGemini) return null;

    const metadata = { ...(initial || {}) };
    const messages = [];
    if (Array.isArray(initial?.messages)) messages.push(...initial.messages);
    for (const record of records) {
        if (record?.$set && typeof record.$set === 'object') Object.assign(metadata, record.$set);
        applyGeminiRecord(messages, record);
    }
    const history = [];
    for (const message of messages) {
        if (message?.type === 'user') appendImportedMessage(history, 'user', message.displayContent || message.content);
        if (message?.type === 'gemini') appendImportedMessage(history, 'assistant', message.displayContent || message.content);
    }
    return importedConversation(
        'gemini',
        metadata.sessionId,
        metadata.summary,
        history,
        metadata.startTime || metadata.lastUpdated,
        file
    );
}

function parseClaudeSession(records, file) {
    const isClaude = records.some((record) => (
        ['user', 'assistant'].includes(record?.type) && record?.message && typeof record.message === 'object'
    ));
    if (!isClaude) return null;
    const history = [];
    for (const record of records) {
        if (!['user', 'assistant'].includes(record?.type)) continue;
        appendImportedMessage(history, record.type, record.message?.content);
    }
    const metadata = records.find((record) => record?.sessionId) || {};
    return importedConversation('claude', metadata.sessionId, '', history, metadata.timestamp, file);
}

function parseGenericSession(root, records, file) {
    let messages = [];
    let metadata = {};
    if (Array.isArray(root)) messages = root;
    else if (Array.isArray(root?.messages)) {
        messages = root.messages;
        metadata = root;
    } else if (Array.isArray(root?.history)) {
        messages = root.history;
        metadata = root;
    } else if (records.some((record) => ['user', 'assistant'].includes(record?.role))) {
        messages = records;
    }
    if (!messages.length) return null;
    const history = [];
    for (const message of messages) {
        const role = message?.role === 'model' ? 'assistant' : message?.role;
        if (!['user', 'assistant'].includes(role)) continue;
        appendImportedMessage(history, role, message.content ?? message.parts ?? message.text);
    }
    return importedConversation(
        'generic',
        metadata.id || metadata.sessionId || metadata.conversationId,
        metadata.title || metadata.name || metadata.summary,
        history,
        metadata.createdAt || metadata.startTime || metadata.timestamp,
        file
    );
}

function parseLocalSessionFile(text, file) {
    let root = null;
    try { root = JSON.parse(text); } catch (_) { /* JSONL is handled below. */ }
    const records = Array.isArray(root) ? root : parseJsonLines(text);
    return parseCodexSession(records, file)
        || parseGeminiSession(records, root, file)
        || parseClaudeSession(records, file)
        || parseGenericSession(root, records, file);
}

function isSensitiveLocalFile(file) {
    const baseName = file.name.toLowerCase();
    return /^(auth|oauth_creds|settings|config|credentials?|secrets?|tokens?)(\.|$)/i.test(baseName);
}

async function handleLocalSessionImport(event) {
    const input = event.currentTarget;
    const selected = Array.from(input.files || []);
    input.value = '';
    closeLocalSessionImport();
    if (!selected.length) return;

    const candidates = selected
        .filter((file) => /\.jsonl?$/i.test(file.name) && !isSensitiveLocalFile(file))
        .filter((file) => file.size <= MAX_LOCAL_IMPORT_FILE_BYTES)
        .sort((left, right) => right.lastModified - left.lastModified)
        .slice(0, MAX_LOCAL_IMPORT_FILES);
    const files = [];
    let totalBytes = 0;
    for (const file of candidates) {
        if (totalBytes + file.size > MAX_LOCAL_IMPORT_TOTAL_BYTES) continue;
        files.push(file);
        totalBytes += file.size;
    }
    if (!files.length) {
        showToast('没有找到可读取的 JSON / JSONL 会话文件', true);
        return;
    }

    elements.localSessionImport.disabled = true;
    const parsed = [];
    let unreadable = 0;
    for (const file of files) {
        try {
            const conversation = parseLocalSessionFile(await file.text(), file);
            if (conversation) parsed.push(conversation);
            else unreadable += 1;
        } catch (_) {
            unreadable += 1;
        }
    }
    elements.localSessionImport.disabled = false;

    const existingKeys = new Set(state.conversations.map((item) => item.importedFrom?.sourceKey).filter(Boolean));
    const imported = parsed.filter((item) => {
        const key = item.importedFrom.sourceKey;
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
    });
    if (!imported.length) {
        showToast(parsed.length ? '所选会话已经导入' : '未识别到可导入的对话内容', true);
        return;
    }

    const previousConversations = state.conversations;
    const previousActiveId = state.activeConversationId;
    imported.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    state.conversations = [...state.conversations, ...imported];
    state.activeConversationId = imported.at(-1).id;
    if (!persistConversations()) {
        state.conversations = previousConversations;
        state.activeConversationId = previousActiveId;
        return;
    }
    renderConversationTabs();
    renderActiveConversation();
    const skipped = unreadable + (parsed.length - imported.length);
    showToast(`已导入 ${imported.length} 个本地对话${skipped ? `，跳过 ${skipped} 个文件` : ''}`);
}

function activeConversation() {
    return state.conversations.find((item) => item.id === state.activeConversationId) || null;
}

function restoreConversations() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(CONVERSATIONS_STORAGE_KEY) || 'null'); } catch (_) { /* Start fresh. */ }
    const savedConversations = Array.isArray(stored?.conversations) ? stored.conversations : [];
    state.conversations = savedConversations.map((item, index) => ({
        id: typeof item?.id === 'string' ? item.id : createId('conversation'),
        title: typeof item?.title === 'string' && item.title.trim() ? item.title : `新会话 ${index + 1}`,
        systemPrompt: typeof item?.systemPrompt === 'string' ? item.systemPrompt : '',
        activeAgent: item?.activeAgent && typeof item.activeAgent.id === 'string' && typeof item.activeAgent.name === 'string'
            ? {
                id: item.activeAgent.id,
                name: item.activeAgent.name,
                emoji: typeof item.activeAgent.emoji === 'string' ? item.activeAgent.emoji : '',
                departmentName: typeof item.activeAgent.departmentName === 'string' ? item.activeAgent.departmentName : ''
            }
            : null,
        history: Array.isArray(item?.history) ? item.history.filter((message) => (
            message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
        )) : [],
        createdAt: typeof item?.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        importedFrom: item?.importedFrom && typeof item.importedFrom.sourceKey === 'string'
            ? {
                source: typeof item.importedFrom.source === 'string' ? item.importedFrom.source : 'generic',
                fileName: typeof item.importedFrom.fileName === 'string' ? item.importedFrom.fileName : '',
                sourceKey: item.importedFrom.sourceKey
            }
            : null
    }));
    if (!state.conversations.length) {
        createConversation({ silent: true, systemPrompt: elements.systemPrompt.value });
        return;
    }
    state.activeConversationId = state.conversations.some((item) => item.id === stored?.activeConversationId)
        ? stored.activeConversationId
        : state.conversations[0].id;
    renderConversationTabs();
    renderActiveConversation();
}

function persistConversations() {
    return writeStoredValue(CONVERSATIONS_STORAGE_KEY, {
        activeConversationId: state.activeConversationId,
        conversations: state.conversations
    });
}

function createConversation(options = {}) {
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    const inheritedAgent = options.activeAgent === undefined ? activeConversation()?.activeAgent : options.activeAgent;
    const conversation = {
        id: createId('conversation'),
        title: `新会话 ${state.conversations.length + 1}`,
        systemPrompt: typeof options.systemPrompt === 'string' ? options.systemPrompt : elements.systemPrompt.value,
        activeAgent: inheritedAgent ? { ...inheritedAgent } : null,
        history: [],
        createdAt: new Date().toISOString()
    };
    state.conversations.push(conversation);
    state.activeConversationId = conversation.id;
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    if (!options.silent) showToast('已新建对话窗口');
}

function switchConversation(id) {
    if (id === state.activeConversationId) return;
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    if (!state.conversations.some((item) => item.id === id)) return;
    state.activeConversationId = id;
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
}

function closeConversation(id) {
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    const index = state.conversations.findIndex((item) => item.id === id);
    if (index < 0) return;
    if (state.conversations.length === 1) {
        const conversation = state.conversations[0];
        conversation.history = [];
        conversation.title = '新会话 1';
        persistConversations();
        renderConversationTabs();
        renderActiveConversation();
        return;
    }
    state.conversations.splice(index, 1);
    if (id === state.activeConversationId) {
        state.activeConversationId = state.conversations[Math.min(index, state.conversations.length - 1)].id;
    }
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
}

function renderConversationTabs() {
    elements.conversationTabs.replaceChildren();
    for (const conversation of state.conversations) {
        const tab = document.createElement('div');
        tab.className = `conversation-tab${conversation.id === state.activeConversationId ? ' active' : ''}`;
        const selectButton = document.createElement('button');
        selectButton.className = 'conversation-tab-title';
        selectButton.type = 'button';
        selectButton.role = 'tab';
        selectButton.ariaSelected = String(conversation.id === state.activeConversationId);
        selectButton.title = conversation.importedFrom
            ? `${conversation.title}\n导入自 ${conversation.importedFrom.fileName}`
            : conversation.title;
        selectButton.textContent = conversation.title;
        selectButton.addEventListener('click', () => switchConversation(conversation.id));
        const closeButton = document.createElement('button');
        closeButton.className = 'conversation-tab-close';
        closeButton.type = 'button';
        closeButton.title = '关闭对话';
        closeButton.setAttribute('aria-label', `关闭${conversation.title}`);
        const closeIcon = document.createElement('i');
        closeIcon.className = 'bi bi-x';
        closeButton.appendChild(closeIcon);
        closeButton.addEventListener('click', () => closeConversation(conversation.id));
        tab.append(selectButton, closeButton);
        elements.conversationTabs.appendChild(tab);
    }
    elements.conversationTabs.querySelector('.conversation-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function renderActiveConversation() {
    const conversation = activeConversation();
    if (!conversation) return;
    elements.systemPrompt.value = conversation.systemPrompt;
    renderActiveAgent();
    elements.chatWindow.replaceChildren();
    elements.emptyState = null;
    elements.emptyEndpoint = null;
    if (!conversation.history.length) {
        renderEmptyState();
        return;
    }
    for (const message of conversation.history) addMessage(message.role, message.content);
}

function renderMarkdown(element, text) {
    if (!globalThis.marked?.parse || !globalThis.DOMPurify?.sanitize) {
        element.textContent = text;
        return;
    }

    const html = globalThis.marked.parse(text, { breaks: true, gfm: true });
    element.innerHTML = globalThis.DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['button', 'embed', 'form', 'iframe', 'input', 'object', 'select', 'style', 'textarea'],
        FORBID_ATTR: ['style']
    });
    element.querySelectorAll('a[href]').forEach((link) => {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });
}

function setMessageContent(message, text, render = false) {
    message.content.classList.toggle('markdown-content', render);
    if (render) renderMarkdown(message.content, text);
    else message.content.textContent = text;
}

function createStreamingMarkdownRenderer(message) {
    let latestText = '';
    let frameId = 0;

    const flush = () => {
        frameId = 0;
        setMessageContent(message, latestText, Boolean(latestText));
        scrollChatToBottom();
    };

    return {
        update(text) {
            latestText = text;
            if (!frameId) frameId = requestAnimationFrame(flush);
        },
        finish(text = latestText) {
            latestText = text;
            if (frameId) cancelAnimationFrame(frameId);
            flush();
        },
        cancel() {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };
}

function deriveConversationTitle(text) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized.length > 18 ? `${normalized.slice(0, 18)}…` : normalized || '新会话';
}

function requestMessages(userText) {
    const system = elements.systemPrompt.value.trim();
    return [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...(activeConversation()?.history || []),
        { role: 'user', content: userText }
    ];
}

function maskedHeaders(headers) {
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [
        key,
        /authorization|api-key|proxy-query-key|bridge-token/i.test(key) ? '***' : value
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
    if (eventName === 'error' || payload?.error) {
        throw new ApiError(getErrorMessage(payload, '流式请求失败'));
    }
    if (protocol === 'anthropic') {
        const text = payload.delta?.text || '';
        if (payload.type === 'error') {
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

    const conversation = activeConversation();
    if (!conversation) return;
    const priorHistory = [...conversation.history];
    const messages = requestMessages(userText);
    addMessage('user', userText);
    const assistant = addMessage('assistant', '', true);
    const streamRenderer = createStreamingMarkdownRenderer(assistant);
    elements.messageInput.value = '';
    let assistantText = '';
    setBusy(true);

    try {
        const result = await executeRequest(messages, {
            onDelta: (text) => {
                assistantText = text;
                streamRenderer.update(text);
            }
        });
        assistantText = result.text || '';
        streamRenderer.finish(assistantText || '（响应为空）');
        assistant.row.classList.remove('pending');
        conversation.history = [...priorHistory, { role: 'user', content: userText }, { role: 'assistant', content: assistantText }];
        conversation.systemPrompt = elements.systemPrompt.value;
        if (!priorHistory.length) conversation.title = deriveConversationTitle(userText);
        persistConversations();
        renderConversationTabs();
        applyUsage(result.usage);
        setConnectionState('success', '请求成功', `${result.duration} ms`);
    } catch (error) {
        assistant.row.classList.remove('pending');
        if (error.name === 'AbortError') {
            streamRenderer.finish(assistantText || '已停止生成');
            if (assistantText) {
                conversation.history = [...priorHistory, { role: 'user', content: userText }, { role: 'assistant', content: assistantText }];
                conversation.systemPrompt = elements.systemPrompt.value;
                if (!priorHistory.length) conversation.title = deriveConversationTitle(userText);
                persistConversations();
                renderConversationTabs();
            }
            showToast('已停止生成');
        } else {
            streamRenderer.cancel();
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
    if (state.busy) return;
    if (currentLocalTool()) {
        await testLocalCodexConnection();
        return;
    }
    const path = elements.modelsPath.value.trim();
    if (!path) {
        showToast('当前服务没有可用的只读检查接口，请直接发送实际消息', true);
        return;
    }
    try {
        if (elements.authMode.value !== 'none' && !elements.apiKey.value.trim()) throw new Error('请填写 API Key');
        new URL(buildUrl(path, false, true));
        parseJsonObject(elements.customHeaders.value, '自定义请求头');
    } catch (error) {
        showToast(error.message, true);
        return;
    }
    setBusy(true);
    setConnectionState('idle', '检查中', '');
    try {
        const { url, upstreamUrl, headers } = prepareRequest(path, false);
        delete headers['Content-Type'];
        state.inspector.request = prettyJson({
            method: 'GET',
            url: maskedUrl(url),
            ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
            headers: maskedHeaders(headers)
        });
        state.inspector.events = '连接检查不产生流式事件';
        renderInspector();
        elements.requestProtocol.textContent = elements.protocol.value;
        const startedAt = performance.now();
        state.controller = new AbortController();
        syncControls();
        const response = await fetch(url, { headers, signal: state.controller.signal });
        const raw = await response.text();
        let payload;
        try { payload = JSON.parse(raw); } catch (_) { payload = raw; }
        const duration = Math.round(performance.now() - startedAt);
        elements.httpStatus.textContent = String(response.status);
        elements.duration.textContent = `${duration} ms`;
        state.inspector.response = prettyJson(payload || `HTTP ${response.status}`);
        renderInspector();
        if (!response.ok) throw new ApiError(getErrorMessage(payload, `HTTP ${response.status}`), response.status);
        setConnectionState('success', '连接正常', `${duration} ms`);
        showToast(`连接成功 · ${duration} ms`);
    } catch (error) {
        if (error.name !== 'AbortError') {
            const message = describeError(error);
            setConnectionState('error', '连接失败', '');
            showToast(message, true);
        }
    } finally {
        state.controller = null;
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
        populateModels(models, elements.model.value.trim(), true);
        persistSettings();
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
    }).filter(Boolean).sort(compareModelsByStrength);
}

function describeError(error) {
    if (error.name === 'AbortError') return '请求已取消';
    if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) {
        if (currentLocalTool()) {
            return `无法连接${currentLocalTool().title}。请运行下载的启动脚本并保持终端开启；若浏览器阻止本地网络访问，请允许访问 127.0.0.1。`;
        }
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
    row.append(avatar, content);
    setMessageContent({ content }, text, role === 'assistant' && Boolean(text));
    elements.chatWindow.appendChild(row);
    scrollChatToBottom();
    return { row, content };
}

function clearChat() {
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    const conversation = activeConversation();
    if (!conversation) return;
    conversation.history = [];
    conversation.title = '新会话';
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
}

function renderEmptyState() {
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
    try { return new URL(elements.baseUrl.value).origin; } catch (_) { return '选择服务商与模型后开始对话'; }
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
    elements.testButton.disabled = state.busy;
    elements.loadModelsButton.disabled = state.busy;
    elements.localSessionImport.disabled = state.busy;
    elements.localCodexDownload.disabled = state.busy;
    elements.localCodexCheck.disabled = state.busy;
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

try {
    initialize();
} catch (error) {
    showToast(`初始化失败：${error.message}`, true);
}
