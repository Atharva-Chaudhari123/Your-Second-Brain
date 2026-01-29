'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding } from '@/utils/gemini' // Import our new AI helper

// ... existing imports
// Add this new function to your existing actions.ts file

export async function searchNotes(query: string) {
  const supabase = await createClient()
  
  // 1. Generate an embedding for the *Search Query*
  // If the user searches "cooking", we turn "cooking" into numbers.
  const embedding = await generateEmbedding(query);

  // 2. Call the RPC function (Remote Procedure Call) we wrote in SQL
  // This uses Cosine Similarity to find the closest matches.
  const { data: notes, error } = await supabase.rpc('match_notes', {
    query_embedding: embedding, // The vector we just made
    match_threshold: 0.45,       // Similarity score (0 to 1). 0.5 is a good baseline.
    match_count: 5              // Only return top 5 matches
  });

  if (error) {
    console.error(error);
    return [];
  }

  return notes;
}


export async function addNote(formData: FormData) {
  const supabase = await createClient()
  const content = formData.get('content') as string

  // 1. Validation
  if (!content || content.trim().length === 0) return;

  // 2. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;

  try {
    // 3. GENERATE EMBEDDING (The "Brain" part)
    // This converts the user's text into a vector
    const embedding = await generateEmbedding(content);

    // 4. Save Text + Vector to Supabase
    const { error } = await supabase
      .from('notes')
      .insert({ 
        content,
        embedding, // Now we are saving the 'meaning' too!
        user_id: user.id 
      })

    if (error) throw error;

    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('Error saving note:', error)
    // In a real app, you might want to return this error to the UI
  }
}