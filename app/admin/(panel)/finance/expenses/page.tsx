import { desc, gte, sql } from "drizzle-orm";
import { Card, EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { EXPENSE_CATEGORIES } from "@/lib/admin/finance";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { departmentOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { deleteExpense } from "../actions";
import { ExpenseForm } from "../FinanceForms";
import FinanceTabs from "../FinanceTabs";

export default async function ExpensesPage() {
  await requireUser("finance");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rows, byCategory, departments] = await Promise.all([
    db.query.expenses.findMany({ orderBy: desc(t.expenses.date), limit: 200, with: { department: { columns: { name: true } } } }),
    db
      .select({ category: t.expenses.category, v: sql<string>`sum(${t.expenses.amount})` })
      .from(t.expenses)
      .where(gte(t.expenses.date, monthStart))
      .groupBy(t.expenses.category)
      .orderBy(sql`2 desc`),
    departmentOptions(),
  ]);
  const monthTotal = byCategory.reduce((s, c) => s + Number(c.v), 0);

  return (
    <>
      <PageHeader title="Expenses" description={`${formatMoney(monthTotal)} spent this month`} />
      <FinanceTabs active="expenses" />

      <Card className="mb-6 p-5">
        <ExpenseForm categories={[...EXPENSE_CATEGORIES]} departments={departments} today={now.toISOString().slice(0, 10)} />
      </Card>

      {byCategory.length > 0 && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 font-display font-bold">This month by category</h2>
          <ul className="space-y-3">
            {byCategory.map((c) => (
              <li key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-medium">{formatMoney(c.v)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-os-ink/10">
                  <div className="h-full rounded-full bg-os-accent" style={{ width: `${(Number(c.v) / monthTotal) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No expenses yet" body="Record software, hosting, ads, contractors and other costs to see your real profit." />
      ) : (
        <Table head={["Date", "Category", "Vendor / description", "Department", "Amount", ""]}>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap px-5 py-3 text-os-muted">{formatDate(e.date)}</td>
              <td className="px-5 py-3">{e.category}</td>
              <td className="px-5 py-3">
                {e.vendor ?? "—"}
                {e.description && <p className="text-xs text-os-muted">{e.description}</p>}
              </td>
              <td className="px-5 py-3 text-os-muted">{e.department?.name ?? "—"}</td>
              <td className="px-5 py-3 font-medium">{formatMoney(e.amount)}</td>
              <td className="px-5 py-3 text-right">
                <form action={deleteExpense.bind(null, e.id)}>
                  <button type="submit" className="text-xs text-os-muted hover:text-red-700">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
