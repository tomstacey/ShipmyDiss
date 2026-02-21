import OpenAI from "openai";
import { PLAN_GENERATION_SYSTEM_PROMPT } from "./prompts";
import type { OnboardingData } from "@/app/onboarding/page";

// Lazy-initialised so the key is only required at runtime, not build time
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

// Default model — claude-sonnet via OpenRouter. Override with OPENROUTER_MODEL env var.
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

export type GeneratedMilestone = {
  title: string;
  description: string;
  phase: string;
  targetDate: string;
  estimatedHours: number;
  deliverable: string;
  order: number;
};

export type GeneratedPlan = {
  milestones: GeneratedMilestone[];
  summary: string;
  weeksAvailable: number;
  totalEstimatedHours: number;
  bufferWeeks: number;
};

export async function generatePlan(data: OnboardingData): Promise<GeneratedPlan> {
  const client = getClient();
  const today = new Date().toISOString().split("T")[0];
  const deadlineDate = new Date(data.deadline);
  const todayDate = new Date();
  const weeksUntilDeadline = Math.floor(
    (deadlineDate.getTime() - todayDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const userMessage = `Generate a project plan for the following dissertation/assignment:

PROJECT DETAILS:
- Type: ${data.projectType}
- Title/Topic: ${data.title}
- Word count: ${data.wordCount} words
- Submission deadline: ${data.deadline}
- Weeks until deadline: ${weeksUntilDeadline}
- Weekly hours available: ${data.weeklyHours} hours/week
- Methodology: ${data.methodology}
- Current progress: ${data.currentProgress}
- Today's date: ${today}
${
  data.blockedWeeks.filter(Boolean).length > 0
    ? `- Blocked weeks (cannot work): ${data.blockedWeeks.filter(Boolean).join(", ")}`
    : ""
}

Total available hours (approx): ${weeksUntilDeadline * data.weeklyHours} hours

Generate the plan now. Return ONLY the JSON object.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      { role: "system", content: PLAN_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // Strip any markdown code fences if present
  const cleaned = raw.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  const plan = JSON.parse(cleaned) as GeneratedPlan;
  return plan;
}
