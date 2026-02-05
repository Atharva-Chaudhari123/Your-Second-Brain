'use server'

import { createClient } from '@/utils/supabase/server'
import { generateSummary, generateEmbedding } from '@/utils/gemini'
import { revalidatePath } from 'next/cache'

// 1. Save Page Content (Auto-save)
export async function savePageContent(pageId: string, title: string, content: any) {
  const supabase = await createClient()
  
  // Update Metadata (Title)
  const { error: metaError } = await supabase
    .from('pages')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', pageId)

  if (metaError) throw metaError

  // Update Body Content
  const { error: contentError } = await supabase
    .from('page_contents')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('page_id', pageId)

  if (contentError) throw contentError
  
  // We don't revalidatePath here to avoid jarring UI refreshes during typing
}

// 2. Map to Mind (The AI Trigger)
export async function mapToMind(pageId: string, plainTextContent: string) {
  const supabase = await createClient()

  try {
    // A. Generate Summary
    // We send the plain text to Gemini to get a concise summary
    const summary = await generateSummary(plainTextContent)

    // B. Generate Embedding of the SUMMARY (Not the full text)
    // This is the key "Second Brain" optimization
    const embedding = await generateEmbedding(summary)

    // C. Save to DB
    const { error } = await supabase
      .from('page_contents')
      .update({
        ai_summary: summary,
        summary_embedding: embedding,
        updated_at: new Date().toISOString()
      })
      .eq('page_id', pageId)

    if (error) throw error

    revalidatePath(`/dashboard/Knowledge-Store/${pageId}`)
    return { success: true, summary }

  } catch (error) {
    console.error("Map to Mind Error:", error)
    return { success: false, error: 'Failed to map to mind' }
  }
}