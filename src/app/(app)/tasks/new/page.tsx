import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { createTask } from "@/lib/actions/tasks";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "APPROVED", "COMPLETED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default async function NewTaskPage() {
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);

  const [projects, countries, journeys, owners] = await Promise.all([
    db.project.findMany({ orderBy: { name: "asc" } }),
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.journey.findMany({ where: countryScope === "ALL" ? {} : { countryId: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tasks" className="text-xs text-gray-500 hover:underline">← Tasks</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">New Task</h1>
      </div>

      <Card>
        <form action={createTask} className="space-y-4">
          <Field label="Title">
            <input name="title" required className={inputClass} />
          </Field>

          <Field label="Description">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>

          <Field label="Project">
            <select name="projectId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Country">
              <select name="countryId" className={inputClass} defaultValue="">
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Journey">
              <select name="journeyId" className={inputClass} defaultValue="">
                <option value="">—</option>
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <select name="ownerId" className={inputClass} defaultValue="">
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.fullName}</option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" name="dueDate" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Priority">
              <select name="priority" defaultValue="MEDIUM" className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue="NOT_STARTED" className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Create Task</button>
            <Link href="/tasks" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
