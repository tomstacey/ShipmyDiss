import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runCheckin } from "@/lib/ai/checkin-engine";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, completedTasks, blockers, moodRating } = body as {
    projectId: string;
    completedTasks: string[];
    blockers: string;
    moodRating: number;
  };

  if (!projectId || moodRating == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch project with milestones and previous check-ins
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
      checkIns: { orderBy: { weekNumber: "desc" }, take: 2 },
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

  const weekNumber = (project.checkIns[0]?.weekNumber ?? 0) + 1;

  const completedMilestones = project.milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const overdueMilestones = project.milestones.filter(
    (m) => m.status === "overdue" || (m.status !== "completed" && new Date(m.targetDate) < now)
  ).length;

  const currentMilestone = project.milestones.find(
    (m) => m.status === "in_progress"
  );
  const upcomingMilestone = project.milestones.find(
    (m) => m.status === "upcoming"
  );

  const previousCheckin = project.checkIns[0];

  // Run AI check-in
  const checkinResult = await runCheckin({
    projectTitle: project.title,
    projectType: project.type,
    deadline: deadline.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    weeksRemaining,
    weekNumber,
    currentMilestone: currentMilestone?.title ?? null,
    completedTasks: completedTasks ?? [],
    blockers: blockers ?? "",
    moodRating,
    totalMilestones: project.milestones.length,
    completedMilestones,
    overdueMilestones,
    upcomingMilestone: upcomingMilestone?.title ?? null,
    previousCheckinSummary: previousCheckin?.aiResponse
      ? previousCheckin.aiResponse.slice(0, 200)
      : null,
  });

  // Save check-in to DB
  const checkIn = await prisma.checkIn.create({
    data: {
      projectId,
      weekNumber,
      status: "completed",
      completedTasks: completedTasks ?? [],
      blockers: blockers ?? "",
      moodRating,
      aiResponse: checkinResult.aiResponse,
      planAdjustments: checkinResult.suggestPlanAdjustment
        ? { suggested: true, reason: checkinResult.adjustmentReason }
        : null,
    },
  });

  // Log AI interaction
  await prisma.aIInteractionLog.create({
    data: {
      projectId,
      interactionType: "checkin",
      userInput: JSON.stringify({ completedTasks, blockers, moodRating }),
      aiOutput: checkinResult.aiResponse,
    },
  });

  // Auto-update milestone statuses based on dates
  const milestonesToUpdate = project.milestones.filter(
    (m) =>
      m.status !== "completed" &&
      m.status !== "adjusted" &&
      new Date(m.targetDate) < now
  );

  if (milestonesToUpdate.length > 0) {
    await prisma.milestone.updateMany({
      where: { id: { in: milestonesToUpdate.map((m) => m.id) } },
      data: { status: "overdue" },
    });
  }

  return NextResponse.json({
    checkInId: checkIn.id,
    weekNumber,
    aiResponse: checkinResult.aiResponse,
    suggestPlanAdjustment: checkinResult.suggestPlanAdjustment,
    adjustmentReason: checkinResult.adjustmentReason,
  });
}
