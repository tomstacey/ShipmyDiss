// Debug endpoint — remove before going public
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_port: process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || "?",
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    await prisma.$queryRawUnsafe("SELECT 1 as ok");
    const userCount = await prisma.user.count();
    checks.db = { connected: true, users: userCount };
  } catch (e: unknown) {
    checks.db = { connected: false, error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(checks, { status: 200 });
}
