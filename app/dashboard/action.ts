'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateEmbedding, generateAnswer, generateTags } from '@/utils/gemini' // Ensure generateTags is imported
import { scrapeUrl, LinkMetadata } from '@/utils/scraper'
// Helper: Get all unique tags the user has ever used (for AI Context)
async function getExistingTags(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('notes')
    .select('tags')
    .eq('user_id', userId);

  if (!data) return [];

  // Flatten [[a,b], [b,c]] -> [a,b,c] and remove duplicates
  const allTags = data.flatMap((note: any) => note.tags || []);
  const uniqueTags = Array.from(new Set(allTags)) as string[];
  
  // Return top 50 to save token space
  return uniqueTags.slice(0, 50);
}
// Helper regex to extract the FIRST URL found in text
function extractUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
}
export async function searchNotes(query: string) {
  const supabase = await createClient()
  const embedding = await generateEmbedding(query);

  const { data: notes, error } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    match_threshold: 0.45,
    match_count: 5
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
  const manualTagsString = formData.get('manualTags') as string

  if (!content) return;

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;

  try {
    const manualTags = manualTagsString
      ? manualTagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
      : [];
    
    const existingTags = await getExistingTags(supabase, user.id);
    const url = extractUrl(content);

    // --- PREPARE PROMISES ---
    // We construct a content string for the AI that includes the scraped title
    // so the AI knows "https://youtu.be/..." is actually "React Tutorial"
    let contentForAI = content;
    let linkMeta: LinkMetadata | null = null;

    // 1. If URL exists, start scraping
    const linkPromise = url ? scrapeUrl(url) : Promise.resolve(null);

    // 2. Wait for Scraper FIRST (so we can give the title to the AI)
    linkMeta = await linkPromise;

    if (linkMeta && linkMeta.title) {
      contentForAI = `${content}\n\n(Context: This is a link about "${linkMeta.title}: ${linkMeta.description}")`;
    }

    // 3. Now run AI on the ENRICHED content
    const [embedding, aiTags] = await Promise.all([
      generateEmbedding(contentForAI),
      generateTags(contentForAI, existingTags)
    ]);

    const finalTags = Array.from(new Set([...manualTags, ...aiTags]));

    // 4. Save everything (including new link_meta)
    const { error } = await supabase
      .from('notes')
      .insert({ 
        content,
        embedding,
        tags: finalTags,
        link_meta: linkMeta, // <--- SAVING THE RICH DATA
        user_id: user.id 
      })

    if (error) throw error;
    revalidatePath('/dashboard')
    
  } catch (error) {
    console.error('Error saving note:', error)
  }
}

export async function askBrain(question: string) {
  const supabase = await createClient()

  const embedding = await generateEmbedding(question);
  
  const { data: notes } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    match_threshold: 0.45,
    match_count: 5
  });

  // NEW: Include Tags in the context so the AI understands categories
  interface Note {
    content: string;
    tags?: string[]; // Add tags to interface
    [key: string]: unknown;
  }

  const contextText: string = (notes as Note[] | null)?.map(note => {
    return `Content: ${note.content}\nTags: [${note.tags?.join(', ') || ''}]`
  }).join("\n---\n") || "No relevant notes found.";

  const prompt = `
    You are a Second Brain assistant. You answer questions based ONLY on the context provided below.
    If the answer is not in the context, say "I don't have that information in my memory."
    Do not make things up.

    USER QUESTION: 
    ${question}

    YOUR KNOWLEDGE BASE (CONTEXT):
    ${contextText}
  `;

  const answer = await generateAnswer(prompt);

  return answer;
}


export async function deleteNote(noteId: number) {
  const supabase = await createClient()
  
  // 1. Delete the note
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    console.error('Error deleting note:', error)
    return
  }

  // 2. Refresh the UI
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/mind-map')
}