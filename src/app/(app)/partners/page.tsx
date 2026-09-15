import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds, canWrite } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PartnersPage() {
  const user = await requireUser();
  const scope = accessibleCountryIds(user);
  const where = scope === "ALL" ? {} : { countryId: { in: scope } };

  const partners = await db.partner.findMany({
    where,
    include: { country: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Partners</h1>
          <p className="mt-1 text-sm text-gray-500">Charging technology partners per country</p>
        </div>
        {canWrite(user) && (
          <Link href="/partners/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            + New Partner
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {partners.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">{p.country.name} · {p.technology ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.contractStatus} />
                {canWrite(user) && (
                  <Link href={`/partners/${p.id}/edit`} className="text-xs font-medium text-gray-500 hover:underline">
                    Edit
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-gray-500">
              <div>Contact: {p.contact ?? "—"}</div>
              <div>SLA: {p.sla ?? "—"}</div>
              <div>Offer: {p.offer ?? "—"}</div>
              <div>Support: {p.customerSupport ?? "—"}</div>
            </div>
          </Card>
        ))}
      </div>

      {partners.length === 0 && (
        <Card>
          <CardTitle>No partners</CardTitle>
          <p className="text-sm text-gray-500">No partners are in your scope.</p>
        </Card>
      )}
    </div>
  );
}
