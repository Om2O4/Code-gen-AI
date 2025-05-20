const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export the configured Gemini instance
module.exports = genAI;

// API endpoint for code generation
app.post('/api/generate-code', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ 
            success: true,
            code: text
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate code' 
        });
    }
});

// API endpoint for chat interactions
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Start a chat
        const chat = model.startChat({
            history: messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });
        
        // Get the last message
        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        res.json({
            success: true,
            message: {
                role: 'assistant',
                content: response.text()
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
