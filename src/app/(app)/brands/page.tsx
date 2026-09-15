import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleBrandIds, isAdmin } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";

export default async function BrandsPage() {
  const user = await requireUser();
  const scope = accessibleBrandIds(user);
  const where = scope === "ALL" ? {} : { id: { in: scope } };

  const brands = await db.brand.findMany({
    where,
    include: { _count: { select: { journeys: true, taskBrands: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Brands</h1>
          <p className="mt-1 text-sm text-gray-500">Stellantis brands participating in the e-PRO transition</p>
        </div>
        {isAdmin(user) && (
          <Link href="/brands/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            + New Brand
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <Link href={`/brands/${brand.id}`} className="font-semibold text-gray-900 hover:underline">
              {brand.name}
            </Link>
            <div className="mt-1 text-xs text-gray-500">{brand.brandOwner ?? "No owner set"}</div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>{brand._count.journeys} journeys</span>
              <span>{brand._count.taskBrands} tasks</span>
            </div>
            {!brand.active && (
              <span className="mt-3 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactive</span>
            )}
          </Card>
        ))}
      </div>

      {brands.length === 0 && (
        <Card>
          <CardTitle>No brands</CardTitle>
          <p className="text-sm text-gray-500">No brands are in your scope.</p>
        </Card>
      )}
    </div>
  );
}
