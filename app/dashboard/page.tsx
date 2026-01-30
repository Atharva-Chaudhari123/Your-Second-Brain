import { createClient } from '@/utils/supabase/server'
import { addNote, deleteNote } from './action'
import SearchBar from '@/components/search-bar'

// Define the shape of our Note data for TypeScript
interface LinkMetadata {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

interface Note {
  id: number;
  content: string;
  created_at: string;
  tags: string[] | null;
  link_meta: LinkMetadata | null; // The new rich data column
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch notes
  const { data: rawNotes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  // Cast data to our typed interface
  const notes = rawNotes as Note[] | null

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* 1. Global Search */}
      <section>
        <SearchBar />
      </section>

      {/* 2. Add Note Area */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Add to Second Brain</h1>
        
        <form action={addNote} className="flex flex-col gap-4">
          <textarea
            name="content"
            placeholder="Paste a link, a thought, or a fact..."
            className="w-full p-4 border border-gray-200 rounded-md min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-black transition-all"
            required
          />
          
          {/* Manual Tag Input */}
          <input 
            type="text"
            name="manualTags"
            placeholder="Add your own tags (optional, e.g. 'work, urgent')..."
            className="w-full p-3 border border-gray-200 rounded-md text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400 italic">
              * AI will also generate tags automatically
            </span>
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
            >
              Save Note
            </button>
          </div>
        </form>
      </section>

      {/* 3. Recent Memories Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Memories</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes?.map((note) => (
             <div key={note.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden">
                
                {/* DELETE BUTTON (Hidden by default, shows on hover) */}
                <form 
                  action={deleteNote.bind(null, note.id)} 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                >
                  <button 
                    type="submit" 
                    className="p-1.5 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-200 shadow-sm transition-colors"
                    title="Delete Note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>

                {/* --- CARD CONTENT --- */}
                <div className="flex-1">
                  
                  {/* A. If Link Image Exists, Show it at top */}
                  {note.link_meta?.image && (
                    <div className="h-32 w-full overflow-hidden border-b border-gray-100 relative bg-gray-50">
                      <img 
                        src={note.link_meta.image} 
                        alt="Link Preview" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    {/* B. Main Text Content */}
                    <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3 line-clamp-4 leading-relaxed">
                      {note.content}
                    </p>

                    {/* C. Rich Link Preview Box (If link exists) */}
                    {note.link_meta && (
                      <a 
                        href={note.link_meta.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors group/link"
                      >
                        <div className="flex items-center gap-3">
                          {/* Small Thumbnail if large one doesn't exist, else generic icon */}
                           <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="text-xs font-bold text-gray-900 truncate group-hover/link:text-blue-600">
                               {note.link_meta.title || "External Link"}
                             </h4>
                             <p className="text-[10px] text-gray-500 truncate">
                               {note.link_meta.description || note.link_meta.url}
                             </p>
                           </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* --- FOOTER (Tags & Date) --- */}
                <div className="px-4 pb-4 pt-0 mt-auto flex justify-between items-end">
                  <div className="flex flex-wrap gap-1">
                    {note.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium border border-gray-200">
                        {tag}
                      </span>
                    ))}
                    {/* Show +X more if too many tags */}
                    {note.tags && note.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-400 text-[10px] font-medium">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                    {new Date(note.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

             </div>
          ))}

          {/* Empty State */}
          {(!notes || notes.length === 0) && (
            <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                 <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p className="text-gray-900 font-medium mb-1">Your brain is empty.</p>
              <p className="text-sm text-gray-500">Add a note or link above to get started.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}