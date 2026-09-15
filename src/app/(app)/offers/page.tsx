import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function OffersPage() {
  await requireUser();

  const offers = await db.offer.findMany({
    where: { scope: "GLOBAL" },
    include: {
      brand: true,
      partner: true,
      localAdaptations: { include: { country: true, brand: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
        <p className="mt-1 text-sm text-gray-500">Global HQ offers and their local country adaptations</p>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">GLOBAL</span>
                  <span className="text-lg font-semibold text-gray-900">{offer.name}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {offer.brand?.name ?? "All brands"} · {offer.partner?.name ?? "—"} · HQ Owner: {offer.hqOwner ?? "—"}
                </div>
                {offer.description && <p className="mt-2 text-sm text-gray-600">{offer.description}</p>}
              </div>
              <StatusBadge status={offer.status} />
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3">
              <div className="text-xs font-medium uppercase text-gray-400">Local Adaptations</div>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                {offer.localAdaptations.map((a) => (
                  <div key={a.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {a.country.name}{a.brand ? ` · ${a.brand.name}` : ""}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.decision === "YES"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.decision === "NO"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {a.decision}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      {a.localRule && <div>Rule: {a.localRule}</div>}
                      {a.localPrice && <div>Price: {a.localPrice}</div>}
                      {a.localBenefit && <div>Benefit: {a.localBenefit}</div>}
                      {a.localRestriction && <div>Restriction: {a.localRestriction}</div>}
                      {a.decisionOwner && <div>Owner: {a.decisionOwner}</div>}
                    </div>
                  </div>
                ))}
                {offer.localAdaptations.length === 0 && (
                  <p className="text-sm text-gray-400">No local adaptation defined yet.</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {offers.length === 0 && (
        <Card>
          <CardTitle>No offers</CardTitle>
          <p className="text-sm text-gray-500">No global offers have been created yet.</p>
        </Card>
      )}
    </div>
  );
}
