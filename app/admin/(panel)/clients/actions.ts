"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { CLIENT_STATUSES, str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type FormState = { error?: string } | undefined;

function readClient(form: FormData) {
  const status = str(form, "status");
  return {
    fullName: str(form, "fullName"),
    email: str(form, "email")?.toLowerCase() ?? null,
    phone: str(form, "phone"),
    company: str(form, "company"),
    website: str(form, "website"),
    source: str(form, "source"),
    notes: str(form, "notes"),
    status: (CLIENT_STATUSES as readonly string[]).includes(status ?? "") ? (status as ClientStatus) : "LEAD",
  };
}

export async function createClient(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("clients");
  const data = readClient(form);
  if (!data.fullName || !data.email) return { error: "Name and email are required." };

  const existing = await db.query.clients.findFirst({ where: eq(t.clients.email, data.email) });
  if (existing) return { error: "A client with this email already exists." };

  const [row] = await db
    .insert(t.clients)
    .values({ ...data, fullName: data.fullName, email: data.email })
    .returning({ id: t.clients.id });
  await audit(user, "CREATE", "client", row.id);
  redirect(`/admin/clients/${row.id}`);
}

export async function updateClient(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("clients");
  const data = readClient(form);
  if (!data.fullName || !data.email) return { error: "Name and email are required." };

  const clash = await db.query.clients.findFirst({ where: eq(t.clients.email, data.email) });
  if (clash && clash.id !== id) return { error: "Another client already uses this email." };

  await db
    .update(t.clients)
    .set({ ...data, fullName: data.fullName, email: data.email })
    .where(eq(t.clients.id, id));
  await audit(user, "UPDATE", "client", id);
  revalidatePath(`/admin/clients/${id}`);
  return undefined;
}
