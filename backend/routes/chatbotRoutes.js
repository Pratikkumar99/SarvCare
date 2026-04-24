const express = require('express');
const router = express.Router();

// Ollama Phi-3 integration for healthcare chatbot
router.post('/chat', async (req, res) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // System prompt for healthcare assistant with strict restrictions
        const systemPrompt = `You are SarvCare AI Assistant, a professional healthcare information provider. 

STRICT GUIDELINES:
1. NEVER provide medical diagnoses or prescribe treatments
2. ALWAYS encourage users to consult healthcare professionals for medical concerns
3. Provide general health information and educational content only
4. If user asks for diagnosis, say "I cannot provide medical diagnoses. Please consult a qualified healthcare provider."
5. If user asks for prescriptions, say "I cannot prescribe medications. Please consult a licensed healthcare provider."
6. Be helpful, professional, and empathetic
7. Provide accurate general health information
8. Suggest when to seek emergency care for serious symptoms

User Context: ${userContext ? `Role: ${userContext.role}, Name: ${userContext.name}` : 'Unknown user'}

Respond professionally and helpfully within these guidelines.`;

        // Call Ollama API
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'phi3',
                prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
                stream: false,
                options: {
                    temperature: 0.7,
                    max_tokens: 500
                }
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error('Ollama service unavailable');
        }

        const ollamaData = await ollamaResponse.json();
        
        res.json({
            success: true,
            response: ollamaData.response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Fallback response when Ollama is unavailable
        const fallbackResponse = `I'm SarvCare AI Assistant. I can help you with general health information, but I cannot provide medical diagnoses or treatments. 

For any medical concerns, please consult a qualified healthcare provider.

How can I help you with general health information today?`;

        res.json({
            success: true,
            response: fallbackResponse,
            fallback: true,
            timestamp: new Date().toISOString()
        });
    }
});

// Check Ollama service status
router.get('/status', async (req, res) => {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            const data = await response.json();
            res.json({
                success: true,
                status: 'online',
                models: data.models
            });
        } else {
            throw new Error('Ollama not responding');
        }
    } catch (error) {
        res.json({
            success: false,
            status: 'offline',
            message: 'Ollama service is not available'
        });
    }
});

module.exports = router;
