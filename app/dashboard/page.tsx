import { createClient } from '@/utils/supabase/server'
import { addNote } from './action'
import SearchBar from '@/components/search-bar'



export default async function DashboardPage() {
  const supabase = await createClient()



  // Fetch existing notes
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8">
      {/* 1. THE SEARCH BAR */}
      <section>
        <SearchBar />
      </section>
      
      {/* 1. The Input Area (The "Dump") */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-4">What's on your mind?</h1>
        <form action={addNote} className="flex flex-col gap-4">
          <textarea
            name="content"
            placeholder="Paste a link, a thought, or a fact..."
            className="w-full p-4 border rounded-md min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button 
            type="submit" 
            className="self-end bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Save to Brain
          </button>
        </form>
      </section>

      {/* 2. The Recent Notes List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Memories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes?.map((note) => (
            <div key={note.id} className="p-4 bg-yellow-50 rounded border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-800 whitespace-pre-wrap text-sm line-clamp-6">
                {note.content}
              </p>
              <span className="text-xs text-gray-400 mt-2 block">
                {new Date(note.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          
          {(!notes || notes.length === 0) && (
            <p className="text-gray-500 col-span-full text-center py-10">
              Your brain is empty. Add a note above!
            </p>
          )}
        </div>
      </section>

    </main>
  )
}