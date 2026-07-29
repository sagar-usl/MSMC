"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession, verifyPassword } from "@/lib/auth";
import { isRateLimited, clientIpFromHeaders } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  // Keyed by account, not just IP: a plain IP key collapses to one shared
  // "unknown" bucket for every caller when there's no reverse proxy in
  // front (local dev, or a misconfigured one) — meaning repeated attempts
  // on ANY account would lock out login for every OTHER account too.
  const ip = clientIpFromHeaders(await headers());
  if (isRateLimited(`login:${ip}:${email}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many login attempts. Please try again in a few minutes." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== "OFFICER" && user.role !== "MASTER_ADMIN") || !user.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
