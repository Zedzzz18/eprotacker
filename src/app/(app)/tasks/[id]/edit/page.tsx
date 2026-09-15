import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCountryIds } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateTask, deleteTask } from "@/lib/actions/tasks";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "APPROVED", "COMPLETED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const countryScope = accessibleCountryIds(user);

  const task = await db.task.findUnique({ where: { id } });
  if (!task) notFound();
  if (countryScope !== "ALL" && task.countryId && !countryScope.includes(task.countryId)) notFound();

  const [countries, journeys, owners] = await Promise.all([
    db.country.findMany({ where: countryScope === "ALL" ? {} : { id: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.journey.findMany({ where: countryScope === "ALL" ? {} : { countryId: { in: countryScope } }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { active: true }, orderBy: { fullName: "asc" } }),
  ]);

  const dueDateValue = task.dueDate ? task.dueDate.toISOString().slice(0, 10) : "";
  const boundUpdate = updateTask.bind(null, id);
  const boundDelete = deleteTask.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tasks" className="text-xs text-gray-500 hover:underline">← Tasks</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Task</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Title">
            <input name="title" required defaultValue={task.title} className={inputClass} />
          </Field>

          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={task.description ?? ""} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Country">
              <select name="countryId" className={inputClass} defaultValue={task.countryId ?? ""}>
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Journey">
              <select name="journeyId" className={inputClass} defaultValue={task.journeyId ?? ""}>
                <option value="">—</option>
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner">
              <select name="ownerId" className={inputClass} defaultValue={task.ownerId ?? ""}>
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.fullName}</option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" name="dueDate" defaultValue={dueDateValue} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Priority">
              <select name="priority" defaultValue={task.priority} className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={task.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <button type="submit" className={primaryButtonClass}>Save Changes</button>
              <Link href="/tasks" className={secondaryButtonClass}>Cancel</Link>
            </div>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
          <ConfirmSubmitButton
            label="Delete Task"
            confirmText="Delete this task? This cannot be undone."
            className={dangerButtonClass}
          />
        </form>
      </Card>
    </div>
  );
}
