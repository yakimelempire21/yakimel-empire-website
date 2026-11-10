import Link from "next/link";
import { desc } from "drizzle-orm";
import { Star } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate } from "@/lib/admin/format";
import { REVIEW_SERVICES } from "@/lib/reviews";
import { SITE } from "@/lib/site";
import { db, tables as t } from "@/lib/db";
import AddReviewForm from "./AddReviewForm";
import { deleteReview, setReviewStatus } from "./actions";

const TABS = [
  { label: "Waiting", value: "PENDING" },
  { label: "Published", value: "APPROVED" },
  { label: "Hidden", value: "HIDDEN" },
] as const;
type Status = (typeof TABS)[number]["value"];

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string; add?: string }> }) {
  await requireUser("clients");
  const params = await searchParams;
  const status: Status = TABS.some((tab) => tab.value === params.status) ? (params.status as Status) : "PENDING";

  const all = await db.query.reviews.findMany({ orderBy: desc(t.reviews.createdAt), limit: 500 });
  const counts = Object.fromEntries(TABS.map((tab) => [tab.value, all.filter((r) => r.status === tab.value).length]));
  const list = all.filter((r) => r.status === status);

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Client reviews. Published reviews appear on the home page and the Pricing page."
        action={
          <a href="/review" target="_blank" rel="noopener noreferrer" className={secondaryButton}>
            Open review page ↗
          </a>
        }
      />

      <Card className="mb-6 p-5 text-sm text-os-muted">
        Send this link to every client when a project is done:{" "}
        <span className="select-all font-mono text-os-ink">https://www.yakimelempire.com/review</span>
        {SITE.googleReviewUrl && (
          <>
            <br />
            And ask happy clients for a Google review (it shows on Google Maps):{" "}
            <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="select-all font-mono text-os-accent hover:underline">
              {SITE.googleReviewUrl}
            </a>
          </>
        )}
      </Card>

      <details className="mb-6" open={params.add === "1" || all.length === 0}>
        <summary className="cursor-pointer text-sm font-medium text-os-accent">+ Add a review you already received</summary>
        <Card className="mt-3 p-6">
          <AddReviewForm services={REVIEW_SERVICES} />
        </Card>
      </details>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              tab.value === status ? "bg-os-accent text-white" : "border border-os-ink/15 text-os-muted hover:text-os-ink"
            }`}
          >
            {tab.label} ({counts[tab.value]})
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={status === "PENDING" ? "No reviews waiting" : status === "APPROVED" ? "No published reviews yet" : "No hidden reviews"}
          body="New reviews sent through yakimelempire.com/review arrive here for approval."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((r) => (
            <Card key={r.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-os-ink">{r.name}</p>
                  <p className="text-sm text-os-muted">{[r.role, r.company].filter(Boolean).join(", ") || "—"}</p>
                </div>
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={15} aria-hidden="true" className={n <= r.rating ? "fill-amber-400 text-amber-700" : "text-os-ink/20"} />
                  ))}
                </div>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-os-ink/90">“{r.body}”</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-os-muted">
                {r.service && <Badge tone="blue">{r.service}</Badge>}
                <Badge tone={r.consent ? "green" : "amber"}>{r.consent ? "OK to publish" : "No permission to publish"}</Badge>
                <span>
                  {r.source === "team" ? "Added by team" : "From website"} · {formatDate(r.createdAt)}
                </span>
                {r.email && <span>· {r.email}</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-os-ink/15 pt-4">
                {r.status !== "APPROVED" && r.consent && (
                  <form action={setReviewStatus.bind(null, r.id, "APPROVED")}>
                    <button className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100">Publish</button>
                  </form>
                )}
                {r.status !== "HIDDEN" && (
                  <form action={setReviewStatus.bind(null, r.id, "HIDDEN")}>
                    <button className="rounded-lg border border-os-ink/15 px-3 py-1.5 text-sm text-os-muted hover:text-os-ink">Hide</button>
                  </form>
                )}
                <form action={deleteReview.bind(null, r.id)}>
                  <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 hover:text-red-700">Delete</button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
