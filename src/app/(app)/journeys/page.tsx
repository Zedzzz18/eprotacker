import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, accessibleBrandIds } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ countryId?: string; brandId?: string; type?: string }>;
}) {
  const user = await requireUser();
  const { countryId, brandId, type } = await searchParams;

  const countryScope = accessibleCountryIds(user);
  const brandScope = accessibleBrandIds(user);

  const [countries, brands] = await Promise.all([
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.brand.findMany({ where: brandScope === "ALL" ? {} : { id: { in: brandScope } }, orderBy: { name: "asc" } }),
  ]);

  const journeys = await db.journey.findMany({
    where: {
      ...(countryScope === "ALL" ? {} : { countryId: { in: countryScope } }),
      ...(brandScope === "ALL" ? {} : { brandId: { in: brandScope } }),
      ...(countryId ? { countryId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(type ? { journeyType: type as "ONLINE" | "OFFLINE" | "HYBRID" } : {}),
    },
    include: { country: true, brand: true, _count: { select: { steps: true, tasks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Journeys</h1>
          <p className="mt-1 text-sm text-gray-500">Customer &amp; business journeys per country and brand</p>
        </div>
        <Link href="/journeys/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
          + New Journey
        </Link>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="countryId" defaultValue={countryId ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="brandId" defaultValue={brandId ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All types</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Journey</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Steps</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map((j) => (
              <tr key={j.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link href={`/journeys/${j.id}`} className="font-medium text-gray-900 hover:underline">
                    {j.name}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{j.country.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{j.brand.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{j.journeyType}</td>
                <td className="px-4 py-3 text-gray-600">{j._count.steps}</td>
                <td className="px-4 py-3 text-gray-600">{j._count.tasks}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={j.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {journeys.length === 0 && (
        <Card>
          <CardTitle>No journeys</CardTitle>
          <p className="text-sm text-gray-500">No journeys match the current filters.</p>
        </Card>
      )}
    </div>
  );
}
