import Anthropic from "@anthropic-ai/sdk";
import { PLAN_GENERATION_SYSTEM_PROMPT } from "./prompts";
import type { OnboardingData } from "@/app/onboarding/page";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: PLAN_GENERATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  // Strip any markdown code fences if present
  const raw = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  const plan = JSON.parse(raw) as GeneratedPlan;
  return plan;
}
