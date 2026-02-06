'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { deleteNote } from '@/app/dashboard/action'

// Types
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
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'Link';
  }
}

export default function NotesFeed({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const supabase = createClient()

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [payload.new as Note, ...prev])
          } 
          else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id))
          } 
          else if (payload.eventType === 'UPDATE') {
            setNotes((prev) => prev.map((n) => 
              n.id === payload.new.id ? { ...n, ...payload.new } as Note : n
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {notes.map((note) => {
          let displayContent = note.content;
          if (note.link_meta?.url) {
            displayContent = displayContent.replace(note.link_meta.url, '').trim();
          }
          const hasRichData = note.link_meta?.title && note.link_meta?.image;

          return (
            <div key={note.id} className="break-inside-avoid group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden mb-4">
              
              {/* DELETE ACTION */}
              <button 
                onClick={async () => {
                   setNotes(notes.filter(n => n.id !== note.id))
                   await deleteNote(note.id)
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 p-1.5 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full border border-gray-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              {/* --- FILE VISUALS --- */}

              {/* 1. IMAGES */}
              {note.file_type?.startsWith('image/') && note.file_path && (
                <div className="w-full relative bg-gray-50 border-b border-gray-100">
                  <img src={note.file_path} alt="Uploaded" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* 2. AUDIO PLAYER (NEW) */}
              {note.file_type?.startsWith('audio/') && note.file_path && (
                <div className="w-full bg-gray-50 border-b border-gray-100 p-4">
                   <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <span>🎙️</span> Audio Note
                   </div>
                   <audio controls className="w-full h-8 rounded-lg" src={note.file_path} />
                </div>
              )}

              {/* 3. RICH LINK IMAGE (Fallback) */}
              {!note.file_type?.startsWith('image/') && hasRichData && (
                <div className="w-full relative bg-gray-50 border-b border-gray-100">
                  <img src={note.link_meta!.image!} alt="Link Preview" className="w-full h-40 object-cover" />
                </div>
              )}

              <div className="p-4">
                {/* BADGE */}
                <div className="mb-2 flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${note.category === 'temporary' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {note.category === 'temporary' ? 'Temp' : 'Fact'}
                    </span>
                </div>

                {/* 4. PDF CARD */}
                {note.file_type === 'application/pdf' && note.file_path && (
                  <a href={note.file_path} target="_blank" className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg mb-3 hover:bg-red-100 transition-colors group/pdf">
                      <div className="p-2 bg-white rounded text-red-500 shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-red-900 truncate">PDF Document</p>
                        <p className="text-[10px] text-red-600 uppercase font-semibold">Preview</p>
                      </div>
                  </a>
                )}

                {/* 5. GENERIC FILE FALLBACK (NEW) */}
                {note.file_path && !note.file_type?.startsWith('image/') && !note.file_type?.startsWith('audio/') && note.file_type !== 'application/pdf' && (
                   <a href={note.file_path} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3 hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded text-gray-500 shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">Attached File</p>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Download</p>
                      </div>
                   </a>
                )}

                {/* TEXT */}
                {displayContent && (
                  <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
                    {displayContent}
                  </p>
                )}

                {/* RICH LINK */}
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
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200 animate-in fade-in zoom-in">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

            </div>
          )
      })}

      {(!notes || notes.length === 0) && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <h3 className="text-lg font-medium text-gray-900">Your brain is empty</h3>
            <p className="text-gray-500 mt-1">Start by adding a quick note or fact above.</p>
          </div>
      )}
    </div>
  )
}