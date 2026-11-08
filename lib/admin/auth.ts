import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";
import { canAccess, type Area, type RoleKey } from "./roles";

export const SESSION_COOKIE = "ye_session";
const SESSION_DAYS = 7;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  title: string | null;
  role: RoleKey;
  roleName: string;
  departmentId: string;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function requestMeta() {
  const h = await headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null,
    userAgent: h.get("user-agent")?.slice(0, 300) || null,
  };
}

/** The signed-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: t.users.id,
      email: t.users.email,
      isActive: t.users.isActive,
      name: t.employees.fullName,
      title: t.employees.title,
      status: t.employees.status,
      role: t.roles.key,
      roleName: t.roles.name,
      departmentId: t.employees.departmentId,
    })
    .from(t.sessions)
    .innerJoin(t.users, eq(t.users.id, t.sessions.userId))
    .innerJoin(t.employees, eq(t.employees.userId, t.users.id))
    .innerJoin(t.roles, eq(t.roles.id, t.employees.roleId))
    .where(
      and(
        eq(t.sessions.tokenHash, hashToken(token)),
        isNull(t.sessions.revokedAt),
        gt(t.sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row || !row.isActive || row.status !== "ACTIVE") return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    role: row.role as RoleKey,
    roleName: row.roleName,
    departmentId: row.departmentId,
  };
});

/** Use at the top of every admin page and server action. */
export async function requireUser(area?: Area): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (area && !canAccess(user.role, area)) redirect("/admin?denied=1");
  return user;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function signIn(emailRaw: string, password: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  const meta = await requestMeta();
  const generic = "Incorrect email or password.";

  // Lock out after repeated failures for this email (both lookups run together).
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60_000);
  const [[{ failures }], user] = await Promise.all([
    db
      .select({ failures: count() })
      .from(t.loginHistory)
      .where(and(eq(t.loginHistory.email, email), eq(t.loginHistory.success, false), gt(t.loginHistory.createdAt, since))),
    db.query.users.findFirst({ where: eq(t.users.email, email) }),
  ]);
  if (failures >= MAX_FAILED_LOGINS) {
    return { ok: false, error: `Too many attempts. Try again in ${LOCKOUT_MINUTES} minutes.` };
  }
  // Compare against a dummy hash when the user doesn't exist, so timing doesn't reveal accounts.
  const valid = await bcrypt.compare(
    password,
    user?.passwordHash ?? "$2b$12$jwEFWtkZ5Asr8zOiRi/ep.z3ZzJBC6Ubx1TXCTbjzaVVf9BgCcK4y",
  );

  if (!user || !valid || !user.isActive) {
    await Promise.all([
      db.insert(t.loginHistory).values({
        email,
        userId: user?.id,
        success: false,
        reason: !user ? "unknown_email" : !valid ? "invalid_password" : "inactive",
        ...meta,
      }),
      user
        ? db.insert(t.auditLogs).values({ userId: user.id, action: "LOGIN_FAILED", resource: "auth", ipAddress: meta.ipAddress })
        : null,
    ]);
    return { ok: false, error: generic };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  // The session must exist before the cookie is used; the bookkeeping writes run alongside it.
  await Promise.all([
    db.insert(t.sessions).values({ userId: user.id, tokenHash: hashToken(token), expiresAt, ...meta }),
    db.update(t.users).set({ lastLoginAt: new Date() }).where(eq(t.users.id, user.id)),
    db.insert(t.loginHistory).values({ email, userId: user.id, success: true, ...meta }),
    db.insert(t.auditLogs).values({ userId: user.id, action: "LOGIN", resource: "auth", ipAddress: meta.ipAddress }),
  ]);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const [session] = await db
      .update(t.sessions)
      .set({ revokedAt: new Date() })
      .where(eq(t.sessions.tokenHash, hashToken(token)))
      .returning({ userId: t.sessions.userId });
    if (session) {
      await db.insert(t.auditLogs).values({ userId: session.userId, action: "LOGOUT", resource: "auth" });
    }
  }
  jar.delete(SESSION_COOKIE);
}

export async function audit(
  user: CurrentUser,
  action: "CREATE" | "UPDATE" | "DELETE" | "EXPORT" | "PERMISSION_CHANGE",
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
) {
  const { ipAddress } = await requestMeta();
  await db.insert(t.auditLogs).values({ userId: user.id, action, resource, resourceId, metadata, ipAddress });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
