import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canWrite } from "@/lib/rbac";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await db.project.findMany({
    include: {
      countries: { include: { country: true } },
      brands: { include: { brand: true } },
      _count: { select: { epics: true, tasks: true, milestones: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Programs driving the e-PRO transition</p>
        </div>
        {canWrite(user) && (
          <Link href="/projects/new" className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
            + New Project
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">{p.name}</div>
                <p className="mt-1 text-sm text-gray-500">{p.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                {canWrite(user) && (
                  <Link href={`/projects/${p.id}/edit`} className="text-xs font-medium text-gray-500 hover:underline">
                    Edit
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs text-gray-500">
              <span>{p.countries.map((c) => c.country.name).join(", ") || "—"}</span>
              <span>·</span>
              <span>{p.brands.map((b) => b.brand.name).join(", ") || "—"}</span>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>{p._count.epics} epics</span>
              <span>{p._count.tasks} tasks</span>
              <span>{p._count.milestones} milestones</span>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardTitle>No projects</CardTitle>
          <p className="text-sm text-gray-500">No projects have been created yet.</p>
        </Card>
      )}
    </div>
  );
}
