'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding, generateAnswer } from '@/utils/gemini'

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

export async function askBrain(question: string) {
  const supabase = await createClient()
  
  // 1. Get embedding for the question
  const embedding = await generateEmbedding(question);
  
  // 2. Find relevant notes (Using existing match_notes for now)
  const { data: notes } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    match_threshold: 0.45,
    match_count: 5
  });

  // 3. Build Context
  const contextText = notes?.map((note: any) => {
    return `Content: ${note.content}\nTags: [${note.tags?.join(', ')}]`
  }).join("\n---\n") || "No relevant notes found.";

  // 4. Create Prompt
  const prompt = `
    You are a Second Brain assistant. Answer the user's question using ONLY the context provided below.
    If the answer is not in the context, say "I don't have that information in my memory."
    Do not make things up.

    USER QUESTION: 
    ${question}

    YOUR KNOWLEDGE BASE (CONTEXT):
    ${contextText}
  `;

  // 5. Generate Answer
  const answer = await generateAnswer(prompt);

  return answer;
}