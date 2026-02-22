import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { PLAN_GENERATION_SYSTEM_PROMPT } from "@/lib/ai/prompts";

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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { projectId, reason } = await req.json() as {
    projectId: string;
    reason?: string;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
      checkIns: { orderBy: { weekNumber: "desc" }, take: 1 },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const now = new Date();
  const deadline = new Date(project.deadline);
  const weeksRemaining = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );

  const completedMilestones = project.milestones.filter(
    (m) => m.status === "completed"
  );
  const remainingMilestones = project.milestones.filter(
    (m) => m.status !== "completed"
  );

  const client = getClient();

  const adjustPrompt = `You are adjusting an existing dissertation project plan. The student is behind schedule and needs a realistic re-plan.

PROJECT: ${project.title} (${project.type})
DEADLINE: ${deadline.toLocaleDateString("en-GB")} — ${weeksRemaining} weeks remaining
WEEKLY HOURS: ${project.weeklyHoursAvailable}h/week
TODAY: ${now.toISOString().split("T")[0]}

COMPLETED MILESTONES:
${completedMilestones.map((m) => `- ${m.title} ✓`).join("\n") || "None yet"}

REMAINING MILESTONES (need new dates):
${remainingMilestones
  .map(
    (m) =>
      `- [${m.id}] ${m.title} (was due: ${new Date(m.targetDate).toLocaleDateString("en-GB")}, est. ${m.estimatedHours ?? "?"}h)`
  )
  .join("\n")}

${reason ? `REASON FOR ADJUSTMENT: ${reason}` : ""}

Redistribute the remaining milestones across the available ${weeksRemaining} weeks. Keep the same milestone IDs and titles. Maintain phase order. Keep at least 1 week buffer before the final deadline.

Return ONLY valid JSON:
{
  "adjustedMilestones": [
    {
      "id": "existing milestone id",
      "targetDate": "YYYY-MM-DD",
      "status": "upcoming | in_progress",
      "note": "optional 1-sentence note about this change"
    }
  ],
  "summary": "2-3 sentences explaining what changed and what the student needs to do now"
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      { role: "system", content: PLAN_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: adjustPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const cleaned = raw.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  const result = JSON.parse(cleaned) as {
    adjustedMilestones: Array<{
      id: string;
      targetDate: string;
      status: string;
      note?: string;
    }>;
    summary: string;
  };

  // Apply updates to DB
  await Promise.all(
    result.adjustedMilestones.map((m) =>
      prisma.milestone.update({
        where: { id: m.id },
        data: {
          targetDate: new Date(m.targetDate),
          status: m.status as "upcoming" | "in_progress",
        },
      })
    )
  );

  // Log interaction
  await prisma.aIInteractionLog.create({
    data: {
      projectId,
      interactionType: "plan_adjustment",
      userInput: reason ?? "Manual plan adjustment requested",
      aiOutput: result.summary,
    },
  });

  return NextResponse.json({
    summary: result.summary,
    adjustedCount: result.adjustedMilestones.length,
  });
}
