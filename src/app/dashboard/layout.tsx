import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/ui/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-lg font-bold text-white">
                shipmydiss
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/dashboard/plan">Plan</NavLink>
                <NavLink href="/dashboard/checkin">Check-in</NavLink>
                <NavLink href="/dashboard/settings">Settings</NavLink>
                <NavLink href="/dashboard/transparency">Transparency</NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-md"
    >
      {children}
    </Link>
  );
}
