import OpenAI from "openai";
import { DOCUMENT_ANALYSIS_SYSTEM_PROMPT } from "./prompts";
import type { DocumentAnalysis } from "@/types";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "missing",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "Ship My Dissertation",
    },
  });
}

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

export async function analyseDocument(
  text: string,
  context: { projectType?: string; title?: string }
): Promise<DocumentAnalysis> {
  const client = getClient();

  const userMessage = `Analyse this academic document and extract structured information.

${context.projectType ? `PROJECT TYPE: ${context.projectType}` : ""}
${context.title ? `PROJECT TITLE: ${context.title}` : ""}

--- DOCUMENT TEXT ---
${text}
--- END DOCUMENT ---

Return ONLY the JSON object. No markdown fences, no explanation.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      { role: "system", content: DOCUMENT_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const cleaned = raw.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  const analysis = JSON.parse(cleaned) as DocumentAnalysis;

  // Validate the response has the expected shape
  if (!analysis.rawSummary || !Array.isArray(analysis.assessmentCriteria)) {
    throw new Error("AI returned invalid analysis structure");
  }

  return analysis;
}
