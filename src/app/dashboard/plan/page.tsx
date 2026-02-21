import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MilestoneTimeline } from "@/components/dashboard/milestone-timeline";
import Link from "next/link";

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const project = await prisma.project.findFirst({
    where: { userId: session.user.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">No project yet.</p>
        <Link href="/onboarding" className="text-purple-400 hover:text-purple-300">
          Create your first project →
        </Link>
      </div>
    );
  }

  const deadline = new Date(project.deadline);
  const now = new Date();
  const weeksRemaining = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const completedCount = project.milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const progress =
    project.milestones.length > 0
      ? Math.round((completedCount / project.milestones.length) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {project.wordCount.toLocaleString()} words ·{" "}
            {deadline.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {weeksRemaining} weeks left
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{progress}%</div>
          <div className="text-xs text-gray-500">complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <MilestoneTimeline milestones={project.milestones} deadline={project.deadline} />
    </div>
  );
}
