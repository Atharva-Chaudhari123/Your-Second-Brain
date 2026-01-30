'use client'

import { useState } from 'react'
import { askBrain } from '@/app/dashboard/action'

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add user message immediately to UI
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Call the Server Action
      const answer = await askBrain(userMessage.content);
      
      // 3. Add AI response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't think right now." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold">Chat with your Brain</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            Ask me anything about your notes...
          </p>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Summarize my thoughts on React..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}