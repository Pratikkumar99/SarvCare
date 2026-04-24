import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import './Chatbot.css';

const Chatbot = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const [magicAnimation, setMagicAnimation] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check chatbot status on mount
    useEffect(() => {
        checkStatus();
        // Show welcome popup after 2 seconds
        const timer = setTimeout(() => {
            if (messages.length === 0) {
                setIsOpen(true);
                addMessage('bot', 'Hello! I\'m SarvCare AI Assistant. I can help you with general health information. How can I assist you today?');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Suggested questions based on user role
    const getSuggestedQuestions = () => {
        const baseQuestions = [
            "What are common symptoms of flu?",
            "How can I improve my sleep quality?",
            "What should I ask my doctor during checkups?",
            "How can I manage stress naturally?"
        ];

        if (user?.role === 'patient') {
            return [
                ...baseQuestions,
                "What preventive screenings should I get?",
                "How can I prepare for a doctor's appointment?",
                "What are common side effects of medications?"
            ];
        } else if (user?.role === 'doctor') {
            return [
                "What are latest guidelines for hypertension?",
                "How to explain complex medical terms to patients?",
                "What are effective patient communication strategies?"
            ];
        } else if (user?.role === 'insurance') {
            return [
                "What are common preventive care coverage guidelines?",
                "How to explain insurance terms to members?",
                "What documentation is needed for claims?"
            ];
        }

        return baseQuestions;
    };

    const handleSuggestedQuestion = (question) => {
        setInputMessage(question);
        inputRef.current?.focus();
    };

    const checkStatus = async () => {
        try {
            const response = await chatbotAPI.getStatus();
            setIsOnline(response.data.success);
        } catch (error) {
            setIsOnline(false);
        }
    };

    const addMessage = (sender, message) => {
        setMessages(prev => [...prev, { sender, message, timestamp: new Date() }]);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        addMessage('user', userMessage);
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await chatbotAPI.chat(userMessage, {
                role: user?.role,
                name: user?.name
            });

            if (response.data.success) {
                // Simulate typing delay for better UX
                setTimeout(() => {
                    addMessage('bot', response.data.response);
                    setIsTyping(false);
                    setIsLoading(false);
                }, 1000);
            }
        } catch (error) {
            setIsTyping(false);
            setIsLoading(false);
            addMessage('bot', 'I apologize, but I\'m having trouble connecting right now. Please try again later or contact support if you need immediate assistance.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
            {/* Chat Button */}
            <button 
                className="chatbot-toggle-btn btn-gradient"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle chatbot"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
                {!isOpen && (
                    <span className="notification-dot"></span>
                )}
            </button>

            {/* Chat Window */}
            <div className="chatbot-window">
                {/* Header */}
                <div className="chatbot-header">
                    <div className="header-content">
                        <div className="bot-info">
                            <div className="bot-avatar">
                                🤖
                            </div>
                            <div className="bot-details">
                                <h3 className="bot-name">SarvCare AI</h3>
                                <div className="status-indicator">
                                    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                                    <span className="status-text">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            <div className="message-content">
                                <p>{msg.message}</p>
                                <span className="message-time">
                                    {formatTimestamp(msg.timestamp)}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {/* Suggested Questions - Show only when no messages or last message is from bot */}
                    {messages.length === 0 || (messages[messages.length - 1]?.sender === 'bot' && !isTyping) ? (
                        <div 
                            className={`suggested-questions ${magicAnimation ? 'magic-reveal' : ''}`}
                            onClick={() => {
                                if (!showAllSuggestions) {
                                    setMagicAnimation(true);
                                    setTimeout(() => setMagicAnimation(false), 600);
                                }
                                setShowAllSuggestions(!showAllSuggestions);
                            }}
                        >
                            <p className="suggestions-title">✨ Suggestions:</p>
                            {showAllSuggestions && (
                                <>
                                    <div className="suggestions-grid">
                                        {getSuggestedQuestions().map((question, index) => (
                                            <button
                                                key={index}
                                                className="suggestion-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSuggestedQuestion(question);
                                                }}
                                                disabled={isLoading}
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                            {!showAllSuggestions && getSuggestedQuestions().length > 0 && (
                                <p className="suggestions-hint">Click the card above to reveal suggestions</p>
                            )}
                        </div>
                    ) : null}
                    
                    {isTyping && (
                        <div className="message bot typing">
                            <div className="bot-avatar">🤖</div>
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer */}
                <div className="chatbot-disclaimer">
                    <small>
                        <span className="warning-icon">⚠️</span>
                        I provide general health information only. 
                        For medical advice, please consult a healthcare professional.
                    </small>
                </div>

                {/* Input */}
                <div className="chatbot-input">
                    <div className="input-container">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about general health information..."
                            className="message-input"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            className="send-btn btn-gradient"
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            aria-label="Send message"
                        >
                            {isLoading ? (
                                <div className="loading-spinner"></div>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
