import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateEmbedding, generateTags, analyzeFile, generateSummary } from '@/utils/gemini'
import { scrapeUrl } from '@/utils/scraper'

export async function POST(request: Request) {
  try {
    const { noteId } = await request.json()
    if (!noteId) return NextResponse.json({ error: 'Missing noteId' }, { status: 400 })

    const supabase = await createClient()

    // 1. Fetch Note
    const { data: note } = await supabase.from('notes').select('*').eq('id', noteId).single()
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    console.log(`🚀 Processing Note ${noteId} [Category: ${note.category}]`)

    // 2. Prepare Context (Read Files/Links)
    let rawContent = note.content || "";
    let extractedFileText = "";
    let linkMeta = null;

    // A. Handle Files (Read content if possible)
    if (note.file_path && note.file_type) {
      try {
        const fileRes = await fetch(note.file_path);
        const arrayBuffer = await fileRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        // Use AI to extract/describe file content
        extractedFileText = await analyzeFile(base64, note.file_type);
      } catch (err) {
        console.error("File processing failed:", err)
      }
    }

    // B. Handle Links (Scrape)
    const urlMatch = note.content.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      try {
        linkMeta = await scrapeUrl(urlMatch[0]);
      } catch (err) {
        console.error("Scraping failed:", err)
      }
    }

    // Combine for Tagging Context
    const fullContextForTagging = `${rawContent}\n${extractedFileText}\n${linkMeta?.title || ''} ${linkMeta?.description || ''}`;

    // 3. AI TAGGING (For ALL notes: Temp & Fact)
    const { data: userNotes } = await supabase.from('notes').select('tags').eq('user_id', note.user_id);
    const existingTags = Array.from(new Set(userNotes?.flatMap(n => n.tags || []) || [])).slice(0, 50) as string[];
    
    const newTags = await generateTags(fullContextForTagging, existingTags);
    const finalTags = Array.from(new Set([...(note.tags || []), ...newTags]));

    // 4. EMBEDDING & SUMMARY LOGIC (Strict Separation)
    let embedding = null;
    let aiSummary = null;

    if (note.category === 'fact') {
      // Only Facts get embeddings
      
      const hasRichContent = extractedFileText.length > 0 || (linkMeta !== null);
      
      if (hasRichContent) {
        // CASE: Fact with File/Link -> Summarize THEN Embed
        console.log("   - Fact has rich content: Generating Summary...");
        aiSummary = await generateSummary(fullContextForTagging);
        embedding = await generateEmbedding(aiSummary); // Embed the summary
      } else {
        // CASE: Fact Text Only -> Embed Raw Content
        console.log("   - Fact is text only: Embedding Raw Content...");
        // Ensure we don't exceed token limits for embedding models
        embedding = await generateEmbedding(rawContent.substring(0, 8000));
      }
    } else {
      console.log("   - Temporary Note: Skipping Embedding & Summary.");
    }

    // 5. Update DB
    await supabase.from('notes').update({
      tags: finalTags,
      link_meta: linkMeta,
      ai_summary: aiSummary,
      embedding: embedding
    }).eq('id', noteId);

    console.log(`✅ Note ${noteId} Processed. Tags: [${finalTags.length}]`)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Processing Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}