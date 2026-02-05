import { createClient } from '@/utils/supabase/server'
import { deleteNote } from '@/app/dashboard/action'
import SearchBar from '@/components/search-bar'
import Link from 'next/link'

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
  ai_summary: string | null;
}

// Helper: Extract domain from URL
function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'Link';
  }
}

export default async function FactsStorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const q = (await searchParams).q

  // 1. Base Query
  let query = supabase
    .from('notes')
    .select('*')
    .eq('category', 'fact')
    .order('created_at', { ascending: false })

  // 2. Optional Search
  if (q) {
    // Simple text match. For advanced vector search, we'd use the RPC function.
    query = query.ilike('content', `%${q}%`)
  }

  const { data: rawNotes } = await query
  const notes = rawNotes as Note[] | null

  return (
    <main className="w-full max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* 1. Header */}
      <div className="pt-6 border-b border-gray-100 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
            <span>🧠</span> Facts Store
          </h1>
          <p className="text-blue-700/60 mt-1">
            Permanent knowledge, references, and resources. Indexed for long-term recall.
          </p>
        </div>
        <div className="w-full md:w-96">
          <SearchBar />
        </div>
      </div>

      {/* 2. Facts Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {notes?.map((note) => {
             // Logic to clean up display text
             let displayContent = note.content;
             if (note.link_meta?.url) {
                displayContent = displayContent.replace(note.link_meta.url, '').trim();
             }
             const hasRichData = note.link_meta?.title && note.link_meta?.image;

             return (
               <div key={note.id} className="break-inside-avoid group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden mb-4">
                  
                  {/* DELETE ACTION */}
                  <form action={deleteNote.bind(null, note.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <button type="submit" className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-200 shadow-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </form>

                  {/* 1. IMAGE/FILE VISUALS */}
                  {note.file_type?.startsWith('image/') && note.file_path && (
                    <div className="w-full relative bg-gray-50 border-b border-gray-100">
                      <img src={note.file_path} alt="Uploaded" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  {!note.file_type?.startsWith('image/') && hasRichData && (
                    <div className="w-full relative bg-gray-50 border-b border-gray-100">
                      <img src={note.link_meta!.image!} alt="Link Preview" className="w-full h-40 object-cover" />
                    </div>
                  )}

                  <div className="p-4">
                    {/* 2. PDF CARD */}
                    {note.file_type === 'application/pdf' && note.file_path && (
                      <a href={note.file_path} target="_blank" className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-3 hover:bg-blue-100 transition-colors group/pdf">
                          <div className="p-2 bg-white rounded text-blue-500 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-blue-900 truncate">PDF Document</p>
                            {/* If AI summarized it, show snippet */}
                            <p className="text-[10px] text-blue-600 truncate">{note.ai_summary ? "AI Summarized" : "Click to Preview"}</p>
                          </div>
                      </a>
                    )}

                    {/* 3. CONTENT */}
                    <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
                      {displayContent}
                    </p>

                    {/* 4. LINK CARD */}
                    {note.link_meta && (
                      <a href={note.link_meta.url} target="_blank" rel="noopener noreferrer" className="block mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors group/link">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 overflow-hidden">
                              {hasRichData ? <img src={note.link_meta.image!} className="w-full h-full object-cover" /> : <span className="text-lg">🌍</span>}
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

                  {/* FOOTER */}
                  <div className="px-4 pb-4 pt-0 mt-auto">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

               </div>
             )
          })}

          {(!notes || notes.length === 0) && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No facts stored</h3>
                <p className="text-gray-500 mt-1">Anything valuable you add will appear here.</p>
             </div>
          )}
        </div>
      
    </main>
  )
}