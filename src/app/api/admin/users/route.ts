import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-auth";
import nodemailer from "nodemailer";

const smtpConfig = {
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
  name: "resend.com",
};

/** GET /api/admin/users — list all users with project counts */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

/** POST /api/admin/users — create a user and send them an invite email */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Upsert — create if new, skip if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
  const created = !existingUser;

  if (created) {
    await prisma.user.create({
      data: {
        email: cleanEmail,
        subscriptionStatus: "active",
      },
    });
  } else {
    // Existing user — just activate their subscription
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { subscriptionStatus: "active" },
    });
  }

  // Send invite email
  let emailSent = false;
  try {
    const appUrl = process.env.NEXTAUTH_URL ?? "https://app.tomstacey.co.uk";
    const from = process.env.EMAIL_FROM ?? "Ship My Dissertation <noreply@tomstacey.co.uk>";

    const transport = nodemailer.createTransport(smtpConfig);
    await transport.sendMail({
      from,
      to: cleanEmail,
      subject: "You're invited to ShipmyDiss 🚀",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #222222;border-radius:16px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#ffffff;">shipmydiss 🚀</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                You've been invited!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.6;">
                You've been granted beta access to ShipmyDiss — the project management tool that helps
                UK undergraduates actually finish their dissertations. 🎓
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.6;">
                Sign in with your email address to get started. We'll send you a magic link — no password needed.
              </p>
              <a href="${appUrl}/auth/signin"
                 style="display:inline-block;background-color:#7c3aed;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
                Get started →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222222;">
              <p style="margin:0;font-size:12px;color:#4b5563;">
                Sign in using this email address: ${cleanEmail}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
    emailSent = true;
  } catch (err) {
    console.error("[admin/users] Failed to send invite email:", err);
  }

  return NextResponse.json({ created, emailSent });
}
