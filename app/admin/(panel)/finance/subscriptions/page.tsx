import { desc } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, Table, inputClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { monthly } from "@/lib/admin/finance";
import { formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { clientOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { setSubscriptionStatus } from "../actions";
import { SubscriptionForm } from "../FinanceForms";
import FinanceTabs from "../FinanceTabs";

export default async function SubscriptionsPage() {
  await requireUser("finance");
  const [subs, clients] = await Promise.all([
    db.query.subscriptions.findMany({ orderBy: desc(t.subscriptions.createdAt), with: { client: { columns: { fullName: true } } } }),
    clientOptions(),
  ]);
  const active = subs.filter((s) => s.status === "ACTIVE");
  const mrr = active.filter((s) => s.kind === "INCOME").reduce((sum, s) => sum + monthly(s.amount, s.interval), 0);
  const costs = active.filter((s) => s.kind === "EXPENSE").reduce((sum, s) => sum + monthly(s.amount, s.interval), 0);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description={`${formatMoney(mrr)}/month recurring income · ${formatMoney(costs)}/month recurring costs`}
      />
      <FinanceTabs active="subscriptions" />

      <Card className="mb-6 p-5">
        <SubscriptionForm clients={clients} />
      </Card>

      {subs.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          body="Add client plans like Website Maintenance ($79/month) and company costs like hosting or software."
        />
      ) : (
        <Table head={["Name", "Type", "Client / vendor", "Amount", "Monthly", "Next date", "Status"]}>
          {subs.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-3 font-medium">{s.name}</td>
              <td className="px-5 py-3">
                <Badge tone={s.kind === "INCOME" ? "green" : "gray"}>{s.kind === "INCOME" ? "Income" : "Cost"}</Badge>
              </td>
              <td className="px-5 py-3 text-os-muted">{s.client?.fullName ?? s.vendor ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3">
                {formatMoney(s.amount)} <span className="text-xs text-os-muted">/ {humanize(s.interval).replace("ly", "")}</span>
              </td>
              <td className="px-5 py-3">{formatMoney(monthly(s.amount, s.interval))}</td>
              <td className="whitespace-nowrap px-5 py-3 text-os-muted">{formatDate(s.nextDate)}</td>
              <td className="px-5 py-3">
                <form key={s.status} action={setSubscriptionStatus.bind(null, s.id)} className="flex items-center gap-1.5">
                  <Badge tone={statusTone(s.status)}>{humanize(s.status)}</Badge>
                  <select name="status" defaultValue={s.status} aria-label={`${s.name} status`} className={`${inputClass} w-28 py-1 text-xs`}>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button type="submit" className="rounded-lg border border-os-ink/20 px-2 py-1 text-xs hover:border-os-accent">
                    Set
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
