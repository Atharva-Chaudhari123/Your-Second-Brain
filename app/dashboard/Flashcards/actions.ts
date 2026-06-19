'use server'

import { createClient } from '@/utils/supabase/server'
import { generateFlashcards } from '@/utils/gemini'

// 1. Fetch Options (Populate the dropdowns)
export async function getQuizOptions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tags: [], pages: [] }

  // Get used tags (Filter out nulls)
  const { data: notes } = await supabase
    .from('notes')
    .select('tags')
    .not('tags', 'is', null)
  
  // Flatten, Unique, Clean
  const allTags = notes?.flatMap(n => n.tags) || []
  const uniqueTags = Array.from(new Set(allTags))
    .filter(t => t && t.trim().length > 0) // Remove empty strings
    .sort()
    .slice(0, 50) 

  // Get pages
  const { data: pages } = await supabase
    .from('pages')
    .select('id, title')
    .order('updated_at', { ascending: false })
    .limit(20)

  return { tags: uniqueTags, pages: pages || [] }
}

// 2. Generate Quiz (The Heavy Lifter)
export async function generateQuizAction(mode: 'recent' | 'tag' | 'page' | 'text', value?: string) {
  const supabase = await createClient()
  let contextContent = ""
  let debugSourceCount = 0;

  console.log(`[Quiz] Generating mode: ${mode}, value: ${value?.substring(0, 20)}...`)

  try {
    // --- SOURCE GATHERING ---
    if (mode === 'recent') {
      const { data } = await supabase.from('notes')
        .select('content')
        .eq('category', 'fact')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) debugSourceCount = data.length
      contextContent = data?.map(n => n.content).join("\n---\n") || ""
    } 
    else if (mode === 'tag' && value) {
      // Clean the input
      const tagToFind = value.trim()
      
      // Fetch notes that CONTAIN this tag
      // We order by created_at to get the freshest context
      const { data } = await supabase.from('notes')
        .select('content, tags') 
        .contains('tags', [tagToFind])
        .order('created_at', { ascending: false }) 
        .limit(15)
      
      if (!data || data.length === 0) {
        console.log(`[Quiz] No notes found for tag: ${tagToFind}`)
        return { error: `No notes found with tag "${tagToFind}". Try adding some notes with this tag!` }
      }

      console.log(`[Quiz] Found ${data.length} notes for tag "${tagToFind}"`)
      debugSourceCount = data.length
      contextContent = data.map(n => n.content).join("\n---\n")
    } 
    else if (mode === 'page' && value) {
      const { data } = await supabase.from('page_contents')
        .select('ai_summary, content')
        .eq('page_id', value)
        .single()
      
      // Prefer summary, fallback to raw content structure
      contextContent = data?.ai_summary || (data?.content ? JSON.stringify(data.content) : "")
      if (contextContent) debugSourceCount = 1
    } 
    else if (mode === 'text' && value) {
      contextContent = value
      debugSourceCount = 1
    }

    // Validation
    if (!contextContent || contextContent.length < 20) {
      return { error: "Not enough content to generate a quiz. Add more detailed notes." }
    }

    console.log(`[Quiz] Context constructed. Length: ${contextContent.length} chars from ${debugSourceCount} sources.`)

    // --- AI GENERATION ---
    // We append a small instruction to ensure variety if multiple notes are present
    const enhancedContext = `${contextContent}\n\n(System Instruction: The content above contains ${debugSourceCount} separate notes. Generate 5 flashcards that cover DIFFERENT notes if possible, not just the first one.)`
    
    const cards = await generateFlashcards(enhancedContext)
    
    if (!cards || cards.length === 0) {
      return { error: "AI couldn't extract valid questions. Try different content." }
    }

    return { success: true, cards }

  } catch (error) {
    console.error("Quiz Gen Error:", error)
    return { error: "Failed to generate quiz. Please try again." }
  }
}