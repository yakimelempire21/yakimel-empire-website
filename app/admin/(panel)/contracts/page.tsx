import DocumentsView from "@/components/admin/DocumentsView";
import { requireUser } from "@/lib/admin/auth";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireUser("documents");
  return <DocumentsView mode="contracts" typeFilter={(await searchParams).type} />;
}
