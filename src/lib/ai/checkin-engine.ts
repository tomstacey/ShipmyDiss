import OpenAI from "openai";
import { CHECKIN_SYSTEM_PROMPT } from "./prompts";

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

export type CheckInInput = {
  projectTitle: string;
  projectType: string;
  deadline: string;
  weeksRemaining: number;
  weekNumber: number;
  currentMilestone: string | null;
  completedTasks: string[];
  blockers: string;
  moodRating: number; // 1-5
  // Plan context
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  upcomingMilestone: string | null;
  previousCheckinSummary?: string | null;
};

export type CheckInResult = {
  aiResponse: string;
  suggestPlanAdjustment: boolean;
  adjustmentReason?: string;
};

export async function runCheckin(input: CheckInInput): Promise<CheckInResult> {
  const client = getClient();

  const progressPercent = input.totalMilestones > 0
    ? Math.round((input.completedMilestones / input.totalMilestones) * 100)
    : 0;

  const userMessage = `WEEKLY CHECK-IN — Week ${input.weekNumber}

PROJECT: ${input.projectTitle} (${input.projectType})
DEADLINE: ${input.deadline} (${input.weeksRemaining} weeks away)
OVERALL PROGRESS: ${input.completedMilestones}/${input.totalMilestones} milestones complete (${progressPercent}%)
OVERDUE MILESTONES: ${input.overdueMilestones}
CURRENT MILESTONE: ${input.currentMilestone ?? "None in progress"}
NEXT MILESTONE: ${input.upcomingMilestone ?? "None upcoming"}

THIS WEEK'S CHECK-IN:
Mood rating: ${input.moodRating}/5 (1=struggling, 5=great)
What they got done:
${input.completedTasks.length > 0 ? input.completedTasks.map(t => `- ${t}`).join("\n") : "- Nothing completed this week"}

Blockers / issues:
${input.blockers?.trim() || "None mentioned"}
${input.previousCheckinSummary ? `\nLAST WEEK'S SUMMARY: ${input.previousCheckinSummary}` : ""}

Please give a check-in response now. Respond in plain text only — no markdown, no bullet lists, just natural paragraphs. 150-250 words maximum.

Also include on the very last line (separated by a blank line) either:
ADJUST_PLAN: YES - [one sentence reason]
ADJUST_PLAN: NO`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      { role: "system", content: CHECKIN_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // Parse the ADJUST_PLAN line from the end
  const lines = raw.trim().split("\n");
  const adjustLine = lines.findLast((l) => l.startsWith("ADJUST_PLAN:"));
  const aiResponse = lines
    .filter((l) => !l.startsWith("ADJUST_PLAN:"))
    .join("\n")
    .trim();

  const suggestPlanAdjustment = adjustLine?.includes("YES") ?? false;
  const adjustmentReason = suggestPlanAdjustment
    ? adjustLine?.replace(/^ADJUST_PLAN:\s*YES\s*-?\s*/i, "").trim()
    : undefined;

  return { aiResponse, suggestPlanAdjustment, adjustmentReason };
}
