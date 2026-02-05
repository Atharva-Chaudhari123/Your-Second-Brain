'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SmartInput() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // --- STATE ---
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'temporary' | 'fact'>('temporary')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // Temporary Specific State
  const [showAdvanced, setShowAdvanced] = useState(true) // Default true for temp
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [alertAt, setAlertAt] = useState<string>('')

  // --- 1. Tag Logic (Pill Style) ---
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(' ')) {
      const newTag = val.trim()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setTagInput('')
      }
    } else {
      setTagInput(val)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  // --- 2. Gatekeeper Logic (Redirects & Warnings) ---
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    
    // Rule: Fact Store Limit (15k)
    if (category === 'fact' && val.length > 15000) {
      if (confirm("This content is massive (>15k chars). It belongs in the Knowledge Store. Redirect now?")) {
        router.push('/dashboard/Knowledge-Store')
      }
      return
    }
    
    // Rule: Temporary Store Limit (5k) -> Force switch to Fact
    if (category === 'temporary' && val.length > 5000) {
      alert("Temporary notes cannot exceed 5000 characters. Switching to Fact Store.")
      setCategory('fact')
      setShowAdvanced(false)
    }

    setContent(val)
  }

  // --- 3. Save Logic (Optimistic Non-Blocking) ---
  const handleSave = async () => {
    if (!content.trim() && !file) return

    startTransition(async () => {
      // A. Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // B. Upload File (Blocking but necessary for file path)
      let filePath = null
      let fileType = null
      
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          alert("File too large (>15MB). Please create a Knowledge Page.")
          return
        }
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('uploads').upload(fileName, file)
        if (!uploadErr) {
            const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)
            filePath = data.publicUrl
            fileType = file.type
        }
      }

      // C. Save to DB (Fast Insert)
      const { data: note, error } = await supabase.from('notes').insert({
        user_id: user.id,
        content,
        category, 
        tags, // Save manual tags immediately
        file_path: filePath,
        file_type: fileType,
        // Set lifecycle dates if Temporary
        expires_at: category === 'temporary' && expiresAt ? new Date(expiresAt).toISOString() : null,
        alert_at: category === 'temporary' && alertAt ? new Date(alertAt).toISOString() : null
      }).select().single()

      if (error) {
        console.error(error)
        alert("Failed to save note")
        return
      }

      // D. Trigger Background Processing (Fire & Forget)
      // This handles AI Tagging, Summarization, and Embedding based on category
      fetch('/api/process-note', {
        method: 'POST',
        body: JSON.stringify({ noteId: note.id }),
      })

      // E. Reset UI Instantly
      setContent('')
      setTags([])
      setFile(null)
      setTagInput('')
      setExpiresAt('')
      setAlertAt('')
      router.refresh()
    })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 transition-all">
      
      {/* 1. Category Toggles */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { setCategory('temporary'); setShowAdvanced(true) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-2
            ${category === 'temporary' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
        >
          <span>⏳</span> Temporary
        </button>
        <button
          onClick={() => { setCategory('fact'); setShowAdvanced(false) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-2
            ${category === 'fact' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
        >
          <span>🧠</span> Fact
        </button>
      </div>

      {/* 2. Main Input */}
      <textarea
        value={content}
        onChange={handleContentChange}
        disabled={isPending}
        placeholder={category === 'temporary' ? "Quick task, reminder, or grocery list..." : "Write a fact, paste a link, or capture an idea..."}
        className="w-full min-h-[120px] p-0 border-none focus:ring-0 resize-none text-gray-800 placeholder:text-gray-400 text-lg leading-relaxed focus:outline-none"
      />

      {/* 3. Tags & File Area */}
      <div className="flex flex-col gap-3 mt-4">
        {/* File Preview */}
        {file && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 p-2 rounded-md w-fit">
            <span className="text-lg">📎</span>
            <span className="text-xs text-green-700 max-w-[200px] truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-green-400 hover:text-green-700 ml-2">✕</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-100 rounded-lg bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white text-xs font-medium">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">✕</button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInput}
            placeholder={tags.length === 0 ? "Add tags (type & space)..." : "Add another..."}
            className="flex-1 min-w-[120px] text-sm bg-transparent border-none focus:ring-0 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Advanced Controls (Only for Temporary) */}
      {category === 'temporary' && showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 items-center animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Auto-Delete</span>
            <input 
              type="datetime-local" 
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="text-xs border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 text-gray-600 bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alert Me</span>
            <input 
              type="datetime-local" 
              value={alertAt}
              onChange={(e) => setAlertAt(e.target.value)}
              className="text-xs border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 text-gray-600 bg-gray-50"
            />
          </div>
        </div>
      )}

      {/* 5. Footer Actions */}
      <div className="flex justify-between items-center mt-6 pt-2">
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-gray-500 hover:text-black">
            <span className="text-xl">📎</span>
            <span className="text-xs font-medium">Attach</span>
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <button
          onClick={handleSave}
          disabled={isPending || (!content && !file)}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-2
            ${isPending 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800 hover:shadow'
            }`}
        >
          {isPending ? 'Saving...' : 'Save Note'}
        </button>
      </div>

    </div>
  )
}