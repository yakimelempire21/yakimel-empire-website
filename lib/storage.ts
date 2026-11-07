import "server-only";

/**
 * Private file storage on Supabase Storage (bucket "documents").
 *
 * Needs, in .env.local and Vercel:
 *   SUPABASE_URL               https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  Project Settings → API keys → service_role / secret key
 *
 * The bucket is created as private on first upload. Files are only reachable
 * through short-lived signed links generated after a permission check.
 */
const BUCKET = "documents";
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies.

export function storageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function base() {
  return (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
}

function authHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return { Authorization: `Bearer ${key}`, apikey: key };
}

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

async function ensureBucket() {
  const res = await fetch(`${base()}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false, file_size_limit: MAX_UPLOAD_BYTES }),
  });
  // 200 = created; 400/409 = already exists.
  if (!res.ok && res.status !== 400 && res.status !== 409) {
    throw new Error(`Could not create storage bucket (${res.status}): ${await res.text()}`);
  }
}

export async function uploadFile(path: string, file: File): Promise<void> {
  const body = Buffer.from(await file.arrayBuffer());
  const put = () =>
    fetch(`${base()}/storage/v1/object/${BUCKET}/${encodePath(path)}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" },
      body,
    });

  let res = await put();
  if (!res.ok) {
    const body = await res.text();
    if (/bucket not found/i.test(body) || res.status === 404) {
      await ensureBucket();
      res = await put();
      if (res.ok) return;
      throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
    }
    throw new Error(`Upload failed (${res.status}): ${body}`);
  }
}

/** A download link valid for `seconds` (default 2 minutes). */
export async function signedUrl(path: string, fileName?: string | null, seconds = 120): Promise<string> {
  const res = await fetch(`${base()}/storage/v1/object/sign/${BUCKET}/${encodePath(path)}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: seconds }),
  });
  if (!res.ok) throw new Error(`Could not sign download link (${res.status}): ${await res.text()}`);
  const { signedURL } = (await res.json()) as { signedURL: string };
  const url = new URL(`${base()}/storage/v1${signedURL}`);
  if (fileName) url.searchParams.set("download", fileName);
  return url.toString();
}
