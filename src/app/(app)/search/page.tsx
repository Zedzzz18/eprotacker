import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardTitle } from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results =
    query.length > 0
      ? await Promise.all([
          db.country.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
          db.brand.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
          db.journey.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
          db.task.findMany({ where: { title: { contains: query, mode: "insensitive" } }, take: 10 }),
          db.partner.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
        ])
      : [[], [], [], [], []];

  const [countries, brands, journeys, tasks, partners] = results;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">Find countries, brands, journeys, tasks and partners</p>
      </div>

      <form className="flex gap-3">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search..."
          className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </form>

      {query.length === 0 ? (
        <p className="text-sm text-gray-400">Type a search term above.</p>
      ) : (
        <div className="space-y-4">
          <CardTitle>Countries</CardTitle>
          <Card>
            {countries.length === 0 && <p className="text-sm text-gray-400">No matches.</p>}
            <ul className="space-y-1">
              {countries.map((c) => (
                <li key={c.id}>
                  <Link href={`/countries/${c.id}`} className="text-sm text-gray-900 hover:underline">{c.name}</Link>
                </li>
              ))}
            </ul>
          </Card>

          <CardTitle>Brands</CardTitle>
          <Card>
            {brands.length === 0 && <p className="text-sm text-gray-400">No matches.</p>}
            <ul className="space-y-1">
              {brands.map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.id}`} className="text-sm text-gray-900 hover:underline">{b.name}</Link>
                </li>
              ))}
            </ul>
          </Card>

          <CardTitle>Journeys</CardTitle>
          <Card>
            {journeys.length === 0 && <p className="text-sm text-gray-400">No matches.</p>}
            <ul className="space-y-1">
              {journeys.map((j) => (
                <li key={j.id}>
                  <Link href={`/journeys/${j.id}`} className="text-sm text-gray-900 hover:underline">{j.name}</Link>
                </li>
              ))}
            </ul>
          </Card>

          <CardTitle>Tasks</CardTitle>
          <Card>
            {tasks.length === 0 && <p className="text-sm text-gray-400">No matches.</p>}
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li key={t.id} className="text-sm text-gray-900">{t.title}</li>
              ))}
            </ul>
          </Card>

          <CardTitle>Partners</CardTitle>
          <Card>
            {partners.length === 0 && <p className="text-sm text-gray-400">No matches.</p>}
            <ul className="space-y-1">
              {partners.map((p) => (
                <li key={p.id} className="text-sm text-gray-900">{p.name}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
