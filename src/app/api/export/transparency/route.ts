import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseInteraction, formatProjectForExport } from "@/lib/transparency-format";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Optional ?projectId=xxx — falls back to most recent project
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;

  const project = await prisma.project.findFirst({
    where: {
      userId: session.user.id,
      ...(projectId ? { id: projectId } : {}),
    },
    include: {
      aiInteractionLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!project) {
    return NextResponse.json({ error: "No project found" }, { status: 404 });
  }

  const interactions = project.aiInteractionLogs.map(parseInteraction);

  // Count by type
  const byType = {
    plan_generation: 0,
    checkin: 0,
    plan_adjustment: 0,
    document_analysis: 0,
  };
  for (const log of project.aiInteractionLogs) {
    const t = log.interactionType as keyof typeof byType;
    if (t in byType) byType[t]++;
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    project: formatProjectForExport(project),
    summary: {
      totalInteractions: interactions.length,
      byType,
    },
    interactions,
  });
}
