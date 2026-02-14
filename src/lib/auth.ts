import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "nify_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setAdminSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getAdminSession(): Promise<{ id: string; nickname: string } | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const user = await prisma.user.findUnique({
    where: { id: value, role: "ADMIN" },
    select: { id: true, nickname: true },
  });
  return user;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifyAdminPassword(nickname: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { nickname, role: "ADMIN" },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
