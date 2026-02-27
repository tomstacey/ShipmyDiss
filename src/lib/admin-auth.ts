/**
 * Admin authentication helpers.
 *
 * Admin auth is completely separate from NextAuth — it uses a plain password
 * stored in ADMIN_PASSWORD and a signed JWT cookie for the session.
 *
 * jose is a transitive dependency of next-auth and is always available.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_token";

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

/** Create a signed 7-day admin JWT. */
export async function signAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Returns true if the token is a valid, unexpired admin JWT. */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.admin === true;
  } catch {
    return false;
  }
}

/** Reads the admin cookie from the current request and verifies it. */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
