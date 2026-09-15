import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { countryReadiness } from "@/lib/readiness";
import { StatCard, Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function DashboardPage() {
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);
  const countryWhere = countryScope === "ALL" ? {} : { id: { in: countryScope } };

  const [countries, taskStats, overdueCount, pendingApprovals, milestones] = await Promise.all([
    db.country.findMany({
      where: countryWhere,
      include: {
        partners: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.task.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: countryScope === "ALL" ? {} : { countryId: { in: countryScope } },
    }),
    db.task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ["COMPLETED", "APPROVED"] },
        ...(countryScope === "ALL" ? {} : { countryId: { in: countryScope } }),
      },
    }),
    db.approval.count({ where: { decision: null } }),
    db.milestone.findMany({ orderBy: { dueDate: "asc" }, take: 6 }),
  ]);

  const totalTasks = taskStats.reduce((s, t) => s + t._count._all, 0);
  const completed = taskStats.find((t) => t.status === "COMPLETED")?._count._all ?? 0;
  const inProgress = taskStats.find((t) => t.status === "IN_PROGRESS")?._count._all ?? 0;
  const blocked = taskStats.find((t) => t.status === "BLOCKED")?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          e-PRO Charging Partner Transition — Belux Control Tower
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Tasks" value={totalTasks} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="In Progress" value={inProgress} />
        <StatCard label="Blocked" value={blocked} />
        <StatCard label="Overdue" value={overdueCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CardTitle>Country Readiness</CardTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {countries.map((country) => {
              const { overall } = countryReadiness(country as unknown as Record<string, unknown>);
              return (
                <Card key={country.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/countries/${country.id}`} className="font-semibold text-gray-900 hover:underline">
                        {country.name}
                      </Link>
                      <div className="text-xs text-gray-500">
                        Partner: {country.partners[0]?.name ?? "—"}
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{overall}%</span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={overall} />
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {country._count.tasks} open tasks
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <CardTitle>Upcoming Milestones</CardTitle>
          <Card>
            <ul className="space-y-3">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{m.name}</span>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          </Card>

          <CardTitle>Pending Approvals</CardTitle>
          <Card>
            <div className="text-3xl font-semibold text-gray-900">{pendingApprovals}</div>
            <div className="text-xs text-gray-500">Awaiting decision</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
