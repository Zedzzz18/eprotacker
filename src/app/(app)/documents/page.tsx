import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function DocumentsPage() {
  const user = await requireUser();
  const scope = accessibleCountryIds(user);

  const documents = await db.document.findMany({
    where: scope === "ALL" ? {} : { OR: [{ countryId: { in: scope } }, { countryId: null }] },
    include: { country: true, brand: true, partner: true, owner: true, versions: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">Contracts, legal files, and country/brand documentation</p>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Versions</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{d.category ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{d.country?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{d.brand?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{d.owner?.fullName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{d.versions.length}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {documents.length === 0 && (
        <Card>
          <CardTitle>No documents</CardTitle>
          <p className="text-sm text-gray-500">No documents have been uploaded yet.</p>
        </Card>
      )}
    </div>
  );
}
