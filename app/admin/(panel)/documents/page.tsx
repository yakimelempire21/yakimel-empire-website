import DocumentsView from "@/components/admin/DocumentsView";
import { requireUser } from "@/lib/admin/auth";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireUser("documents");
  return <DocumentsView mode="documents" typeFilter={(await searchParams).type} />;
}
