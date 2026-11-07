"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { parseMoney, str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

export type FinanceFormState = { error?: string; saved?: boolean } | undefined;
const day = (v: string | null) => (v ? new Date(`${v}T12:00:00`) : null);

export async function addExpense(_prev: FinanceFormState, form: FormData): Promise<FinanceFormState> {
  const user = await requireUser("finance");
  const amount = parseMoney(str(form, "amount"));
  const date = day(str(form, "date"));
  const category = str(form, "category");
  if (!amount || !date || !category) return { error: "Date, category and amount are required." };
  const [row] = await db
    .insert(t.expenses)
    .values({
      amount,
      date,
      category,
      vendor: str(form, "vendor"),
      description: str(form, "description"),
      departmentId: str(form, "departmentId"),
      recordedById: user.id,
    })
    .returning({ id: t.expenses.id });
  await audit(user, "CREATE", "expense", row.id, { amount });
  revalidatePath("/admin/finance", "layout");
  return { saved: true };
}

export async function deleteExpense(id: string) {
  const user = await requireUser("finance");
  await db.delete(t.expenses).where(eq(t.expenses.id, id));
  await audit(user, "DELETE", "expense", id);
  revalidatePath("/admin/finance", "layout");
}

export async function addSubscription(_prev: FinanceFormState, form: FormData): Promise<FinanceFormState> {
  const user = await requireUser("finance");
  const amount = parseMoney(str(form, "amount"));
  const name = str(form, "name");
  const kind = str(form, "kind") === "EXPENSE" ? "EXPENSE" : "INCOME";
  const interval = (["MONTHLY", "QUARTERLY", "YEARLY"] as const).find((i) => i === str(form, "interval")) ?? "MONTHLY";
  if (!amount || !name) return { error: "Name and amount are required." };
  const [row] = await db
    .insert(t.subscriptions)
    .values({
      kind,
      name,
      amount,
      interval,
      clientId: kind === "INCOME" ? str(form, "clientId") : null,
      vendor: kind === "EXPENSE" ? str(form, "vendor") : null,
      nextDate: day(str(form, "nextDate")),
    })
    .returning({ id: t.subscriptions.id });
  await audit(user, "CREATE", "subscription", row.id, { kind, amount });
  revalidatePath("/admin/finance", "layout");
  return { saved: true };
}

export async function setSubscriptionStatus(id: string, form: FormData) {
  const user = await requireUser("finance");
  const status = (["ACTIVE", "PAUSED", "CANCELLED"] as const).find((s) => s === str(form, "status"));
  if (!status) return;
  await db.update(t.subscriptions).set({ status }).where(eq(t.subscriptions.id, id));
  await audit(user, "UPDATE", "subscription", id, { status });
  revalidatePath("/admin/finance", "layout");
}
