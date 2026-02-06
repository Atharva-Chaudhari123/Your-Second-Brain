'use client'

import { useState, useRef, useEffect } from 'react'
import { askBrain } from '@/app/dashboard/action'

type Message = {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input.trim();
    
    // 1. Add User Message
    const newHistory = [...messages, { role: 'user' as const, content: userText }]
    setMessages(newHistory)
    setInput('')
    setIsLoading(true)

    try {
      // 2. Call Server Action
      const { reply, savedNoteId } = await askBrain(userText, newHistory)
      
      // 3. Add AI Response
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      // 4. TRIGGER BACKGROUND PROCESSING (If a note was saved)
      if (savedNoteId) {
        console.log("Triggering AI enrichment for note:", savedNoteId)
        fetch('/api/process-note', {
          method: 'POST',
          body: JSON.stringify({ noteId: savedNoteId }),
        })
      }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span>🤖</span> Chat with Brain
        </h3>
        {messages.length > 0 && (
          <button 
            onClick={() => setMessages([])} 
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear Session
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="text-4xl mb-4">🧠</div>
            <p className="text-gray-500 font-medium text-lg">Ask me anything.</p>
            <p className="text-sm text-gray-400 mt-2 max-w-xs">
              I recall your notes, answer questions, and can even save new notes for you.
            </p>
            <p className="text-xs text-gray-300 mt-4">Try: "Remind me to buy milk" or "Save a fact about React"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }
            `}>
              {/* Simple rendering for paragraphs */}
              {msg.content.split('\n').map((line, idx) => (
                <p key={idx} className={`min-h-[1em] ${line.trim().startsWith('-') ? 'pl-4' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-5 py-4 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Search, chat, or save notes..."}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 shadow-sm transition-all text-sm disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>

    </div>
  )
}