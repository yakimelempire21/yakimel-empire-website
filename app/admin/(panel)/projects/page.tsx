import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { PROJECT_STATUSES, formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import { DEPARTMENT_SCOPED } from "@/lib/admin/roles";

type Status = (typeof PROJECT_STATUSES)[number];

const PIPELINE: { label: string; statuses: Status[] }[] = [
  { label: "Sales", statuses: ["LEAD", "CONSULTATION", "PROPOSAL", "CONTRACT", "DEPOSIT"] },
  { label: "In production", statuses: ["DESIGN", "DEVELOPMENT", "TESTING", "CLIENT_REVIEW"] },
  { label: "Closed", statuses: ["COMPLETED", "CANCELLED"] },
];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser("projects");
  const { status } = await searchParams;
  const scoped = DEPARTMENT_SCOPED.includes(user.role);
  const filter = (PROJECT_STATUSES as readonly string[]).includes(status ?? "") ? (status as Status) : undefined;

  const all = await db.query.projects.findMany({
    where: scoped ? eq(t.projects.departmentId, user.departmentId) : undefined,
    orderBy: desc(t.projects.updatedAt),
    with: { client: { columns: { fullName: true } } },
    limit: 500,
  });
  const rows = filter ? all.filter((p) => p.status === filter) : all;
  const countFor = (statuses: Status[]) => all.filter((p) => statuses.includes(p.status)).length;
  const pipelineValue = all
    .filter((p) => !["COMPLETED", "CANCELLED"].includes(p.status))
    .reduce((sum, p) => sum + Number(p.budget ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Projects"
        description={`Open pipeline value: ${formatMoney(pipelineValue)}`}
        action={
          <Link href="/admin/projects/new" className={primaryButton}>
            New project
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {PIPELINE.map((stage) => (
          <div key={stage.label} className="rounded-2xl border border-os-ink/15 bg-white p-4">
            <p className="text-sm text-os-muted">{stage.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{countFor(stage.statuses)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stage.statuses.map((s) => (
                <Link key={s} href={filter === s ? "/admin/projects" : `/admin/projects?status=${s}`}>
                  <Badge tone={filter === s ? "blue" : "gray"}>
                    {humanize(s)} {countFor([s])}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={filter ? `No projects in ${humanize(filter).toLowerCase()}` : "No projects yet"}
          body="Create a project for a client, or convert a website project request from the inbox."
        />
      ) : (
        <Table head={["Project", "Client", "Status", "Budget", "Deadline", "Updated"]}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-os-ink/[0.03]">
              <td className="px-5 py-3.5">
                <Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-os-accent">
                  {p.name}
                </Link>
                <p className="text-xs text-os-muted">{p.service}</p>
              </td>
              <td className="px-5 py-3.5 text-os-muted">{p.client.fullName}</td>
              <td className="px-5 py-3.5">
                <Badge tone={statusTone(p.status)}>{humanize(p.status)}</Badge>
              </td>
              <td className="px-5 py-3.5">{formatMoney(p.budget)}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{formatDate(p.deadline)}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{formatDate(p.updatedAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

