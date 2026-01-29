'use client'

import { useState, useTransition } from 'react'
import { searchNotes } from '@/app/dashboard/action' // Import the server action

// Define the shape of a Note
type Note = {
  id: number;
  content: string;
  similarity: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Note[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use transition to keep UI responsive while fetching
    startTransition(async () => {
      const notes = await searchNotes(query);
      setResults(notes || []);
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your brain (e.g., 'What did I learn about caching?')"
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {isPending ? 'Thinking...' : 'Search'}
        </button>
      </form>

      {/* Results Display */}
      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500">Related Memories:</h3>
          {results.map((note) => (
            <div key={note.id} className="p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded">
                   {/* Convert 0.8123 to 81% Match */}
                   Match: {Math.round(note.similarity * 100)}%
                </span>
              </div>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}