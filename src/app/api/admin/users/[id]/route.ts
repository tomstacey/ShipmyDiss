import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";

const VALID_STATUSES = ["free", "active", "cancelled", "past_due"];

/** PATCH /api/admin/users/[id] — update subscriptionStatus */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const { subscriptionStatus } = await req.json();

  if (!subscriptionStatus || !VALID_STATUSES.includes(subscriptionStatus)) {
    return NextResponse.json({ error: "Invalid subscriptionStatus" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { subscriptionStatus },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

/** DELETE /api/admin/users/[id] — delete user and all their data (cascade) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
