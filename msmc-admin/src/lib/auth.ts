import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const SESSION_COOKIE = "msmc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

/**
 * For Route Handlers: returns the logged-in staff account (officer or the
 * master admin), or null if the caller isn't one. Named "Officer" for the
 * admin-panel-access check — MASTER_ADMIN is a superset of that access, not
 * a separate portal.
 */
export async function getCurrentOfficer(): Promise<User | null> {
  const user = await getCurrentUser();
  return user && (user.role === "OFFICER" || user.role === "MASTER_ADMIN") ? user : null;
}

/**
 * For Server Actions: re-verifies the caller is logged in as staff instead
 * of trusting proxy.ts alone (Server Actions are separate POST requests that
 * can bypass proxy.ts route matchers if a route is ever moved).
 */
export async function requireOfficer(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OFFICER" && user.role !== "MASTER_ADMIN")) {
    redirect("/login");
  }
  return user;
}

/** For Route Handlers: returns the master admin, or null if the caller isn't one. */
export async function getCurrentMasterAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return user && user.role === "MASTER_ADMIN" ? user : null;
}

/**
 * For Server Actions restricted to the master admin (assigning officers).
 * Distinguishes "not logged in" (send to login) from "logged in but not
 * authorized for this" (throw — the caller IS a valid officer, just not
 * allowed to do this specific thing, so redirecting to /login would be the
 * wrong signal).
 */
export async function requireMasterAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "MASTER_ADMIN") {
    throw new Error("Only the master admin can perform this action.");
  }
  return user;
}
