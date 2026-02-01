'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding, generateTags, analyzeFile } from '@/utils/gemini' // <--- Import analyzeFile
import { scrapeUrl } from '@/utils/scraper'

// Helper: Get all unique tags
async function getExistingTags(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from('notes').select('tags').eq('user_id', userId);
  if (!data) return [];
  const allTags = data.flatMap((note: any) => note.tags || []);
  return Array.from(new Set(allTags)).slice(0, 50) as string[];
}

// Helper: Extract URL
function extractUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
}

export async function addNote(formData: FormData) {
  const supabase = await createClient()
  
  const content = formData.get('content') as string
  const manualTagsString = formData.get('manualTags') as string
  const file = formData.get('file') as File | null;

  if ((!content || content.trim().length === 0) && (!file || file.size === 0)) return null;

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null;

  try {
    // 1. FAST UPLOAD (Only blocking part, but necessary for images)
    let filePath = null;
    let fileType = null;

    if (file && file.size > 0) {
      if (file.size > 15 * 1024 * 1024) throw new Error("File too large");
      
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}-${safeName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
      filePath = publicUrl;
      fileType = file.type;
    }

    // 2. FAST INSERT (No AI yet)
    // Parse manual tags immediately so they show up instantly
    const manualTags = manualTagsString 
      ? manualTagsString.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) 
      : [];

    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({ 
        content, 
        tags: manualTags, // Only manual tags for now
        file_path: filePath,
        file_type: fileType,
        user_id: user.id 
        // link_meta and embedding remain NULL for now
      })
      .select() // Return the new note so we get the ID
      .single()

    if (error) throw error;

    // 3. Update UI Instantly
    revalidatePath('/dashboard')

    // 4. Return the ID so the Client can trigger the background job
    return { success: true, noteId: newNote.id };

  } catch (error) {
    console.error('Error in addNote:', error)
    return { success: false, error: 'Failed to save note' };
  }
}
// ... Keep your searchNotes, askBrain, deleteNote functions as they were ...
export async function deleteNote(noteId: number) {
  const supabase = await createClient()
  await supabase.from('notes').delete().eq('id', noteId)
  revalidatePath('/dashboard')
}

export async function searchNotes(query: string) {
  // ... (Your existing search logic)
  const supabase = await createClient()
  const embedding = await generateEmbedding(query);
  const { data: notes } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    match_threshold: 0.45,
    match_count: 5
  });
  return notes;
}

export async function askBrain(question: string) {
  // ... (Your existing chat logic, make sure to import generateAnswer)
  const supabase = await createClient()
  // ... (rest of function)
  return "Chat logic goes here"; // Placeholder if you haven't copied it yet
}