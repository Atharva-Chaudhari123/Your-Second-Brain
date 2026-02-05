'use client'

import { useState, useEffect } from 'react'
import { savePageContent, mapToMind } from '@/app/dashboard/Knowledge-Store/[id]/action'
import { useRouter } from 'next/navigation'

interface EditorProps {
  pageId: string
  initialTitle: string
  initialContent: any // JSONB
  initialSummary: string | null
}

export default function PageEditor({ pageId, initialTitle, initialContent, initialSummary }: EditorProps) {
  const router = useRouter()
  
  // State
  const [title, setTitle] = useState(initialTitle)
  // For MVP, we treat content as a simple text block stored in JSON. 
  // You can upgrade this to a list of blocks [] later without breaking the schema.
  const [body, setBody] = useState(initialContent?.text || "")
  const [summary, setSummary] = useState(initialSummary)
  
  // Status States
  const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [isMapping, setIsMapping] = useState(false)

  // Auto-Save Logic (Debounce 1.5s)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (status === 'unsaved') {
        setStatus('saving')
        try {
          // We store content as structured JSON for future extensibility
          const contentJSON = { text: body, type: 'markdown' }
          await savePageContent(pageId, title, contentJSON)
          setStatus('saved')
          router.refresh()
        } catch (e) {
          setStatus('unsaved') // Retry logic would go here
          console.error(e)
        }
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [body, title, status, pageId, router])

  // Handle Input Changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setStatus('unsaved')
  }

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
    setStatus('unsaved')
  }

  // Handle "Map to Mind"
  const handleMapToMind = async () => {
    if (!body.trim()) return alert("Write some content first!")
    
    setIsMapping(true)
    const result = await mapToMind(pageId, body) // We pass raw text for AI
    setIsMapping(false)

    if (result.success && result.summary) {
      setSummary(result.summary)
    } else {
      alert("Failed to map to mind. Try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-0">
      
      {/* 1. Toolbar / Status Bar */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-gray-100">
        <div className="text-xs font-mono text-gray-400">
          {status === 'saved' && <span className="text-green-600">Saved</span>}
          {status === 'saving' && <span className="text-orange-500 animate-pulse">Saving...</span>}
          {status === 'unsaved' && <span>Unsaved changes...</span>}
        </div>

        <button
          onClick={handleMapToMind}
          disabled={isMapping || status !== 'saved'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
            ${isMapping ? 'bg-purple-100 text-purple-700 cursor-wait' : 'bg-black text-white hover:bg-gray-800'}
            ${status !== 'saved' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={status !== 'saved' ? "Wait for auto-save to finish" : "Generate AI Summary & Embeddings"}
        >
          {isMapping ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mapping...
            </>
          ) : (
            <>
              <span>🧠</span> Map to Mind
            </>
          )}
        </button>
      </div>

      {/* 2. Editor Surface */}
      <div className="space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Page"
          className="w-full text-4xl font-bold text-gray-900 border-none focus:ring-0 placeholder:text-gray-300 bg-transparent px-0"
        />

        {/* AI Summary Block (If exists) */}
        {summary && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>✨</span> Knowledge Summary
            </h3>
            <p className="text-purple-900 text-sm leading-relaxed italic">
              "{summary}"
            </p>
            <div className="mt-3 text-[10px] text-purple-400">
              * This summary is indexed for semantic search.
            </div>
          </div>
        )}

        {/* Body (Simple Textarea for now - robust and mobile friendly) */}
        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Start typing your knowledge document..."
          className="w-full min-h-[60vh] text-lg text-gray-700 leading-relaxed border-none focus:ring-0 resize-none placeholder:text-gray-300 px-0"
        />
      </div>

    </div>
  )
}