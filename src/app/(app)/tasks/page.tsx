import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "APPROVED", "COMPLETED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ countryId?: string; status?: string; priority?: string; ownerId?: string }>;
}) {
  const user = await requireUser();
  const { countryId, status, priority, ownerId } = await searchParams;
  const countryScope = accessibleCountryIds(user);

  const [countries, owners] = await Promise.all([
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { fullName: "asc" } }),
  ]);

  const tasks = await db.task.findMany({
    where: {
      ...(countryScope === "ALL" ? {} : { countryId: { in: countryScope } }),
      ...(countryId ? { countryId } : {}),
      ...(status ? { status: status as (typeof STATUSES)[number] } : {}),
      ...(priority ? { priority: priority as (typeof PRIORITIES)[number] } : {}),
      ...(ownerId ? { ownerId } : {}),
    },
    include: { owner: true, country: true, journey: true, epic: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">All tasks across countries, journeys and epics</p>
        </div>
        <Link href="/tasks/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
          + New Task
        </Link>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="countryId" defaultValue={countryId ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select name="priority" defaultValue={priority ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="ownerId" defaultValue={ownerId ?? ""} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
          <option value="">All owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.fullName}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Journey</th>
              <th className="px-4 py-3">Epic</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{t.title}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{t.country?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {t.journey ? (
                    <Link href={`/journeys/${t.journey.id}`} className="hover:underline">{t.journey.name}</Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{t.epic?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{t.owner?.fullName ?? "Unassigned"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={t.status.replace("_", " ")} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Link href={`/tasks/${t.id}/edit`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {tasks.length === 0 && (
        <Card>
          <CardTitle>No tasks</CardTitle>
          <p className="text-sm text-gray-500">No tasks match the current filters.</p>
        </Card>
      )}
    </div>
  );
}
