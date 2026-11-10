import type { MetadataRoute } from "next";
import { openJobs } from "@/lib/careers";
import { isExternal, products } from "@/lib/products";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

/** Every public page Google should know about (yakimelempire.com/sitemap.xml). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const jobs = await openJobs();
  return [
    page("/", 1, "weekly"),
    page("/pricing", 0.9, "weekly"),
    page("/services", 0.9),
    page("/consultation", 0.8),
    page("/templates", 0.7),
    page("/products", 0.7),
    page("/about", 0.6),
    page("/faq", 0.6),
    page("/careers", 0.6, "weekly"),
    ...products.filter((p) => !isExternal(p.detailsUrl)).map((p) => page(p.detailsUrl, 0.5)),
    ...jobs.map((j) => ({ ...page(`/careers/${j.slug}`, 0.5, "weekly"), lastModified: j.updatedAt })),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
