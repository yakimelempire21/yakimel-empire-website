import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { ExternalLink, FileText } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Table, inputClass } from "@/components/admin/ui";
import { formatDate, formatMoney, humanize, statusTone } from "@/lib/admin/format";
import { clientOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { storageConfigured } from "@/lib/storage";
import { setDocumentStatus } from "@/app/admin/(panel)/documents/actions";
import UploadForm from "@/app/admin/(panel)/documents/UploadForm";

type DocType = "CONTRACT" | "PROPOSAL" | "SOW" | "INVOICE" | "RECEIPT" | "COMPANY" | "HR" | "OTHER";
const ALL_TYPES: DocType[] = ["CONTRACT", "PROPOSAL", "SOW", "INVOICE", "RECEIPT", "COMPANY", "HR", "OTHER"];
const CONTRACT_TYPES: DocType[] = ["CONTRACT", "PROPOSAL", "SOW"];

const size = (b: number | null) => (!b ? "" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Shared by /admin/documents (everything) and /admin/contracts (contracts, proposals, SOWs). */
export default async function DocumentsView({ mode, typeFilter }: { mode: "documents" | "contracts"; typeFilter?: string }) {
  const types = mode === "contracts" ? CONTRACT_TYPES : ALL_TYPES;
  const filter = types.find((x) => x === typeFilter);

  const [docs, clients] = await Promise.all([
    db.query.documents.findMany({
      where: inArray(t.documents.type, filter ? [filter] : types),
      orderBy: desc(t.documents.createdAt),
      limit: 300,
      with: { client: { columns: { id: true, fullName: true } } },
    }),
    clientOptions(),
  ]);
  const storageReady = storageConfigured();
  const base = mode === "contracts" ? "/admin/contracts" : "/admin/documents";
  const signedValue = docs.filter((d) => d.status === "SIGNED").reduce((s, d) => s + Number(d.value ?? 0), 0);

  return (
    <>
      <PageHeader
        title={mode === "contracts" ? "Contracts" : "Documents"}
        description={
          mode === "contracts"
            ? `Contracts, proposals and statements of work · ${formatMoney(signedValue)} signed`
            : "Contracts, proposals, invoices, receipts and company files in one private place."
        }
      />

      <Card className="mb-6 p-5">
        <UploadForm clients={clients} types={types} defaultType={types[0]} storageReady={storageReady} />
        {!storageReady && (
          <p className="mt-3 text-xs text-amber-300/90">
            File uploads turn on once SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are added. Until then you can save links
            (Google Drive, DocuSign…).
          </p>
        )}
      </Card>

      <div className="mb-5 flex flex-wrap gap-2">
        {[undefined, ...types].map((x) => (
          <Link
            key={x ?? "all"}
            href={x ? `${base}?type=${x}` : base}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              x === filter ? "bg-[#2F6FEA] text-white" : "border border-white/10 text-[#a2adc4] hover:text-white"
            }`}
          >
            {x ? (x === "SOW" ? "SOW" : humanize(x)) : "All"}
          </Link>
        ))}
      </div>

      {docs.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Add your first document above." />
      ) : (
        <Table head={mode === "contracts" ? ["Document", "Client", "Value", "Signed", "Expires", "Status"] : ["Document", "Type", "Client", "Added", "Status"]}>
          {docs.map((d) => (
            <tr key={d.id}>
              <td className="px-5 py-3">
                <a href={`/admin/documents/${d.id}/download`} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-2">
                  {d.storagePath ? (
                    <FileText size={16} className="mt-0.5 shrink-0 text-[#7fa8ff]" aria-hidden="true" />
                  ) : (
                    <ExternalLink size={16} className="mt-0.5 shrink-0 text-[#7fa8ff]" aria-hidden="true" />
                  )}
                  <span>
                    <span className="font-medium group-hover:text-[#4d8dff]">{d.title}</span>
                    <span className="block text-xs text-[#7f93b8]">{d.fileName ? `${d.fileName} · ${size(d.sizeBytes)}` : "External link"}</span>
                  </span>
                </a>
              </td>
              {mode === "documents" && <td className="px-5 py-3 text-[#a2adc4]">{d.type === "SOW" ? "SOW" : humanize(d.type)}</td>}
              <td className="px-5 py-3 text-[#a2adc4]">
                {d.client ? (
                  <Link href={`/admin/clients/${d.client.id}`} className="hover:text-white">
                    {d.client.fullName}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              {mode === "contracts" ? (
                <>
                  <td className="px-5 py-3">{formatMoney(d.value)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{formatDate(d.signedAt)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{formatDate(d.expiresAt)}</td>
                </>
              ) : (
                <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{formatDate(d.createdAt)}</td>
              )}
              <td className="px-5 py-3">
                <form key={d.status} action={setDocumentStatus.bind(null, d.id)} className="flex items-center gap-1.5">
                  <Badge tone={statusTone(d.status)}>{humanize(d.status)}</Badge>
                  <select name="status" defaultValue={d.status} aria-label={`${d.title} status`} className={`${inputClass} w-28 py-1 text-xs`}>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="SIGNED">Signed</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <button type="submit" className="rounded-lg border border-white/15 px-2 py-1 text-xs hover:border-[#2F6FEA]">
                    Set
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
