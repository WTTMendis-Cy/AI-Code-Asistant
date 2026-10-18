// Check for API key in localStorage
let apiKey = localStorage.getItem('openrouter_api_key');
if (!apiKey) {
    apiKey = prompt('Please enter your OpenRouter API Key:');
    if (apiKey) {
        localStorage.setItem('openrouter_api_key', apiKey);
    } else {
        alert('API Key is required to use the chatbot.');
        // Disable input
        document.getElementById('message-input').disabled = true;
        document.getElementById('send-button').disabled = true;
        return;
    }
}

const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let messages = [];

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'flex justify-end mb-4' : 'flex justify-start mb-4';
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'bg-blue-500 text-white p-3 rounded-lg max-w-xs lg:max-w-md' : 'bg-gray-300 text-black p-3 rounded-lg max-w-xs lg:max-w-md';
    bubble.textContent = content;
    messageDiv.appendChild(bubble);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    addMessage('user', content);
    messages.push({ role: 'user', content });

    messageInput.value = '';
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'JIAT-chatbot'
            },
            body: JSON.stringify({
                model: 'stepfun/step-3.5-flash:free',
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        addMessage('assistant', reply);
        messages.push({ role: 'assistant', content: reply });
    } catch (error) {
        addMessage('assistant', `Error: ${error.message}`);
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
