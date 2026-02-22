import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check env vars exist (not values)
  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_port: process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || "?",
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test DB connection
  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 as ok");
    checks.db = { connected: true, result };
  } catch (e: unknown) {
    checks.db = { connected: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Test tables exist
  try {
    const userCount = await prisma.user.count();
    const tokenCount = await prisma.verificationToken.count();
    checks.tables = { users: userCount, verificationTokens: tokenCount };
  } catch (e: unknown) {
    checks.tables = { error: e instanceof Error ? e.message : String(e) };
  }

  // Test creating and deleting a verification token (what NextAuth does)
  try {
    const token = await prisma.verificationToken.create({
      data: {
        identifier: "debug-test@example.com",
        token: "debug-test-token-" + Date.now(),
        expires: new Date(Date.now() + 60000),
      },
    });
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    });
    checks.tokenCRUD = "OK — create + delete worked";
  } catch (e: unknown) {
    checks.tokenCRUD = { error: e instanceof Error ? e.message : String(e) };
  }

  // Show what magic link URL would look like based on env
  const baseUrl = process.env.NEXTAUTH_URL || "NOT SET";
  const sampleUrl = baseUrl !== "NOT SET"
    ? `${baseUrl}/api/auth/callback/nodemailer?callbackUrl=${encodeURIComponent(baseUrl + "/dashboard")}&token=SAMPLE_TOKEN&email=user%40example.com`
    : "NEXTAUTH_URL not set";
  checks.magicLinkUrlSample = sampleUrl;

  // Show what the request URL looks like from inside Vercel
  checks.requestInfo = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL || "not set",
  };

  return NextResponse.json(checks, { status: 200 });
}
