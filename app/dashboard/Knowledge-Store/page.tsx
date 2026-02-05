import { createClient } from '@/utils/supabase/server'
import { createPage, deletePage } from './action'
import SearchBar from '@/components/search-bar'
import Link from 'next/link'

export default async function KnowledgeStorePage() {
  const supabase = await createClient()

  // Fetch Metadata ONLY (Fast)
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <main className="w-full max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* 1. Header & Actions */}
      <div className="pt-6 border-b border-gray-100 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>📚</span> Knowledge Store
          </h1>
          <p className="text-gray-500 mt-1">Deep work, study notes, and documentation.</p>
        </div>
        
        <form action={createPage}>
          <button className="bg-black text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Page
          </button>
        </form>
      </div>

      {/* 2. Search (Optional) */}
      <div className="max-w-md">
        <SearchBar />
      </div>

      {/* 3. Page List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages?.map((page) => (
          <div key={page.id} className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between h-40">
            
            <Link href={`/dashboard/Knowledge-Store/${page.id}`} className="absolute inset-0 z-10" />

            {/* Content */}
            <div>
              <div className="text-3xl mb-3">{page.icon || '📄'}</div>
              <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {page.title || "Untitled"}
              </h3>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end border-t border-gray-50 pt-3">
              <span className="text-xs text-gray-400">
                Last edited {new Date(page.updated_at).toLocaleDateString()}
              </span>
              
              {/* Delete Action (Z-Index higher than link) */}
              <form action={deletePage.bind(null, page.id)} className="z-20 relative">
                <button className="text-gray-300 hover:text-red-500 p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </form>
            </div>

          </div>
        ))}

        {(!pages || pages.length === 0) && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-gray-500">No pages yet. Create one to start writing.</p>
          </div>
        )}
      </div>

    </main>
  )
}