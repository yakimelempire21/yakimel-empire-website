import Link from "next/link";
import { asc, ne } from "drizzle-orm";
import { Card, EmptyState, PageHeader, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { clientOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { services } from "@/lib/services";
import InvoiceForm from "../InvoiceForm";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string; project?: string }> }) {
  await requireUser("finance");
  const sp = await searchParams;
  const [clients, projects] = await Promise.all([
    clientOptions(),
    db
      .select({ id: t.projects.id, name: t.projects.name, clientId: t.projects.clientId })
      .from(t.projects)
      .where(ne(t.projects.status, "CANCELLED"))
      .orderBy(asc(t.projects.name)),
  ]);

  // Prices from the public Services page, for one-click line items.
  const presets = services
    .filter((s) => /^\$\d/.test(s.price))
    .map((s) => ({ label: s.title, price: s.price.replace(/[^0-9.]/g, "") }));

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 14);

  return (
    <>
      <PageHeader title="New invoice" back={{ href: "/admin/invoices", label: "Invoices" }} />
      {clients.length === 0 ? (
        <EmptyState
          title="Add a client first"
          action={
            <Link href="/admin/clients/new" className={primaryButton}>
              New client
            </Link>
          }
        />
      ) : (
        <Card className="p-6">
          <InvoiceForm
            clients={clients}
            projects={projects.map((p) => ({ value: p.id, label: p.name, clientId: p.clientId }))}
            presets={presets}
            defaults={{ clientId: sp.client, projectId: sp.project, issueDate: iso(today), dueDate: iso(due) }}
          />
        </Card>
      )}
    </>
  );
}
