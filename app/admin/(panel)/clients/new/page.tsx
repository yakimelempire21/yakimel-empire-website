import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { createClient } from "../actions";
import ClientForm from "../ClientForm";

export default async function NewClientPage() {
  await requireUser("clients");
  return (
    <>
      <PageHeader title="New client" back={{ href: "/admin/clients", label: "Clients" }} />
      <Card className="max-w-3xl p-6">
        <ClientForm action={createClient} submitLabel="Create client" />
      </Card>
    </>
  );
}
