import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubscriptionEditor } from "./subscription-editor";
import { DeleteUserButton } from "./delete-user-button";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          _count: { select: { milestones: true, checkIns: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const joinedDate = user.createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link
        href="/admin"
        className="text-sm text-gray-400 hover:text-white transition-colors mb-6 inline-block"
      >
        ← All users
      </Link>

      {/* User info card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h1 className="text-lg font-bold text-white mb-4">User</h1>
        <div className="grid sm:grid-cols-2 gap-3 text-sm mb-6">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Email</p>
            <p className="text-white">{user.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Name</p>
            <p className="text-white">{user.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Joined</p>
            <p className="text-white">{joinedDate}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Stripe customer</p>
            <p className="text-white font-mono text-xs">
              {user.stripeCustomerId ?? "—"}
            </p>
          </div>
        </div>

        {/* Subscription editor */}
        <div className="border-t border-gray-800 pt-5">
          <p className="text-sm font-medium text-gray-300 mb-3">Subscription status</p>
          <SubscriptionEditor userId={user.id} current={user.subscriptionStatus ?? "free"} />
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          Projects ({user.projects.length})
        </h2>
        {user.projects.length === 0 ? (
          <p className="text-sm text-gray-500">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {user.projects.map((project) => {
              const deadline = project.deadline.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div
                  key={project.id}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="text-white font-medium">{project.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {project.type} · {project.wordCount.toLocaleString()} words · due {deadline}
                    </p>
                  </div>
                  <div className="text-right shrink-0 text-xs text-gray-500">
                    <p>{project._count.milestones} milestones</p>
                    <p>{project._count.checkIns} check-ins</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-400 mb-1">
          Danger zone
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently deletes this user and all their data — projects, milestones, check-ins,
          and AI logs. This cannot be undone.
        </p>
        <DeleteUserButton userId={user.id} userEmail={user.email ?? "this user"} />
      </div>
    </div>
  );
}
