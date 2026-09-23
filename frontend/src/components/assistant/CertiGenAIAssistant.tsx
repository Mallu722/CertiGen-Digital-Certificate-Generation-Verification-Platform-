import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Trash2,
  Compass,
  Layers,
  CheckCircle2,
  ArrowRight,
  Bot
} from 'lucide-react';
import { assistantService } from '@/services/assistant.service';
import type { AssistantChatResponse } from '@/types';
import { MarkdownView } from './MarkdownView';
import { cn } from '@/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  sources?: AssistantChatResponse['sources'];
  suggested_queries?: string[];
  model_used?: string;
  timestamp: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  content: `### 👋 Welcome to CertiGen AI Guide & Assistant!

I am your dedicated **CertiGen RAG Project Guide**. I can explain **everything** about the platform, including:

- 🚀 **How to Use CertiGen**: Step-by-step guides for single certificate issuance, bulk Excel/CSV batch generation, and custom templates.
- 🔍 **Verification & QR Scanner**: How public ID lookup and live camera QR code scanning work.
- ⚙️ **System Architecture & Tech Stack**: In-depth breakdown of Django REST Framework, React 19 + TypeScript, SimpleJWT, and PostgreSQL/SQLite.
- 📐 **Core Algorithms & Vector Math**: Concurrency-safe sequential IDs and trigonometric 24-point gold seal geometry.
- 🌐 **REST API Specification**: Endpoints, schemas, payloads, and integration guides.

*Choose a quick question below or type your own question!*`,
  suggested_queries: [
    "What is CertiGen and how do I use it?",
    "How do I bulk issue certificates from an Excel file?",
    "How does the public QR verification scanner work?",
    "Explain the 24-point mathematical gold seal algorithm",
    "What are all the available REST API endpoints?"
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const CertiGenAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await assistantService.sendMessage(query);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        sources: response.sources,
        suggested_queries: response.suggested_queries,
        model_used: response.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Failed to get AI assistant answer:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ **Connection Note**: Could not connect to the Assistant API endpoint. Please ensure the Django backend is running at \`http://localhost:8000\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = (message: ChatMessage) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking && speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for cleaner speech
    const cleanSpeechText = message.content
      .replace(/#+/g, '')
      .replace(/\*\*/g, '')
      .replace(/`+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/---/g, '')
      .slice(0, 1000); // speak up to 1000 chars

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(message.id);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  return (
    <>
      {/* Floating Trigger Launcher */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-sky-600/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-md"
            title="Open CertiGen AI Guide & Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-ping" />
            </div>
            <span className="text-xs font-extrabold tracking-wide">
              Ask CertiGen AI
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
              RAG Guide
            </span>
          </button>
        </div>
      )}

      {/* Expanded Assistant Dialog */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col bg-slate-950 text-slate-100 shadow-2xl border border-slate-800 backdrop-blur-xl transition-all duration-300 ease-out overflow-hidden',
            isMaximized
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'bottom-6 right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[85vh] rounded-2xl'
          )}
        >
          {/* Header */}
          <div className="h-16 px-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    CertiGen AI Assistant
                  </h2>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    RAG Grounded
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Ask anything about how CertiGen works</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors hidden sm:block"
                title={isMaximized ? 'Restore Size' : 'Maximize Window'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
            {messages.map((message) => {
              const isAi = message.sender === 'assistant';
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex flex-col gap-1.5 max-w-[90%]',
                    isAi ? 'self-start' : 'self-end items-end'
                  )}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {isAi ? 'CertiGen AI Guide' : 'You'}
                    </span>
                    <span className="text-[9px] text-slate-500">{message.timestamp}</span>
                    {isAi && (
                      <button
                        onClick={() => toggleSpeech(message)}
                        className={cn(
                          'p-0.5 rounded text-slate-400 hover:text-sky-300 transition-colors',
                          isSpeaking && speakingMessageId === message.id && 'text-amber-400 animate-pulse'
                        )}
                        title={isSpeaking && speakingMessageId === message.id ? 'Stop Reading' : 'Read Aloud'}
                      >
                        {isSpeaking && speakingMessageId === message.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={cn(
                      'p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-md',
                      isAi
                        ? 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-sm'
                        : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-sm'
                    )}
                  >
                    {isAi ? (
                      <MarkdownView content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Sources Grounding Citation Footer */}
                    {isAi && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1.5">
                          <Layers className="w-3 h-3 text-sky-400" />
                          <span>Grounded Sources ({message.sources.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((src) => (
                            <span
                              key={src.id}
                              className="px-2 py-0.5 rounded-md text-[9px] font-medium bg-slate-800/90 text-sky-300 border border-slate-700/80 flex items-center gap-1"
                              title={src.summary}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              {src.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contextual Follow-Up Suggestions */}
                  {isAi && message.suggested_queries && message.suggested_queries.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5 max-w-full">
                      {message.suggested_queries.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800/80 hover:bg-sky-600/30 text-slate-300 hover:text-sky-200 border border-slate-700/60 hover:border-sky-500/50 transition-all text-left flex items-center gap-1 group active:scale-95"
                        >
                          <Compass className="w-2.5 h-2.5 text-sky-400 group-hover:rotate-45 transition-transform" />
                          <span className="truncate">{suggestion}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-sky-400 bg-slate-900/80 border border-slate-800 rounded-xl p-3 w-fit shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin-slow text-amber-300" />
                <span className="font-semibold">Synthesizing RAG answer from CertiGen knowledge base...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about bulk issuance, QR verification, vector PDF math..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
              <span>Powered by CertiGen RAG Semantic Engine</span>
              <span>100% Knowledge Grounded</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
