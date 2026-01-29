import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  
  return embedding.values; // Returns the array of numbers [0.12, -0.34, ...]
}