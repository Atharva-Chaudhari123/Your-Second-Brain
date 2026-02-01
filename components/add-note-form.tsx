'use client'

import { useState, useRef, useTransition } from 'react'
import { addNote } from '@/app/dashboard/action'
import { useRouter } from 'next/navigation' // To refresh page after AI finishes

export default function AddNoteForm() {
  const [isPending, startTransition] = useTransition()
  const [fileAttached, setFileAttached] = useState(false)
  const [fileName, setFileName] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter() // Hook to refresh UI

  // ... (Keep handleTagKeyDown, removeTag, handleFileChange exactly the same) ...
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && tagInput.trim() !== '') {
        e.preventDefault(); if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]); setTagInput("");
      }
  }
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; setError(null);
    if (file) {
       if (file.size > 15 * 1024 * 1024) { setError("File too big"); return; }
       setFileAttached(true); setFileName(file.name);
    } else { setFileAttached(false); setFileName(""); }
  }

  const handleSubmit = (formData: FormData) => {
    if (error) return;

    startTransition(async () => {
      // 1. FAST SAVE (Upload + Text)
      const result = await addNote(formData)
      
      if (result?.success && result.noteId) {
        // 2. INSTANT RESET (User is free to go!)
        setFileAttached(false)
        setFileName("")
        setTags([])
        setTagInput("")
        setError(null)
        formRef.current?.reset()

        // 3. TRIGGER BACKGROUND PROCESS (Fire & Forget)
        // We don't await this. We let it run in the background.
        fetch('/api/process-note', {
          method: 'POST',
          body: JSON.stringify({ noteId: result.noteId })
        }).then(() => {
          // Optional: Refresh the page silently once AI is done 
          // to show the new tags/link preview
          router.refresh(); 
        });
      } else {
        setError("Failed to save note.")
      }
    })
  }

  return (
    <form action={handleSubmit} ref={formRef} className="flex flex-col gap-4">
      {/* ... (Keep the rest of your JSX exactly the same) ... */}
      <textarea
        name="content"
        disabled={isPending}
        placeholder="Type a thought, paste a link, or upload a file..."
        className={`w-full p-4 border rounded-md min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-black transition-all
          ${isPending ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200 bg-white'}
        `}
      />

      {/* ... File Input & Tags ... */}
      <div className="flex flex-col md:flex-row gap-4">
         <label className={`cursor-pointer flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-md border transition-all md:w-auto w-full select-none ${fileAttached ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
            {fileAttached ? <span className="truncate max-w-[120px]">{fileName}</span> : <span>Attach File</span>}
            <input type="file" name="file" className="hidden" accept="image/*,.pdf,.ppt,.pptx,.txt" onChange={handleFileChange} disabled={isPending} />
         </label>
         
         <div className="flex-1 flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-md bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-medium">
                {tag} <button type="button" onClick={() => removeTag(tag)} disabled={isPending} className="hover:text-red-600">✕</button>
              </span>
            ))}
            <input type="text" value={tagInput} disabled={isPending} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Tags..." className="flex-1 bg-transparent text-sm focus:outline-none min-w-[120px]" />
            <input type="hidden" name="manualTags" value={tags.join(',')} />
         </div>
      </div>

      <div className="flex justify-between items-center mt-2">
         <span className="text-xs text-gray-400 italic">{isPending ? "Uploading..." : "* AI processes in background"}</span>
         <button 
           type="submit" 
           disabled={isPending}
           className={`px-6 py-2 rounded-md font-medium text-sm shadow-sm flex items-center gap-2 transition-all ${isPending ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}
         >
           {isPending ? "Saving..." : "Save Note"}
         </button>
      </div>
    </form>
  )
}