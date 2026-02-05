'use server'

import { createClient } from '@/utils/supabase/server'
import { generateFlashcards } from '@/utils/gemini'

// 1. Fetch Options (Populate the dropdowns)
export async function getQuizOptions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tags: [], pages: [] }

  // Get used tags
  const { data: notes } = await supabase.from('notes').select('tags').not('tags', 'is', null)
  const tags = Array.from(new Set(notes?.flatMap(n => n.tags) || [])).slice(0, 20)

  // Get pages
  const { data: pages } = await supabase.from('pages').select('id, title').order('updated_at', { ascending: false }).limit(20)

  return { tags, pages: pages || [] }
}

// 2. Generate Quiz (The Heavy Lifter)
export async function generateQuizAction(mode: 'recent' | 'tag' | 'page' | 'text', value?: string) {
  const supabase = await createClient()
  let contextContent = ""

  try {
    // --- SOURCE GATHERING ---
    if (mode === 'recent') {
      // Fetch last 10 Fact notes
      const { data } = await supabase.from('notes')
        .select('content')
        .eq('category', 'fact')
        .order('created_at', { ascending: false })
        .limit(10)
      contextContent = data?.map(n => n.content).join("\n---\n") || ""
    } 
    else if (mode === 'tag' && value) {
      // Fetch notes with specific tag
      const { data } = await supabase.from('notes')
        .select('content')
        .contains('tags', [value])
        .limit(15)
      contextContent = data?.map(n => n.content).join("\n---\n") || ""
    } 
    else if (mode === 'page' && value) {
      // Fetch specific Knowledge Page content/summary
      const { data } = await supabase.from('page_contents')
        .select('ai_summary, content') // Use summary if available, else raw content
        .eq('page_id', value)
        .single()
      
      contextContent = data?.ai_summary || JSON.stringify(data?.content) || ""
    } 
    else if (mode === 'text' && value) {
      // Raw text input
      contextContent = value
    }

    if (!contextContent || contextContent.length < 50) {
      return { error: "Not enough content to generate a quiz. Add more notes first!" }
    }

    // --- AI GENERATION ---
    // We use the existing utility function
    const cards = await generateFlashcards(contextContent)
    
    if (!cards || cards.length === 0) {
      return { error: "AI couldn't extract valid questions. Try different content." }
    }

    return { success: true, cards }

  } catch (error) {
    console.error("Quiz Gen Error:", error)
    return { error: "Failed to generate quiz." }
  }
}