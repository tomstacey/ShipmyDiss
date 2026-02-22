import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePlan } from "@/lib/ai/plan-generator";
import type { OnboardingData } from "@/app/onboarding/page";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const data: OnboardingData = await req.json();

    // Validate required fields
    if (!data.projectType || !data.title || !data.deadline || !data.methodology || !data.currentProgress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate the plan via Claude
    const plan = await generatePlan(data);

    // Save project to DB
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title: data.title,
        type: data.projectType,
        wordCount: data.wordCount,
        deadline: new Date(data.deadline),
        weeklyHoursAvailable: data.weeklyHours,
        methodology: data.methodology,
        currentProgress: data.currentProgress,
        currentPhase: plan.milestones[0]?.phase ?? "lit_review",
        blockedWeeks: data.blockedWeeks.filter(Boolean),
        otherDeadlines: data.otherDeadlines,
        ...(data.documentAnalysis
          ? {
              documentAnalysis: JSON.parse(JSON.stringify(data.documentAnalysis)),
              documentFileName: data.documentFileName,
              documentAnalysedAt: new Date(),
            }
          : {}),
      },
    });

    // Save milestones
    await prisma.milestone.createMany({
      data: plan.milestones.map((m) => ({
        projectId: project.id,
        title: m.title,
        description: m.description,
        phase: m.phase,
        targetDate: new Date(m.targetDate),
        estimatedHours: m.estimatedHours,
        deliverable: m.deliverable,
        order: m.order,
        status: m.order === 1 ? "in_progress" : "upcoming",
      })),
    });

    // Log AI interaction for transparency
    await prisma.aIInteractionLog.create({
      data: {
        projectId: project.id,
        interactionType: "plan_generation",
        userInput: JSON.stringify(data),
        aiOutput: JSON.stringify(plan),
      },
    });

    return NextResponse.json({
      projectId: project.id,
      summary: plan.summary,
      milestoneCount: plan.milestones.length,
    });
  } catch (err) {
    console.error("Plan generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate plan" },
      { status: 500 }
    );
  }
}
