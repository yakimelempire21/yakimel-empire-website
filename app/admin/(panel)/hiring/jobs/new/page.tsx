import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import JobForm from "../../JobForm";

export default async function NewJobPage() {
  await requireUser("employees");
  return (
    <>
      <PageHeader title="New job" back={{ href: "/admin/hiring?tab=jobs", label: "Hiring" }} />
      <Card className="p-6">
        <JobForm />
      </Card>
    </>
  );
}
