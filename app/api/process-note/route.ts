import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateEmbedding, generateTags, analyzeFile } from '@/utils/gemini'
import { scrapeUrl } from '@/utils/scraper'

// This route runs in the background
export async function POST(request: Request) {
  try {
    const { noteId } = await request.json()
    if (!noteId) return NextResponse.json({ error: 'Missing noteId' }, { status: 400 })

    const supabase = await createClient()

    // 1. Fetch the "Raw" Note from DB
    const { data: note } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

    console.log(`🚀 Background Processing Started for Note ${noteId}`)

    // 2. Prepare Context (Text + File + Link)
    let fullContext = note.content || "";
    let linkMeta = null;

    // A. Process File (Download from Supabase Storage -> Send to Gemini)
    if (note.file_path && note.file_type) {
      try {
        console.log("   - Downloading file for analysis...")
        // Fetch the file from the public URL
        const fileRes = await fetch(note.file_path);
        const arrayBuffer = await fileRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        const analysis = await analyzeFile(base64, note.file_type);
        fullContext += `\n\n[File Analysis]: ${analysis}`;
      } catch (err) {
        console.error("   - File analysis failed:", err)
      }
    }

    // B. Process Link (Scrape URL)
    const urlMatch = note.content.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      try {
        console.log("   - Scraping link...")
        linkMeta = await scrapeUrl(urlMatch[0]);
        if (linkMeta?.title) {
          fullContext += `\n\n[Link Context]: ${linkMeta.title} - ${linkMeta.description}`;
        }
      } catch (err) {
        console.error("   - Scraping failed:", err)
      }
    }

    // 3. Generate AI Metadata (Tags + Embeddings)
    // We fetch existing tags to maintain consistency
    const { data: userNotes } = await supabase.from('notes').select('tags').eq('user_id', note.user_id);
    const existingTags = Array.from(new Set(userNotes?.flatMap(n => n.tags || []) || [])).slice(0, 50) as string[];

    console.log("   - Generating AI Metadata...")
    const [embedding, aiTags] = await Promise.all([
      generateEmbedding(fullContext),
      generateTags(fullContext, existingTags)
    ]);

    // 4. Update the Note in DB
    // Merge manual tags (if any were saved initially) with AI tags
    console.log(aiTags) ;
    const currentTags = note.tags || [];
    const finalTags = Array.from(new Set([...currentTags, ...aiTags]));

    const { error
        
    } = await supabase
      .from('notes')
      .update({
        embedding,
        tags: finalTags,
        link_meta: linkMeta,
        // We could add a 'status' column here if you wanted to track 'processing' vs 'done'
      })
      .eq('id', noteId);

    if (error) throw error;

    console.log(`✅ Note ${noteId} Enriched Successfully!`)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Processing Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}