'use client'

import { useState, useEffect, useTransition } from 'react'
import { getQuizOptions, generateQuizAction } from './actions'
import QuizPlayer from '@/components/flashcard/quiz-player'

export default function FlashcardsPage() {
  const [isPending, startTransition] = useTransition()
  
  // Data State
  const [tags, setTags] = useState<string[]>([])
  const [pages, setPages] = useState<{ id: string, title: string }[]>([])
  
  // UI State
  const [mode, setMode] = useState<'recent' | 'tag' | 'page' | 'text' | null>(null)
  const [selectedValue, setSelectedValue] = useState('')
  const [quizCards, setQuizCards] = useState<any[] | null>(null)

  // 1. Fetch Options on Load
  useEffect(() => {
    getQuizOptions().then(data => {
      setTags(data.tags)
      setPages(data.pages)
    })
  }, [])

  // 2. Handle Generation
  const handleGenerate = () => {
    if (!mode) return
    if ((mode === 'tag' || mode === 'page' || mode === 'text') && !selectedValue) return

    startTransition(async () => {
      const { success, cards, error } = await generateQuizAction(mode, selectedValue)
      
      if (success && cards) {
        setQuizCards(cards)
      } else {
        alert(error || "Something went wrong")
      }
    })
  }

  // 3. Render Quiz Player if active
  if (quizCards) {
    return (
      <main className="w-full max-w-4xl mx-auto pb-20 px-4 md:px-0 pt-6">
        <button 
          onClick={() => { setQuizCards(null); setMode(null); }}
          className="mb-6 text-sm text-gray-500 hover:text-black flex items-center gap-1"
        >
          ← Back to Generator
        </button>
        <QuizPlayer cards={quizCards} onExit={() => { setQuizCards(null); setMode(null); }} />
      </main>
    )
  }

  // 4. Render Generator UI
  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* Header */}
      <div className="pt-6 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-green-900 tracking-tight flex items-center gap-2">
          <span>🗂️</span> Flashcard Generator
        </h1>
        <p className="text-green-700/60 mt-1">
          Create an active recall session on-demand. Choose your source material below.
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* MODE: Recent */}
        <button
          onClick={() => { setMode('recent'); setSelectedValue(''); }}
          className={`p-6 rounded-xl border text-left transition-all ${mode === 'recent' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
        >
          <div className="text-2xl mb-2">🕒</div>
          <h3 className="font-bold text-gray-900">Recent Notes</h3>
          <p className="text-xs text-gray-500 mt-1">Quiz me on the last 10 facts I added.</p>
        </button>

        {/* MODE: By Tag */}
        <button
          onClick={() => { setMode('tag'); setSelectedValue(''); }}
          className={`p-6 rounded-xl border text-left transition-all ${mode === 'tag' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
        >
          <div className="text-2xl mb-2">🏷️</div>
          <h3 className="font-bold text-gray-900">By Tag</h3>
          <p className="text-xs text-gray-500 mt-1">Focus on a specific topic (e.g. #react).</p>
        </button>

        {/* MODE: By Page */}
        <button
          onClick={() => { setMode('page'); setSelectedValue(''); }}
          className={`p-6 rounded-xl border text-left transition-all ${mode === 'page' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
        >
          <div className="text-2xl mb-2">📄</div>
          <h3 className="font-bold text-gray-900">Knowledge Page</h3>
          <p className="text-xs text-gray-500 mt-1">Deep dive into one of your documents.</p>
        </button>

        {/* MODE: Raw Text */}
        <button
          onClick={() => { setMode('text'); setSelectedValue(''); }}
          className={`p-6 rounded-xl border text-left transition-all ${mode === 'text' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-bold text-gray-900">Raw Text</h3>
          <p className="text-xs text-gray-500 mt-1">Paste content directly to generate a quiz.</p>
        </button>
      </div>

      {/* Dynamic Input Area (Based on Mode) */}
      {mode && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-gray-900 mb-4 capitalize">Configure {mode} Quiz</h3>
          
          {mode === 'recent' && (
            <p className="text-sm text-gray-600 mb-4">Ready to review your latest findings?</p>
          )}

          {mode === 'tag' && (
            <select 
              className="w-full p-3 border rounded-lg mb-4 bg-white"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <option value="">Select a tag...</option>
              {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}

          {mode === 'page' && (
            <select 
              className="w-full p-3 border rounded-lg mb-4 bg-white"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <option value="">Select a document...</option>
              {pages.map(page => <option key={page.id} value={page.id}>{page.title}</option>)}
            </select>
          )}

          {mode === 'text' && (
            <textarea
              className="w-full p-3 border rounded-lg mb-4 h-32 bg-white"
              placeholder="Paste your study material here (max 800 words)..."
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            />
          )}

          <button
            onClick={handleGenerate}
            disabled={isPending || (mode !== 'recent' && !selectedValue)}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-95
              ${isPending 
                ? 'bg-green-300 cursor-wait' 
                : 'bg-green-600 hover:bg-green-700'
              }
            `}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                Generating Quiz...
              </span>
            ) : "🚀 Generate Flashcards"}
          </button>
        </div>
      )}

    </main>
  )
}