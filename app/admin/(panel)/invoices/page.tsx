import Link from "next/link";
import { desc } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { balance, displayStatus, invoiceNumber } from "@/lib/admin/finance";
import { formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import FinanceTabs from "../finance/FinanceTabs";

const FILTERS = ["ALL", "UNPAID", "OVERDUE", "DRAFT", "PAID", "VOID"] as const;

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireUser("finance");
  const { show: showParam } = await searchParams;
  const show = FILTERS.find((f) => f === showParam) ?? "ALL";

  const all = await db.query.invoices.findMany({
    orderBy: desc(t.invoices.number),
    limit: 500,
    with: { client: { columns: { fullName: true, company: true } } },
  });
  const rows = all
    .map((inv) => ({ ...inv, shown: displayStatus(inv) }))
    .filter((inv) =>
      show === "ALL"
        ? true
        : show === "UNPAID"
          ? ["SENT", "PARTIAL", "OVERDUE"].includes(inv.shown)
          : inv.shown === show,
    );
  const outstanding = all.filter((i) => ["SENT", "PARTIAL"].includes(i.status)).reduce((s, i) => s + balance(i), 0);

  return (
    <>
      <PageHeader
        title="Invoices"
        description={`${formatMoney(outstanding)} outstanding`}
        action={
          <Link href="/admin/invoices/new" className={primaryButton}>
            New invoice
          </Link>
        }
      />
      <FinanceTabs active="invoices" />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/invoices" : `/admin/invoices?show=${f}`}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              show === f ? "bg-[#2F6FEA] text-white" : "border border-white/10 text-[#a2adc4] hover:text-white"
            }`}
          >
            {humanize(f)}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No invoices here" body="Create an invoice for a client. Quick-add buttons use your Services prices." />
      ) : (
        <Table head={["Invoice", "Client", "Issued", "Due", "Total", "Balance", "Status"]}>
          {rows.map((inv) => (
            <tr key={inv.id} className="hover:bg-white/[0.03]">
              <td className="px-5 py-3.5">
                <Link href={`/admin/invoices/${inv.id}`} className="font-mono font-medium hover:text-[#4d8dff]">
                  {invoiceNumber(inv.number)}
                </Link>
              </td>
              <td className="px-5 py-3.5">
                {inv.client.fullName}
                {inv.client.company && <p className="text-xs text-[#7f93b8]">{inv.client.company}</p>}
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-[#a2adc4]">{formatDate(inv.issueDate)}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-[#a2adc4]">{formatDate(inv.dueDate)}</td>
              <td className="px-5 py-3.5">{formatMoney(inv.total)}</td>
              <td className="px-5 py-3.5 font-medium">{inv.status === "VOID" ? "—" : formatMoney(balance(inv))}</td>
              <td className="px-5 py-3.5">
                <Badge tone={statusTone(inv.shown)}>{humanize(inv.shown)}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
