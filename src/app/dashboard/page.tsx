import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-2xl font-bold mb-2">No projects yet</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Let&apos;s set up your dissertation or assignment and create a personalised plan.
        </p>
        <Link
          href="/onboarding"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Create your first project
        </Link>
      </div>
    );
  }

  const project = projects[0];
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const now = new Date();
  const deadline = new Date(project.deadline);
  const weeksRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));

  const currentMilestone = project.milestones.find(
    (m) => m.status === "in_progress" || m.status === "upcoming"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {weeksRemaining} weeks until deadline
          </p>
        </div>
        <Link
          href="/dashboard/plan"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg transition-colors"
        >
          View full plan
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Progress</p>
          <p className="text-2xl font-bold">{progress}%</p>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Milestones</p>
          <p className="text-2xl font-bold">
            {completedMilestones}/{totalMilestones}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Weeks left</p>
          <p className="text-2xl font-bold">{weeksRemaining}</p>
        </div>
      </div>

      {currentMilestone && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <p className="text-sm text-purple-400 font-medium mb-2">This week&apos;s focus</p>
          <h2 className="text-lg font-semibold mb-1">{currentMilestone.title}</h2>
          {currentMilestone.description && (
            <p className="text-gray-400 text-sm">{currentMilestone.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-3">
            Due: {new Date(currentMilestone.targetDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/dashboard/checkin"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Weekly check-in
        </Link>
        <Link
          href="/onboarding"
          className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
        >
          New project
        </Link>
      </div>
    </div>
  );
}
