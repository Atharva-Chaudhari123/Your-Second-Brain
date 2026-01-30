import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  
  return embedding.values; // Returns the array of numbers [0.12, -0.34, ...]
}
// 2. NEW: Text Generation Function (The "Chat" part)
export async function generateAnswer(prompt: string) {

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}


// NEW: Tag Generation
export async function generateTags(content: string, existingTags: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  
  const prompt = `
You are a semantic tagging engine for a Second Brain knowledge system.

Your job is to analyze the note and assign 1–5 highly relevant semantic tags that maximize future retrieval accuracy.

STRICT OUTPUT RULES:
- Return ONLY a comma-separated list
- No explanations
- No extra text
- No quotes
- No numbering
- No hashtags
- No punctuation except hyphen for kebab-case
- Each tag must be ONE WORD ONLY (single token or kebab-case)
- Tags must be lowercase
- No duplicate tags
- No generic tags like: note, text, info, idea, content

TAG SELECTION RULES:
1. EXISTING TAGS (highest priority): [${existingTags.join(', ')}]
2. Strongly prefer choosing from the existing tag list when relevant
3. Only create a new tag if NONE of the existing tags match the concept
4. Never create a synonym if an equivalent existing tag already exists
5. Choose tags based on MEANING — not exact wording
6. Tags should represent:
   - main topic
   - domain
   - method or concept
   - intent or use-case when clear

SEMANTIC RULES:
- Extract the core subject matter
- Infer obvious context when confidence is high
- Avoid overly broad tags if a specific one exists
- Avoid overly niche tags if a broader known tag exists in the list
- Prefer stable vocabulary over trendy wording
- Convert multi-word concepts into kebab-case

GOOD TAG EXAMPLES:
machine-learning
productivity
javascript
memory
planning
api
debugging

BAD TAG EXAMPLES:
how-to-study
very-important
random-thought
my-note
things

Analyze this note now.

NOTE:
"""${content}"""
`;

  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean up: "Coding, React, Js" -> ["coding", "react", "js"]
  return text.split(',').map(tag => tag.trim().toLowerCase());
}