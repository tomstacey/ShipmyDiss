import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer";
import { prisma } from "./db";

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

const providers = [
  // Only enable Google if credentials are configured
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })]
    : []),
  Nodemailer({
    server: smtpConfig,
    from: process.env.EMAIL_FROM || "Ship My Dissertation <noreply@tomstacey.co.uk>",
    async sendVerificationRequest({ identifier: email, url }) {
      // Log the exact URL being emailed so we can debug via Vercel logs
      console.log("[auth][magic-link-url]", url);
      const transport = nodemailer.createTransport(smtpConfig);
      await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM || "Ship My Dissertation <noreply@tomstacey.co.uk>",
        subject: "Sign in to Ship My Dissertation",
        text: `Sign in to Ship My Dissertation\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Click the link below to sign in:</p><p><a href="${url}">${url}</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  adapter: PrismaAdapter(prisma as never),
  providers,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  logger: {
    error(error) {
      console.error("[auth][error]", error);
    },
    warn(code) {
      console.warn("[auth][warn]", code);
    },
    debug(message, metadata) {
      console.log("[auth][debug]", message, metadata);
    },
  },
});
