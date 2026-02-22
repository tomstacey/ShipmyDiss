import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { prisma } from "./db";
import type { Adapter } from "next-auth/adapters";

// @auth/prisma-adapter@2.x has broken updateUser/createSession for Prisma v7:
// it spreads fields at top level instead of wrapping in `data: {}`.
// We patch those methods while keeping everything else from the base adapter.
function buildAdapter(): Adapter {
  const base = PrismaAdapter(prisma as never);
  return {
    ...base,
    updateUser: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      return prisma.user.update({ where: { id }, data }) as never;
    },
    createSession: async (data: { sessionToken: string; userId: string; expires: Date }) => {
      return prisma.session.create({ data }) as never;
    },
    updateSession: async ({ sessionToken, ...data }: { sessionToken: string; [key: string]: unknown }) => {
      return prisma.session.update({ where: { sessionToken }, data }) as never;
    },
  };
}

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
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: buildAdapter(),
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
});
