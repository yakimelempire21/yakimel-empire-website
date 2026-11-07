import Link from "next/link";
import { Card, EmptyState, PageHeader, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { PROJECT_STATUSES, options } from "@/lib/admin/format";
import { clientOptions, departmentOptions, teamOptions } from "@/lib/admin/lookups";
import { createProject } from "../actions";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requireUser("projects");
  const { client } = await searchParams;
  const [clients, departments, managers] = await Promise.all([clientOptions(), departmentOptions(), teamOptions()]);

  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      {clients.length === 0 ? (
        <EmptyState
          title="Add a client first"
          body="Every project belongs to a client."
          action={
            <Link href="/admin/clients/new" className={primaryButton}>
              New client
            </Link>
          }
        />
      ) : (
        <Card className="max-w-3xl p-6">
          <ProjectForm
            action={createProject}
            defaultClientId={client}
            clients={clients}
            departments={departments}
            managers={managers}
            statuses={options(PROJECT_STATUSES)}
            submitLabel="Create project"
          />
        </Card>
      )}
    </>
  );
}
