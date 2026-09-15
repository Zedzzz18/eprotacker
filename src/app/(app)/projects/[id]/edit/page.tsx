import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Field, inputClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/components/ui/form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-button";
import { updateProject, deleteProject } from "@/lib/actions/projects";

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  const boundUpdate = updateProject.bind(null, id);
  const boundDelete = deleteProject.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-xs text-gray-500 hover:underline">← Projects</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Edit Project</h1>
      </div>

      <Card>
        <form action={boundUpdate} className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={project.name} className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={project.description ?? ""} className={inputClass} />
          </Field>
          <Field label="Status">
            <input name="status" defaultValue={project.status} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input type="date" name="startDate" defaultValue={toDateInput(project.startDate)} className={inputClass} />
            </Field>
            <Field label="End date">
              <input type="date" name="endDate" defaultValue={toDateInput(project.endDate)} className={inputClass} />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className={primaryButtonClass}>Save Changes</button>
            <Link href="/projects" className={secondaryButtonClass}>Cancel</Link>
          </div>
        </form>

        {isAdmin(user) && (
          <form action={boundDelete} className="mt-4 border-t border-gray-100 pt-4">
            <ConfirmSubmitButton
              label="Delete Project"
              confirmText="Delete this project and ALL its epics, milestones and links? This cannot be undone."
              className={dangerButtonClass}
            />
          </form>
        )}
      </Card>
    </div>
  );
}
