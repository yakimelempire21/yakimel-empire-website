import Link from "next/link";
import { desc } from "drizzle-orm";
import { Star } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate } from "@/lib/admin/format";
import { REVIEW_SERVICES } from "@/lib/reviews";
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

      <Card className="mb-6 p-5 text-sm text-dim-invert">
        Send this link to every client when a project is done:{" "}
        <span className="select-all font-mono text-ink-invert">https://www.yakimelempire.com/review</span>
      </Card>

      <details className="mb-6" open={params.add === "1" || all.length === 0}>
        <summary className="cursor-pointer text-sm font-medium text-[#8fb3ff]">+ Add a review you already received</summary>
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
              tab.value === status ? "bg-[#2F6FEA] text-white" : "border border-white/10 text-[#a2adc4] hover:text-white"
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
                  <p className="font-medium text-ink-invert">{r.name}</p>
                  <p className="text-sm text-dim-invert">{[r.role, r.company].filter(Boolean).join(", ") || "—"}</p>
                </div>
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={15} aria-hidden="true" className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-white/20"} />
                  ))}
                </div>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink-invert/90">“{r.body}”</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-dim-invert">
                {r.service && <Badge tone="blue">{r.service}</Badge>}
                <Badge tone={r.consent ? "green" : "amber"}>{r.consent ? "OK to publish" : "No permission to publish"}</Badge>
                <span>
                  {r.source === "team" ? "Added by team" : "From website"} · {formatDate(r.createdAt)}
                </span>
                {r.email && <span>· {r.email}</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {r.status !== "APPROVED" && r.consent && (
                  <form action={setReviewStatus.bind(null, r.id, "APPROVED")}>
                    <button className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/25">Publish</button>
                  </form>
                )}
                {r.status !== "HIDDEN" && (
                  <form action={setReviewStatus.bind(null, r.id, "HIDDEN")}>
                    <button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#a2adc4] hover:text-white">Hide</button>
                  </form>
                )}
                <form action={deleteReview.bind(null, r.id)}>
                  <button className="rounded-lg px-3 py-1.5 text-sm text-red-300/80 hover:bg-red-500/10 hover:text-red-300">Delete</button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
