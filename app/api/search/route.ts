import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateEmbedding } from '@/utils/gemini'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) return NextResponse.json([])

  const supabase = await createClient()

  try {
    const embedding = await generateEmbedding(query)
    
    const { data, error } = await supabase.rpc('search_brain', {
      query_embedding: embedding,
      query_text: query,
      match_threshold: 0.45,
      match_count: 8
    })

    if (error) throw error
    return NextResponse.json(data)

  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}