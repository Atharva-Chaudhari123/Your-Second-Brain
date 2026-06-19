import { createClient } from '@/utils/supabase/server'
import { deleteNote } from '@/app/dashboard/action'
import CreateNoteButton from '@/components/dashboard/create-note-button'

// --- Types ---
interface LinkMetadata {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

interface Note {
  id: number;
  content: string;
  category: 'temporary' | 'fact';
  created_at: string;
  tags: string[] | null;
  link_meta: LinkMetadata | null;
  file_path: string | null;
  file_type: string | null;
  expires_at: string | null;
  alert_at: string | null;
}

export default async function TemporaryStorePage() {
  const supabase = await createClient()

  // 1. Fetch ONLY Temporary Notes
  const { data: rawNotes } = await supabase
    .from('notes')
    .select('*')
    .eq('category', 'temporary')
    .order('created_at', { ascending: false })

  const notes = rawNotes as Note[] | null

  // Helper to calculate days left
  const getDaysLeft = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <main className="w-full max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* 1. Header */}
      <div className="pt-6 border-b border-gray-100 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-orange-900 tracking-tight flex items-center gap-2">
            <span>⏳</span> Temporary Store
          </h1>
          <p className="text-orange-700/60 mt-1">
            Ephemeral thoughts and tasks. Items here auto-delete after their expiry date.
          </p>
        </div>
        
        {/* 2. Action Button (Replaces Smart Input) */}
        <CreateNoteButton category="temporary" />
      </div>

      {/* 3. The Temporary Feed (Masonry Layout) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Active Tasks</h2>
        
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {notes?.map((note) => {
             const daysLeft = note.expires_at ? getDaysLeft(note.expires_at) : 30;
             const isUrgent = daysLeft <= 3;

             return (
               <div key={note.id} className={`break-inside-avoid mb-4 group relative bg-white rounded-xl border shadow-sm transition-all overflow-hidden
                 ${isUrgent ? 'border-orange-200 shadow-orange-50' : 'border-gray-200 hover:shadow-md'}
               `}>
                  
                  {/* DELETE ACTION */}
                  <form action={deleteNote.bind(null, note.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <button type="submit" className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-200 shadow-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </form>

                  {/* Header: Urgency Flag */}
                  <div className={`px-4 py-2 border-b flex justify-between items-center text-xs font-medium
                    ${isUrgent ? 'bg-orange-50 text-orange-800 border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-100'}
                  `}>
                    <span className="flex items-center gap-1">
                      {isUrgent && <span className="animate-pulse">⚠️</span>}
                      {isUrgent ? 'Expiring Soon' : 'Active'}
                    </span>
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                  </div>

                  <div className="p-4">
                    {/* Content */}
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>

                    {/* File Attachment Indicator */}
                    {note.file_path && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md w-fit border border-gray-100">
                        <span className="text-lg">📎</span>
                        <span>Attached File</span>
                        <a href={note.file_path} target="_blank" className="text-blue-600 hover:underline ml-1">View</a>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="px-4 pb-4 pt-0 flex flex-wrap gap-1">
                      {note.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

               </div>
             )
          })}

          {(!notes || notes.length === 0) && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-4">
                  <span className="text-2xl">🧹</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No temporary tasks</h3>
                <p className="text-gray-500 mt-1">Everything is clean. Add a quick task above!</p>
             </div>
          )}
        </div>
      </section>
    </main>
  )
}