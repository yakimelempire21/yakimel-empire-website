import AppCard from "@/components/admin/AppCard";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { appsWithLatestMetrics } from "@/lib/admin/ecosystem";

export default async function AppMonitoringPage() {
  await requireUser("apps");
  const apps = await appsWithLatestMetrics();
  const live = apps.filter((a) => a.status === "LIVE").length;
  const connected = apps.filter((a) => a.connected).length;

  return (
    <>
      <PageHeader
        title="App Monitoring"
        description={`${apps.length} apps · ${live} live · ${connected} connected to YAKIMEL OS`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </div>
    </>
  );
}
