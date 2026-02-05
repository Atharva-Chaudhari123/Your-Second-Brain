'use client'

import { useState, useTransition } from 'react'
import { generateBrainstorm } from './actions'
import ReactMarkdown from 'react-markdown'

export default function BrainstormPage() {
  const [isPending, startTransition] = useTransition()
  const [insight, setInsight] = useState<string | null>(null)

  const handleIgnite = () => {
    startTransition(async () => {
      const { result, error } = await generateBrainstorm()
      if (error) {
        alert(error)
      } else if (result) {
        setInsight(result)
      }
    })
  }

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* Header */}
      <div className="pt-6 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-purple-900 tracking-tight flex items-center gap-2">
          <span>🧠</span> Brainstorm
        </h1>
        <p className="text-purple-700/60 mt-1">
          Synthesize your recent facts and knowledge into actionable insights.
        </p>
      </div>

      {/* Action Area */}
      {!insight && (
        <div className="flex flex-col items-center justify-center py-20 bg-purple-50 rounded-xl border border-purple-100 border-dashed">
          <div className="mb-6 text-center max-w-md">
            <h3 className="text-lg font-semibold text-purple-900">Ready to connect the dots?</h3>
            <p className="text-sm text-purple-600 mt-2">
              The AI will analyze your last 15 inputs (Facts & Knowledge Pages) to find hidden patterns and summarize your learning.
            </p>
          </div>
          
          <button
            onClick={handleIgnite}
            disabled={isPending}
            className={`px-8 py-3 rounded-full font-bold text-white shadow-md transition-all transform hover:scale-105
              ${isPending 
                ? 'bg-purple-300 cursor-wait' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
              }
            `}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Connecting Neurons...
              </span>
            ) : (
              "⚡ Ignite Brainstorm"
            )}
          </button>
        </div>
      )}

      {/* Result Area */}
      {insight && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Using Tailwind Typography (prose) for beautiful Markdown rendering */}
            <article className="prose prose-purple max-w-none text-gray-800 leading-relaxed prose-headings:font-bold prose-headings:text-purple-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-purple-800">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </article>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
              <button 
                onClick={() => setInsight(null)}
                className="text-sm text-gray-400 hover:text-purple-600 underline"
              >
                Clear and Start Over
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}