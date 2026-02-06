'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding, generateChatResponse } from '@/utils/gemini'

export async function deleteNote(noteId: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    console.error('Error deleting note:', error)
    return
  }

  revalidatePath('/dashboard')
}

export async function searchNotes(query: string) {
  const supabase = await createClient()
  
  // 1. Convert query to vector
  const embedding = await generateEmbedding(query);

  // 2. Search via RPC
  const { data: notes, error } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    match_threshold: 0.45, // Sensitivity threshold
    match_count: 5
  });

  if (error) {
    console.error(error);
    return [];
  }

  return notes;
}

// NEW: Unified Search Action (Hybrid)
export async function searchBrain(query: string) {
  const supabase = await createClient()
  
  try {
    const embedding = await generateEmbedding(query)
    
    const { data, error } = await supabase.rpc('search_brain', {
      query_embedding: embedding,
      query_text: query,
      match_threshold: 0.5,
      match_count: 10
    })

    if (error) throw error
    return data || []

  } catch (error) {
    console.error("Search Brain Error:", error)
    return []
  }
}

export async function askBrain(question: string, history: { role: string, content: string }[] = []) {
  const supabase = await createClient()
  
  // 1. RAG: Find relevant context
  const embedding = await generateEmbedding(question);
  
  const { data: notes } = await supabase.rpc('search_brain', {
    query_embedding: embedding,
    query_text: question,
    match_threshold: 0.45,
    match_count: 5
  });

  const contextText = notes?.map((note: any) => {
    return `[${note.source_type.toUpperCase()}] ${note.title}: ${note.content_snippet}`
  }).join("\n") || "No relevant notes found.";

  const historyText = history.slice(-5).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n");

  // 2. AI: Generate Response & Action
  const aiResponse = await generateChatResponse(historyText, contextText, question);

  let savedNoteId: number | null = null;

  // 3. Action: Save Note
  if (aiResponse.action === 'save' && aiResponse.content) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Insert raw note first
      const { data: note, error } = await supabase.from('notes').insert({
        user_id: user.id,
        content: aiResponse.content,
        category: aiResponse.category || 'fact', 
        // We leave tags/embeddings empty for now, the client will trigger the enrichment
      })
      .select()
      .single()
      
      if (error) {
        console.error("Failed to auto-save note:", error)
      } else {
        savedNoteId = note.id; // Capture ID to return to client
        revalidatePath('/dashboard')
      }
    }
  }

  // Return rich response
  return { 
    reply: aiResponse.reply, 
    savedNoteId 
  };
}