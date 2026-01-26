import { getEncoding } from "https://cdn.jsdelivr.net/npm/js-tiktoken@1.0.21/dist/index.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- Price Constants (CNY per 1M tokens) ---
    const INPUT_PRICE_PER_MILLION = 6.4;
    const OUTPUT_PRICE_PER_MILLION = 25.6;

    // --- DOM Element References ---
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const modelDescription = document.getElementById('model-description');
    const systemPromptInput = document.getElementById('system-prompt');
    const maxTokensInput = document.getElementById('max-tokens');
    const presencePenaltySlider = document.getElementById('presence-penalty');
    const presencePenaltyValue = document.getElementById('presence-penalty-value');
    const frequencyPenaltySlider = document.getElementById('frequency-penalty');
    const frequencyPenaltyValue = document.getElementById('frequency-penalty-value');
    const seedInput = document.getElementById('seed');
    const stopSequencesInput = document.getElementById('stop-sequences');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const topPSlider = document.getElementById('top-p');
    const topPValue = document.getElementById('top-p-value');
    const topKSlider = document.getElementById('top-k');
    const topKValue = document.getElementById('top-k-value');
    const streamToggle = document.getElementById('stream-toggle');
    const chatWindow = document.getElementById('chat-window');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = messageForm.querySelector('button');
    const totalInputTokensEl = document.getElementById('total-input-tokens');
    const totalOutputTokensEl = document.getElementById('total-output-tokens');
    const totalCostEl = document.getElementById('total-cost');
    const costLimitInput = document.getElementById('cost-limit');

    // --- Tokenizer Initialization ---
    let encoding;
    try {
        encoding = getEncoding("cl100k_base");
    } catch (e) {
        console.error("Failed to load tokenizer", e);
        addMessageToChat('error', '错误：加载分词器失败，无法估算Token用量。');
    }

    const getTokenCount = (text) => {
        if (!encoding || !text) return 0;
        try {
            return encoding.encode(text).length;
        } catch (e) {
            console.error("Token counting error:", e);
            return 0;
        }
    };

    // --- State Management ---
    let conversationHistory = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    
    // --- Model Descriptions ---
    const modelDescriptions = {
        'qwen-turbo': '高性价比和速度。适用于快速响应、信息总结、对话等常规应用场景。',
        'qwen-plus': '能力与成本之间的平衡点。增强了推理、代码理解、工具使用等能力，适用于需要更高质量输出的复杂任务。',
        'qwen-max': '性能最强的旗舰模型。为需要极强通用推理能力的复杂、多步任务而设计，在编码、分析和创作方面表现出色。',
        'qwen-max-longcontext': 'qwen-max的长文本版本。拥有更大的上下文窗口，专为处理和理解超长文档、长篇对话或大量代码而设计。'
    };

    // --- Event Listeners ---
    // Mobile drawer, etc. ...
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsDrawer = document.querySelector('.settings-drawer');
    const overlay = document.querySelector('.overlay');
    if (settingsToggle && settingsDrawer && overlay) {
        settingsToggle.addEventListener('click', () => {
            settingsDrawer.classList.toggle('is-open');
            overlay.classList.toggle('is-open');
        });
        overlay.addEventListener('click', () => {
            settingsDrawer.classList.remove('is-open');
            overlay.classList.remove('is-open');
        });
    }
    modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        if (modelDescription && modelDescriptions[selectedModel]) {
            modelDescription.textContent = modelDescriptions[selectedModel];
        }
    });
    temperatureSlider.addEventListener('input', () => { temperatureValue.textContent = temperatureSlider.value; });
    topPSlider.addEventListener('input', () => { topPValue.textContent = topPSlider.value; });
    topKSlider.addEventListener('input', () => { topKValue.textContent = topKSlider.value; });
    presencePenaltySlider.addEventListener('input', () => { presencePenaltyValue.textContent = presencePenaltySlider.value; });
    frequencyPenaltySlider.addEventListener('input', () => { frequencyPenaltyValue.textContent = frequencyPenaltySlider.value; });

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage || sendButton.disabled) return;
        if (conversationHistory.length === 0) {
            const systemPrompt = systemPromptInput.value.trim();
            if (systemPrompt) conversationHistory.push({ role: 'system', content: systemPrompt });
        }
        addMessageToChat('user', userMessage);
        conversationHistory.push({ role: 'user', content: userMessage });
        messageInput.value = '';
        await callQwenAPI();
    });

    // --- Main API Call Logic ---
    async function callQwenAPI() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            addMessageToChat('error', '错误：API Key 不能为空。');
            return;
        }
        setFormState(true, '发送中...');
        
        const promptString = conversationHistory.map(m => m.content).join('\n');
        const estimatedPromptTokens = getTokenCount(promptString);

        const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        const isStreaming = streamToggle.checked;
        const requestBody = {
            model: modelSelect.value,
            messages: conversationHistory,
            temperature: parseFloat(temperatureSlider.value),
            top_p: parseFloat(topPSlider.value),
            presence_penalty: parseFloat(presencePenaltySlider.value),
            frequency_penalty: parseFloat(frequencyPenaltySlider.value),
            stream: isStreaming,
        };
        const maxTokens = parseInt(maxTokensInput.value, 10);
        if (!isNaN(maxTokens) && maxTokens > 0) requestBody.max_tokens = maxTokens;
        const seed = parseInt(seedInput.value, 10);
        if (!isNaN(seed)) requestBody.seed = seed;
        const stopSequences = stopSequencesInput.value.trim();
        if (stopSequences) requestBody.stop = stopSequences.split(',').map(s => s.trim()).filter(s => s);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
            }
            if (isStreaming) {
                await handleStreamResponse(response, estimatedPromptTokens);
            } else {
                await handleNonStreamResponse(response);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            addMessageToChat('error', `发生错误: ${error.message}`);
        } finally {
            setFormState(false);
            messageInput.focus();
        }
    }

    async function handleNonStreamResponse(response) {
        const data = await response.json();
        const modelMessage = data.choices[0]?.message?.content;
        if (modelMessage) {
            addMessageToChat('assistant', modelMessage);
            conversationHistory.push({ role: 'assistant', content: modelMessage });
        }
        if (data.usage) {
            updateUsageAndCheckLimit(data.usage.prompt_tokens, data.usage.completion_tokens);
        } else {
            const promptTokens = getTokenCount(conversationHistory.slice(0,-1).map(m=>m.content).join('\n'));
            const completionTokens = getTokenCount(modelMessage || "");
            updateUsageAndCheckLimit(promptTokens, completionTokens);
        }
    }

    async function handleStreamResponse(response, estimatedPromptTokens) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let usageFromAPI = null;
        let estimatedCompletionTokens = 0;
        
        const modelMessageElement = addMessageToChat('assistant', '...');
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); 
            for (const line of lines) {
                if (line.trim() === '' || !line.startsWith('data:')) continue;
                if (line.includes('[DONE]')) {
                    conversationHistory.push({ role: 'assistant', content: fullResponse });
                    if (usageFromAPI) {
                        updateUsageAndCheckLimit(usageFromAPI.prompt_tokens, usageFromAPI.completion_tokens);
                    } else {
                        updateUsageAndCheckLimit(estimatedPromptTokens, estimatedCompletionTokens);
                    }
                    return; 
                }
                const jsonStr = line.replace('data: ', '');
                try {
                    const chunk = JSON.parse(jsonStr);
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        fullResponse += content;
                        estimatedCompletionTokens += getTokenCount(content);
                        modelMessageElement.innerHTML = marked.parse(fullResponse, { breaks: true });
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                    if (chunk.usage) {
                        usageFromAPI = chunk.usage;
                    }
                } catch (e) { /* Ignore parsing errors */ }
            }
        }
        conversationHistory.push({ role: 'assistant', content: fullResponse });
        if (usageFromAPI) {
            updateUsageAndCheckLimit(usageFromAPI.prompt_tokens, usageFromAPI.completion_tokens);
        } else {
            updateUsageAndCheckLimit(estimatedPromptTokens, estimatedCompletionTokens);
        }
    }

    function updateUsageAndCheckLimit(promptTokens, completionTokens) {
        if(isNaN(promptTokens) || isNaN(completionTokens)) return;
        totalInputTokens += promptTokens;
        totalOutputTokens += completionTokens;
        const inputCost = (totalInputTokens / 1_000_000) * INPUT_PRICE_PER_MILLION;
        const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_PRICE_PER_MILLION;
        totalCost = inputCost + outputCost;
        totalInputTokensEl.textContent = totalInputTokens.toLocaleString();
        totalOutputTokensEl.textContent = totalOutputTokens.toLocaleString();
        totalCostEl.textContent = `¥ ${totalCost.toFixed(4)}`;
        const costLimit = parseFloat(costLimitInput.value);
        if (!isNaN(costLimit) && costLimit > 0 && totalCost >= costLimit) {
            addMessageToChat('error', `费用已超上限！当前费用: ¥ ${totalCost.toFixed(4)}，上限: ¥ ${costLimit.toFixed(2)}。已停止发送消息。`);
            setFormState(true, '已达上限'); 
        }
    }

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        const roleClass = role === 'error' ? 'model-message error-message' : `${role}-message`;
        messageDiv.classList.add('message', ...roleClass.split(' '));
        if ((role === 'assistant') && typeof marked !== 'undefined') {
            messageDiv.innerHTML = marked.parse(content, { breaks: true });
        } else {
            messageDiv.textContent = content;
        }
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageDiv;
    }
    
    function setFormState(isLoading, text = '发送') {
        messageInput.disabled = isLoading;
        sendButton.disabled = isLoading;
        if (isLoading && text === '发送中...') {
            sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        } else {
            sendButton.textContent = text;
        }
    }

    // Initialize Popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});