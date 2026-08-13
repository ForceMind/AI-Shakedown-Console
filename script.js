const SETTINGS_STORAGE_KEY = 'ai-shakedown-console.settings.v1';
const PROFILES_STORAGE_KEY = 'ai-shakedown-console.profiles.v1';
const PROMPTS_STORAGE_KEY = 'ai-shakedown-console.prompts.v1';
const CONVERSATIONS_STORAGE_KEY = 'ai-shakedown-console.conversations.v1';
const CUSTOM_MODEL_VALUE = '__custom__';
const AGENT_CATALOG_URL = 'agents/index.json';
const MAX_LOCAL_IMPORT_FILES = 200;
const MAX_LOCAL_IMPORT_FILE_BYTES = 20 * 1024 * 1024;
const MAX_LOCAL_IMPORT_TOTAL_BYTES = 60 * 1024 * 1024;
const APP_VERSION = 'v25';
const LOCAL_CODEX_SESSION_KEY = 'ai-shakedown-console.local-codex.v1';
const HELP_INTRO_STORAGE_KEY = 'ai-shakedown-console.help-intro.v1';
const PWA_IME_NOTICE_STORAGE_KEY = 'ai-shakedown-console.pwa-ime-notice.v1';
const CONVERSATION_SIDEBAR_STORAGE_KEY = 'ai-shakedown-console.conversation-sidebar.v1';
const CONVERSATION_SIDEBAR_THRESHOLD = 4;
const MULTIMODAL_CAPABILITIES_STORAGE_KEY = 'ai-shakedown-console.multimodal-capabilities.v1';
const ATTACHMENT_DATABASE_NAME = 'ai-shakedown-console.attachments.v1';
const ATTACHMENT_STORE_NAME = 'files';
const MAX_ATTACHMENTS_PER_MESSAGE = 6;
const MAX_IMAGE_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_ATTACHMENT_BYTES = 1024 * 1024;
const MAX_PDF_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENT_TOTAL_BYTES = 12 * 1024 * 1024;
const MAX_PDF_PAGES = 100;
const MAX_EXTRACTED_ATTACHMENT_CHARS = 500000;
const MAX_REQUEST_BODY_BYTES = 20 * 1024 * 1024;
const MULTIMODAL_TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGElEQVR42mP8z8AARMAgYKSqhhGjgqgGACmXAh8+fdbZAAAAAElFTkSuQmCC';
const LOCAL_CODEX_DEFAULT_PORT = 4510;
const LOCAL_BRIDGE_PORT_SCAN_LIMIT = 100;
const LOCAL_BRIDGE_DISCOVERY_MS = 10 * 60 * 1000;

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
    attachmentButton: $('attachment-button'), attachmentInput: $('attachment-input'),
    attachmentPreviewList: $('attachment-preview-list'),
    helpOpen: $('help-open'), helpModal: $('help-modal'), helpClose: $('help-close'), helpConfirm: $('help-confirm'),
    helpEnvironmentLabel: $('help-environment-label'), helpSendShortcut: $('help-send-shortcut'),
    helpNewlineShortcut: $('help-newline-shortcut'), helpNewlineNote: $('help-newline-note'),
    helpPlatformNote: $('help-platform-note'),
    macosLaunchHelpModal: $('macos-launch-help-modal'), macosLaunchHelpClose: $('macos-launch-help-close'),
    macosLaunchHelpConfirm: $('macos-launch-help-confirm'), macosLaunchHelpFile: $('macos-launch-help-file'),
    macosLaunchHelpCommand: $('macos-launch-help-command'), macosLaunchHelpCopy: $('macos-launch-help-copy'),
    testButton: $('test-connection'), loadModelsButton: $('load-models'), stopButton: $('stop-request'),
    chatWindow: $('chat-window'), emptyState: $('empty-state'), emptyEndpoint: $('empty-endpoint'),
    activeModelTitle: $('active-model-title'), connectionState: $('connection-state'),
    connectionStateText: $('connection-state-text'), latencyText: $('latency-text'), inspector: $('inspector-content'),
    httpStatus: $('http-status'), duration: $('request-duration'), requestProtocol: $('request-protocol'),
    inputTokens: $('total-input-tokens'), outputTokens: $('total-output-tokens'), totalRequests: $('total-requests'),
    totalCost: $('total-cost'), inputPrice: $('input-price'), outputPrice: $('output-price'), costLimit: $('cost-limit'),
    workspaceSidebar: $('workspace-sidebar'), settingsPanel: $('settings-panel'), drawerOverlay: $('drawer-overlay'), toastRegion: $('toast-region'),
    settingsToggle: $('settings-toggle'), settingsToggleIcon: $('settings-toggle-icon'),
    settingsToggleLabel: $('settings-toggle-label'), settingsInspector: $('settings-inspector'),
    sidebarConversationsButton: $('sidebar-conversations-button'), sidebarSettingsButton: $('sidebar-settings-button'),
    conversationSidebar: $('conversation-sidebar'), conversationSidebarList: $('conversation-sidebar-list'),
    conversationSidebarCount: $('conversation-sidebar-count'), conversationSidebarToggle: $('conversation-sidebar-toggle'),
    sidebarNewConversation: $('sidebar-new-conversation'), sidebarImportConversations: $('sidebar-import-conversations'),
    clearSavedSettings: $('clear-saved-settings'),
    pwaInstallCard: $('pwa-install-card'), pwaInstallButton: $('pwa-install-button'),
    pwaImeCard: $('pwa-ime-card'), pwaImeCopyUrl: $('pwa-ime-copy-url'),
    profileSelect: $('profile-select'), profileName: $('profile-name'), profileNew: $('profile-new'),
    profileSave: $('profile-save'), profileLoad: $('profile-load'), profileDelete: $('profile-delete'),
    conversationTabs: $('conversation-tabs'), newConversation: $('new-conversation'),
    conversationSearchToggle: $('conversation-search-toggle'), conversationSearch: $('conversation-search'),
    conversationSearchInput: $('conversation-search-input'), conversationSearchCount: $('conversation-search-count'),
    conversationSearchPrevious: $('conversation-search-previous'), conversationSearchNext: $('conversation-search-next'),
    conversationSearchClose: $('conversation-search-close'), conversationRename: $('conversation-rename'),
    conversationExport: $('conversation-export'), messageSelectionBar: $('message-selection-bar'),
    messageSelectionCount: $('message-selection-count'), messageSelectAll: $('message-select-all'),
    messageCopySelected: $('message-copy-selected'), messageExportSelected: $('message-export-selected'),
    messageDeleteSelected: $('message-delete-selected'), messageSelectionCancel: $('message-selection-cancel'),
    localSessionImport: $('local-session-import'), localSessionModal: $('local-session-modal'),
    localSessionClose: $('local-session-close'), localSessionFilesButton: $('local-session-files-button'),
    localSessionDirectoryButton: $('local-session-directory-button'), localSessionFiles: $('local-session-files'),
    localSessionDirectory: $('local-session-directory'),
    localCodexSetup: $('local-codex-setup'), localCodexPlatform: $('local-codex-platform'),
    localCodexStatus: $('local-codex-status'), localCodexDownload: $('local-codex-download'),
    localCodexCheck: $('local-codex-check'), localCodexStop: $('local-codex-stop'), localCodexCommand: $('local-codex-command'),
    localCodexCopyCommand: $('local-codex-copy-command'), localCodexGuide: $('local-codex-guide'),
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
    agentBuiltInTab: $('agent-built-in-tab'), agentCustomTab: $('agent-custom-tab'),
    customAgentCount: $('custom-agent-count'), customAgentNew: $('custom-agent-new'),
    customAgentEditor: $('custom-agent-editor'), customAgentName: $('custom-agent-name'),
    customAgentPrompt: $('custom-agent-prompt'), customAgentPreview: $('custom-agent-preview'),
    customAgentSave: $('custom-agent-save'),
    customAgentDelete: $('custom-agent-delete'),
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
    agentLibraryMode: 'built-in',
    agentDetailRequest: 0,
    agentReturnFocus: null,
    pwaInstallPrompt: null,
    pwaUpdateWorker: null,
    pwaRefreshing: false,
    localSessionReturnFocus: null,
    helpReturnFocus: null,
    macosLaunchHelpReturnFocus: null,
    localCodex: { token: '', port: LOCAL_CODEX_DEFAULT_PORT, platform: 'macos', tool: '' },
    localBridgeDiscoveryTimer: 0,
    localBridgeDiscoveryUntil: 0,
    localBridgeDiscoveryCycle: 0,
    localBridgeDiscoveryRunning: false,
    localBridgeConnected: false,
    controller: null,
    busy: false,
    messageComposing: false,
    composerAttachments: [],
    attachmentDatabase: null,
    multimodalStatus: 'unknown',
    multimodalSignature: '',
    selectedMessageIds: new Set(),
    selectionMode: false,
    searchMatches: [],
    searchMatchIndex: -1,
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

function openAttachmentDatabase() {
    if (state.attachmentDatabase) return state.attachmentDatabase;
    const pending = new Promise((resolve, reject) => {
        if (!globalThis.indexedDB) {
            reject(new Error('当前浏览器不支持附件存储'));
            return;
        }
        const request = indexedDB.open(ATTACHMENT_DATABASE_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(ATTACHMENT_STORE_NAME)) {
                request.result.createObjectStore(ATTACHMENT_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('无法打开附件存储'));
    });
    state.attachmentDatabase = pending;
    pending.catch(() => {
        if (state.attachmentDatabase === pending) state.attachmentDatabase = null;
    });
    return pending;
}

async function attachmentTransaction(mode, operation) {
    const database = await openAttachmentDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(ATTACHMENT_STORE_NAME, mode);
        const store = transaction.objectStore(ATTACHMENT_STORE_NAME);
        let request;
        try { request = operation(store); } catch (error) { reject(error); return; }
        transaction.oncomplete = () => resolve(request?.result);
        transaction.onerror = () => reject(transaction.error || request?.error || new Error('附件存储操作失败'));
        transaction.onabort = () => reject(transaction.error || new Error('附件存储操作已取消'));
    });
}

function putAttachmentRecord(record) {
    return attachmentTransaction('readwrite', (store) => store.put(record));
}

function getAttachmentRecord(id) {
    return attachmentTransaction('readonly', (store) => store.get(id));
}

function deleteAttachmentRecord(id) {
    return attachmentTransaction('readwrite', (store) => store.delete(id));
}

function attachmentMetadata(record) {
    return {
        id: record.id,
        name: record.name,
        type: record.type,
        size: record.size,
        kind: record.kind,
        ...(record.pageCount ? { pageCount: record.pageCount } : {})
    };
}

function normalizeAttachmentMetadata(value) {
    if (!value || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
    if (!['image', 'text', 'pdf'].includes(value.kind)) return null;
    return {
        id: value.id,
        name: value.name.slice(0, 240),
        type: typeof value.type === 'string' ? value.type : 'application/octet-stream',
        size: Number.isFinite(value.size) ? value.size : 0,
        kind: value.kind,
        ...(Number.isFinite(value.pageCount) ? { pageCount: value.pageCount } : {})
    };
}

function normalizeStoredMessage(message) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') return null;
    return {
        id: typeof message.id === 'string' ? message.id : createId('message'),
        role: message.role,
        content: message.content,
        attachments: Array.isArray(message.attachments)
            ? message.attachments.map(normalizeAttachmentMetadata).filter(Boolean)
            : [],
        createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString(),
        ...(message.status === 'failed' ? { status: 'failed', error: typeof message.error === 'string' ? message.error : '请求失败' } : {})
    };
}

function createStoredMessage(role, content, attachments = [], extra = {}) {
    return {
        id: createId('message'),
        role,
        content,
        attachments: attachments.map((item) => ({ ...item })),
        createdAt: new Date().toISOString(),
        ...extra
    };
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file) {
    return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type);
}

function isPdfFile(file) {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function isTextAttachmentFile(file) {
    return /^text\//i.test(file.type)
        || /\.(txt|md|jsonl?|csv|tsv|ya?ml|xml|html?|css|jsx?|tsx?|py|go|rs|java|c|cpp|h|sql|sh|ps1|toml|ini|log)$/i.test(file.name);
}

async function extractPdfText(file) {
    const pdfjs = await import('./vendor/pdf.min.mjs?v=5.4.296');
    pdfjs.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.mjs?v=5.4.296';
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    if (document.numPages > MAX_PDF_PAGES) throw new Error(`PDF 最多支持 ${MAX_PDF_PAGES} 页`);
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
        if (text) pages.push(`--- 第 ${pageNumber} 页 ---\n${text}`);
        if (pages.join('\n\n').length > MAX_EXTRACTED_ATTACHMENT_CHARS) {
            throw new Error(`PDF 提取文字超过 ${MAX_EXTRACTED_ATTACHMENT_CHARS.toLocaleString()} 字`);
        }
    }
    const text = pages.join('\n\n');
    if (!text) throw new Error('该 PDF 未提取到文字，扫描版 PDF 暂不支持 OCR');
    return { text, pageCount: document.numPages };
}

async function createAttachmentRecord(file) {
    if (isImageFile(file)) {
        if (file.size > MAX_IMAGE_ATTACHMENT_BYTES) throw new Error(`${file.name}：图片不能超过 5 MB`);
        return { id: createId('attachment'), name: file.name, type: file.type, size: file.size, kind: 'image', data: file };
    }
    if (isPdfFile(file)) {
        if (file.size > MAX_PDF_ATTACHMENT_BYTES) throw new Error(`${file.name}：PDF 不能超过 10 MB`);
        const extracted = await extractPdfText(file);
        return {
            id: createId('attachment'), name: file.name, type: 'application/pdf', size: file.size,
            kind: 'pdf', data: extracted.text, pageCount: extracted.pageCount
        };
    }
    if (!isTextAttachmentFile(file)) throw new Error(`${file.name}：不支持此文件类型`);
    if (file.size > MAX_TEXT_ATTACHMENT_BYTES) throw new Error(`${file.name}：文本或代码文件不能超过 1 MB`);
    const text = await file.text();
    if (text.includes('\0')) throw new Error(`${file.name}：文件似乎是二进制内容`);
    return { id: createId('attachment'), name: file.name, type: file.type || 'text/plain', size: file.size, kind: 'text', data: text };
}

async function addComposerFiles(files) {
    if (state.multimodalStatus !== 'supported') return;
    const candidates = Array.from(files || []);
    if (!candidates.length) return;
    if (state.composerAttachments.length + candidates.length > MAX_ATTACHMENTS_PER_MESSAGE) {
        showToast(`每条消息最多 ${MAX_ATTACHMENTS_PER_MESSAGE} 个附件`, true);
        return;
    }
    const currentBytes = state.composerAttachments.reduce((sum, item) => sum + item.size, 0);
    if (currentBytes + candidates.reduce((sum, file) => sum + file.size, 0) > MAX_ATTACHMENT_TOTAL_BYTES) {
        showToast('单条消息附件原始大小合计不能超过 12 MB', true);
        return;
    }
    elements.attachmentButton.disabled = true;
    for (const file of candidates) {
        try {
            const record = await createAttachmentRecord(file);
            await putAttachmentRecord(record);
            state.composerAttachments.push(attachmentMetadata(record));
        } catch (error) {
            showToast(error.message, true);
        }
    }
    elements.attachmentButton.disabled = false;
    renderComposerAttachments();
    persistActiveDraft();
}

function handleAttachmentSelection(event) {
    // FileList is live in Chromium. Copy it before clearing the input or the
    // async attachment pipeline can receive an empty list.
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    addComposerFiles(files);
}

function handleComposerPaste(event) {
    if (state.multimodalStatus !== 'supported') return;
    const files = Array.from(event.clipboardData?.files || []).filter(isImageFile);
    if (!files.length) return;
    event.preventDefault();
    addComposerFiles(files);
}

function handleComposerDragOver(event) {
    if (state.multimodalStatus !== 'supported' || !event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handleComposerDrop(event) {
    if (state.multimodalStatus !== 'supported') return;
    event.preventDefault();
    addComposerFiles(event.dataTransfer?.files);
}

async function renderAttachmentThumbnail(image, id) {
    try {
        const record = await getAttachmentRecord(id);
        if (!(record?.data instanceof Blob) || !image.isConnected) return;
        const url = URL.createObjectURL(record.data);
        image.onload = image.onerror = () => URL.revokeObjectURL(url);
        image.src = url;
    } catch (_) { /* Keep the generic icon when attachment data is unavailable. */ }
}

function renderComposerAttachments() {
    elements.attachmentPreviewList.replaceChildren();
    elements.attachmentPreviewList.hidden = !state.composerAttachments.length;
    for (const attachment of state.composerAttachments) {
        const item = document.createElement('div');
        item.className = 'attachment-preview-item';
        let preview;
        if (attachment.kind === 'image') {
            preview = document.createElement('img');
            preview.alt = '';
            renderAttachmentThumbnail(preview, attachment.id);
        } else {
            preview = document.createElement('i');
            preview.className = attachment.kind === 'pdf' ? 'bi bi-filetype-pdf' : 'bi bi-file-earmark-text';
        }
        const copy = document.createElement('span');
        copy.className = 'attachment-preview-copy';
        const name = document.createElement('strong');
        name.textContent = attachment.name;
        const meta = document.createElement('small');
        meta.textContent = `${attachment.kind === 'pdf' ? `${attachment.pageCount || 0} 页 · ` : ''}${formatBytes(attachment.size)}`;
        copy.append(name, meta);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'attachment-preview-remove';
        remove.title = `移除 ${attachment.name}`;
        remove.setAttribute('aria-label', remove.title);
        remove.innerHTML = '<i class="bi bi-x"></i>';
        remove.addEventListener('click', () => removeComposerAttachment(attachment.id));
        item.append(preview, copy, remove);
        elements.attachmentPreviewList.appendChild(item);
    }
}

function removeComposerAttachment(id) {
    state.composerAttachments = state.composerAttachments.filter((item) => item.id !== id);
    renderComposerAttachments();
    persistActiveDraft();
    cleanupUnusedAttachments();
}

function referencedAttachmentIds() {
    const ids = new Set(state.composerAttachments.map((item) => item.id));
    for (const conversation of state.conversations) {
        for (const message of conversation.history) {
            for (const attachment of message.attachments || []) ids.add(attachment.id);
        }
        for (const attachment of conversation.draftAttachments || []) ids.add(attachment.id);
    }
    return ids;
}

async function cleanupUnusedAttachments() {
    try {
        const database = await openAttachmentDatabase();
        const referenced = referencedAttachmentIds();
        const keys = await new Promise((resolve, reject) => {
            const transaction = database.transaction(ATTACHMENT_STORE_NAME, 'readonly');
            const request = transaction.objectStore(ATTACHMENT_STORE_NAME).getAllKeys();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
        await Promise.all(keys.filter((id) => !referenced.has(id)).map(deleteAttachmentRecord));
    } catch (_) { /* Attachment cleanup is best effort. */ }
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
    elements.sidebarNewConversation.addEventListener('click', () => createConversation());
    elements.sidebarImportConversations.addEventListener('click', openLocalSessionImport);
    updateUsageDisplay();
    renderHelpEnvironment();
    maybeShowHelpIntro();
    initializeWorkspaceLayout();
    initializePwa();
    resumeLocalBridgeDiscovery();
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
    elements.agentLibraryOpen.addEventListener('click', openAgentLibrary);
    elements.agentLibraryClose.addEventListener('click', closeAgentLibrary);
    elements.agentSearch.addEventListener('input', renderAgentList);
    elements.agentDepartment.addEventListener('change', renderAgentList);
    elements.agentApply.addEventListener('click', applySelectedAgent);
    elements.agentBuiltInTab.addEventListener('click', () => setAgentLibraryMode('built-in'));
    elements.agentCustomTab.addEventListener('click', () => setAgentLibraryMode('custom'));
    elements.customAgentNew.addEventListener('click', startNewCustomAgent);
    elements.customAgentSave.addEventListener('click', saveCustomAgent);
    elements.customAgentDelete.addEventListener('click', deleteCustomAgent);
    elements.customAgentPrompt.addEventListener('input', () => {
        state.selectedAgentContent = elements.customAgentPrompt.value.trim();
        elements.agentApply.disabled = !state.selectedAgentContent;
        renderCustomAgentPreview();
    });
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
    elements.helpOpen.addEventListener('click', () => openHelp(false));
    elements.helpClose.addEventListener('click', closeHelp);
    elements.helpConfirm.addEventListener('click', closeHelp);
    elements.helpModal.addEventListener('click', (event) => {
        if (event.target === elements.helpModal) closeHelp();
    });
    elements.macosLaunchHelpClose.addEventListener('click', closeMacosLauncherHelp);
    elements.macosLaunchHelpConfirm.addEventListener('click', closeMacosLauncherHelp);
    elements.macosLaunchHelpCopy.addEventListener('click', copyMacosLauncherCommand);
    elements.macosLaunchHelpModal.addEventListener('click', (event) => {
        if (event.target === elements.macosLaunchHelpModal) closeMacosLauncherHelp();
    });
    elements.localCodexPlatform.addEventListener('change', () => {
        state.localCodex.platform = elements.localCodexPlatform.value;
        updateLocalCodexCommand();
    });
    elements.localCodexDownload.addEventListener('click', downloadLocalCodexLauncher);
    elements.localCodexCheck.addEventListener('click', testLocalCodexConnection);
    elements.localCodexStop.addEventListener('click', stopLocalCodexConnection);
    elements.localCodexCopyCommand.addEventListener('click', copyLocalCodexCommand);
    elements.messageForm.addEventListener('submit', sendMessage);
    elements.attachmentButton.addEventListener('click', () => elements.attachmentInput.click());
    elements.attachmentInput.addEventListener('change', handleAttachmentSelection);
    elements.testButton.addEventListener('click', testConnection);
    elements.loadModelsButton.addEventListener('click', loadModels);
    elements.stopButton.addEventListener('click', () => state.controller?.abort());
    $('clear-chat').addEventListener('click', clearChat);
    $('reset-stats').addEventListener('click', resetStats);
    $('copy-inspector').addEventListener('click', copyInspector);
    $('key-visibility').addEventListener('click', toggleKeyVisibility);
    elements.conversationSearchToggle.addEventListener('click', openConversationSearch);
    elements.conversationSearchClose.addEventListener('click', closeConversationSearch);
    elements.conversationSearchInput.addEventListener('input', runConversationSearch);
    elements.conversationSearchPrevious.addEventListener('click', () => moveConversationSearch(-1));
    elements.conversationSearchNext.addEventListener('click', () => moveConversationSearch(1));
    elements.conversationRename.addEventListener('click', renameActiveConversation);
    elements.conversationExport.addEventListener('click', exportActiveConversation);
    elements.messageSelectAll.addEventListener('click', selectAllMessages);
    elements.messageCopySelected.addEventListener('click', copySelectedMessages);
    elements.messageExportSelected.addEventListener('click', exportSelectedMessages);
    elements.messageDeleteSelected.addEventListener('click', deleteSelectedMessages);
    elements.messageSelectionCancel.addEventListener('click', exitMessageSelection);

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

    elements.messageInput.addEventListener('compositionstart', () => {
        state.messageComposing = true;
    });
    elements.messageInput.addEventListener('compositionend', () => {
        window.setTimeout(() => {
            state.messageComposing = false;
        }, 0);
    });
    elements.messageInput.addEventListener('blur', () => {
        state.messageComposing = false;
    });
    elements.messageInput.addEventListener('keydown', (event) => {
        const isComposing = state.messageComposing || event.isComposing || event.keyCode === 229;
        if (!isComposing && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            elements.messageForm.requestSubmit();
        }
    });
    elements.messageInput.addEventListener('input', persistActiveDraft);
    elements.messageInput.addEventListener('paste', handleComposerPaste);
    elements.messageForm.addEventListener('dragover', handleComposerDragOver);
    elements.messageForm.addEventListener('drop', handleComposerDrop);

    elements.settingsToggle.addEventListener('click', toggleSettings);
    $('settings-close').addEventListener('click', closeSettings);
    elements.sidebarConversationsButton.addEventListener('click', openConversationSidebar);
    elements.sidebarSettingsButton.addEventListener('click', openSettings);
    elements.conversationSidebarToggle.addEventListener('click', openConversationSidebar);
    elements.drawerOverlay.addEventListener('click', closeWorkspaceSidebar);
    window.addEventListener('resize', syncWorkspaceMode);
    window.addEventListener('focus', resumeLocalBridgeDiscovery);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') resumeLocalBridgeDiscovery();
    });
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
        if (!elements.macosLaunchHelpModal.hidden) closeMacosLauncherHelp();
        else if (!elements.helpModal.hidden) closeHelp();
        else if (!elements.localSessionModal.hidden) closeLocalSessionImport();
        else if (!elements.agentLibraryModal.hidden) closeAgentLibrary();
        else if (!elements.conversationSearch.hidden) closeConversationSearch();
        else if (state.selectionMode) exitMessageSelection();
        else closeSettings();
    });
}

function isStandalonePwa() {
    return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}

function syncPwaInstallCard() {
    elements.pwaInstallCard.hidden = !state.pwaInstallPrompt || isStandalonePwa();
}

function isMacosEdgePwa() {
    return detectLocalPlatform() === 'macos'
        && isStandalonePwa()
        && /\bEdg\//.test(navigator.userAgent || '');
}

function syncPwaImeCard() {
    const visible = isMacosEdgePwa();
    elements.pwaImeCard.hidden = !visible;
    if (!visible) return;
    let shownForVersion = '';
    try { shownForVersion = localStorage.getItem(PWA_IME_NOTICE_STORAGE_KEY) || ''; } catch (_) { /* Ignore. */ }
    if (shownForVersion === APP_VERSION) return;
    try { localStorage.setItem(PWA_IME_NOTICE_STORAGE_KEY, APP_VERSION); } catch (_) { /* Ignore. */ }
    window.setTimeout(() => {
        showActionToast('Edge 更新后第三方输入法候选窗可能再次失效', '一劳永逸方案', () => {
            openSettings();
            elements.pwaImeCard.querySelector('details').open = true;
            elements.pwaImeCard.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
    }, 600);
}

async function copyPwaMigrationUrl() {
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    try {
        await navigator.clipboard.writeText(url.href);
        showToast('地址已复制：请在 Safari 打开，再选择“文件 → 添加到程序坞”');
    } catch (_) {
        showToast(`请在 Safari 打开：${url.href}`, true);
    }
}

async function installPwa() {
    const prompt = state.pwaInstallPrompt;
    if (!prompt) return;
    elements.pwaInstallButton.disabled = true;
    try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice?.outcome === 'accepted') {
            state.pwaInstallPrompt = null;
            syncPwaInstallCard();
            showToast('AI Shakedown Console 已安装');
        }
    } finally {
        elements.pwaInstallButton.disabled = false;
    }
}

function showPwaUpdate(worker) {
    if (state.pwaUpdateWorker === worker) return;
    state.pwaUpdateWorker = worker;
    showActionToast('发现内容更新，刷新后即可使用', '立即刷新', () => {
        state.pwaRefreshing = true;
        worker.postMessage({ type: 'SKIP_WAITING' });
    });
}

async function initializePwa() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        state.pwaInstallPrompt = event;
        syncPwaInstallCard();
    });
    window.addEventListener('appinstalled', () => {
        state.pwaInstallPrompt = null;
        syncPwaInstallCard();
    });
    elements.pwaInstallButton.addEventListener('click', installPwa);
    elements.pwaImeCopyUrl.addEventListener('click', copyPwaMigrationUrl);
    syncPwaImeCard();

    if (new URLSearchParams(window.location.search).has('no-sw')) return;
    if (!('serviceWorker' in navigator) || !globalThis.isSecureContext) return;
    try {
        const assetVersion = APP_VERSION.replace(/^v/, '');
        const registration = await navigator.serviceWorker.register(`/assets/service-worker.js?v=${assetVersion}`, {
            scope: '/',
            updateViaCache: 'none'
        });
        await registration.update();
        if (registration.waiting && navigator.serviceWorker.controller) showPwaUpdate(registration.waiting);
        registration.addEventListener('updatefound', () => {
            const worker = registration.installing;
            worker?.addEventListener('statechange', () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) showPwaUpdate(worker);
            });
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!state.pwaRefreshing) return;
            window.location.reload();
        });
    } catch (error) {
        console.warn('PWA 初始化失败', error);
    }
}

function detectClientEnvironment() {
    const raw = `${navigator.userAgentData?.platform || ''} ${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();
    const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const touch = navigator.maxTouchPoints > 0 || coarsePointer;
    if (raw.includes('android')) {
        return {
            label: 'Android 触摸设备', send: '点击发送按钮', newline: 'Enter / 换行键',
            newlineNote: '外接键盘可用 Shift + Enter',
            note: '触摸设备建议点击发送按钮；连接外接键盘后也可用 Ctrl + Enter 发送。'
        };
    }
    const ios = /iphone|ipad|ipod/.test(raw) || (raw.includes('mac') && touch && navigator.maxTouchPoints > 1);
    if (ios) {
        return {
            label: 'iPhone / iPad 触摸设备', send: '点击发送按钮', newline: 'Return / 换行键',
            newlineNote: '外接键盘可用 Shift + Enter',
            note: '触摸设备建议点击发送按钮；连接外接键盘后也可用 ⌘ + Enter 发送。'
        };
    }
    const platform = detectLocalPlatform();
    if (platform === 'windows') {
        return {
            label: 'Windows 桌面', send: 'Ctrl + Enter', newline: 'Shift + Enter',
            newlineNote: '普通 Enter 也会换行', note: '已按 Windows 键盘显示快捷键。'
        };
    }
    if (platform === 'linux') {
        return {
            label: 'Linux 桌面', send: 'Ctrl + Enter', newline: 'Shift + Enter',
            newlineNote: '普通 Enter 也会换行', note: '已按 Linux 键盘显示快捷键。'
        };
    }
    return {
        label: 'macOS 桌面', send: '⌘ + Enter', newline: 'Shift + Enter',
        newlineNote: '普通 Enter 也会换行', note: '已按 macOS 键盘显示快捷键。'
    };
}

function renderHelpEnvironment() {
    const environment = detectClientEnvironment();
    elements.helpEnvironmentLabel.textContent = environment.label;
    elements.helpSendShortcut.textContent = environment.send;
    elements.helpNewlineShortcut.textContent = environment.newline;
    elements.helpNewlineNote.textContent = environment.newlineNote;
    elements.helpPlatformNote.textContent = `${environment.note} 中文输入法组词和选择候选词时不会触发快捷发送。`;
    elements.helpOpen.title = `使用帮助：${environment.send} 发送，${environment.newline} 换行`;
    elements.helpOpen.setAttribute('aria-label', `打开使用帮助；${environment.send} 发送，${environment.newline} 换行`);
    elements.sendButton.title = `发送消息（${environment.send}）`;
}

function markHelpIntroSeen() {
    try { localStorage.setItem(HELP_INTRO_STORAGE_KEY, '1'); } catch (_) { /* Storage can be unavailable. */ }
}

function helpIntroSeen() {
    try { return localStorage.getItem(HELP_INTRO_STORAGE_KEY) === '1'; } catch (_) { return false; }
}

function maybeShowHelpIntro() {
    if (helpIntroSeen()) return;
    window.setTimeout(() => openHelp(true), 250);
}

function openHelp(automatic = false) {
    renderHelpEnvironment();
    state.helpReturnFocus = automatic ? null : document.activeElement;
    elements.helpModal.hidden = false;
    document.body.classList.add('modal-open');
    markHelpIntroSeen();
    window.requestAnimationFrame(() => (automatic ? elements.helpConfirm : elements.helpClose).focus());
}

function closeHelp() {
    if (elements.helpModal.hidden) return;
    elements.helpModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (state.helpReturnFocus?.focus) state.helpReturnFocus.focus();
    else elements.messageInput.focus();
    state.helpReturnFocus = null;
}

function openMacosLauncherHelp(fileName) {
    elements.macosLaunchHelpFile.textContent = fileName;
    elements.macosLaunchHelpCommand.textContent = elements.localCodexCommand.textContent;
    state.macosLaunchHelpReturnFocus = document.activeElement;
    elements.macosLaunchHelpModal.hidden = false;
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => elements.macosLaunchHelpCopy.focus({ preventScroll: true }));
}

function closeMacosLauncherHelp() {
    if (elements.macosLaunchHelpModal.hidden) return;
    elements.macosLaunchHelpModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (state.macosLaunchHelpReturnFocus?.focus) state.macosLaunchHelpReturnFocus.focus();
    state.macosLaunchHelpReturnFocus = null;
}

async function copyMacosLauncherCommand() {
    try {
        await navigator.clipboard.writeText(elements.macosLaunchHelpCommand.textContent);
        showToast('macOS 运行命令已复制，请粘贴到终端并按回车');
    } catch (_) {
        showToast('无法自动复制，请手动选择命令', true);
    }
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

function stopLocalBridgeDiscovery() {
    if (state.localBridgeDiscoveryTimer) window.clearTimeout(state.localBridgeDiscoveryTimer);
    state.localBridgeDiscoveryTimer = 0;
    state.localBridgeDiscoveryUntil = 0;
    state.localBridgeDiscoveryCycle = 0;
}

function base64Url(bytes) {
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function localBridgeChallenge() {
    return base64Url(crypto.getRandomValues(new Uint8Array(24)));
}

async function expectedLocalBridgeProof(challenge, port) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(state.localCodex.token),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${challenge}.${port}`)
    );
    return base64Url(new Uint8Array(signature));
}

async function probeLocalBridgePort(port, challenge) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 650);
    try {
        const discoveryResponse = await fetch(`http://127.0.0.1:${port}/discover?challenge=${encodeURIComponent(challenge)}`, {
            cache: 'no-store',
            signal: controller.signal
        });
        if (!discoveryResponse.ok) return null;
        const discovery = await discoveryResponse.json().catch(() => null);
        if (!discovery || discovery.provider !== state.localCodex.tool) return null;
        const expectedProof = await expectedLocalBridgeProof(challenge, port);
        if (discovery.proof !== expectedProof) return null;
        const response = await fetch(`http://127.0.0.1:${port}/status`, {
            headers: { Authorization: `Bearer ${state.localCodex.token}` },
            cache: 'no-store',
            signal: controller.signal
        });
        if (!response.ok) return null;
        const payload = await response.json().catch(() => null);
        if (!payload || payload.provider !== state.localCodex.tool) return null;
        return { port, payload };
    } catch (_) {
        return null;
    } finally {
        window.clearTimeout(timeout);
    }
}

function localBridgeCandidatePort(offset) {
    const port = state.localCodex.port + offset;
    return port <= 65535 ? port : LOCAL_CODEX_DEFAULT_PORT + (port - 65536);
}

async function scanLocalBridgePorts(fullScan) {
    const challenge = localBridgeChallenge();
    const offsets = fullScan
        ? Array.from({ length: LOCAL_BRIDGE_PORT_SCAN_LIMIT }, (_, index) => index)
        : [0];
    const batchSize = 25;
    for (let index = 0; index < offsets.length; index += batchSize) {
        const results = await Promise.all(offsets.slice(index, index + batchSize)
            .map((offset) => probeLocalBridgePort(localBridgeCandidatePort(offset), challenge)));
        const match = results.find(Boolean);
        if (match) return match;
    }
    return null;
}

function acceptLocalBridgeDiscovery(match) {
    state.localCodex.port = match.port;
    elements.baseUrl.value = `http://127.0.0.1:${match.port}`;
    saveLocalCodexPairing();
    updateEndpointPreview();
    const account = match.payload.account || {};
    const accountLabel = account.planType || match.payload.version || account.type || '已连接';
    const tool = currentLocalTool();
    setLocalCodexStatus('success', accountLabel);
    setConnectionState('success', `${tool?.title || match.payload.label || '本机 AI'}已连接`, '自动');
    elements.localCodexStop.disabled = false;
    state.localBridgeConnected = true;
    setMultimodalCapability('unsupported', '当前本机桥接仅开放文本对话', true);
    stopLocalBridgeDiscovery();
    showToast(`${tool?.title || match.payload.label || '本机 AI'}已自动连接；没有打开重复网页窗口`);
}

async function runLocalBridgeDiscovery() {
    state.localBridgeDiscoveryTimer = 0;
    if (state.localBridgeDiscoveryRunning) {
        state.localBridgeDiscoveryTimer = window.setTimeout(runLocalBridgeDiscovery, 250);
        return;
    }
    if (!state.localCodex.token || Date.now() >= state.localBridgeDiscoveryUntil) {
        if (Date.now() >= state.localBridgeDiscoveryUntil) stopLocalBridgeDiscovery();
        return;
    }
    const tool = currentLocalTool();
    if (!tool || tool.tool !== state.localCodex.tool) return;
    state.localBridgeDiscoveryRunning = true;
    try {
        const fullScan = state.localBridgeDiscoveryCycle % 5 === 0;
        state.localBridgeDiscoveryCycle += 1;
        const match = await scanLocalBridgePorts(fullScan);
        if (match && state.localCodex.token && state.localBridgeDiscoveryUntil > Date.now()) {
            acceptLocalBridgeDiscovery(match);
            return;
        }
    } finally {
        state.localBridgeDiscoveryRunning = false;
    }
    if (state.localBridgeDiscoveryUntil) {
        state.localBridgeDiscoveryTimer = window.setTimeout(runLocalBridgeDiscovery, 1200);
    }
}

function startLocalBridgeDiscovery(duration = LOCAL_BRIDGE_DISCOVERY_MS) {
    if (!state.localCodex.token) return;
    if (state.localBridgeDiscoveryTimer) window.clearTimeout(state.localBridgeDiscoveryTimer);
    state.localBridgeDiscoveryUntil = Date.now() + duration;
    state.localBridgeDiscoveryCycle = 0;
    state.localBridgeDiscoveryTimer = window.setTimeout(runLocalBridgeDiscovery, 0);
}

function resumeLocalBridgeDiscovery() {
    const tool = currentLocalTool();
    if (state.localBridgeConnected || !state.localCodex.token || !tool || tool.tool !== state.localCodex.tool) return;
    if (state.localBridgeDiscoveryUntil > Date.now()) {
        if (!state.localBridgeDiscoveryTimer && !state.localBridgeDiscoveryRunning) {
            state.localBridgeDiscoveryTimer = window.setTimeout(runLocalBridgeDiscovery, 0);
        }
        return;
    }
    startLocalBridgeDiscovery(30_000);
}

function setLocalCodexStatus(status, text) {
    elements.localCodexStatus.dataset.state = status;
    elements.localCodexStatus.textContent = text;
}

function updateLocalCodexCommand() {
    const tool = currentLocalTool()?.tool || 'codex';
    const slug = tool === 'antigravity' ? 'antigravity' : tool;
    const commands = {
        macos: `bash "$HOME/Downloads/ai-shakedown-${slug}-macos.command"`,
        windows: `powershell -ExecutionPolicy Bypass -File "$HOME\\Downloads\\ai-shakedown-${slug}-windows.ps1"`,
        linux: `bash "$HOME/Downloads/ai-shakedown-${slug}-linux.sh"`
    };
    elements.localCodexCommand.textContent = commands[state.localCodex.platform] || commands.macos;
    elements.localCodexGuide.hidden = state.localCodex.platform !== 'macos';
}

async function copyLocalCodexCommand() {
    try {
        await navigator.clipboard.writeText(elements.localCodexCommand.textContent);
        showToast('运行命令已复制');
    } catch (_) {
        showToast('无法自动复制，请手动选择命令', true);
    }
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
        elements.localToolNote.textContent = `脚本会检查 Node.js、${tool.cli} 和登录状态；新版启动器会停止同工具的旧桥接，自动避让端口，并由当前应用直接完成连接。`;
        const paired = state.localCodex.token && state.localCodex.tool === tool.tool;
        setLocalCodexStatus(paired ? 'idle' : 'error', paired ? '等待检测' : '需要运行脚本');
        updateLocalCodexCommand();
        resumeLocalBridgeDiscovery();
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
        const assetVersion = APP_VERSION.replace(/^v/, '');
        const templateUrl = new URL(`${spec.template}?v=${assetVersion}`, window.location.href);
        const bridgeUrl = new URL(`assets/local-codex-bridge.mjs?v=${assetVersion}`, window.location.href);
        const returnUrl = new URL(window.location.href);
        returnUrl.search = '';
        returnUrl.searchParams.set('source', isStandalonePwa() ? 'pwa' : 'launcher');
        returnUrl.hash = '';
        const response = await fetch(templateUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`启动脚本下载失败（HTTP ${response.status}）`);
        const template = await response.text();
        const launcher = template
            .replaceAll('__BRIDGE_URL__', bridgeUrl.href)
            .replaceAll('__RETURN_URL__', returnUrl.href)
            .replaceAll('__APP_VERSION__', APP_VERSION)
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
        state.localBridgeConnected = false;
        elements.baseUrl.value = `http://127.0.0.1:${port}`;
        saveLocalCodexPairing();
        startLocalBridgeDiscovery();
        setLocalCodexStatus('idle', '脚本已下载');
        updateEndpointPreview();
        showToast('自检启动脚本已下载；运行后当前页面会自动连接，不会重复开窗');
        if (state.localCodex.platform === 'macos') openMacosLauncherHelp(spec.fileName);
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
        elements.localCodexStop.disabled = false;
        state.localBridgeConnected = true;
        setMultimodalCapability('unsupported', '当前本机桥接仅开放文本对话', true);
        stopLocalBridgeDiscovery();
        showToast(`${tool.title}已连接 · ${accountLabel}；桥接在后台运行，终端可以关闭`);
    } catch (error) {
        state.localBridgeConnected = false;
        setLocalCodexStatus('error', '连接失败');
        setConnectionState('error', '连接失败', '');
        const message = error instanceof TypeError
            ? '未检测到本地桥接。请运行刚下载的脚本；显示后台启动成功后即可关闭终端。'
            : error.message;
        showToast(message, true);
    }
}

async function stopLocalCodexConnection() {
    if (state.busy || !state.localCodex.token) return;
    const tool = currentLocalTool();
    try {
        elements.localCodexStop.disabled = true;
        const response = await fetch(`http://127.0.0.1:${state.localCodex.port}/shutdown`, {
            method: 'POST',
            headers: localCodexAuthorizationHeaders(true)
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(getErrorMessage(payload, `HTTP ${response.status}`));
        try { sessionStorage.removeItem(LOCAL_CODEX_SESSION_KEY); } catch (_) { /* Ignore. */ }
        state.localCodex.token = '';
        state.localCodex.tool = '';
        state.localBridgeConnected = false;
        stopLocalBridgeDiscovery();
        setLocalCodexStatus('idle', '已停止');
        setConnectionState('idle', '后台连接已停止', '');
        showToast(`${tool?.title || '本地连接'}已停止`);
    } catch (error) {
        elements.localCodexStop.disabled = false;
        showToast(error instanceof TypeError ? '无法连接后台桥接，可能已经停止' : error.message, true);
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
        [
            SETTINGS_STORAGE_KEY, PROFILES_STORAGE_KEY, PROMPTS_STORAGE_KEY, CONVERSATIONS_STORAGE_KEY,
            HELP_INTRO_STORAGE_KEY, PWA_IME_NOTICE_STORAGE_KEY, CONVERSATION_SIDEBAR_STORAGE_KEY,
            MULTIMODAL_CAPABILITIES_STORAGE_KEY
        ]
            .forEach((key) => localStorage.removeItem(key));
    } catch (_) { /* Ignore storage restrictions. */ }
    try { sessionStorage.removeItem(LOCAL_CODEX_SESSION_KEY); } catch (_) { /* Ignore storage restrictions. */ }
    state.localCodex.token = '';
    state.localCodex.port = LOCAL_CODEX_DEFAULT_PORT;
    state.localCodex.tool = '';
    state.localBridgeConnected = false;
    state.profiles = [];
    state.prompts = [];
    state.conversations = [];
    state.activeConversationId = '';
    state.selectedAgentId = '';
    state.selectedAgentContent = '';
    state.composerAttachments = [];
    const attachmentDatabase = state.attachmentDatabase;
    state.attachmentDatabase = null;
    if (attachmentDatabase) {
        Promise.resolve(attachmentDatabase).then((database) => {
            database.close();
            indexedDB.deleteDatabase(ATTACHMENT_DATABASE_NAME);
        }).catch(() => {});
    } else {
        try { indexedDB.deleteDatabase(ATTACHMENT_DATABASE_NAME); } catch (_) { /* Ignore storage restrictions. */ }
    }
    elements.provider.value = PROVIDERS[0].id;
    applyProvider(PROVIDERS[0]);
    elements.apiKey.value = '';
    elements.systemPrompt.value = '';
    renderProfileOptions();
    updateAgentCount();
    document.body.classList.remove('conversation-sidebar-enabled', 'sidebar-conversations');
    createConversation({ silent: true, systemPrompt: '' });
    showToast('已清除配置、自定义智能体、对话、API Key 和帮助提示状态');
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
    updateAgentCount();
}

function updateAgentCount() {
    const builtInCount = state.agentCatalog?.count || state.agentCatalog?.agents?.length || 268;
    elements.agentCount.textContent = String(builtInCount + state.prompts.length);
    elements.customAgentCount.textContent = String(state.prompts.length);
}

function startNewCustomAgent() {
    state.selectedAgentId = '';
    state.selectedAgentContent = '';
    elements.agentDetailEmpty.hidden = true;
    elements.agentDetailContent.hidden = true;
    elements.customAgentEditor.hidden = false;
    elements.customAgentName.value = '';
    elements.customAgentPrompt.value = elements.systemPrompt.value;
    renderCustomAgentPreview();
    elements.customAgentDelete.disabled = true;
    elements.agentApply.disabled = !elements.customAgentPrompt.value.trim();
    renderAgentList();
    elements.customAgentName.focus();
}

function saveCustomAgent() {
    const name = elements.customAgentName.value.trim();
    const content = elements.customAgentPrompt.value.trim();
    if (!name || !content) {
        showToast('请填写智能体名称和 System 定义', true);
        return;
    }
    let prompt = state.prompts.find((item) => item.id === state.selectedAgentId);
    if (prompt) {
        prompt.name = name;
        prompt.content = content;
        prompt.updatedAt = new Date().toISOString();
    } else {
        prompt = { id: createId('prompt'), name, content, updatedAt: new Date().toISOString() };
        state.prompts.push(prompt);
    }
    if (!writeStoredValue(PROMPTS_STORAGE_KEY, state.prompts)) return;
    state.selectedAgentId = prompt.id;
    state.selectedAgentContent = content;
    elements.customAgentDelete.disabled = false;
    elements.agentApply.disabled = false;
    updateAgentCount();
    renderAgentList();
    renderCustomAgentPreview();
    showToast(`已保存自定义智能体“${name}”`);
}

function deleteCustomAgent() {
    const prompt = state.prompts.find((item) => item.id === state.selectedAgentId);
    if (!prompt) return;
    state.prompts = state.prompts.filter((item) => item.id !== prompt.id);
    writeStoredValue(PROMPTS_STORAGE_KEY, state.prompts);
    updateAgentCount();
    state.selectedAgentId = '';
    state.selectedAgentContent = '';
    renderAgentList();
    startNewCustomAgent();
    showToast(`已删除自定义智能体“${prompt.name}”`);
}

async function loadAgentCatalog() {
    if (state.agentCatalog) return state.agentCatalog;
    const response = await fetch(AGENT_CATALOG_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`角色索引加载失败（HTTP ${response.status}）`);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.agents)) throw new Error('角色索引格式无效');
    state.agentCatalog = catalog;
    updateAgentCount();
    elements.agentLibrarySource.textContent = `agency-agents-zh ${catalog.version || ''} · ${catalog.license || 'MIT'}`;
    elements.agentDepartment.replaceChildren(new Option('全部部门', ''));
    for (const department of catalog.departments || []) {
        const count = catalog.agents.filter((agent) => agent.department === department.id).length;
        if (count) elements.agentDepartment.appendChild(new Option(`${department.name} (${count})`, department.id));
    }
    return catalog;
}

function setAgentLibraryMode(mode) {
    state.agentLibraryMode = mode === 'custom' ? 'custom' : 'built-in';
    const custom = state.agentLibraryMode === 'custom';
    elements.agentBuiltInTab.classList.toggle('active', !custom);
    elements.agentBuiltInTab.setAttribute('aria-selected', String(!custom));
    elements.agentCustomTab.classList.toggle('active', custom);
    elements.agentCustomTab.setAttribute('aria-selected', String(custom));
    elements.agentDepartment.hidden = custom;
    elements.customAgentNew.hidden = !custom;
    elements.customAgentSave.hidden = !custom;
    elements.customAgentDelete.hidden = !custom;
    elements.agentLibrarySource.textContent = custom
        ? '自定义智能体 · 仅保存在当前浏览器'
        : `agency-agents-zh ${state.agentCatalog?.version || ''} · ${state.agentCatalog?.license || 'MIT'}`;
    elements.agentSearch.placeholder = custom ? '搜索自定义智能体' : '搜索角色、能力或文件名';
    state.selectedAgentId = '';
    state.selectedAgentContent = '';
    elements.agentDetailEmpty.hidden = false;
    elements.agentDetailEmpty.querySelector('span').textContent = custom ? '选择或新建一个自定义智能体' : '选择一个角色';
    elements.agentDetailContent.hidden = true;
    elements.customAgentEditor.hidden = true;
    elements.agentApply.disabled = true;
    elements.customAgentDelete.disabled = true;
    renderAgentList();
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
        const activeAgent = activeConversation()?.activeAgent;
        const activeAgentId = activeAgent?.id;
        setAgentLibraryMode(activeAgent?.custom ? 'custom' : state.agentLibraryMode);
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
    const query = elements.agentSearch.value.trim().toLocaleLowerCase('zh-CN');
    if (state.agentLibraryMode === 'custom') {
        return state.prompts.filter((agent) => !query || [agent.name, agent.content]
            .some((value) => String(value || '').toLocaleLowerCase('zh-CN').includes(query)));
    }
    if (!state.agentCatalog) return [];
    const department = elements.agentDepartment.value;
    return state.agentCatalog.agents.filter((agent) => {
        if (department && agent.department !== department) return false;
        if (!query) return true;
        return [agent.name, agent.description, agent.departmentName, agent.path]
            .some((value) => String(value || '').toLocaleLowerCase('zh-CN').includes(query));
    });
}

function renderAgentList() {
    const agents = filteredAgents();
    const custom = state.agentLibraryMode === 'custom';
    elements.agentResultsCount.textContent = `${agents.length} 个${custom ? '自定义' : '角色'}`;
    elements.agentList.replaceChildren();
    if (!agents.length) {
        const empty = document.createElement('div');
        empty.className = 'agent-list-empty';
        empty.textContent = custom ? '还没有自定义智能体，点击“新建自定义”开始' : '没有匹配的角色';
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
        emoji.textContent = custom ? '✦' : (agent.emoji || '●');
        const name = document.createElement('span');
        name.className = 'agent-list-name';
        name.textContent = agent.name;
        const description = document.createElement('span');
        description.className = 'agent-list-description';
        description.textContent = custom ? '自定义 System 智能体' : agent.description;
        button.append(emoji, name, description);
        button.addEventListener('click', () => selectAgent(agent.id));
        elements.agentList.appendChild(button);
    }
    elements.agentList.querySelector('.agent-list-item.active')?.scrollIntoView({ block: 'nearest' });
}

async function selectAgent(agentId) {
    if (state.agentLibraryMode === 'custom') {
        selectCustomAgent(agentId);
        return;
    }
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

function selectCustomAgent(agentId) {
    const agent = state.prompts.find((item) => item.id === agentId);
    if (!agent) return;
    state.selectedAgentId = agent.id;
    state.selectedAgentContent = agent.content;
    elements.agentDetailEmpty.hidden = true;
    elements.agentDetailContent.hidden = true;
    elements.customAgentEditor.hidden = false;
    elements.customAgentName.value = agent.name;
    elements.customAgentPrompt.value = agent.content;
    renderCustomAgentPreview();
    elements.customAgentDelete.disabled = false;
    elements.agentApply.disabled = false;
    renderAgentList();
}

function renderCustomAgentPreview() {
    const content = elements.customAgentPrompt.value.trim();
    elements.customAgentPreview.classList.toggle('is-empty', !content);
    if (!content) {
        elements.customAgentPreview.textContent = '输入内容后会在这里自动预览。';
        return;
    }
    renderMarkdown(elements.customAgentPreview, content);
}

function applySelectedAgent() {
    const conversation = activeConversation();
    if (!state.selectedAgentContent || !conversation) return;
    if (state.agentLibraryMode === 'custom') {
        const name = elements.customAgentName.value.trim();
        const content = elements.customAgentPrompt.value.trim();
        if (!name || !content) {
            showToast('请填写智能体名称和 System 定义', true);
            return;
        }
        let savedAgent = state.prompts.find((item) => item.id === state.selectedAgentId);
        if (savedAgent) {
            savedAgent.name = name;
            savedAgent.content = content;
            savedAgent.updatedAt = new Date().toISOString();
        } else {
            savedAgent = { id: createId('prompt'), name, content, updatedAt: new Date().toISOString() };
            state.prompts.push(savedAgent);
        }
        if (!writeStoredValue(PROMPTS_STORAGE_KEY, state.prompts)) return;
        state.selectedAgentId = savedAgent.id;
        state.selectedAgentContent = content;
        updateAgentCount();
        elements.systemPrompt.value = state.selectedAgentContent;
        conversation.systemPrompt = state.selectedAgentContent;
        conversation.activeAgent = {
            id: savedAgent.id,
            name,
            emoji: '✦',
            departmentName: '自定义',
            custom: true
        };
        persistSettings();
        persistConversations();
        renderActiveAgent();
        closeAgentLibrary();
        showToast(`已应用自定义智能体“${name}”`);
        return;
    }
    const agent = state.agentCatalog?.agents.find((item) => item.id === state.selectedAgentId);
    if (!agent) return;
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
    state.agentLibraryMode = activeConversation()?.activeAgent?.custom ? 'custom' : 'built-in';
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
        if (elements.emptyEndpoint) elements.emptyEndpoint.textContent = masked.origin;
    } catch (error) {
        elements.endpointPreview.textContent = error.message;
    }
    updateActiveModel();
}

function updateActiveModel() {
    elements.activeModelTitle.textContent = elements.model.value.trim() || '未选择模型';
    updateRuntimeContext();
    syncMultimodalCapability();
}

function multimodalCapabilitySignature() {
    return JSON.stringify({
        provider: elements.provider.value,
        protocol: elements.protocol.value,
        baseUrl: elements.baseUrl.value.trim().replace(/\/+$/, ''),
        chatPath: elements.chatPath.value.trim(),
        model: elements.model.value.trim(),
        proxy: elements.proxy.checked
    });
}

function readMultimodalCapabilities() {
    try {
        const value = JSON.parse(localStorage.getItem(MULTIMODAL_CAPABILITIES_STORAGE_KEY) || '{}');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_) {
        return {};
    }
}

function syncMultimodalCapability() {
    const signature = multimodalCapabilitySignature();
    state.multimodalSignature = signature;
    if (currentLocalTool()) {
        state.multimodalStatus = 'unsupported';
    } else {
        const cached = readMultimodalCapabilities()[signature];
        state.multimodalStatus = cached?.status === 'supported' ? 'supported'
            : cached?.status === 'unsupported' ? 'unsupported'
                : 'unknown';
    }
    syncAttachmentButton();
}

function syncAttachmentButton() {
    const supported = state.multimodalStatus === 'supported';
    elements.attachmentButton.hidden = !supported;
    elements.attachmentButton.disabled = !supported || state.busy;
    if (!supported && state.composerAttachments.length) {
        state.composerAttachments = [];
        renderComposerAttachments();
        persistActiveDraft();
    }
}

function setMultimodalCapability(status, reason = '', persist = false) {
    const signature = multimodalCapabilitySignature();
    state.multimodalSignature = signature;
    state.multimodalStatus = status;
    if (persist && ['supported', 'unsupported'].includes(status) && !currentLocalTool()) {
        try {
            const capabilities = readMultimodalCapabilities();
            capabilities[signature] = { status, reason, testedAt: new Date().toISOString() };
            localStorage.setItem(MULTIMODAL_CAPABILITIES_STORAGE_KEY, JSON.stringify(capabilities));
        } catch (_) { /* Capability cache is optional. */ }
    }
    syncAttachmentButton();
}

function multimodalUnsupportedResponse(status, text) {
    return [400, 415, 422].includes(status)
        && /image|vision|multimodal|image_url|inline.?data|content.?type|base64|media.?type|图片|多模态/i.test(text);
}

async function testMultimodalCapability() {
    if (currentLocalTool()) {
        setMultimodalCapability('unsupported', '本机桥接尚未开放图片输入', true);
        return { supported: false, reason: '本机桥接尚未开放图片输入' };
    }
    const probeMessages = [{
        role: 'user',
        content: '仅回复 OK',
        images: [{ name: 'capability-test.png', type: 'image/png', data: MULTIMODAL_TEST_IMAGE_BASE64 }]
    }];
    const { url, upstreamUrl, headers } = prepareRequest(elements.chatPath.value, false);
    const body = buildRequestBody(probeMessages, false, { maxTokens: 2 });
    state.inspector.request = prettyJson({
        method: 'POST',
        url: maskedUrl(url),
        ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
        headers: maskedHeaders(headers),
        purpose: '多模态能力检查',
        body: inspectorSafeBody(body)
    });
    state.inspector.events = '多模态检查使用 16×16 像素测试图片和极短回复';
    renderInspector();
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: state.controller?.signal
    });
    const raw = await response.text();
    let payload = raw;
    try { payload = JSON.parse(raw); } catch (_) { /* Keep the provider error text. */ }
    elements.httpStatus.textContent = String(response.status);
    state.inspector.response = prettyJson(payload || `HTTP ${response.status}`);
    renderInspector();
    if (response.ok) {
        setMultimodalCapability('supported', '实际图片请求成功', true);
        return { supported: true, reason: '实际图片请求成功' };
    }
    const errorText = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (multimodalUnsupportedResponse(response.status, errorText)) {
        const reason = getErrorMessage(payload, '当前模型不支持图片输入');
        setMultimodalCapability('unsupported', reason, true);
        return { supported: false, reason };
    }
    setMultimodalCapability('unknown');
    throw new ApiError(getErrorMessage(payload, `多模态检查失败（HTTP ${response.status}）`), response.status);
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

function openAiRequestMessage(message) {
    if (!message.images?.length || message.role !== 'user') return { role: message.role, content: message.content };
    return {
        role: message.role,
        content: [
            { type: 'text', text: message.content || '请分析附件。' },
            ...message.images.map((image) => ({
                type: 'image_url',
                image_url: { url: `data:${image.type};base64,${image.data}` }
            }))
        ]
    };
}

function anthropicRequestMessage(message) {
    if (!message.images?.length || message.role !== 'user') return { role: message.role, content: message.content };
    return {
        role: message.role,
        content: [
            ...message.images.map((image) => ({
                type: 'image',
                source: { type: 'base64', media_type: image.type, data: image.data }
            })),
            { type: 'text', text: message.content || '请分析附件。' }
        ]
    };
}

function geminiRequestParts(message) {
    return [
        ...(message.images || []).map((image) => ({ inlineData: { mimeType: image.type, data: image.data } })),
        { text: message.content || '请分析附件。' }
    ];
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
            messages: messages.filter((message) => message.role !== 'system').map(anthropicRequestMessage),
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
            parts: geminiRequestParts(message)
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
        messages: messages.map(openAiRequestMessage),
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
        history: history.map(normalizeStoredMessage).filter(Boolean),
        draft: '',
        draftAttachments: [],
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

    const sidebarWasEnabled = conversationSidebarEnabled();
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
    if (!sidebarWasEnabled && conversationSidebarEnabled()) {
        if (!isMobileWorkspace()) openConversationSidebar();
        showToast('对话已超过 4 个，已切换为左侧列表；以后打开仍保持此布局');
    }
}

function activeConversation() {
    return state.conversations.find((item) => item.id === state.activeConversationId) || null;
}

function conversationSidebarPreference() {
    try { return localStorage.getItem(CONVERSATION_SIDEBAR_STORAGE_KEY) === '1'; } catch (_) { return false; }
}

function conversationSidebarEnabled() {
    return conversationSidebarPreference() || state.conversations.length > CONVERSATION_SIDEBAR_THRESHOLD;
}

function syncConversationSidebarMode() {
    if (state.conversations.length > CONVERSATION_SIDEBAR_THRESHOLD && !conversationSidebarPreference()) {
        try { localStorage.setItem(CONVERSATION_SIDEBAR_STORAGE_KEY, '1'); } catch (_) { /* Storage can be unavailable. */ }
    }
    const enabled = conversationSidebarEnabled();
    document.body.classList.toggle('conversation-sidebar-enabled', enabled);
    if (!enabled) document.body.classList.remove('sidebar-conversations');
    else if (document.body.classList.contains('chat-focused') && !isMobileWorkspace()) {
        document.body.classList.add('sidebar-conversations');
    }
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
                departmentName: typeof item.activeAgent.departmentName === 'string' ? item.activeAgent.departmentName : '',
                custom: item.activeAgent.custom === true
            }
            : null,
        history: Array.isArray(item?.history) ? item.history.map(normalizeStoredMessage).filter(Boolean) : [],
        draft: typeof item?.draft === 'string' ? item.draft : '',
        draftAttachments: Array.isArray(item?.draftAttachments)
            ? item.draftAttachments.map(normalizeAttachmentMetadata).filter(Boolean)
            : [],
        createdAt: typeof item?.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        parentConversationId: typeof item?.parentConversationId === 'string' ? item.parentConversationId : '',
        branchAtMessageId: typeof item?.branchAtMessageId === 'string' ? item.branchAtMessageId : '',
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

function persistActiveDraft() {
    const conversation = activeConversation();
    if (!conversation) return;
    conversation.draft = elements.messageInput.value;
    conversation.draftAttachments = state.composerAttachments.map((item) => ({ ...item }));
    persistConversations();
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
        draft: '',
        draftAttachments: [],
        createdAt: new Date().toISOString()
    };
    const sidebarWasEnabled = conversationSidebarEnabled();
    state.conversations.push(conversation);
    state.activeConversationId = conversation.id;
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    if (!sidebarWasEnabled && conversationSidebarEnabled() && !options.silent) {
        if (!isMobileWorkspace()) openConversationSidebar();
        showToast('对话已超过 4 个，已切换为左侧列表；以后打开仍保持此布局');
    }
    if (!options.silent) showToast('已新建对话窗口');
}

function switchConversation(id) {
    if (id === state.activeConversationId) return;
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    if (!state.conversations.some((item) => item.id === id)) return;
    persistActiveDraft();
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
        conversation.draft = '';
        conversation.draftAttachments = [];
        conversation.title = '新会话 1';
        persistConversations();
        renderConversationTabs();
        renderActiveConversation();
        cleanupUnusedAttachments();
        return;
    }
    state.conversations.splice(index, 1);
    if (id === state.activeConversationId) {
        state.activeConversationId = state.conversations[Math.min(index, state.conversations.length - 1)].id;
    }
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    cleanupUnusedAttachments();
}

function renderConversationTabs() {
    syncConversationSidebarMode();
    elements.conversationTabs.replaceChildren();
    elements.conversationSidebarList.replaceChildren();
    elements.conversationSidebarCount.textContent = String(state.conversations.length);
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

        const sidebarItem = document.createElement('div');
        sidebarItem.className = `conversation-sidebar-item${conversation.id === state.activeConversationId ? ' active' : ''}`;
        const sidebarSelect = document.createElement('button');
        sidebarSelect.type = 'button';
        sidebarSelect.role = 'tab';
        sidebarSelect.ariaSelected = String(conversation.id === state.activeConversationId);
        sidebarSelect.title = selectButton.title;
        const sidebarTitle = document.createElement('strong');
        sidebarTitle.textContent = conversation.title;
        const sidebarMeta = document.createElement('small');
        sidebarMeta.textContent = conversation.importedFrom ? '本地导入' : `${conversation.history.length} 条消息`;
        sidebarSelect.append(sidebarTitle, sidebarMeta);
        sidebarSelect.addEventListener('click', () => {
            switchConversation(conversation.id);
            if (isMobileWorkspace()) closeWorkspaceSidebar();
        });
        const sidebarClose = document.createElement('button');
        sidebarClose.type = 'button';
        sidebarClose.className = 'conversation-sidebar-close';
        sidebarClose.title = '关闭对话';
        sidebarClose.setAttribute('aria-label', `关闭${conversation.title}`);
        sidebarClose.innerHTML = '<i class="bi bi-x"></i>';
        sidebarClose.addEventListener('click', () => closeConversation(conversation.id));
        sidebarItem.append(sidebarSelect, sidebarClose);
        elements.conversationSidebarList.appendChild(sidebarItem);
    }
    elements.conversationTabs.querySelector('.conversation-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    elements.conversationSidebarList.querySelector('.conversation-sidebar-item.active')?.scrollIntoView({ block: 'nearest' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function renderActiveConversation() {
    const conversation = activeConversation();
    if (!conversation) return;
    elements.systemPrompt.value = conversation.systemPrompt;
    elements.messageInput.value = conversation.draft || '';
    state.composerAttachments = (conversation.draftAttachments || []).map((item) => ({ ...item }));
    renderComposerAttachments();
    syncAttachmentButton();
    renderActiveAgent();
    elements.chatWindow.replaceChildren();
    elements.emptyState = null;
    elements.emptyEndpoint = null;
    if (!conversation.history.length) {
        renderEmptyState();
        return;
    }
    for (const message of conversation.history) addMessage(message);
    closeConversationSearch();
    exitMessageSelection();
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
    element.querySelectorAll('pre').forEach((pre) => {
        if (pre.querySelector(':scope > .code-copy-button')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy-button';
        button.textContent = '复制代码';
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent || '');
                button.textContent = '已复制';
                window.setTimeout(() => { button.textContent = '复制代码'; }, 1200);
            } catch (_) {
                showToast('复制失败，请手动选择代码', true);
            }
        });
        pre.prepend(button);
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

function requestMessages(userMessage) {
    const system = elements.systemPrompt.value.trim();
    return [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...(activeConversation()?.history || []),
        userMessage
    ];
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
    }
    return btoa(binary);
}

function attachmentFenceLanguage(name) {
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const mapped = { js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', py: 'python', sh: 'bash', yml: 'yaml', md: 'markdown' }[extension];
    return mapped || (/^[a-z0-9+-]{1,12}$/.test(extension) ? extension : 'text');
}

async function hydrateRequestMessage(message) {
    const images = [];
    const documents = [];
    for (const attachment of message.attachments || []) {
        const record = await getAttachmentRecord(attachment.id);
        if (!record) throw new Error(`附件数据已丢失：${attachment.name}`);
        if (record.kind === 'image') {
            if (!(record.data instanceof Blob)) throw new Error(`图片附件无法读取：${attachment.name}`);
            images.push({ name: attachment.name, type: attachment.type, data: arrayBufferToBase64(await record.data.arrayBuffer()) });
        } else {
            const language = record.kind === 'pdf' ? 'text' : attachmentFenceLanguage(attachment.name);
            documents.push(`\n\n<attachment name="${attachment.name.replace(/["<>]/g, '')}">\n\`\`\`${language}\n${String(record.data).slice(0, MAX_EXTRACTED_ATTACHMENT_CHARS)}\n\`\`\`\n</attachment>`);
        }
    }
    return { role: message.role, content: `${message.content}${documents.join('')}`, ...(images.length ? { images } : {}) };
}

async function hydrateRequestMessages(messages) {
    return Promise.all(messages.map((message) => hydrateRequestMessage(message)));
}

function inspectorSafeBody(body) {
    return JSON.parse(JSON.stringify(body, (key, value) => {
        if (key === 'data' && typeof value === 'string' && value.length > 256) return `[已隐藏 ${value.length} 字符的附件数据]`;
        if (key === 'url' && typeof value === 'string' && value.startsWith('data:image/')) {
            return `[${value.slice(5, value.indexOf(';'))} 图片数据已隐藏]`;
        }
        return value;
    }));
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
    const serializedBody = JSON.stringify(body);
    if (new Blob([serializedBody]).size > MAX_REQUEST_BODY_BYTES) {
        throw new Error('完整请求超过 20 MiB；请减少附件，或新建对话避免重复发送历史附件');
    }
    state.inspector.request = prettyJson({
        method: 'POST',
        url: maskedUrl(url),
        ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
        headers: maskedHeaders(headers),
        body: inspectorSafeBody(body)
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
            method: 'POST', headers, body: serializedBody, signal: state.controller.signal
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
    const typedText = elements.messageInput.value.trim();
    const attachments = state.composerAttachments.map((item) => ({ ...item }));
    if ((!typedText && !attachments.length) || state.busy || isCostLimitReached()) return;
    if (attachments.length && state.multimodalStatus !== 'supported') {
        showToast('当前配置尚未通过多模态验证，请重新检查连接', true);
        return;
    }
    const userText = typedText || '请分析附件。';

    try {
        validateConfiguration();
    } catch (error) {
        showToast(error.message, true);
        return;
    }

    const conversation = activeConversation();
    if (!conversation) return;
    const priorHistory = [...conversation.history];
    const userMessage = createStoredMessage('user', userText, attachments);
    let messages;
    try {
        messages = await hydrateRequestMessages(requestMessages(userMessage));
    } catch (error) {
        showToast(error.message, true);
        return;
    }
    addMessage(userMessage);
    const assistant = addMessage('assistant', '', true);
    const streamRenderer = createStreamingMarkdownRenderer(assistant);
    elements.messageInput.value = '';
    state.composerAttachments = [];
    conversation.draft = '';
    conversation.draftAttachments = [];
    renderComposerAttachments();
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
        conversation.history = [...priorHistory, userMessage, createStoredMessage('assistant', assistantText)];
        conversation.systemPrompt = elements.systemPrompt.value;
        if (!priorHistory.length && !conversation.parentConversationId) conversation.title = deriveConversationTitle(userText);
        persistConversations();
        renderConversationTabs();
        renderActiveConversation();
        applyUsage(result.usage);
        setConnectionState('success', '请求成功', `${result.duration} ms`);
    } catch (error) {
        assistant.row.classList.remove('pending');
        if (error.name === 'AbortError') {
            streamRenderer.finish(assistantText || '已停止生成');
            if (assistantText) {
                conversation.history = [...priorHistory, userMessage, createStoredMessage('assistant', assistantText)];
                conversation.systemPrompt = elements.systemPrompt.value;
                if (!priorHistory.length && !conversation.parentConversationId) conversation.title = deriveConversationTitle(userText);
                persistConversations();
                renderConversationTabs();
                renderActiveConversation();
            }
            showToast('已停止生成');
        } else {
            streamRenderer.cancel();
            const message = describeError(error);
            conversation.history = [...priorHistory, { ...userMessage, status: 'failed', error: message }];
            conversation.systemPrompt = elements.systemPrompt.value;
            if (!priorHistory.length && !conversation.parentConversationId) conversation.title = deriveConversationTitle(userText);
            persistConversations();
            renderConversationTabs();
            renderActiveConversation();
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
    try {
        validateConfiguration();
        if (path) new URL(buildUrl(path, false, true));
    } catch (error) {
        showToast(error.message, true);
        return;
    }
    setBusy(true);
    setConnectionState('idle', '检查中', '');
    const startedAt = performance.now();
    try {
        state.controller = new AbortController();
        syncControls();
        if (path) {
            const { url, upstreamUrl, headers } = prepareRequest(path, false);
            delete headers['Content-Type'];
            state.inspector.request = prettyJson({
                method: 'GET',
                url: maskedUrl(url),
                ...(elements.proxy.checked ? { upstreamUrl: maskedUrl(upstreamUrl) } : {}),
                headers: maskedHeaders(headers)
            });
            state.inspector.events = '先检查模型列表，再发送极小图片验证多模态';
            renderInspector();
            elements.requestProtocol.textContent = elements.protocol.value;
            const response = await fetch(url, { headers, signal: state.controller.signal });
            const raw = await response.text();
            let payload;
            try { payload = JSON.parse(raw); } catch (_) { payload = raw; }
            elements.httpStatus.textContent = String(response.status);
            state.inspector.response = prettyJson(payload || `HTTP ${response.status}`);
            renderInspector();
            if (!response.ok) throw new ApiError(getErrorMessage(payload, `HTTP ${response.status}`), response.status);
        }
        const multimodal = await testMultimodalCapability();
        const duration = Math.round(performance.now() - startedAt);
        elements.duration.textContent = `${duration} ms`;
        setConnectionState('success', multimodal.supported ? '连接正常 · 支持附件' : '连接正常 · 不支持附件', `${duration} ms`);
        showToast(multimodal.supported
            ? `连接成功 · 已验证多模态 · ${duration} ms`
            : `连接成功 · 当前模型不显示附件按钮 · ${duration} ms`);
    } catch (error) {
        if (error.name !== 'AbortError') {
            setMultimodalCapability('unknown');
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
            return `无法连接${currentLocalTool().title}。请重新运行下载的启动脚本；显示后台启动成功后终端可以关闭。若浏览器阻止本地网络访问，请允许访问 127.0.0.1。`;
        }
        return '无法连接服务。请检查 URL、CORS、HTTPS/HTTP 混合内容以及自建服务是否已启动。';
    }
    return error.message || '未知错误';
}

function messageAction(icon, label, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'message-action';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<i class="bi ${icon}"></i>`;
    button.addEventListener('click', action);
    return button;
}

function findActiveMessage(messageId) {
    const conversation = activeConversation();
    const index = conversation?.history.findIndex((item) => item.id === messageId) ?? -1;
    return { conversation, index, message: index >= 0 ? conversation.history[index] : null };
}

function renderMessageAttachments(container, attachments = []) {
    if (!attachments.length) return;
    const list = document.createElement('div');
    list.className = 'message-attachments';
    for (const attachment of attachments) {
        const item = document.createElement('div');
        item.className = 'message-attachment';
        let preview;
        if (attachment.kind === 'image') {
            preview = document.createElement('img');
            preview.alt = attachment.name;
            renderAttachmentThumbnail(preview, attachment.id);
        } else {
            preview = document.createElement('i');
            preview.className = attachment.kind === 'pdf' ? 'bi bi-filetype-pdf' : 'bi bi-file-earmark-text';
        }
        const copy = document.createElement('span');
        copy.className = 'message-attachment-copy';
        const name = document.createElement('strong');
        name.textContent = attachment.name;
        const meta = document.createElement('small');
        meta.textContent = `${attachment.kind === 'pdf' ? `${attachment.pageCount || 0} 页 · ` : ''}${formatBytes(attachment.size)}`;
        copy.append(name, meta);
        item.append(preview, copy);
        list.appendChild(item);
    }
    container.appendChild(list);
}

function addMessage(messageOrRole, text = '', pending = false) {
    elements.emptyState?.remove();
    const message = typeof messageOrRole === 'string'
        ? createStoredMessage(messageOrRole, text)
        : messageOrRole;
    const role = message.role;
    const row = document.createElement('div');
    row.className = `message-row ${role}${pending ? ' pending' : ''}${message.status === 'failed' ? ' error' : ''}`;
    row.dataset.messageId = message.id;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'AI';
    const main = document.createElement('div');
    main.className = 'message-main';
    renderMessageAttachments(main, message.attachments);
    const content = document.createElement('div');
    content.className = 'message-content';
    setMessageContent({ content }, message.content, role === 'assistant' && Boolean(message.content));
    main.appendChild(content);
    if (message.status === 'failed' && message.error) {
        const errorNote = document.createElement('small');
        errorNote.className = 'message-error-note';
        errorNote.textContent = message.error;
        main.appendChild(errorNote);
    }
    if (!pending) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'message-select-control';
        checkbox.hidden = !state.selectionMode;
        checkbox.checked = state.selectedMessageIds.has(message.id);
        checkbox.setAttribute('aria-label', '选择此消息');
        checkbox.addEventListener('change', () => toggleMessageSelection(message.id, checkbox.checked));
        actions.appendChild(checkbox);
        actions.appendChild(messageAction('bi-copy', '复制消息', () => copySingleMessage(message.id)));
        actions.appendChild(messageAction('bi-check2-square', '选择消息', () => {
            enterMessageSelection();
            toggleMessageSelection(message.id, true);
        }));
        if (role === 'user') {
            actions.appendChild(messageAction('bi-pencil', '编辑并重新发送', () => editUserMessage(message.id)));
            if (message.status === 'failed') {
                actions.appendChild(messageAction('bi-arrow-repeat', '重试', () => retryUserMessage(message.id)));
            }
        } else {
            actions.appendChild(messageAction('bi-arrow-clockwise', '重新生成', () => regenerateAssistantMessage(message.id)));
            actions.appendChild(messageAction('bi-three-dots', '继续生成', continueAssistantMessage));
        }
        actions.appendChild(messageAction('bi-trash3', '从此处删除', () => deleteMessagesFrom(message.id)));
        main.appendChild(actions);
    }
    row.append(avatar, main);
    elements.chatWindow.appendChild(row);
    scrollChatToBottom();
    return { row, content, message };
}

async function copyText(text, successMessage = '已复制') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage);
        return true;
    } catch (_) {
        showToast('复制失败，请手动选择内容', true);
        return false;
    }
}

function transcriptMarkdown(messages) {
    return messages.map((message) => {
        const role = message.role === 'user' ? '用户' : 'AI';
        const files = (message.attachments || []).map((item) => `- 附件：${item.name} (${formatBytes(item.size)})`).join('\n');
        return `## ${role}\n\n${files ? `${files}\n\n` : ''}${message.content}`;
    }).join('\n\n---\n\n');
}

function copySingleMessage(messageId) {
    const { message } = findActiveMessage(messageId);
    if (message) copyText(message.content, '已复制消息');
}

function enterMessageSelection() {
    state.selectionMode = true;
    updateMessageSelectionUi();
}

function exitMessageSelection() {
    state.selectionMode = false;
    state.selectedMessageIds.clear();
    updateMessageSelectionUi();
}

function toggleMessageSelection(messageId, selected) {
    if (selected) state.selectedMessageIds.add(messageId);
    else state.selectedMessageIds.delete(messageId);
    updateMessageSelectionUi();
}

function updateMessageSelectionUi() {
    elements.messageSelectionBar.hidden = !state.selectionMode;
    elements.messageSelectionCount.textContent = String(state.selectedMessageIds.size);
    elements.messageCopySelected.disabled = !state.selectedMessageIds.size;
    elements.messageExportSelected.disabled = !state.selectedMessageIds.size;
    elements.messageDeleteSelected.disabled = !state.selectedMessageIds.size;
    elements.chatWindow.querySelectorAll('.message-row[data-message-id]').forEach((row) => {
        const selected = state.selectedMessageIds.has(row.dataset.messageId);
        row.classList.toggle('selected', selected);
        const checkbox = row.querySelector('.message-select-control');
        if (checkbox) {
            checkbox.hidden = !state.selectionMode;
            checkbox.checked = selected;
        }
    });
}

function selectedMessages() {
    return (activeConversation()?.history || []).filter((message) => state.selectedMessageIds.has(message.id));
}

function selectAllMessages() {
    const messages = activeConversation()?.history || [];
    const allSelected = messages.length && messages.every((message) => state.selectedMessageIds.has(message.id));
    state.selectedMessageIds = new Set(allSelected ? [] : messages.map((message) => message.id));
    updateMessageSelectionUi();
}

function copySelectedMessages() {
    const messages = selectedMessages();
    if (messages.length) copyText(transcriptMarkdown(messages), `已复制 ${messages.length} 条消息`);
}

function safeFileName(value) {
    return (value || '对话').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || '对话';
}

function downloadTextFile(name, text, type) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([text], { type }));
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportSelectedMessages() {
    const messages = selectedMessages();
    if (!messages.length) return;
    const title = safeFileName(activeConversation()?.title);
    downloadTextFile(`${title}-选中消息.md`, transcriptMarkdown(messages), 'text/markdown;charset=utf-8');
    showToast(`已导出 ${messages.length} 条消息`);
}

function deleteSelectedMessages() {
    const conversation = activeConversation();
    if (!conversation || !state.selectedMessageIds.size) return;
    if (!window.confirm(`确定删除选中的 ${state.selectedMessageIds.size} 条消息吗？`)) return;
    const removed = conversation.history.filter((message) => state.selectedMessageIds.has(message.id));
    conversation.history = conversation.history.filter((message) => !state.selectedMessageIds.has(message.id));
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    showActionToast('已删除选中消息', '撤销', () => {
        conversation.history.push(...removed);
        conversation.history.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
        persistConversations();
        renderActiveConversation();
    }, { timeout: 8000, onExpire: cleanupUnusedAttachments });
}

function renameActiveConversation() {
    const conversation = activeConversation();
    if (!conversation || state.busy) return;
    const name = window.prompt('输入新的对话名称', conversation.title);
    if (!name?.trim()) return;
    conversation.title = name.trim().slice(0, 52);
    persistConversations();
    renderConversationTabs();
    showToast('已重命名对话');
}

function exportActiveConversation() {
    const conversation = activeConversation();
    if (!conversation) return;
    const base = safeFileName(conversation.title);
    const markdown = `# ${conversation.title}\n\n${conversation.systemPrompt ? `> System\n> ${conversation.systemPrompt.replace(/\n/g, '\n> ')}\n\n` : ''}${transcriptMarkdown(conversation.history)}`;
    downloadTextFile(`${base}.md`, markdown, 'text/markdown;charset=utf-8');
    window.setTimeout(() => {
        downloadTextFile(`${base}.json`, JSON.stringify({ ...conversation, exportedAt: new Date().toISOString() }, null, 2), 'application/json;charset=utf-8');
    }, 120);
    showToast('已导出 Markdown 和 JSON');
}

function createConversationBranch(conversation, history, branchMessageId) {
    const branch = {
        id: createId('conversation'),
        title: `${conversation.title.replace(/ · 分支.*$/, '')} · 分支`.slice(0, 52),
        systemPrompt: conversation.systemPrompt,
        activeAgent: conversation.activeAgent ? { ...conversation.activeAgent } : null,
        history: history.map((message) => ({ ...message, attachments: (message.attachments || []).map((item) => ({ ...item })) })),
        draft: '',
        draftAttachments: [],
        createdAt: new Date().toISOString(),
        parentConversationId: conversation.id,
        branchAtMessageId: branchMessageId
    };
    state.conversations.push(branch);
    state.activeConversationId = branch.id;
    return branch;
}

function queueComposerSubmission(text, attachments) {
    elements.messageInput.value = text;
    state.composerAttachments = (attachments || []).map((item) => ({ ...item }));
    renderComposerAttachments();
    persistActiveDraft();
    window.setTimeout(() => elements.messageForm.requestSubmit(), 0);
}

function editUserMessage(messageId) {
    if (state.busy) return;
    const { conversation, index, message } = findActiveMessage(messageId);
    if (!conversation || !message || message.role !== 'user') return;
    const row = elements.chatWindow.querySelector(`[data-message-id="${CSS.escape(messageId)}"]`);
    const main = row?.querySelector('.message-main');
    if (!main || main.querySelector('.message-editor')) return;
    const content = main.querySelector('.message-content');
    const actions = main.querySelector('.message-actions');
    const editor = document.createElement('div');
    editor.className = 'message-editor';
    const textarea = document.createElement('textarea');
    textarea.value = message.content;
    textarea.lang = 'zh-CN';
    const footer = document.createElement('div');
    footer.className = 'message-editor-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'secondary-button compact';
    cancel.textContent = '取消';
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'primary-button compact';
    save.textContent = '保存并重新发送';
    footer.append(cancel, save);
    editor.append(textarea, footer);
    content.hidden = true;
    actions.hidden = true;
    main.insertBefore(editor, actions);
    const close = () => { editor.remove(); content.hidden = false; actions.hidden = false; };
    cancel.addEventListener('click', close);
    save.addEventListener('click', () => {
        const nextText = textarea.value.trim();
        if (!nextText) return;
        const laterUserMessages = conversation.history.slice(index + 1).some((item) => item.role === 'user');
        if (laterUserMessages) createConversationBranch(conversation, conversation.history.slice(0, index), message.id);
        else conversation.history = conversation.history.slice(0, index);
        persistConversations();
        renderConversationTabs();
        renderActiveConversation();
        queueComposerSubmission(nextText, message.attachments);
    });
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function retryUserMessage(messageId) {
    if (state.busy) return;
    const { conversation, index, message } = findActiveMessage(messageId);
    if (!conversation || !message) return;
    conversation.history = conversation.history.slice(0, index);
    persistConversations();
    renderActiveConversation();
    queueComposerSubmission(message.content, message.attachments);
}

function regenerateAssistantMessage(messageId) {
    if (state.busy) return;
    const { conversation, index, message } = findActiveMessage(messageId);
    if (!conversation || !message || message.role !== 'assistant') return;
    let userIndex = index - 1;
    while (userIndex >= 0 && conversation.history[userIndex].role !== 'user') userIndex -= 1;
    if (userIndex < 0) return;
    const userMessage = conversation.history[userIndex];
    const laterUserMessages = conversation.history.slice(index + 1).some((item) => item.role === 'user');
    if (laterUserMessages) createConversationBranch(conversation, conversation.history.slice(0, userIndex), message.id);
    else conversation.history = conversation.history.slice(0, userIndex);
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    queueComposerSubmission(userMessage.content, userMessage.attachments);
}

function continueAssistantMessage() {
    if (state.busy) return;
    queueComposerSubmission('请继续完成上一个回答。', []);
}

function deleteMessagesFrom(messageId) {
    if (state.busy) return;
    const { conversation, index } = findActiveMessage(messageId);
    if (!conversation || index < 0) return;
    if (!window.confirm('确定删除这条消息及其后的全部内容吗？')) return;
    const removed = conversation.history.splice(index);
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    showActionToast('已从此处删除对话', '撤销', () => {
        conversation.history.push(...removed);
        persistConversations();
        renderConversationTabs();
        renderActiveConversation();
    }, { timeout: 8000, onExpire: cleanupUnusedAttachments });
}

function openConversationSearch() {
    elements.conversationSearch.hidden = false;
    elements.conversationSearchInput.focus();
    runConversationSearch();
}

function closeConversationSearch() {
    elements.conversationSearch.hidden = true;
    elements.conversationSearchInput.value = '';
    state.searchMatches = [];
    state.searchMatchIndex = -1;
    elements.chatWindow.querySelectorAll('.search-match, .search-current').forEach((row) => row.classList.remove('search-match', 'search-current'));
}

function runConversationSearch() {
    const query = elements.conversationSearchInput.value.trim().toLocaleLowerCase();
    const messages = activeConversation()?.history || [];
    state.searchMatches = query
        ? messages.filter((message) => `${message.content} ${(message.attachments || []).map((item) => item.name).join(' ')}`.toLocaleLowerCase().includes(query)).map((message) => message.id)
        : [];
    state.searchMatchIndex = state.searchMatches.length ? 0 : -1;
    updateConversationSearchUi();
}

function moveConversationSearch(offset) {
    if (!state.searchMatches.length) return;
    state.searchMatchIndex = (state.searchMatchIndex + offset + state.searchMatches.length) % state.searchMatches.length;
    updateConversationSearchUi();
}

function updateConversationSearchUi() {
    elements.conversationSearchCount.textContent = state.searchMatches.length
        ? `${state.searchMatchIndex + 1} / ${state.searchMatches.length}`
        : '0 个结果';
    elements.chatWindow.querySelectorAll('.message-row[data-message-id]').forEach((row) => {
        const matchIndex = state.searchMatches.indexOf(row.dataset.messageId);
        row.classList.toggle('search-match', matchIndex >= 0);
        row.classList.toggle('search-current', matchIndex === state.searchMatchIndex);
    });
    const currentId = state.searchMatches[state.searchMatchIndex];
    if (currentId) elements.chatWindow.querySelector(`[data-message-id="${CSS.escape(currentId)}"]`)?.scrollIntoView({ block: 'center' });
}

function clearChat() {
    if (state.busy) {
        showToast('请先停止当前生成', true);
        return;
    }
    const conversation = activeConversation();
    if (!conversation) return;
    conversation.history = [];
    conversation.draft = '';
    conversation.draftAttachments = [];
    elements.messageInput.value = '';
    state.composerAttachments = [];
    renderComposerAttachments();
    conversation.title = '新会话';
    persistConversations();
    renderConversationTabs();
    renderActiveConversation();
    cleanupUnusedAttachments();
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
    elements.localCodexStop.disabled = state.busy || !state.localCodex.token;
    elements.stopButton.disabled = !state.busy || !state.controller;
    elements.messageInput.disabled = state.busy || locked;
    elements.attachmentButton.disabled = state.busy || state.multimodalStatus !== 'supported';
    elements.sendButton.querySelector('span').textContent = locked ? '已达上限' : state.busy ? '请求中' : '发送';
}

function setConnectionState(status, text, latency) {
    const previousStatus = elements.connectionState.dataset.state;
    elements.connectionState.dataset.state = status;
    elements.connectionStateText.textContent = text;
    elements.latencyText.textContent = latency;
    if (status === 'success' && previousStatus !== 'success') {
        closeSettings();
    } else if (status === 'error') {
        elements.settingsInspector.open = true;
        openSettings();
    }
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

function showActionToast(message, actionLabel, action, options = {}) {
    const toast = document.createElement('div');
    toast.className = 'toast with-action';
    const copy = document.createElement('span');
    copy.textContent = message;
    const button = document.createElement('button');
    button.className = 'toast-action';
    button.type = 'button';
    button.textContent = actionLabel;
    let timeoutId = 0;
    button.addEventListener('click', () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        toast.remove();
        action();
    });
    toast.append(copy, button);
    elements.toastRegion.appendChild(toast);
    if (Number.isFinite(options.timeout) && options.timeout > 0) {
        timeoutId = window.setTimeout(() => {
            toast.remove();
            options.onExpire?.();
        }, options.timeout);
    }
}

function scrollChatToBottom() {
    elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function isMobileWorkspace() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 780px)').matches;
}

function initializeWorkspaceLayout() {
    syncConversationSidebarMode();
    if (conversationSidebarEnabled()) {
        document.body.classList.add('chat-focused', 'sidebar-conversations');
        document.body.classList.remove('sidebar-settings');
    } else if (isMobileWorkspace()) {
        document.body.classList.add('chat-focused');
        document.body.classList.remove('sidebar-settings', 'sidebar-conversations');
        elements.workspaceSidebar.classList.remove('is-open');
    } else {
        document.body.classList.add('sidebar-settings');
        document.body.classList.remove('chat-focused', 'sidebar-conversations');
    }
    syncWorkspaceMode();
}

function settingsAreVisible() {
    return document.body.classList.contains('sidebar-settings')
        && (!isMobileWorkspace() || elements.workspaceSidebar.classList.contains('is-open'));
}

function syncWorkspaceMode() {
    const settingsVisible = settingsAreVisible();
    elements.settingsToggle.setAttribute('aria-expanded', String(settingsVisible));
    elements.settingsToggle.setAttribute('aria-label', settingsVisible ? '切换到专注聊天' : '打开设置');
    elements.settingsToggle.title = settingsVisible ? '切换到专注聊天' : '打开设置';
    elements.settingsToggleLabel.textContent = settingsVisible ? '聊天' : '设置';
    elements.settingsToggleIcon.className = settingsVisible ? 'bi bi-chat-left-text' : 'bi bi-sliders';
    elements.sidebarSettingsButton.classList.toggle('active', settingsVisible);
    elements.sidebarConversationsButton.classList.toggle('active', !settingsVisible);
}

function toggleSettings() {
    if (settingsAreVisible()) closeSettings();
    else openSettings();
}

function openSettings() {
    document.body.classList.remove('chat-focused');
    document.body.classList.add('sidebar-settings');
    document.body.classList.remove('sidebar-conversations');
    elements.workspaceSidebar.classList.add('is-open');
    elements.drawerOverlay.classList.add('is-open');
    syncWorkspaceMode();
}

function closeSettings() {
    document.body.classList.add('chat-focused');
    document.body.classList.remove('sidebar-settings');
    if (conversationSidebarEnabled()) document.body.classList.add('sidebar-conversations');
    else document.body.classList.remove('sidebar-conversations');
    if (isMobileWorkspace()) elements.workspaceSidebar.classList.remove('is-open');
    elements.drawerOverlay.classList.remove('is-open');
    syncWorkspaceMode();
}

function openConversationSidebar() {
    if (!conversationSidebarEnabled()) {
        closeSettings();
        return;
    }
    document.body.classList.add('chat-focused', 'sidebar-conversations');
    document.body.classList.remove('sidebar-settings');
    if (isMobileWorkspace()) {
        elements.workspaceSidebar.classList.add('is-open');
        elements.drawerOverlay.classList.add('is-open');
    } else {
        elements.drawerOverlay.classList.remove('is-open');
    }
    syncWorkspaceMode();
}

function closeWorkspaceSidebar() {
    if (!isMobileWorkspace()) return;
    elements.workspaceSidebar.classList.remove('is-open');
    elements.drawerOverlay.classList.remove('is-open');
    document.body.classList.add('chat-focused');
    syncWorkspaceMode();
}

try {
    initialize();
} catch (error) {
    showToast(`初始化失败：${error.message}`, true);
}
