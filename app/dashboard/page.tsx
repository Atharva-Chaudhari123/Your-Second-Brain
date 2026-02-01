import { createClient } from '@/utils/supabase/server'
import { deleteNote } from './action'
import SearchBar from '@/components/search-bar'
import AddNoteForm from '@/components/add-note-form'

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
  link_meta: LinkMetadata | null;
  file_path: string | null;
  file_type: string | null;
}

// Helper to show domain only (e.g. "supabase.com")
function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch (e) {
    return 'Link';
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: rawNotes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  const notes = rawNotes as Note[] | null

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 pb-10">
      <section><SearchBar /></section>
      
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Add to Second Brain</h1>
        <AddNoteForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Memories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes?.map((note) => {
             // Logic to hide raw URL in text
             let displayContent = note.content;
             if (note.link_meta?.url) {
                displayContent = displayContent.replace(note.link_meta.url, '').trim();
             }

             // Check if we have valid scraped data
             const hasRichData = note.link_meta?.title && note.link_meta?.image;

             return (
               <div key={note.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden">
                  
                  {/* DELETE BUTTON */}
                  <form action={deleteNote.bind(null, note.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <button type="submit" className="p-1.5 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-200 shadow-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </form>

                  <div className="flex-1">
                    {/* 1. UPLOADED IMAGE */}
                    {note.file_type?.startsWith('image/') && note.file_path && (
                      <div className="h-40 w-full overflow-hidden border-b border-gray-100 relative bg-gray-50">
                        <img src={note.file_path} alt="Uploaded File" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    {/* 2. RICH LINK IMAGE (Only if valid) */}
                    {!note.file_type?.startsWith('image/') && hasRichData && (
                      <div className="h-32 w-full overflow-hidden border-b border-gray-100 relative bg-gray-50">
                        <img src={note.link_meta!.image!} alt="Link Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    <div className="p-4">
                      {/* 3. PDF CARD */}
                      {note.file_type === 'application/pdf' && note.file_path && (
                        <a href={note.file_path} target="_blank" className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg mb-4 hover:bg-red-100 transition-colors group/pdf">
                           <div className="p-2 bg-white rounded text-red-500 shadow-sm">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                           </div>
                           <div className="overflow-hidden">
                             <p className="text-sm font-bold text-red-900 truncate">PDF Document</p>
                             <p className="text-[10px] text-red-600 uppercase font-semibold">Click to Preview</p>
                           </div>
                        </a>
                      )}

                      {/* 4. TEXT CONTENT */}
                      {displayContent && (
                        <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3 line-clamp-4 leading-relaxed">
                          {displayContent}
                        </p>
                      )}

                      {/* 5. SMART LINK CARD */}
                      {note.link_meta && (
                        <a href={note.link_meta.url} target="_blank" rel="noopener noreferrer" className="block mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors group/link">
                          <div className="flex items-center gap-3">
                             {/* ICON: If rich image exists, show tiny thumb. Else show GLOBE ICON */}
                             <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 overflow-hidden">
                                {hasRichData ? (
                                   <img src={note.link_meta.image!} className="w-full h-full object-cover" />
                                ) : (
                                   <span className="text-lg">🌍</span> 
                                )}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                               <h4 className="text-xs font-bold text-gray-900 truncate group-hover/link:text-blue-600">
                                 {note.link_meta.title || getDomain(note.link_meta.url)}
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
                  
                  {/* FOOTER */}
                  <div className="px-4 pb-4 pt-0 mt-auto flex justify-between items-end">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium border border-gray-200">{tag}</span>
                      ))}
                      {note.tags && note.tags.length > 3 && <span className="px-2 py-0.5 text-gray-400 text-[10px]">+{note.tags.length - 3}</span>}
                    </div>
                    <span className="text-[10px] text-gray-400 ml-2">{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>

               </div>
             )
          })}
        </div>
      </section>
    </main>
  )
}