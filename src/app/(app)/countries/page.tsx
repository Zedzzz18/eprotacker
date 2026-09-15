import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, isAdmin } from "@/lib/rbac";
import { countryReadiness } from "@/lib/readiness";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function CountriesPage() {
  const user = await requireUser();
  const scope = accessibleCountryIds(user);
  const where = scope === "ALL" ? {} : { id: { in: scope } };

  const countries = await db.country.findMany({
    where,
    include: {
      partners: true,
      _count: { select: { tasks: true, journeys: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Countries</h1>
          <p className="mt-1 text-sm text-gray-500">Readiness and rollout status per country</p>
        </div>
        {isAdmin(user) && (
          <Link href="/countries/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            + New Country
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {countries.map((country) => {
          const { overall } = countryReadiness(country as unknown as Record<string, unknown>);
          return (
            <Card key={country.id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/countries/${country.id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                    {country.name}
                  </Link>
                  <div className="text-xs text-gray-500">{country.code} · {country.region ?? "—"}</div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{overall}%</span>
              </div>

              <div className="mt-3">
                <ProgressBar value={overall} />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Partner: {country.partners[0]?.name ?? "—"}</span>
                <StatusBadge status={country.projectStatus} />
              </div>

              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>{country._count.journeys} journeys</span>
                <span>{country._count.tasks} tasks</span>
              </div>
            </Card>
          );
        })}
      </div>

      {countries.length === 0 && (
        <Card>
          <CardTitle>No countries</CardTitle>
          <p className="text-sm text-gray-500">No countries are in your scope.</p>
        </Card>
      )}
    </div>
  );
}
