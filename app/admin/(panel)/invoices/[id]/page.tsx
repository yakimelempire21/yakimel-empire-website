import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Badge, Card, PageHeader, inputClass, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { balance, displayStatus, invoiceNumber } from "@/lib/admin/finance";
import { formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import { SITE } from "@/lib/site";
import { setInvoiceStatus } from "../actions";
import { PaymentForm, SendAndPrint } from "./InvoiceActions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("finance");
  const { id } = await params;
  const inv = await db.query.invoices.findFirst({
    where: eq(t.invoices.id, id),
    with: {
      client: true,
      project: { columns: { id: true, name: true } },
      items: { orderBy: asc(t.invoiceItems.position) },
      payments: { orderBy: asc(t.payments.paidAt) },
    },
  });
  if (!inv) notFound();

  const no = invoiceNumber(inv.number);
  const shown = displayStatus(inv);
  const due = balance(inv);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={no}
          description={`${inv.client.fullName}${inv.project ? ` · ${inv.project.name}` : ""}`}
          back={{ href: "/admin/invoices", label: "Invoices" }}
          action={<Badge tone={statusTone(shown)}>{humanize(shown)}</Badge>}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] print:block">
        {/* The invoice itself — prints on a white page */}
        <article className="rounded-2xl bg-white p-8 text-[#0b1220] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] md:p-12 print:rounded-none print:p-0 print:shadow-none">
          <header className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row">
            <div className="flex items-start gap-3">
              <Image src="/yakimel-icon.png" alt="" width={44} height={44} className="h-11 w-11" />
              <div>
                <p className="font-display text-lg font-bold">{SITE.name}</p>
                <p className="text-sm text-slate-500">{SITE.location}</p>
                <p className="text-sm text-slate-500">{SITE.email}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-3xl font-bold tracking-tight">INVOICE</p>
              <p className="font-mono text-sm text-slate-500">{no}</p>
              {shown === "PAID" && <p className="mt-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">PAID</p>}
              {shown === "VOID" && <p className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">VOID</p>}
            </div>
          </header>

          <section className="grid gap-6 py-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bill to</p>
              <p className="mt-1 font-semibold">{inv.client.fullName}</p>
              {inv.client.company && <p className="text-sm text-slate-600">{inv.client.company}</p>}
              <p className="text-sm text-slate-600">{inv.client.email}</p>
              {inv.client.phone && <p className="text-sm text-slate-600">{inv.client.phone}</p>}
            </div>
            <dl className="grid grid-cols-2 gap-y-1 text-sm sm:text-right">
              <dt className="text-slate-400">Issue date</dt>
              <dd>{formatDate(inv.issueDate)}</dd>
              <dt className="text-slate-400">Due date</dt>
              <dd>{formatDate(inv.dueDate)}</dd>
              {inv.project && (
                <>
                  <dt className="text-slate-400">Project</dt>
                  <dd>{inv.project.name}</dd>
                </>
              )}
            </dl>
          </section>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left text-xs uppercase tracking-wider">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{i.description}</td>
                  <td className="py-3 text-right">{Number(i.quantity)}</td>
                  <td className="py-3 text-right">{formatMoney(i.unitPrice)}</td>
                  <td className="py-3 text-right font-medium">{formatMoney(Number(i.quantity) * Number(i.unitPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-6 w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span>{formatMoney(inv.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span>− {formatMoney(inv.amountPaid)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-2 text-base font-bold">
              <span>Amount due</span>
              <span>{formatMoney(due)}</span>
            </div>
          </div>

          {inv.notes && <p className="mt-10 whitespace-pre-wrap border-t border-slate-200 pt-6 text-sm text-slate-600">{inv.notes}</p>}
        </article>

        <aside className="space-y-6 print:hidden">
          <Card className="p-5">
            <SendAndPrint id={inv.id} canSend={inv.status !== "VOID"} />
            {inv.sentAt && <p className="mt-3 text-xs text-[#7f93b8]">Last emailed {formatDate(inv.sentAt, true)}</p>}
          </Card>

          {inv.status !== "VOID" && due > 0 && (
            <Card className="p-5">
              <h2 className="mb-4 font-display font-bold">Record a payment</h2>
              <PaymentForm id={inv.id} balance={due} today={today} />
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold">Payments</h2>
            {inv.payments.length === 0 ? (
              <p className="text-sm text-[#7f93b8]">No payments yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {inv.payments.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>
                      {formatDate(p.paidAt)} · {humanize(p.method)}
                      {p.reference && <span className="text-[#7f93b8]"> · {p.reference}</span>}
                    </span>
                    <span className="font-medium text-emerald-300">{formatMoney(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <form key={inv.status} action={setInvoiceStatus.bind(null, inv.id)} className="flex gap-2">
              <select name="status" defaultValue={["DRAFT", "SENT", "VOID"].includes(inv.status) ? inv.status : "SENT"} aria-label="Invoice status" className={inputClass}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="VOID">Void</option>
              </select>
              <button type="submit" className={secondaryButton}>
                Set
              </button>
            </form>
            <p className="mt-2 text-xs text-[#7f93b8]">Paid and partial are set automatically from payments.</p>
            <Link href={`/admin/clients/${inv.clientId}`} className="mt-4 inline-block text-sm text-[#4d8dff] hover:underline">
              Open client →
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
