import { and, desc, eq } from "drizzle-orm";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import PasswordForm from "./PasswordForm";

export default async function AccountPage() {
  const user = await requireUser();
  const logins = await db
    .select()
    .from(t.loginHistory)
    .where(and(eq(t.loginHistory.userId, user.id)))
    .orderBy(desc(t.loginHistory.createdAt))
    .limit(8);

  return (
    <>
      <PageHeader title="My account" description={`${user.name} · ${user.email} · ${user.roleName}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 font-display font-bold">Change password</h2>
          <PasswordForm />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-display font-bold">My recent sign-ins</h2>
          <ul className="space-y-2 text-sm">
            {logins.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className={l.success ? "text-[#d5dcea]" : "text-red-300"}>{l.success ? "Signed in" : "Failed attempt"}</span>
                <span className="text-[#7f93b8]">
                  {formatDate(l.createdAt, true)}
                  {l.ipAddress ? ` · ${l.ipAddress}` : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-[#5d6b86]">If you see a sign-in you don&apos;t recognize, change your password right away.</p>
        </Card>
      </div>
    </>
  );
}
