import { NextResponse } from "next/server";
import { and, count, eq, gt } from "drizzle-orm";
import { notifyArea } from "@/lib/admin/notify";
import { RESUME_EXTENSIONS, RESUME_TYPES } from "@/lib/careers";
import { db, tables as t } from "@/lib/db";
import { CONTACT_INBOX, createTransport, fromAddress, mailConfigured } from "@/lib/mailer";
import { MAX_UPLOAD_BYTES, storageConfigured, uploadFile } from "@/lib/storage";

const field = (form: FormData, key: string, max: number) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

/** True when the file's first bytes match a PDF, an old Word (.doc) or a .docx (zip) file. */
async function looksLikeResume(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  return starts(0x25, 0x50, 0x44, 0x46) || starts(0xd0, 0xcf, 0x11, 0xe0) || starts(0x50, 0x4b, 0x03, 0x04);
}

const fail = (error: string, status: number, field?: string) => NextResponse.json({ error, field }, { status });

/** A job application from yakimelempire.com/careers/<role>. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Your résumé is larger than 4 MB. Please upload a smaller file.", 413, "resume");
  }
  if (field(form, "website", 200)) return NextResponse.json({ success: true }); // honeypot

  const jobId = field(form, "jobId", 80);
  const fullName = field(form, "fullName", 100);
  const email = field(form, "email", 200);
  if (!jobId) return fail("This form is missing its role. Please reload the page.", 400);
  if (!fullName) return fail("Enter your full name.", 400, "fullName");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address, like name@example.com.", 400, "email");
  const linkUrl = field(form, "linkUrl", 300);
  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
    return fail("Enter a full link that starts with https://", 400, "linkUrl");
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  try {
    const job = await db.query.jobs.findFirst({ where: and(eq(t.jobs.id, jobId), eq(t.jobs.status, "OPEN")) });
    if (!job) return fail("This role is no longer open.", 404);

    if (ipAddress) {
      const [{ n }] = await db
        .select({ n: count() })
        .from(t.jobApplications)
        .where(and(eq(t.jobApplications.ipAddress, ipAddress), gt(t.jobApplications.createdAt, new Date(Date.now() - 60 * 60_000))));
      if (n >= 5) return fail("Too many applications were sent from this connection. Please try again in an hour.", 429);
    }

    // Same person, same role, a few minutes apart (double click, retry): keep the first one.
    const [{ n: recent }] = await db
      .select({ n: count() })
      .from(t.jobApplications)
      .where(and(eq(t.jobApplications.jobId, job.id), eq(t.jobApplications.email, email.toLowerCase()), gt(t.jobApplications.createdAt, new Date(Date.now() - 10 * 60_000))));
    if (recent > 0) return NextResponse.json({ success: true, confirmationSent: false });

    // Optional résumé (PDF or Word), stored privately.
    let resumePath: string | null = null;
    let resumeName: string | null = null;
    const file = form.get("resume");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) return fail("Your résumé is larger than 4 MB. Please upload a smaller file.", 413, "resume");
      const typeOk = RESUME_EXTENSIONS.test(file.name) && (!file.type || RESUME_TYPES.test(file.type)) && (await looksLikeResume(file));
      if (!typeOk) return fail("Upload your résumé as a PDF or Word file (.pdf, .doc or .docx).", 400, "resume");
      // Never accept a file we can't store privately: say so instead of silently dropping it.
      if (!storageConfigured()) {
        return fail("Résumé uploads aren't available right now. Please remove the file and submit without it; you can add a link instead.", 503, "resume");
      }
      resumeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-100) || "resume.pdf";
      resumePath = `hiring/${job.slug}/${crypto.randomUUID()}-${resumeName}`;
      await uploadFile(resumePath, file);
    }

    const [application] = await db
      .insert(t.jobApplications)
      .values({
        jobId: job.id,
        fullName,
        email: email.toLowerCase(),
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

    // Emails never block the application: it is already saved. Only report the confirmation as sent if it was accepted.
    let confirmationSent = false;
    if (mailConfigured()) {
      const transporter = createTransport();
      const [, toApplicant] = await Promise.allSettled([
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
          text: `Hi ${fullName.split(" ")[0]},\n\nThank you for applying for the ${job.title} role at Yakimel Empire LLC. Our team will review your application.\n\nYakimel Empire LLC\nhttps://www.yakimelempire.com`,
        }),
      ]);
      confirmationSent = toApplicant.status === "fulfilled";
    }

    return NextResponse.json({ success: true, confirmationSent });
  } catch (error) {
    console.error("[careers] application failed:", (error as Error).message);
    return fail("Your application could not be saved. Please try again in a moment. Your answers are still in the form.", 500);
  }
}
