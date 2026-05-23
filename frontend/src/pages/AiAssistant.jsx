import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

export default function AiAssistant() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your AI Learning Assistant. You can ask me to explain DSA concepts, debug your code, or summarize the course notes we've uploaded." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post('/shared/ai-chat/', { message: userMsg });
            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: res.data.response,
                context_used: res.data.context_used 
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: "Sorry, I encountered an error. Please ensure the backend and ML services are running, and the API keys are correctly set.",
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4">
                    <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-2">
                    Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Assistant</span>
                </h1>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                    Powered by Retrieval-Augmented Generation (RAG) & Gemini. Answers are grounded in uploaded course materials.
                </p>
            </div>

            <div className="flex-1 bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-light-border dark:border-white/5 flex flex-col overflow-hidden relative">
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    msg.role === 'user' 
                                        ? 'bg-brand-500 ml-4' 
                                        : 'bg-gradient-to-br from-accent-500 to-brand-500 mr-4'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>
                                
                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3.5 rounded-2xl ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-500 text-white rounded-tr-none' 
                                            : msg.isError 
                                                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-tl-none border border-red-200 dark:border-red-500/20'
                                                : 'bg-slate-100 dark:bg-white/5 text-light-text dark:text-dark-text rounded-tl-none'
                                    }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                                    </div>
                                    
                                    {/* Context Badge */}
                                    {msg.context_used && (
                                        <div className="mt-2 flex items-center text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                                            <BookOpen className="w-3 h-3 mr-1" /> Document Context Used
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex flex-row max-w-[85%]">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 mr-4 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div className="bg-slate-100 dark:bg-white/5 text-light-text dark:text-dark-text px-5 py-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-dark-card border-t border-light-border dark:border-white/5">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your courses..."
                            className="w-full bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-light-text dark:text-dark-text shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
