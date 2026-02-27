import { prisma } from "@/lib/db";
import Link from "next/link";
import { AddUserForm } from "./add-user-form";

function SubscriptionBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    free: "bg-gray-700/50 text-gray-400 border-gray-600/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    past_due: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const s = status ?? "free";
  const style = styles[s] ?? styles.free;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style}`}>
      {s.replace("_", " ")}
    </span>
  );
}

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <AddUserForm />
      </div>

      {/* Users table */}
      {users.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No users yet.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3 hidden sm:table-cell">
                  Joined
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">
                  Subscription
                </th>
                <th className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3 hidden md:table-cell">
                  Projects
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium truncate max-w-[240px]">
                        {user.email ?? "—"}
                      </p>
                      {user.name && (
                        <p className="text-xs text-gray-500 mt-0.5">{user.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 hidden sm:table-cell whitespace-nowrap">
                    {user.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <SubscriptionBadge status={user.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-right hidden md:table-cell">
                    {user._count.projects}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
