document.addEventListener('DOMContentLoaded', () => {
    // --- Sanity check for marked library ---
    if (typeof marked === 'undefined') {
        console.error('Marked.js library not loaded. Markdown rendering will be disabled.');
    }

    // --- Price Constants (CNY per 1M tokens) ---
    const INPUT_PRICE_PER_MILLION = 6.4;
    const OUTPUT_PRICE_PER_MILLION = 25.6;

    // --- DOM Element References ---
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
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

    // Usage & Cost Elements
    const totalInputTokensEl = document.getElementById('total-input-tokens');
    const totalOutputTokensEl = document.getElementById('total-output-tokens');
    const totalCostEl = document.getElementById('total-cost');
    const costLimitInput = document.getElementById('cost-limit');


    // --- State Management ---
    let conversationHistory = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    // --- Event Listeners ---
    temperatureSlider.addEventListener('input', () => { temperatureValue.textContent = temperatureSlider.value; });
    topPSlider.addEventListener('input', () => { topPValue.textContent = topPSlider.value; });
    topKSlider.addEventListener('input', () => { topKValue.textContent = topKSlider.value; });
    presencePenaltySlider.addEventListener('input', () => { presencePenaltyValue.textContent = presencePenaltySlider.value; });
    frequencyPenaltySlider.addEventListener('input', () => { frequencyPenaltyValue.textContent = frequencyPenaltySlider.value; });


    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        if (conversationHistory.length === 0) {
            const systemPrompt = systemPromptInput.value.trim();
            if (systemPrompt) {
                conversationHistory.push({ role: 'system', content: systemPrompt });
            }
        }

        addMessageToChat('user', userMessage);
        conversationHistory.push({ role: 'user', content: userMessage });
        
        messageInput.value = '';
        
        callQwenAPI();
    });

    // --- Main Functions ---

    async function callQwenAPI() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            addMessageToChat('error', '错误：API Key 不能为空。');
            return;
        }
        
        if (conversationHistory.length <= 1) {
            conversationHistory = [];
            const systemPrompt = systemPromptInput.value.trim();
            if (systemPrompt) {
                 conversationHistory.push({ role: 'system', content: systemPrompt });
            }
            const lastMessageDiv = document.querySelector('.message:last-of-type.user-message');
            if(lastMessageDiv) {
                conversationHistory.push({role: 'user', content: lastMessageDiv.textContent});
            }
        }

        setFormState(true);

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
                await handleStreamResponse(response);
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
        }
    }

    async function handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let usage = null;
        
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
                    if(usage) {
                         updateUsageAndCheckLimit(usage.prompt_tokens, usage.completion_tokens);
                    }
                    return; 
                }

                const jsonStr = line.replace('data: ', '');
                try {
                    const chunk = JSON.parse(jsonStr);
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        fullResponse += content;
                        modelMessageElement.innerHTML = marked.parse(fullResponse);
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                    // Check for usage data in the chunk
                    if (chunk.usage) {
                        usage = chunk.usage;
                    }
                } catch (e) {
                    console.error('Error parsing stream chunk:', e, 'Chunk:', jsonStr);
                }
            }
        }
        conversationHistory.push({ role: 'assistant', content: fullResponse });
        if(usage) {
            updateUsageAndCheckLimit(usage.prompt_tokens, usage.completion_tokens);
        }
    }

    // --- UI & Helper Functions ---

    function updateUsageAndCheckLimit(promptTokens, completionTokens) {
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
            setFormState(true); // Disable form permanently until page reload
        }
    }

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        const roleClass = role === 'error' ? 'model-message error-message' : `${role}-message`;
        messageDiv.classList.add('message', ...roleClass.split(' '));
        
        if ((role === 'assistant') && typeof marked !== 'undefined') {
            messageDiv.innerHTML = marked.parse(content);
        } else {
            messageDiv.textContent = content;
        }

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageDiv;
    }
    
    function setFormState(isLoading) {
        messageInput.disabled = isLoading;
        sendButton.disabled = isLoading;
        if (isLoading) {
            sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        } else {
            sendButton.textContent = '发送';
        }
    }
});
