'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function generateBrainstorm() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch Recent Facts (Limit 10)
  const { data: facts } = await supabase
    .from('notes')
    .select('content, tags, created_at')
    .eq('category', 'fact')
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Fetch Recent Knowledge Summaries (Limit 5)
  // We join 'pages' to get the title
  const { data: pages } = await supabase
    .from('page_contents')
    .select(`
      ai_summary,
      pages!inner(title, created_at)
    `)
    .order('updated_at', { ascending: false })
    .limit(5)

  // 3. Construct the Context
  let context = "Here is the recent information the user has stored:\n\n"

  if (facts && facts.length > 0) {
    context += "--- RECENT FACTS ---\n"
    facts.forEach(f => {
      context += `- [${new Date(f.created_at).toLocaleDateString()}] ${f.content} (Tags: ${f.tags?.join(', ')})\n`
    })
  }

  if (pages && pages.length > 0) {
    context += "\n--- KNOWLEDGE DOCUMENTS (SUMMARIES) ---\n"
    pages.forEach((p: any) => {
      if (p.ai_summary) {
        context += `- Title: ${p.pages.title}\n  Summary: ${p.ai_summary}\n`
      }
    })
  }

  if ((!facts || facts.length === 0) && (!pages || pages.length === 0)) {
    return { result: "Your brain is empty! Add some notes or pages to generate a brainstorm session." }
  }

  // 4. Call Gemini
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })
    
    const prompt = `
      You are the user's "Second Brain" AI. Your goal is to help them synthesize and remember their recent inputs.
      
      Tasks:
      1. Identify the core themes connecting these disparate notes.
      2. Highlight any contradictions or interesting relationships between the Facts and the Knowledge Documents.
      3. Write a concise "Executive Summary" (max 300 words) that reinforces these learnings.
      4. Format the output in clean Markdown (use bolding for key terms).

      ${context}
    `

    const result = await model.generateContent(prompt)
    return { result: result.response.text() }

  } catch (error) {
    console.error("Brainstorm Error:", error)
    return { error: "Failed to generate brainstorm. Try again later." }
  }
}