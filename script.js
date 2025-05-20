// API endpoint
const API_URL = 'http://localhost:3000/api/generate-code';

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const codeDisplay = document.getElementById('codeDisplay');
const copyInfoBtn = document.getElementById('copyInfoBtn');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const copySuccess = document.getElementById('copySuccess');

// Show copy success message
function showCopySuccess() {
    copySuccess.style.display = 'block';
    setTimeout(() => {
        copySuccess.style.display = 'none';
    }, 2000);
}

// Add message to chat
function addMessage(message, isUser = true, imageUrl = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        messageDiv.appendChild(img);
    }
    
    const textDiv = document.createElement('div');
    textDiv.textContent = message;
    messageDiv.appendChild(textDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate code using OpenAI API
async function generateCode(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate code');
        }

        return data.code;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Handle send button click
sendBtn.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (!message) return;

    // Disable input and button while processing
    userInput.disabled = true;
    sendBtn.disabled = true;

    try {
        // Add user message
        addMessage(message, true);

        // Show loading state
        const loadingMessage = addMessage('Generating code...', false);

        // Generate code
        const generatedCode = await generateCode(message);

        // Remove loading message
        loadingMessage.remove();

        // Add AI response
        addMessage('Here\'s the generated code:', false);

        // Update code display
        codeDisplay.textContent = generatedCode;

        // Clear input
        userInput.value = '';
    } catch (error) {
        addMessage('Sorry, there was an error generating the code. Please try again.', false);
        console.error('Error:', error);
    } finally {
        // Re-enable input and button
        userInput.disabled = false;
        sendBtn.disabled = false;
    }
});

// Handle Enter key press
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

// Copy buttons functionality
copyInfoBtn.addEventListener('click', () => {
    const text = Array.from(chatMessages.children)
        .map(msg => msg.textContent)
        .join('\n');
    navigator.clipboard.writeText(text)
        .then(() => showCopySuccess())
        .catch(err => console.error('Failed to copy:', err));
});

copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeDisplay.textContent)
        .then(() => showCopySuccess())
        .catch(err => console.error('Failed to copy:', err));
}); 