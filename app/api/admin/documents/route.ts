import { NextResponse } from "next/server";
import { audit, getCurrentUser } from "@/lib/admin/auth";
import { parseMoney } from "@/lib/admin/format";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { MAX_UPLOAD_BYTES, storageConfigured, uploadFile } from "@/lib/storage";

const TYPES = ["CONTRACT", "PROPOSAL", "SOW", "INVOICE", "RECEIPT", "COMPANY", "HR", "OTHER"] as const;
const STATUSES = ["DRAFT", "SENT", "SIGNED", "EXPIRED", "ARCHIVED"] as const;
const ALLOWED = /^(application\/pdf|image\/(png|jpeg|webp)|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/msword|text\/plain|text\/csv)$/;

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const day = (v: string | null) => (v ? new Date(`${v}T12:00:00`) : null);

/** Adds a document: an uploaded file (stored privately) and/or an external link. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccess(user.role, "documents")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "The file is too large (max 4 MB)." }, { status: 413 });
  }

  const title = text(form, "title");
  if (!title) return NextResponse.json({ error: "Give the document a title." }, { status: 400 });
  const type = TYPES.find((x) => x === text(form, "type")) ?? "OTHER";
  const status = STATUSES.find((x) => x === text(form, "status")) ?? "DRAFT";
  const externalUrl = text(form, "externalUrl");
  if (externalUrl && !/^https:\/\//i.test(externalUrl)) {
    return NextResponse.json({ error: "Links must start with https://" }, { status: 400 });
  }

  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !externalUrl) return NextResponse.json({ error: "Choose a file or paste a link." }, { status: 400 });

  let storage: { storagePath: string; fileName: string; mimeType: string; sizeBytes: number } | null = null;
  if (hasFile) {
    if (!storageConfigured()) {
      return NextResponse.json(
        { error: "File storage isn't set up yet (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Paste a link instead." },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "The file is too large (max 4 MB)." }, { status: 413 });
    if (!ALLOWED.test(file.type)) {
      return NextResponse.json({ error: "Use PDF, Word, Excel, PowerPoint, image, text or CSV files." }, { status: 400 });
    }
    const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-100) || "file";
    const storagePath = `${type.toLowerCase()}/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;
    try {
      await uploadFile(storagePath, file);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "The upload failed. Please try again." }, { status: 502 });
    }
    storage = { storagePath, fileName: file.name.slice(0, 200), mimeType: file.type, sizeBytes: file.size };
  }

  const [doc] = await db
    .insert(t.documents)
    .values({
      title,
      type,
      status,
      clientId: text(form, "clientId"),
      projectId: text(form, "projectId"),
      externalUrl,
      value: parseMoney(text(form, "value")),
      signedAt: day(text(form, "signedAt")),
      expiresAt: day(text(form, "expiresAt")),
      notes: text(form, "notes"),
      uploadedById: user.id,
      ...storage,
    })
    .returning({ id: t.documents.id });
  await audit(user, "CREATE", "document", doc.id, { type, file: Boolean(storage) });
  return NextResponse.json({ ok: true, id: doc.id });
}
