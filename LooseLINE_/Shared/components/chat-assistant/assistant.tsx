import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Plus, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import OpenAI from 'openai';
import './assistant.css';

// --- Configuration ---
// Note: In a real production app, never expose keys on the client side.
// This should be proxied through your backend.
const apiKey = 'io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjI0Y2NhYjY4LTdjNzEtNGU5OC05Njg4LWVjZGI1NGUwOWFlZCIsImV4cCI6NDkxNTI0OTc5OH0.ilXvEHapTJXofCXob_WsQSgOxAXy4DRfRNmhbHXTuvZ-waJ1oz32s6EhWM2KUuuPV3cg1ow0dtbSGUOnOz2Dwg';

const openai = new OpenAI({
    baseURL: 'https://api.intelligence.io.solutions/api/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Only for demo/dev purposes
});

interface ChatMessage {
    id: string;
    text: string;
    isMe: boolean;
    time: string;
}

interface ChatSession {
    id: string;
    title: string;
    date: string; // Readable date string e.g. "Today, 14:30"
    timestamp: number; // For sorting
    lastMessage: string;
    messages: ChatMessage[];
}

interface AssistantWindowProps {
    isOpen: boolean;
    onClose?: () => void;
}

// Helper to format date
const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Initial welcome message generator
const getWelcomeMessage = (): ChatMessage => ({
    id: 'welcome-msg',
    text: 'Здравствуйте, не хотите ли вы обсудить грамотное расходование ваших денежных средств?',
    isMe: false,
    time: formatDate(new Date())
});

export const AssistantWindow: React.FC<AssistantWindowProps> = ({ isOpen, onClose }) => {
    // --- State ---
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Current view messages
    const [newMessage, setNewMessage] = useState('');
    const [models, setModels] = useState<{ id: string }[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
    const [isLoading, setIsLoading] = useState(false);

    // View State
    const [showChatList, setShowChatList] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

    // --- Refs ---
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Effects ---

    // 1. Initialization: Load history and setup view
    useEffect(() => {
        // Load history from local storage
        const savedHistory = localStorage.getItem('loose_chat_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setChatHistory(parsed);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }

        // Start with welcome message if no current chat
        if (!currentChatId) {
            setMessages([getWelcomeMessage()]);
        }

        fetchModels();
    }, []);

    // 2. Persist History whenever it changes
    useEffect(() => {
        if (chatHistory.length > 0) {
            localStorage.setItem('loose_chat_history', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    // 3. Auto-scroll to bottom
    useEffect(() => {
        if (!showChatList) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, showChatList]);

    // 4. Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset to recalculate
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [newMessage]);


    // --- Logic ---

    // Generate a title based on the first user message
    const generateTitle = (text: string) => {
        return text.slice(0, 30) + (text.length > 30 ? '...' : '');
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([getWelcomeMessage()]);
        setNewMessage('');
        setShowChatList(false);
    };

    const handleSelectChat = (chatId: string) => {
        const session = chatHistory.find(c => c.id === chatId);
        if (session) {
            setCurrentChatId(chatId);
            setMessages(session.messages);
            setShowChatList(false);
        }
    };

    const fetchModels = async () => {
        try {
            const list = await openai.models.list();
            const available = list.data.map((m) => ({ id: m.id }));
            if (available.length > 0) {
                setModels(available);
                if (!available.find(m => m.id === 'gpt-4')) {
                    setSelectedModel(available[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load models', err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userText = newMessage;
        const msgId = Date.now().toString();
        const now = new Date();
        const timestampStr = formatDate(now);

        // 1. Create User Message Object
        const userMsg: ChatMessage = {
            id: msgId,
            text: userText,
            isMe: true,
            time: timestampStr
        };

        // 2. Update Local State immediately
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setNewMessage('');
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // 3. Update or Create Chat Session **Synchronously** (Optimistic UI)
        let activeChatId = currentChatId;

        // If we represent the "Welcome" state (no ID yet), we create a new session now
        if (!activeChatId) {
            activeChatId = Date.now().toString();
            setCurrentChatId(activeChatId);

            // Create new session
            const newSession: ChatSession = {
                id: activeChatId,
                title: generateTitle(userText),
                date: now.toLocaleDateString() + ' ' + timestampStr,
                timestamp: now.getTime(),
                lastMessage: userText,
                messages: updatedMessages
            };

            setChatHistory(prev => [newSession, ...prev]);
        } else {
            // Update existing session
            setChatHistory(prev => prev.map(session => {
                if (session.id === activeChatId) {
                    return {
                        ...session,
                        lastMessage: userText,
                        timestamp: now.getTime(), // Update timestamp to move to top if we sorted
                        messages: updatedMessages
                    };
                }
                return session;
            }));

            // Move updated session to top
            setChatHistory(prev => {
                const sessionIndex = prev.findIndex(s => s.id === activeChatId);
                if (sessionIndex > -1) {
                    const session = { ...prev[sessionIndex] };
                    // Update content separately to be safe, though map above did it
                    session.lastMessage = userText;
                    session.timestamp = now.getTime();
                    session.messages = updatedMessages;

                    const newHistory = [...prev];
                    newHistory.splice(sessionIndex, 1);
                    newHistory.unshift(session);
                    return newHistory;
                }
                return prev;
            });
        }

        // 4. API Call
        const apiMessages = updatedMessages.slice(-10).map(m => ({
            role: m.isMe ? ('user' as const) : ('assistant' as const),
            content: m.text
        }));

        try {
            const completion = await openai.chat.completions.create({
                model: selectedModel,
                messages: apiMessages
            });

            const aiText = completion.choices[0]?.message?.content || 'Извините, я не получил ответ.';
            const aiMsgId = (Date.now() + 1).toString();
            const aiTime = formatDate(new Date());

            // 5. Add AI Response
            const aiMsg: ChatMessage = {
                id: aiMsgId,
                text: aiText,
                isMe: false,
                time: aiTime
            };

            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);

            // 6. Update Session with AI Message
            setChatHistory(prev => {
                const newHistory = [...prev];
                const sessionIndex = newHistory.findIndex(s => s.id === activeChatId);
                if (sessionIndex > -1) {
                    newHistory[sessionIndex] = {
                        ...newHistory[sessionIndex],
                        lastMessage: aiText.substring(0, 50) + '...',
                        messages: finalMessages
                    };
                }
                return newHistory;
            });

        } catch (error) {
            console.error('AI Error:', error);
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                text: 'Произошла ошибка при соединении с сервером.',
                isMe: false,
                time: formatDate(new Date())
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`assistant-window ${isOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="assistant-header">
                <div className="assistant-title">
                    <div className="assistant-avatar-small">
                        <Bot size={16} />
                    </div>
                    <div>
                        <span className="assistant-name">ЭКСПЕРТ</span>
                        <div className="assistant-status">
                            <span className="status-dot"></span>
                            Online
                        </div>
                    </div>
                </div>

                <div className="assistant-controls">
                    <button
                        className={`assistant-header-btn ${showChatList ? 'active' : ''}`}
                        onClick={() => setShowChatList(!showChatList)}
                        title="Список чатов"
                    >
                        <MessageSquare size={18} />
                    </button>
                    <button className="assistant-header-btn" onClick={handleNewChat} title="Новый чат">
                        <Plus size={18} />
                    </button>
                    <button className="assistant-header-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            {showChatList ? (
                <div className="assistant-content chat-list-area">
                    <div className="chat-list-header">Ваши чаты</div>
                    <div className="chat-list">
                        {chatHistory.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d', fontSize: '13px' }}>
                                История чатов пуста
                            </div>
                        )}
                        {chatHistory.map(chat => (
                            <div key={chat.id} className="chat-list-item" onClick={() => handleSelectChat(chat.id)}>
                                <div className="chat-item-icon">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="chat-item-info">
                                    <span className="chat-item-title">{chat.title}</span>
                                    <span className="chat-item-preview">{chat.lastMessage}</span>
                                </div>
                                <span className="chat-item-date">{chat.date.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Content / Messages */}
                    <div className="assistant-content chat-scroll-area">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-row ${msg.isMe ? 'message-me' : 'message-ai'}`}
                            >
                                {!msg.isMe && (
                                    <div className="message-avatar">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className="message-bubble">
                                    <div className="message-text markdown-body">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message-row message-ai">
                                <div className="message-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="message-bubble loading-bubble">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="input-container">
                        <textarea
                            ref={textareaRef}
                            className="message-input"
                            placeholder="Напишите сообщение..."
                            rows={1}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <div className="input-actions-right">
                            <select
                                className="model-select-footer"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                title="Model"
                            >
                                {models.length > 0 ? (
                                    models.map(m => <option key={m.id} value={m.id}>{m.id}</option>)
                                ) : (
                                    <>
                                        <option value="gpt-4">GPT-4</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5</option>
                                    </>
                                )}
                            </select>
                            <button
                                className="send-btn"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || isLoading}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AssistantWindow;


