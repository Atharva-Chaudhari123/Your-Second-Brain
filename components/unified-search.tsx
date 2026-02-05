'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UnifiedSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Toggle Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  // THE SEARCH LOGIC (Debounce + Abort)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    const doSearch = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setResults(data)
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err)
      } finally {
        if (!signal.aborted) setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(doSearch, 300) // 300ms Debounce

    return () => {
      clearTimeout(timeoutId)
      controller.abort() // Cancel previous request
    }
  }, [query])

  const handleSelect = (path: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(path)
  }

  return (
    <>
      {/* TRIGGER (Side Nav Style) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all md:justify-start justify-center group"
      >
        <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span className="hidden md:block">Search Brain...</span>
        <span className="hidden md:block ml-auto text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/20 backdrop-blur-sm transition-all" onClick={() => setIsOpen(false)}>
          <div 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-gray-100">
              <svg className={`w-5 h-5 mr-3 transition-colors ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes, pages, or facts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-300 text-gray-800"
              />
              <button onClick={() => setIsOpen(false)} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 hover:text-black">ESC</button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 && query && !isLoading && (
                <div className="py-12 text-center text-gray-400 text-sm">No results found for "{query}"</div>
              )}
              
              {results.length === 0 && !query && (
                <div className="py-12 text-center text-gray-400 text-sm">Type to search your Second Brain...</div>
              )}

              {results.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.url_path)}
                  className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 text-left group transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className={`mt-1 p-2 rounded-md shrink-0 
                    ${item.source_type === 'fact' ? 'bg-blue-50 text-blue-600' : 
                      item.source_type === 'page' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}
                  >
                    {item.source_type === 'fact' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {item.source_type === 'page' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    {item.source_type === 'temporary' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.source_type}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.content_snippet}</p>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            {results.length > 0 && (
              <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 flex justify-between">
                <span>{results.length} results found</span>
                <span>Select to navigate</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}