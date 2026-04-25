const express = require('express');
const router = express.Router();

// AI Chatbot integration - supports both Ollama (local) and Gemini (cloud)
router.post('/chat', async (req, res) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // System prompt for healthcare assistant
        const systemPrompt = `You are a helpful healthcare assistant for SarvCare Healthcare Management System. 
You provide general health information and guidance but never give medical diagnoses or specific treatments.
Always include a disclaimer that users should consult healthcare professionals for medical advice.

User context: ${userContext || 'General patient'}

Respond professionally and helpfully within these guidelines.`;

        let response;

        // Check if using Ollama for local development
        if (process.env.NODE_ENV === 'development' && process.env.USE_OLLAMA === 'true') {
            try {
                // Use Ollama for local development
                const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'phi3',
                        prompt: systemPrompt + '\n\nUser: ' + message,
                        stream: false
                    })
                });

                if (ollamaResponse.ok) {
                    const ollamaData = await ollamaResponse.json();
                    response = ollamaData.response;
                } else {
                    throw new Error('Ollama service unavailable');
                }
            } catch (ollamaError) {
                console.log('Ollama not available, falling back to Gemini:', ollamaError.message);
                // Fall through to Gemini
            }
        }

        // Use Gemini if Ollama failed or not in development
        if (!response) {
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt + '\n\nUser: ' + message
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!geminiResponse.ok) {
                throw new Error('Gemini API unavailable');
            }

            const geminiData = await geminiResponse.json();
            response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                       'I apologize, but I couldn\'t process your request at the moment.';
        }
        
        res.json({
            success: true,
            response: response || 'I\'m SarvCare AI Assistant. How can I help you today?',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Fallback response when API is unavailable
        const fallbackResponse = `I'm SarvCare AI Assistant. I can help you with general health information, but I cannot provide medical diagnoses or treatments.

For any medical concerns, please consult a qualified healthcare provider.

How can I assist you with healthcare information today?`;
        
        res.json({
            success: true,
            response: fallbackResponse,
            timestamp: new Date().toISOString()
        });
    }
});

// Check Gemini API status
router.get('/status', async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (response.ok) {
            const data = await response.json();
            res.json({
                success: true,
                status: 'online',
                service: 'Google Gemini API',
                models: data.models?.map(m => m.name) || []
            });
        } else {
            throw new Error('Gemini API not responding');
        }
    } catch (error) {
        res.json({
            success: false,
            status: 'offline',
            message: 'Gemini API service is not available'
        });
    }
});

module.exports = router;
