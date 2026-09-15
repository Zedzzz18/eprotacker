import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { countryReadiness } from "@/lib/readiness";
import { Card, CardTitle, StatCard } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";

export default async function CountryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scope = accessibleCountryIds(user);
  if (scope !== "ALL" && !scope.includes(id)) notFound();

  const country = await db.country.findUnique({
    where: { id },
    include: {
      partners: true,
      journeys: { include: { brand: true }, orderBy: { name: "asc" } },
      tasks: { include: { owner: true }, orderBy: { dueDate: "asc" }, take: 10 },
      risks: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { tasks: true } },
    },
  });
  if (!country) notFound();

  const { overall, breakdown } = countryReadiness(country as unknown as Record<string, unknown>);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/countries" className="text-xs text-gray-500 hover:underline">← Countries</Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{country.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{overall}%</span>
            <Link href={`/countries/${country.id}/edit`} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">{country.code} · {country.region ?? "—"} · Owner: {country.countryOwner ?? "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Overall Readiness" value={`${overall}%`} />
        <StatCard label="Open Tasks" value={country._count.tasks} />
        <StatCard label="Journeys" value={country.journeys.length} />
        <StatCard label="Partners" value={country.partners.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CardTitle>Readiness Breakdown</CardTitle>
          <Card>
            <div className="space-y-4">
              {breakdown.map((area) => (
                <ProgressBar key={area.label} value={area.score} label={`${area.label} — ${area.status ?? "Not Started"}`} />
              ))}
            </div>
          </Card>

          <CardTitle>Journeys</CardTitle>
          <Card>
            <ul className="divide-y divide-gray-100">
              {country.journeys.map((j) => (
                <li key={j.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <Link href={`/journeys/${j.id}`} className="font-medium text-gray-900 hover:underline">
                      {j.name}
                    </Link>
                    <div className="text-xs text-gray-500">{j.brand.name} · {j.journeyType}</div>
                  </div>
                  <StatusBadge status={j.status} />
                </li>
              ))}
              {country.journeys.length === 0 && (
                <li className="py-2 text-sm text-gray-400">No journeys yet.</li>
              )}
            </ul>
          </Card>

          <CardTitle>Recent Tasks</CardTitle>
          <Card>
            <ul className="divide-y divide-gray-100">
              {country.tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.owner?.fullName ?? "Unassigned"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status.replace("_", " ")} />
                  </div>
                </li>
              ))}
              {country.tasks.length === 0 && <li className="py-2 text-sm text-gray-400">No tasks yet.</li>}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <CardTitle>Partners</CardTitle>
          <Card>
            <ul className="space-y-3">
              {country.partners.map((p) => (
                <li key={p.id} className="text-sm">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.technology ?? "—"}</div>
                  <StatusBadge status={p.contractStatus} />
                </li>
              ))}
              {country.partners.length === 0 && <li className="text-sm text-gray-400">No partner yet.</li>}
            </ul>
          </Card>

          <CardTitle>Risks</CardTitle>
          <Card>
            <ul className="space-y-3">
              {country.risks.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">Severity: {r.severity}</div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
              {country.risks.length === 0 && <li className="text-sm text-gray-400">No risks logged.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
