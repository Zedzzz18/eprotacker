import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleBrandIds } from "@/lib/rbac";
import { Card, CardTitle, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const scope = accessibleBrandIds(user);
  if (scope !== "ALL" && !scope.includes(id)) notFound();

  const brand = await db.brand.findUnique({
    where: { id },
    include: {
      journeys: { include: { country: true }, orderBy: { name: "asc" } },
      _count: { select: { taskBrands: true } },
    },
  });
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/brands" className="text-xs text-gray-500 hover:underline">← Brands</Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{brand.name}</h1>
          <Link href={`/brands/${brand.id}/edit`} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Edit
          </Link>
        </div>
        <p className="mt-1 text-sm text-gray-500">Owner: {brand.brandOwner ?? "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Journeys" value={brand.journeys.length} />
        <StatCard label="Tasks" value={brand._count.taskBrands} />
        <StatCard label="Status" value={brand.active ? "Active" : "Inactive"} />
      </div>

      <CardTitle>Journeys</CardTitle>
      <Card>
        <ul className="divide-y divide-gray-100">
          {brand.journeys.map((j) => (
            <li key={j.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <Link href={`/journeys/${j.id}`} className="font-medium text-gray-900 hover:underline">
                  {j.name}
                </Link>
                <div className="text-xs text-gray-500">{j.country.name} · {j.journeyType}</div>
              </div>
              <StatusBadge status={j.status} />
            </li>
          ))}
          {brand.journeys.length === 0 && <li className="py-2 text-sm text-gray-400">No journeys yet.</li>}
        </ul>
      </Card>

      {brand.communicationStrategy && (
        <>
          <CardTitle>Communication Strategy</CardTitle>
          <Card>
            <p className="text-sm text-gray-700">{brand.communicationStrategy}</p>
          </Card>
        </>
      )}
    </div>
  );
}
