import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Menu, X, Loader2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Message, Role, ModelId } from './types';
import { DEFAULT_MODEL, WELCOME_MESSAGE } from './constants';
import { geminiService } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import Sidebar from './components/Sidebar';

function App() {
  // -- State --
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelId>(DEFAULT_MODEL);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // For smooth UI typing effect check
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitializedRef = useRef(false);

  // -- Initialization --
  useEffect(() => {
    if (!isInitializedRef.current) {
      geminiService.initializeChat(currentModel);
      setMessages([
        {
          id: 'welcome',
          role: Role.MODEL,
          content: WELCOME_MESSAGE,
          timestamp: Date.now()
        }
      ]);
      isInitializedRef.current = true;
    }
  }, [currentModel]);

  // -- Scroll to bottom --
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // -- Auto-resize textarea --
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // -- Handlers --
  const handleModelChange = (model: ModelId) => {
    if (model === currentModel) return;
    setCurrentModel(model);
    setMessages([
       {
          id: uuidv4(),
          role: Role.MODEL,
          content: `Switched to ${model}. How can I help?`,
          timestamp: Date.now()
       }
    ]);
    geminiService.resetSession(model);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([
        {
          id: uuidv4(),
          role: Role.MODEL,
          content: WELCOME_MESSAGE,
          timestamp: Date.now()
        }
    ]);
    geminiService.resetSession(currentModel);
    if (window.innerWidth < 768) setSidebarOpen(false);
    setInput('');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 1. Add User Message
    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: userText,
      timestamp: Date.now()
    };

    // 2. Add Placeholder Model Message
    const placeholderId = uuidv4();
    const modelMsg: Message = {
      id: placeholderId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true
    };

    setMessages(prev => [...prev, userMsg, modelMsg]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // 3. Stream response
      const stream = geminiService.sendMessageStream(userText);
      let accumulatedText = '';

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === placeholderId 
            ? { ...msg, content: accumulatedText } 
            : msg
        ));
      }
      
      // Finalize
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));

    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderId 
          ? { ...msg, content: "Sorry, I encountered an error processing your request. Please try again.", isError: true, isStreaming: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        currentModel={currentModel}
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full max-w-full">
        
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur z-20">
           <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg">
               <Menu size={20} />
             </button>
             <span className="font-semibold">Gemini Chat</span>
           </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="max-w-3xl mx-auto relative">
            {/* Input Container */}
            <div className={`
              relative flex items-end gap-2 p-2 bg-gray-800/50 border rounded-xl transition-all duration-200
              ${isLoading ? 'opacity-80 border-gray-700' : 'border-gray-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:bg-gray-800'}
            `}>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 max-h-48 text-gray-100 placeholder-gray-500 leading-relaxed"
              />

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`
                  p-3 rounded-lg flex-shrink-0 transition-all duration-200
                  ${input.trim() && !isLoading 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                `}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-500">
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
