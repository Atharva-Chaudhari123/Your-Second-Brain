import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const textModelName = "gemini-3-flash-preview";
const embeddingModelName = "gemini-embedding-001";

// 1. Generate Embeddings (Vector)
export async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: embeddingModelName });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// 2. Generate Tags (Classification)
export async function generateTags(content: string, existingTags: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: textModelName });
  
  const prompt = `
    Analyze the note below and assign 3-5 tags.
    RULES:
    1. Prefer existing tags: [${existingTags.join(', ')}]
    2. Tags should be lowercase, single words (or kebab-case).
    3. Return ONLY a comma-separated list.
    
    NOTE: "${content.substring(0, 1000)}"
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.split(',').map(tag => tag.trim().toLowerCase());
  } catch (e) {
    return [];
  }
}

// 3. Analyze File (Vision/PDF)
export async function analyzeFile(fileBase64: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: textModelName });
  
  let prompt = "Analyze this file content.";
  if (mimeType.startsWith("image/")) {
    prompt = "Describe this image in detail. Transcribe any text you see exactly.";
  } else if (mimeType === "application/pdf") {
    prompt = "Read this PDF document. Summarize the key information, main topics, and any important data points.";
  }

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: fileBase64, mimeType } }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini File Analysis Error:", error);
    return "";
  }
}

// 4. Generate Summary (For Fact Store Files/Links & Knowledge Pages)
export async function generateSummary(content: string) {
  const model = genAI.getGenerativeModel({ model: textModelName });
  const prompt = `
    Summarize the following content into a concise paragraph (max 200 words) that captures the core facts and insights.
    CONTENT: "${content.substring(0, 8000)}"
  `;
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return content.substring(0, 200); // Fallback
  }
}

// 5. Generate Flashcards (For Flashcard Page)
export async function generateFlashcards(content: string) {
  const model = genAI.getGenerativeModel({ 
    model: textModelName,
    generationConfig: { responseMimeType: "application/json" } // Force JSON output
  });

  const prompt = `
    You are a professional tutor. Analyze the provided content and extract 3-5 high-quality flashcards for Spaced Repetition.

    Rules:
    1. If content is too short/irrelevant, return empty array.
    2. Output MUST be a JSON array of objects with keys: "front" and "back".
    
    CONTENT:
    ${content.substring(0, 10000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    return [];
  }
}

// 6. Generate Chat Answer (Legacy - keeping for fallback)
export async function generateAnswer(prompt: string) {
  const model = genAI.getGenerativeModel({ model: textModelName });
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "I couldn't process that request right now.";
  }
}

// 7. NEW: Smart Chat Agent (Session Aware + Actions)
export async function generateChatResponse(history: string, context: string, question: string) {
  const model = genAI.getGenerativeModel({ 
    model: textModelName,
    generationConfig: { responseMimeType: "application/json" } // Force JSON for structured actions
  });

  const prompt = `
    You are the user's "Second Brain" assistant.
    
    GOAL:
    Answer the user's question or perform an action (like saving a note) based on the conversation history and context provided.

    CONTEXT FROM DATABASE (RAG):
    ${context}

    CONVERSATION HISTORY:
    ${history}

    CURRENT USER INPUT:
    "${question}"

    INSTRUCTIONS:
    1. If the user explicitly asks to SAVE, REMEMBER, or ADD a note, or if the input is clearly a task/fact they want to store:
       - Set "action" to "save".
       - Determine "category": "temporary" (for tasks, reminders, grocery lists) or "fact" (for knowledge, ideas, links).
       - Extract the "content" cleanly.
       - Provide a "reply" confirming the action.
    2. Otherwise, just chat:
       - Set "action" to "chat".
       - Provide a helpful "reply" based on the Context and History.
    
    OUTPUT FORMAT (JSON):
    {
      "action": "chat" | "save",
      "category": "temporary" | "fact" | null,
      "content": "extracted content to save" | null,
      "reply": "your response to the user"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return { action: "chat", reply: "I'm having trouble processing that right now." };
  }
}