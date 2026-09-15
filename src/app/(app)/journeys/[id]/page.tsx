import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card, CardTitle, StatCard } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const journey = await db.journey.findUnique({
    where: { id },
    include: {
      country: true,
      brand: true,
      steps: {
        include: { channel: true, tasks: true },
        orderBy: { order: "asc" },
      },
      tasks: { include: { owner: true, journeyStep: true }, orderBy: { dueDate: "asc" } },
      risks: true,
    },
  });
  if (!journey) notFound();
  if (countryScope !== "ALL" && !countryScope.includes(journey.countryId)) notFound();
  if (brandScope !== "ALL" && !brandScope.includes(journey.brandId)) notFound();

  const totalTasks = journey.tasks.length;
  const completedTasks = journey.tasks.filter((t) => t.status === "COMPLETED" || t.status === "APPROVED").length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/journeys" className="text-xs text-gray-500 hover:underline">← Journeys</Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{journey.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            <Link href={`/countries/${journey.country.id}`} className="hover:underline">{journey.country.name}</Link>
            {" · "}
            <Link href={`/brands/${journey.brand.id}`} className="hover:underline">{journey.brand.name}</Link>
            {" · "}{journey.journeyType}
          </p>
          {journey.description && <p className="mt-2 text-sm text-gray-600">{journey.description}</p>}
        </div>
        <Link href={`/journeys/${journey.id}/edit`} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Journey Type" value={journey.journeyType} />
        <StatCard label="Steps" value={journey.steps.length} />
        <StatCard label="Tasks" value={totalTasks} />
        <StatCard label="Owner" value={journey.owner ?? "—"} />
      </div>

      <Card>
        <ProgressBar value={completionPct} label="Task completion" />
      </Card>

      <div className="flex items-center justify-between">
        <CardTitle>Journey Steps</CardTitle>
        <Link href={`/journeys/${journey.id}/steps/new`} className="text-xs font-medium text-gray-700 hover:underline">
          + Add Step
        </Link>
      </div>
      <div className="space-y-3">
        {journey.steps.map((step) => (
          <Card key={step.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {step.order}. {step.name}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {step.onlineOffline} · {step.channel?.name ?? "No channel"} · Owner: {step.owner ?? "—"}
                </div>
                {step.description && <p className="mt-2 text-sm text-gray-600">{step.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={step.status} />
                <Link href={`/journeys/${journey.id}/steps/${step.id}/edit`} className="text-xs text-gray-500 hover:underline">
                  Edit
                </Link>
              </div>
            </div>
            {step.tasks.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="text-xs font-medium text-gray-400 uppercase">Tasks</div>
                <ul className="mt-1 space-y-1">
                  {step.tasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{t.title}</span>
                      <StatusBadge status={t.status.replace("_", " ")} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
        {journey.steps.length === 0 && (
          <Card>
            <p className="text-sm text-gray-400">No steps defined yet.</p>
          </Card>
        )}
      </div>

      <CardTitle>All Journey Tasks</CardTitle>
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {journey.tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                <td className="px-4 py-3 text-gray-600">{t.journeyStep?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.owner?.fullName ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={t.status.replace("_", " ")} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {journey.tasks.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No tasks yet.</p>}
      </Card>

      {journey.risks.length > 0 && (
        <>
          <CardTitle>Risks</CardTitle>
          <Card>
            <ul className="space-y-2">
              {journey.risks.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{r.title}</span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
