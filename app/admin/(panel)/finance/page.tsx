import Link from "next/link";
import { desc, eq, gte, inArray, sql } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { Badge, Card, PageHeader, glass, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { balance, displayStatus, invoiceNumber, monthly } from "@/lib/admin/finance";
import { formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import FinanceTabs from "./FinanceTabs";

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default async function FinanceOverview() {
  await requireUser("finance");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [[mRevenue], [yRevenue], [mExpenses], revenueByMonth, expensesByMonth, unpaid, recentPayments, subs] = await Promise.all([
    db.select({ v: sql<string>`coalesce(sum(${t.payments.amount}),0)` }).from(t.payments).where(gte(t.payments.paidAt, monthStart)),
    db.select({ v: sql<string>`coalesce(sum(${t.payments.amount}),0)` }).from(t.payments).where(gte(t.payments.paidAt, yearStart)),
    db.select({ v: sql<string>`coalesce(sum(${t.expenses.amount}),0)` }).from(t.expenses).where(gte(t.expenses.date, monthStart)),
    db
      .select({ m: sql<string>`to_char(${t.payments.paidAt}, 'YYYY-MM')`, v: sql<string>`sum(${t.payments.amount})` })
      .from(t.payments)
      .where(gte(t.payments.paidAt, sixMonthsAgo))
      .groupBy(sql`1`),
    db
      .select({ m: sql<string>`to_char(${t.expenses.date}, 'YYYY-MM')`, v: sql<string>`sum(${t.expenses.amount})` })
      .from(t.expenses)
      .where(gte(t.expenses.date, sixMonthsAgo))
      .groupBy(sql`1`),
    db.query.invoices.findMany({
      where: inArray(t.invoices.status, ["SENT", "PARTIAL"]),
      orderBy: t.invoices.dueDate,
      with: { client: { columns: { fullName: true } } },
    }),
    db.query.payments.findMany({
      orderBy: desc(t.payments.paidAt),
      limit: 6,
      with: { client: { columns: { fullName: true } }, invoice: { columns: { id: true, number: true } } },
    }),
    db.select().from(t.subscriptions).where(eq(t.subscriptions.status, "ACTIVE")),
  ]);

  const outstanding = unpaid.reduce((s, i) => s + balance(i), 0);
  const overdue = unpaid.filter((i) => displayStatus(i) === "OVERDUE");
  const overdueTotal = overdue.reduce((s, i) => s + balance(i), 0);
  const mrr = subs.filter((s) => s.kind === "INCOME").reduce((sum, s) => sum + monthly(s.amount, s.interval), 0);
  const monthlyCosts = subs.filter((s) => s.kind === "EXPENSE").reduce((sum, s) => sum + monthly(s.amount, s.interval), 0);
  const net = Number(mRevenue.v) - Number(mExpenses.v);

  // Last 6 months, oldest first.
  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
  const rev = new Map(revenueByMonth.map((r) => [r.m, Number(r.v)]));
  const exp = new Map(expensesByMonth.map((r) => [r.m, Number(r.v)]));
  const chart = months.map((d) => ({
    label: d.toLocaleString("en-US", { month: "short" }),
    revenue: rev.get(monthKey(d)) ?? 0,
    expenses: exp.get(monthKey(d)) ?? 0,
  }));
  const max = Math.max(1, ...chart.flatMap((c) => [c.revenue, c.expenses]));

  const kpis = [
    { label: "Revenue this month", value: formatMoney(mRevenue.v), tone: "" },
    { label: "Expenses this month", value: formatMoney(mExpenses.v), tone: "" },
    { label: "Net this month", value: formatMoney(net), tone: net < 0 ? "text-red-700" : "text-emerald-700" },
    { label: `Revenue ${now.getFullYear()}`, value: formatMoney(yRevenue.v), tone: "" },
    { label: "Outstanding", value: formatMoney(outstanding), tone: "" },
    { label: "Overdue", value: formatMoney(overdueTotal), tone: overdueTotal > 0 ? "text-red-700" : "" },
  ];

  return (
    <>
      <PageHeader
        title="Finance"
        description="Revenue, expenses, invoices and recurring income."
        action={
          <Link href="/admin/invoices/new" className={primaryButton}>
            New invoice
          </Link>
        }
      />
      <FinanceTabs active="overview" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl p-4 ${glass}`}>
            <p className="text-xs text-os-muted">{k.label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${k.tone}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display font-bold">Last 6 months</h2>
            <div className="flex gap-4 text-xs text-os-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-os-accent" aria-hidden="true" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-os-faint/50" aria-hidden="true" /> Expenses
              </span>
            </div>
          </div>
          <div className="flex h-56 items-end gap-3 sm:gap-6" role="img" aria-label="Revenue and expenses for the last 6 months">
            {chart.map((c) => (
              <div key={c.label} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div
                    className="w-full max-w-7 rounded-t-md bg-gradient-to-t from-os-accent to-os-accent shadow-sm"
                    style={{ height: `${Math.max(c.revenue ? 3 : 0, (c.revenue / max) * 100)}%` }}
                    title={`Revenue ${formatMoney(c.revenue)}`}
                  />
                  <div
                    className="w-full max-w-7 rounded-t-md bg-os-faint/40"
                    style={{ height: `${Math.max(c.expenses ? 3 : 0, (c.expenses / max) * 100)}%` }}
                    title={`Expenses ${formatMoney(c.expenses)}`}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-os-muted">{c.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display font-bold">Recurring</h2>
          <dl className="space-y-4">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-os-muted">Monthly recurring income</dt>
              <dd className="font-display text-2xl font-bold text-emerald-700">{formatMoney(mrr)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-os-muted">Monthly recurring costs</dt>
              <dd className="font-display text-2xl font-bold">{formatMoney(monthlyCosts)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-os-ink/15 pt-4">
              <dt className="text-sm text-os-muted">Recurring margin</dt>
              <dd className="font-display text-2xl font-bold">{formatMoney(mrr - monthlyCosts)}</dd>
            </div>
          </dl>
          <Link href="/admin/finance/subscriptions" className="mt-5 inline-flex items-center gap-1 text-sm text-os-accent hover:underline">
            Manage subscriptions <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-os-ink/10 px-5 py-4">
            <h2 className="font-display font-bold">Unpaid invoices</h2>
            <Link href="/admin/invoices?show=UNPAID" className="text-sm text-os-muted hover:text-os-ink">
              All →
            </Link>
          </div>
          {unpaid.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-os-muted">Everything is paid. 🎉</p>
          ) : (
            <ul className="divide-y divide-os-ink/10">
              {unpaid.slice(0, 8).map((inv) => {
                const s = displayStatus(inv);
                return (
                  <li key={inv.id}>
                    <Link href={`/admin/invoices/${inv.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-os-ink/[0.03]">
                      <span className="font-mono text-xs text-os-muted">{invoiceNumber(inv.number)}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{inv.client.fullName}</span>
                      <span className="text-xs text-os-muted">Due {formatDate(inv.dueDate)}</span>
                      <span className="w-24 text-right text-sm font-medium">{formatMoney(balance(inv))}</span>
                      <Badge tone={statusTone(s)}>{humanize(s)}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="border-b border-os-ink/10 px-5 py-4 font-display font-bold">Recent payments</h2>
          {recentPayments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-os-muted">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-os-ink/10">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">
                    {p.client?.fullName ?? "—"}
                    {p.invoice && (
                      <Link href={`/admin/invoices/${p.invoice.id}`} className="ml-2 font-mono text-xs text-os-muted hover:text-os-ink">
                        {invoiceNumber(p.invoice.number)}
                      </Link>
                    )}
                  </span>
                  <span className="text-xs text-os-muted">
                    {formatDate(p.paidAt)} · {humanize(p.method)}
                  </span>
                  <span className="w-24 text-right font-medium text-emerald-700">{formatMoney(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

