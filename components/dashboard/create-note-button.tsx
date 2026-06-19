'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PaperClipIcon, XMarkIcon, BellIcon, ClockIcon } from '@heroicons/react/24/outline'

interface CreateNoteButtonProps {
  category: 'temporary' | 'fact'
}

export default function CreateNoteButton({ category }: CreateNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // Temp Specific State
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [alertAt, setAlertAt] = useState<string>('')

  // Validation Limits
  const MAX_CHARS = category === 'temporary' ? 5000 : 15000
  const isOverLimit = content.length > MAX_CHARS

  // Tag Logic
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

  // Save Logic
  const handleSave = async () => {
    if ((!content.trim() && !file) || isOverLimit) return

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let filePath = null
      let fileType = null
      
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          alert("File too large (>15MB).")
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

      const { data: note, error } = await supabase.from('notes').insert({
        user_id: user.id,
        content,
        category, 
        tags,
        file_path: filePath,
        file_type: fileType,
        expires_at: category === 'temporary' && expiresAt ? new Date(expiresAt).toISOString() : null,
        alert_at: category === 'temporary' && alertAt ? new Date(alertAt).toISOString() : null
      }).select().single()

      if (error) {
        alert("Failed to save note")
        return
      }

      // Trigger Background AI
      fetch('/api/process-note', {
        method: 'POST',
        body: JSON.stringify({ noteId: note.id }),
      })

      // Reset & Close
      setContent('')
      setTags([])
      setFile(null)
      setTagInput('')
      setExpiresAt('')
      setAlertAt('')
      setIsOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center gap-2 text-white
          ${category === 'temporary' 
            ? 'bg-orange-600 hover:bg-orange-700' 
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <span className="text-lg leading-none">+</span>
        Create {category === 'temporary' ? 'Task' : 'Fact'}
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0
               ${category === 'temporary' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}
            `}>
              <h3 className={`font-bold text-lg ${category === 'temporary' ? 'text-orange-900' : 'text-blue-900'}`}>
                New {category === 'temporary' ? 'Temporary Note' : 'Fact'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
               
               {/* Main Input */}
               <div>
                 <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isPending}
                    placeholder={category === 'temporary' ? "What needs to be done? (Auto-deletes in 30 days)" : "Write a fact, paste a link, or capture an idea..."}
                    className={`w-full min-h-[150px] p-4 border rounded-lg resize-none focus:ring-2 outline-none text-base transition-all
                      ${isOverLimit 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-200 focus:ring-black/5 focus:border-black/20'
                      }`}
                  />
                  <div className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {content.length} / {MAX_CHARS} characters
                    {isOverLimit && <span className="ml-2">(Limit Exceeded)</span>}
                  </div>
               </div>

                {/* File & Tags Row */}
                <div className="flex flex-col gap-3">
                  {file && (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-2 rounded-md w-fit">
                      <PaperClipIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-700 max-w-[200px] truncate">{file.name}</span>
                      <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-600"><XMarkIcon className="w-3 h-3" /></button>
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

                {/* Temporary Options (Alerts) */}
                {category === 'temporary' && (
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Auto-Delete</span>
                      <input 
                        type="datetime-local" 
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="text-xs border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 text-gray-600 bg-gray-50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <BellIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alert Me</span>
                      <input 
                        type="datetime-local" 
                        value={alertAt}
                        onChange={(e) => setAlertAt(e.target.value)}
                        className="text-xs border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 text-gray-600 bg-gray-50"
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center shrink-0">
               <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                  <PaperClipIcon className="w-5 h-5" />
                  <span className="font-medium">Attach File</span>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
               </label>

               <div className="flex gap-3">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                  <button 
                    onClick={handleSave} 
                    disabled={isPending || (!content && !file) || isOverLimit} 
                    className={`px-6 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition-all
                      ${isPending || isOverLimit 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : (category === 'temporary' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700')}
                    `}
                  >
                    {isPending ? 'Saving...' : 'Save Note'}
                  </button>
               </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}