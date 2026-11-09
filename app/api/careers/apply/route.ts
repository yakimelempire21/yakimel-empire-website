import { NextResponse } from "next/server";
import { and, count, eq, gt } from "drizzle-orm";
import { notifyArea } from "@/lib/admin/notify";
import { RESUME_TYPES } from "@/lib/careers";
import { db, tables as t } from "@/lib/db";
import { CONTACT_INBOX, createTransport, fromAddress, mailConfigured } from "@/lib/mailer";
import { MAX_UPLOAD_BYTES, storageConfigured, uploadFile } from "@/lib/storage";

const field = (form: FormData, key: string, max: number) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

/** A job application from yakimelempire.com/careers/<role>. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Your résumé is too large (max 4 MB)." }, { status: 413 });
  }
  if (field(form, "website", 200)) return NextResponse.json({ success: true }); // honeypot

  const jobId = field(form, "jobId", 80);
  const fullName = field(form, "fullName", 100);
  const email = field(form, "email", 200);
  if (!jobId || !fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please add your full name and a valid email." }, { status: 400 });
  }
  const linkUrl = field(form, "linkUrl", 300);
  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
    return NextResponse.json({ error: "Links must start with https://" }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  try {
    const job = await db.query.jobs.findFirst({ where: and(eq(t.jobs.id, jobId), eq(t.jobs.status, "OPEN")) });
    if (!job) return NextResponse.json({ error: "This role is no longer open." }, { status: 404 });

    if (ipAddress) {
      const [{ n }] = await db
        .select({ n: count() })
        .from(t.jobApplications)
        .where(and(eq(t.jobApplications.ipAddress, ipAddress), gt(t.jobApplications.createdAt, new Date(Date.now() - 60 * 60_000))));
      if (n >= 5) return NextResponse.json({ error: "Thanks! We already received your application." }, { status: 429 });
    }

    // Optional résumé (PDF or Word), stored privately.
    let resumePath: string | null = null;
    let resumeName: string | null = null;
    const file = form.get("resume");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Your résumé is too large (max 4 MB)." }, { status: 413 });
      if (!RESUME_TYPES.test(file.type)) return NextResponse.json({ error: "Upload your résumé as a PDF or Word file." }, { status: 400 });
      if (storageConfigured()) {
        resumeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-100) || "resume.pdf";
        resumePath = `hiring/${job.slug}/${crypto.randomUUID()}-${resumeName}`;
        await uploadFile(resumePath, file);
      }
    }

    const [application] = await db
      .insert(t.jobApplications)
      .values({
        jobId: job.id,
        fullName,
        email,
        phone: field(form, "phone", 40) || null,
        location: field(form, "location", 100) || null,
        linkUrl: linkUrl || null,
        coverLetter: field(form, "coverLetter", 4000) || null,
        resumePath,
        resumeName,
        ipAddress,
      })
      .returning({ id: t.jobApplications.id });

    await notifyArea("employees", {
      kind: "INBOX",
      title: `New application: ${fullName}`,
      body: job.title,
      href: `/admin/hiring/applications/${application.id}`,
    }).catch(() => {});

    if (mailConfigured()) {
      const transporter = createTransport();
      await Promise.allSettled([
        transporter.sendMail({
          from: fromAddress("Yakimel Empire Careers"),
          to: CONTACT_INBOX,
          replyTo: email,
          subject: `New application — ${job.title} — ${fullName}`,
          text: `${fullName} applied for ${job.title}.\n\nEmail: ${email}\nPhone: ${field(form, "phone", 40) || "—"}\nLocation: ${field(form, "location", 100) || "—"}\n\nOpen it in YAKIMEL OS → Hiring.`,
        }),
        transporter.sendMail({
          from: fromAddress("Yakimel Empire Careers"),
          to: email,
          subject: `We received your application — ${job.title}`,
          text: `Hi ${fullName.split(" ")[0]},\n\nThank you for applying for the ${job.title} role at Yakimel Empire LLC. Our team will review your application and get back to you if your profile is a good fit.\n\nYakimel Empire LLC\nhttps://www.yakimelempire.com`,
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[careers] application failed:", (error as Error).message);
    return NextResponse.json({ error: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
}
