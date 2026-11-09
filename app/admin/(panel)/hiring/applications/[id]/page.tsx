import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Badge, Card, PageHeader, inputClass, labelClass, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, APPLICATION_TONES, formatDate, humanize } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import { updateApplication } from "../../actions";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("employees");
  const a = await db.query.jobApplications.findFirst({
    where: eq(t.jobApplications.id, (await params).id),
    with: { job: { columns: { id: true, title: true } } },
  });
  if (!a) notFound();
  const waText = encodeURIComponent(`Hi ${a.fullName.split(" ")[0]}, this is Yakimel Empire about your application for ${a.job?.title}.`);
  const phoneDigits = a.phone?.replace(/\D/g, "");

  return (
    <>
      <PageHeader
        title={a.fullName}
        description={`${a.job?.title ?? "Job"} · applied ${formatDate(a.createdAt, true)}`}
        back={{ href: "/admin/hiring", label: "Hiring" }}
        action={<Badge tone={APPLICATION_TONES[a.status]}>{humanize(a.status)}</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                ["Email", <a key="e" href={`mailto:${a.email}`} className="text-os-accent hover:underline">{a.email}</a>],
                ["Phone / WhatsApp", a.phone ?? "—"],
                ["Location", a.location ?? "—"],
                ["Link", a.linkUrl ? <a key="l" href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="break-all text-os-accent hover:underline">{a.linkUrl}</a> : "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className={labelClass}>{k}</dt>
                  <dd className="text-sm text-os-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Your application — ${a.job?.title ?? "Yakimel Empire"}`)}`} className={secondaryButton}>
                Email
              </a>
              {phoneDigits && (
                <a href={`https://wa.me/${phoneDigits}?text=${waText}`} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                  WhatsApp
                </a>
              )}
              {a.resumePath && (
                <a href={`/admin/hiring/applications/${a.id}/resume`} className={secondaryButton}>
                  Download résumé
                </a>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="mb-3 font-display font-bold">Why they&apos;re a good fit</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-os-ink">{a.coverLetter || "—"}</p>
          </Card>
        </div>
        <Card className="h-fit p-6">
          <form action={updateApplication.bind(null, a.id)} className="space-y-4" key={a.status}>
            <label className="block">
              <span className={labelClass}>Stage</span>
              <select name="status" defaultValue={a.status} className={inputClass}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Team notes (private)</span>
              <textarea name="notes" rows={6} defaultValue={a.notes ?? ""} className={inputClass} />
            </label>
            <button type="submit" className={secondaryButton}>
              Save
            </button>
          </form>
          {a.job && (
            <p className="mt-5 text-sm">
              <Link href={`/admin/hiring?job=${a.job.id}`} className="text-os-accent hover:underline">
                All applicants for this job →
              </Link>
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
