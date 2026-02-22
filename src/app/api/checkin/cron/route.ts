import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

// Called by Vercel Cron every Monday at 9am UTC
// vercel.json: { "crons": [{ "path": "/api/checkin/cron", "schedule": "0 9 * * 1" }] }

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (or our secret)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const transport = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    name: "resend.com",
  });

  const appUrl = process.env.NEXTAUTH_URL || "https://app.tomstacey.co.uk";

  // Find all users with active projects that haven't checked in this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const projects = await prisma.project.findMany({
    where: {
      deadline: { gt: new Date() }, // not past deadline
    },
    include: {
      user: true,
      checkIns: {
        where: { createdAt: { gt: oneWeekAgo } },
        take: 1,
      },
      milestones: {
        where: { status: { in: ["in_progress", "upcoming"] } },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });

  const projectsNeedingCheckin = projects.filter(
    (p) => p.checkIns.length === 0 && p.user?.email
  );

  let emailsSent = 0;

  for (const project of projectsNeedingCheckin) {
    const userEmail = project.user?.email;
    if (!userEmail) continue;

    const deadline = new Date(project.deadline);
    const weeksRemaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    );
    const nextMilestone = project.milestones[0];

    const checkinUrl = `${appUrl}/dashboard/checkin?projectId=${project.id}`;

    await transport.sendMail({
      to: userEmail,
      from: process.env.EMAIL_FROM || "Ship My Dissertation <noreply@tomstacey.co.uk>",
      subject: `⏰ Time for your weekly check-in — ${project.title}`,
      text: `Hey,

Time for your weekly dissertation check-in.

Project: ${project.title}
Weeks until deadline: ${weeksRemaining}
${nextMilestone ? `Up next: ${nextMilestone.title}` : ""}

Takes less than 2 minutes. Your AI project manager is waiting.

Check in now: ${checkinUrl}

Ship My Dissertation`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #09090b; color: #fafafa; border-radius: 12px; padding: 32px;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">Time for your weekly check-in ⏰</h2>
          <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px;">${project.title}</p>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #a1a1aa; font-size: 13px;">Weeks remaining</span>
              <span style="font-weight: 600; font-size: 13px;">${weeksRemaining}</span>
            </div>
            ${nextMilestone ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a1a1aa; font-size: 13px;">Up next</span>
              <span style="font-weight: 600; font-size: 13px;">${nextMilestone.title}</span>
            </div>` : ""}
          </div>
          <a href="${checkinUrl}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Do my check-in →
          </a>
          <p style="color: #52525b; font-size: 12px; margin-top: 24px;">Takes less than 2 minutes.</p>
        </div>
      `,
    });
    emailsSent++;
  }

  return NextResponse.json({
    projectsChecked: projects.length,
    emailsSent,
    projectsNeedingCheckin: projectsNeedingCheckin.length,
  });
}
