import "server-only";
import { eq, sql } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";

export const PAYMENT_METHODS = ["ZELLE", "CASH_APP", "CARD", "STRIPE", "PAYPAL", "BANK_TRANSFER", "CASH", "CHECK", "OTHER"] as const;
export const EXPENSE_CATEGORIES = [
  "Software & Subscriptions",
  "Hosting & Domains",
  "Advertising & Marketing",
  "Contractors & Freelancers",
  "Payroll",
  "Equipment",
  "Office & Supplies",
  "Professional Services",
  "Taxes & Fees",
  "Travel",
  "Other",
] as const;

export const invoiceNumber = (n: number) => `INV-${1000 + n}`;

/** Status shown to people: a sent invoice past its due date is overdue. */
export function displayStatus(inv: { status: string; dueDate: Date | null }, today: Date = new Date()): string {
  if ((inv.status === "SENT" || inv.status === "PARTIAL") && inv.dueDate) {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    if (new Date(inv.dueDate) < start) return "OVERDUE";
  }
  return inv.status;
}

export const balance = (inv: { total: string; amountPaid: string }) => Math.max(0, Number(inv.total) - Number(inv.amountPaid));

/** Monthly value of a recurring amount. */
export function monthly(amount: string | number, interval: "MONTHLY" | "QUARTERLY" | "YEARLY"): number {
  const a = Number(amount);
  return interval === "YEARLY" ? a / 12 : interval === "QUARTERLY" ? a / 3 : a;
}

/**
 * Recomputes an invoice's total and amount paid from its items and payments,
 * then moves it to PARTIAL / PAID when money comes in. Draft and void stay put
 * unless a payment arrives.
 */
export async function recalcInvoice(invoiceId: string) {
  const [[items], [paid], inv] = await Promise.all([
    db
      .select({ total: sql<string>`coalesce(sum(${t.invoiceItems.quantity} * ${t.invoiceItems.unitPrice}), 0)` })
      .from(t.invoiceItems)
      .where(eq(t.invoiceItems.invoiceId, invoiceId)),
    db
      .select({ amount: sql<string>`coalesce(sum(${t.payments.amount}), 0)` })
      .from(t.payments)
      .where(eq(t.payments.invoiceId, invoiceId)),
    db.query.invoices.findFirst({ where: eq(t.invoices.id, invoiceId), columns: { status: true } }),
  ]);
  if (!inv) return;

  const total = Number(items.total);
  const amountPaid = Number(paid.amount);
  let status = inv.status;
  if (inv.status !== "VOID") {
    if (amountPaid > 0 && amountPaid >= total && total > 0) status = "PAID";
    else if (amountPaid > 0) status = "PARTIAL";
    else if (status === "PAID" || status === "PARTIAL") status = "SENT";
  }
  await db
    .update(t.invoices)
    .set({ total: total.toFixed(2), amountPaid: amountPaid.toFixed(2), status })
    .where(eq(t.invoices.id, invoiceId));
}
