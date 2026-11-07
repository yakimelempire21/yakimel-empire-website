import Link from "next/link";
import { revalidatePath } from "next/cache";
import { and, count, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge, Card, PageHeader, Table, glass } from "@/components/admin/ui";
import { audit, requireUser } from "@/lib/admin/auth";
import { formatDate, timeAgo } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

async function revokeSession(id: string) {
  "use server";
  const user = await requireUser("security");
  if (!["SUPER_ADMIN", "EXECUTIVE"].includes(user.role)) return;
  await db.update(t.sessions).set({ revokedAt: new Date() }).where(eq(t.sessions.id, id));
  await audit(user, "UPDATE", "session", id, { revoked: true });
  revalidatePath("/admin/security");
}

export default async function SecurityCenter() {
  const user = await requireUser("security");
  const canRevoke = ["SUPER_ADMIN", "EXECUTIVE"].includes(user.role);
  const dayAgo = sql`now() - interval '24 hours'`;

  const [[failed24h], suspicious, sessions, history, [twoFactor]] = await Promise.all([
    db
      .select({ n: count() })
      .from(t.loginHistory)
      .where(and(eq(t.loginHistory.success, false), gt(t.loginHistory.createdAt, dayAgo))),
    // 3+ failed attempts for one email in 24 h
    db
      .select({ email: t.loginHistory.email, n: count(), last: sql<Date>`max(${t.loginHistory.createdAt})` })
      .from(t.loginHistory)
      .where(and(eq(t.loginHistory.success, false), gt(t.loginHistory.createdAt, dayAgo)))
      .groupBy(t.loginHistory.email)
      .having(sql`count(*) >= 3`),
    db
      .select({
        id: t.sessions.id,
        ip: t.sessions.ipAddress,
        agent: t.sessions.userAgent,
        createdAt: t.sessions.createdAt,
        email: t.users.email,
        name: t.employees.fullName,
      })
      .from(t.sessions)
      .innerJoin(t.users, eq(t.users.id, t.sessions.userId))
      .leftJoin(t.employees, eq(t.employees.userId, t.users.id))
      .where(and(isNull(t.sessions.revokedAt), gt(t.sessions.expiresAt, sql`now()`)))
      .orderBy(desc(t.sessions.createdAt))
      .limit(50),
    db.select().from(t.loginHistory).orderBy(desc(t.loginHistory.createdAt)).limit(40),
    db.select({ n: count() }).from(t.users).where(eq(t.users.totpEnabled, true)),
  ]);

  const browser = (ua: string | null) =>
    !ua ? "Unknown device" : /iPhone|Android|Mobile/i.test(ua) ? "Mobile browser" : /Edg\//.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : /Firefox/.test(ua) ? "Firefox" : "Browser";

  return (
    <>
      <PageHeader
        title="Security Center"
        description="Sign-ins, active sessions and suspicious activity."
        action={
          <Link href="/admin/audit" className="text-sm text-[#4d8dff] hover:underline">
            Audit logs →
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-2xl p-4 ${glass}`}>
          <p className="text-xs text-[#7f93b8]">Active sessions</p>
          <p className="mt-2 font-display text-3xl font-bold">{sessions.length}</p>
        </div>
        <div className={`rounded-2xl p-4 ${glass}`}>
          <p className="text-xs text-[#7f93b8]">Failed sign-ins (24 h)</p>
          <p className={`mt-2 font-display text-3xl font-bold ${failed24h.n > 0 ? "text-amber-300" : ""}`}>{failed24h.n}</p>
        </div>
        <div className={`rounded-2xl p-4 ${glass}`}>
          <p className="text-xs text-[#7f93b8]">Suspicious accounts</p>
          <p className={`mt-2 font-display text-3xl font-bold ${suspicious.length ? "text-red-300" : ""}`}>{suspicious.length}</p>
        </div>
        <div className={`rounded-2xl p-4 ${glass}`}>
          <p className="text-xs text-[#7f93b8]">Two-factor enabled</p>
          <p className="mt-2 font-display text-3xl font-bold">{twoFactor.n}</p>
          <p className="mt-1 text-[11px] text-[#5d6b86]">2FA setup arrives in the HR & security update</p>
        </div>
      </div>

      {suspicious.length > 0 ? (
        <Card className="mb-6 border-red-400/25 p-5">
          <p className="flex items-center gap-2 font-semibold text-red-300">
            <ShieldAlert size={18} aria-hidden="true" /> Repeated failed sign-ins
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {suspicious.map((s) => (
              <li key={s.email}>
                <span className="font-medium">{s.email}</span>{" "}
                <span className="text-[#a2adc4]">
                  — {s.n} failed attempts, last {timeAgo(s.last)}. Accounts lock for 15 minutes after 5 failures.
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="mb-6 flex items-center gap-2 text-sm text-emerald-300">
          <ShieldCheck size={16} aria-hidden="true" /> No suspicious sign-in activity in the last 24 hours.
        </p>
      )}

      <h2 className="mb-3 font-display text-lg font-bold">Active sessions</h2>
      <div className="mb-8">
        <Table head={["Person", "Device", "IP address", "Signed in", ""]}>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{s.name ?? s.email}</p>
                <p className="text-xs text-[#7f93b8]">{s.email}</p>
              </td>
              <td className="px-5 py-3 text-[#a2adc4]">{browser(s.agent)}</td>
              <td className="px-5 py-3 font-mono text-xs text-[#a2adc4]">{s.ip ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{timeAgo(s.createdAt)}</td>
              <td className="px-5 py-3 text-right">
                {canRevoke && (
                  <form action={revokeSession.bind(null, s.id)}>
                    <button type="submit" className="text-xs text-red-300 hover:underline">
                      Sign out
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Recent sign-in attempts</h2>
      <Table head={["Email", "Result", "Reason", "IP address", "When"]}>
        {history.map((h) => (
          <tr key={h.id}>
            <td className="px-5 py-3">{h.email}</td>
            <td className="px-5 py-3">
              <Badge tone={h.success ? "green" : "red"}>{h.success ? "Success" : "Failed"}</Badge>
            </td>
            <td className="px-5 py-3 text-[#a2adc4]">{h.reason?.replace(/_/g, " ") ?? "—"}</td>
            <td className="px-5 py-3 font-mono text-xs text-[#a2adc4]">{h.ipAddress ?? "—"}</td>
            <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{formatDate(h.createdAt, true)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
