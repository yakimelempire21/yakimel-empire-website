import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lines, openJobBySlug } from "@/lib/careers";
import { SITE } from "@/lib/site";
import JobView from "./JobView";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const job = await openJobBySlug((await params).slug);
  if (!job) return { title: "Careers | Yakimel Empire" };
  const title = `${job.title} — Careers at Yakimel Empire`;
  return { title, description: job.summary ?? undefined, alternates: { canonical: `/careers/${job.slug}` }, openGraph: { title, description: job.summary ?? undefined, siteName: SITE.name } };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await openJobBySlug((await params).slug);
  if (!job) notFound();

  const sections = [
    { title: "What you'll do", items: lines(job.responsibilities) },
    { title: "What we're looking for", items: lines(job.requirements) },
  ].filter((s) => s.items.length > 0);

  // Structured data so the role can appear in Google's job search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.description, ...sections.map((s) => `${s.title}: ${s.items.join("; ")}`)].join("\n\n"),
    datePosted: (job.publishedAt ?? job.createdAt).toISOString().slice(0, 10),
    employmentType: "CONTRACTOR",
    hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url },
    jobLocationType: /remote/i.test(job.location ?? "") ? "TELECOMMUTE" : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <JobView job={job} />
    </>
  );
}
