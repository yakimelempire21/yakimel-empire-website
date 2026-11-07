"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { balance, invoiceNumber, PAYMENT_METHODS, recalcInvoice } from "@/lib/admin/finance";
import { formatDate, formatMoney, parseMoney, str } from "@/lib/admin/format";
import { notifyArea } from "@/lib/admin/notify";
import { db, tables as t } from "@/lib/db";
import { createTransport, fromAddress, mailConfigured } from "@/lib/mailer";
import { SITE } from "@/lib/site";

export type InvoiceFormState = { error?: string } | undefined;
export type PaymentState = { error?: string; saved?: boolean } | undefined;
export type SendState = { error?: string; sent?: boolean } | undefined;

const day = (v: string | null) => (v ? new Date(`${v}T12:00:00`) : null);

type ItemInput = { description: string; quantity: string; unitPrice: string };

function readItems(raw: string | null): ItemInput[] | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw ?? "[]");
  } catch {
    return "Couldn't read the line items.";
  }
  if (!Array.isArray(parsed)) return "Couldn't read the line items.";
  const items = parsed
    .map((i) => ({
      description: String(i?.description ?? "").trim().slice(0, 300),
      quantity: parseMoney(String(i?.quantity ?? "1")) ?? "1",
      unitPrice: parseMoney(String(i?.unitPrice ?? "")) ?? "",
    }))
    .filter((i) => i.description && i.unitPrice !== "");
  if (items.length === 0) return "Add at least one line item with a description and a price.";
  if (items.length > 50) return "An invoice can have up to 50 line items.";
  return items;
}

export async function createInvoice(_prev: InvoiceFormState, form: FormData): Promise<InvoiceFormState> {
  const user = await requireUser("finance");
  const clientId = str(form, "clientId");
  const issueDate = day(str(form, "issueDate"));
  if (!clientId || !issueDate) return { error: "Choose a client and an issue date." };
  const items = readItems(str(form, "items"));
  if (typeof items === "string") return { error: items };

  const [invoice] = await db
    .insert(t.invoices)
    .values({
      clientId,
      projectId: str(form, "projectId"),
      issueDate,
      dueDate: day(str(form, "dueDate")),
      notes: str(form, "notes"),
      createdById: user.id,
    })
    .returning({ id: t.invoices.id });
  await db.insert(t.invoiceItems).values(items.map((i, position) => ({ ...i, invoiceId: invoice.id, position })));
  await recalcInvoice(invoice.id);
  await audit(user, "CREATE", "invoice", invoice.id);
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function setInvoiceStatus(id: string, form: FormData) {
  const user = await requireUser("finance");
  const status = str(form, "status");
  if (status !== "DRAFT" && status !== "SENT" && status !== "VOID") return;
  await db
    .update(t.invoices)
    .set({ status, ...(status === "SENT" ? { sentAt: new Date() } : {}) })
    .where(eq(t.invoices.id, id));
  if (status !== "VOID") await recalcInvoice(id);
  await audit(user, "UPDATE", "invoice", id, { status });
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
}

export async function recordPayment(id: string, _prev: PaymentState, form: FormData): Promise<PaymentState> {
  const user = await requireUser("finance");
  const amount = parseMoney(str(form, "amount"));
  const paidAt = day(str(form, "paidAt"));
  const method = str(form, "method");
  if (!amount || Number(amount) <= 0) return { error: "Enter the amount received." };
  if (!paidAt) return { error: "Enter the payment date." };

  const invoice = await db.query.invoices.findFirst({ where: eq(t.invoices.id, id), with: { client: true } });
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status === "VOID") return { error: "This invoice is void." };

  await db.insert(t.payments).values({
    invoiceId: id,
    clientId: invoice.clientId,
    amount,
    paidAt,
    method: (PAYMENT_METHODS as readonly string[]).includes(method ?? "") ? (method as (typeof PAYMENT_METHODS)[number]) : "OTHER",
    reference: str(form, "reference"),
    recordedById: user.id,
  });
  await recalcInvoice(id);
  await notifyArea(
    "finance",
    {
      kind: "SYSTEM",
      title: `Payment received: ${formatMoney(amount)}`,
      body: `${invoiceNumber(invoice.number)} · ${invoice.client.fullName}`,
      href: `/admin/invoices/${id}`,
    },
    user.id,
  );
  await audit(user, "CREATE", "payment", id, { amount });
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/finance");
  return { saved: true };
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Emails the invoice to the client through Zoho and marks it sent. */
export async function sendInvoice(id: string, _prev: SendState): Promise<SendState> {
  const user = await requireUser("finance");
  if (!mailConfigured()) return { error: "Email isn't configured (ZOHO_USER / ZOHO_APP_PASSWORD)." };

  const inv = await db.query.invoices.findFirst({
    where: eq(t.invoices.id, id),
    with: { client: true, items: { orderBy: (i, { asc }) => [asc(i.position)] } },
  });
  if (!inv) return { error: "Invoice not found." };
  if (inv.status === "VOID") return { error: "A void invoice can't be sent." };

  const no = invoiceNumber(inv.number);
  const due = balance(inv);
  const rows = inv.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escape(i.description)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${Number(i.quantity)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatMoney(Number(i.quantity) * Number(i.unitPrice)).replace("$", "&#36;")}</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#0b1220">
  <h2 style="margin:0 0 4px">${escape(SITE.name)}</h2>
  <p style="margin:0 0 24px;color:#64748b">Invoice ${no}</p>
  <p>Hi ${escape(inv.client.fullName)},</p>
  <p>Here is your invoice from ${escape(SITE.name)}.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
    <tr><th style="text-align:left;padding-bottom:8px">Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Amount</th></tr>
    ${rows}
  </table>
  <p style="font-size:16px"><strong>Amount due: ${formatMoney(due).replace("$", "&#36;")}</strong>${inv.dueDate ? ` — due ${formatDate(inv.dueDate)}` : ""}</p>
  ${inv.notes ? `<p style="white-space:pre-wrap;color:#334155">${escape(inv.notes)}</p>` : ""}
  <p style="color:#64748b;font-size:13px">Questions? Reply to this email or write to ${escape(SITE.email)}.</p>
</div>`;
  const text = `Invoice ${no} from ${SITE.name}\n\n${inv.items
    .map((i) => `- ${i.description} x${Number(i.quantity)}: ${formatMoney(Number(i.quantity) * Number(i.unitPrice))}`)
    .join("\n")}\n\nAmount due: ${formatMoney(due)}${inv.dueDate ? ` (due ${formatDate(inv.dueDate)})` : ""}\n\n${inv.notes ?? ""}`;

  try {
    await createTransport().sendMail({
      from: fromAddress(SITE.name),
      to: inv.client.email,
      subject: `Invoice ${no} from ${SITE.name} — ${formatMoney(due)}`,
      text,
      html,
    });
  } catch (e) {
    console.error("Invoice email failed:", e);
    return { error: "The email could not be sent. Please try again." };
  }

  await db
    .update(t.invoices)
    .set({ status: inv.status === "DRAFT" ? "SENT" : inv.status, sentAt: new Date() })
    .where(eq(t.invoices.id, id));
  await audit(user, "UPDATE", "invoice", id, { emailed: inv.client.email });
  revalidatePath(`/admin/invoices/${id}`);
  return { sent: true };
}
